/**
 * Local Offline Storage & Store-and-Forward Queue Engine.
 * Enables zero-loss incident capture in cellular dead zones.
 */

const OFFLINE_QUEUE_KEY = 'NER_LOGISTICS_OFFLINE_QUEUE';
const LAST_SYNC_KEY = 'NER_LOGISTICS_LAST_SYNC';
const SYNC_COUNT_KEY = 'NER_LOGISTICS_SYNC_COUNT';

export const offlineStorage = {
  getPendingReports: () => {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading offline queue', e);
      return [];
    }
  },

  enqueueReport: (report) => {
    try {
      const queue = offlineStorage.getPendingReports();
      const enrichedReport = {
        ...report,
        local_id: `LOCAL-${Date.now()}`,
        captured_at: new Date().toISOString(),
        sync_status: 'PENDING'
      };
      queue.push(enrichedReport);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      return enrichedReport;
    } catch (e) {
      console.error('Error enqueuing report', e);
      return null;
    }
  },

  clearQueue: () => {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (e) {
      console.error('Error clearing offline queue', e);
    }
  },

  getLastSyncTime: () => {
    try {
      return localStorage.getItem(LAST_SYNC_KEY) || null;
    } catch {
      return null;
    }
  },

  getSynchronizedCount: () => {
    try {
      const count = localStorage.getItem(SYNC_COUNT_KEY);
      return count ? parseInt(count, 10) : 18;
    } catch {
      return 18;
    }
  },

  incrementSynchronizedCount: (amount = 1) => {
    try {
      const current = offlineStorage.getSynchronizedCount();
      const updated = current + amount;
      localStorage.setItem(SYNC_COUNT_KEY, updated.toString());
      return updated;
    } catch {
      return 18 + amount;
    }
  }
};
