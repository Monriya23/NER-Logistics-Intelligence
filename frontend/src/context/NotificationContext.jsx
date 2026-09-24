import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeRole, setActiveRole] = useState(null); // DRIVER, COORDINATOR, AUTHORITY, or null (all)
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications(activeRole);
      if (res && res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  const triggerEvaluation = async (payload) => {
    try {
      const res = await api.evaluateNotification(payload);
      if (res && res.success) {
        fetchNotifications();
        return res;
      }
    } catch (err) {
      console.warn('Notification evaluation error:', err);
    }
    return null;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const activeCriticalAlert = notifications.find(n => !n.is_read && (n.severity === 'CRITICAL' || n.severity === 'HIGH'));

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeCriticalAlert,
        activeRole,
        setActiveRole,
        isLoading,
        markAsRead,
        triggerEvaluation,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
