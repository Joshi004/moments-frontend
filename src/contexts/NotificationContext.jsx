import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  unreadCount: 0,
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const STORAGE_KEY = 'vm-notifications';
const MAX_NOTIFICATIONS = 50;

// Generate unique ID
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Load notifications from sessionStorage
const loadNotifications = () => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Validate structure
    if (Array.isArray(parsed)) {
      return parsed.filter(n => 
        n.id && n.type && n.message && n.timestamp
      );
    }
  } catch (error) {
    console.error('Failed to load notifications from sessionStorage:', error);
  }
  return [];
};

// Save notifications to sessionStorage
const saveNotifications = (notifications) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications to sessionStorage:', error);
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadNotifications);

  // Persist to sessionStorage whenever notifications change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: generateId(),
      type: notification.type || 'info', // 'success', 'error', 'warning', 'info'
      message: notification.message,
      timestamp: Date.now(),
      read: false,
      actionUrl: notification.actionUrl || null,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit to MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount,
    }),
    [notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
