import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const NotificationContext = createContext();
const STORAGE_KEY = "antariksh_notifications_v1";

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

const normalizeNotification = (notification) => ({
  id:
    notification.id ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: notification.title || "System Alert",
  message: notification.message || "",
  type: notification.type || "INFO",
  createdAt: notification.createdAt || new Date().toISOString(),
  read: Boolean(notification.read),
  href: notification.href || "",
});

const SETTINGS_KEY = "antariksh_local_settings_v1";

const getWebPref = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    if (typeof parsed.webNotifications === "boolean") return parsed.webNotifications;
    return true;
  } catch {
    return true;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setNotifications(parsed.map(normalizeNotification));
      }
    } catch (error) {
      console.error("Failed to restore notifications:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification) => {
    if (!getWebPref()) return null;
    const normalized = normalizeNotification(notification);
    setNotifications((current) => [normalized, ...current].slice(0, 50));
    return normalized.id;
  };

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const clearNotification = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
