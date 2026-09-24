import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';

const ConnectivityContext = createContext();

export const ConnectivityProvider = ({ children }) => {
  const [connectivityMode, setConnectivityMode] = useState('GOOD');
  const [pendingQueue, setPendingQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState({
    total_synchronized: offlineStorage.getSynchronizedCount(),
    last_successful_sync_time: offlineStorage.getLastSyncTime()
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Refresh pending queue from local storage
  const refreshQueue = useCallback(() => {
    const q = offlineStorage.getPendingReports();
    setPendingQueue(q);
    setSyncStatus({
      total_synchronized: offlineStorage.getSynchronizedCount(),
      last_successful_sync_time: offlineStorage.getLastSyncTime()
    });
  }, []);

  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 2500);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  const changeMode = async (newMode) => {
    setConnectivityMode(newMode);
    setSyncMessage(null);
    try {
      await api.setConnectivityMode(newMode);
    } catch (e) {
      console.warn('Backend sync mode update deferred', e);
    }
  };

  const triggerSyncNow = async () => {
    if (connectivityMode === 'OFFLINE') {
      setSyncMessage('Offline — reports are safely stored locally. Sync will resume when connectivity returns.');
      return;
    }

    const queue = offlineStorage.getPendingReports();
    if (queue.length === 0) {
      setSyncMessage('No reports waiting to sync. Queue is up to date.');
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Syncing pending reports with Control Center...');

    try {
      const res = await api.syncBatch(queue);
      if (res && res.success) {
        offlineStorage.clearQueue();
        const updatedCount = offlineStorage.incrementSynchronizedCount(queue.length);
        const lastSync = offlineStorage.getLastSyncTime();
        
        refreshQueue();
        setSyncStatus({
          total_synchronized: updatedCount,
          last_successful_sync_time: lastSync
        });
        setSyncMessage(`Sync complete. ${queue.length} report${queue.length > 1 ? 's' : ''} synchronized into Control Center.`);
      } else {
        setSyncMessage('Sync did not complete. Reports preserved locally.');
      }
    } catch (err) {
      console.error('Batch sync failed', err);
      setSyncMessage('Sync failed. Telemetry link unreachable. Reports preserved in local storage.');
    } finally {
      setIsSyncing(false);
    }
  };

  const queueOfflineReport = (report) => {
    const saved = offlineStorage.enqueueReport(report);
    refreshQueue();
    return saved;
  };

  return (
    <ConnectivityContext.Provider value={{
      connectivityMode,
      changeMode,
      pendingQueue,
      pendingCount: pendingQueue.length,
      syncStatus,
      isSyncing,
      syncMessage,
      setSyncMessage,
      triggerSyncNow,
      queueOfflineReport,
      refreshQueue
    }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
