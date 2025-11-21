import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { mockNotifications as initialMockNotifications } from "../data/mockData";

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial mock data
  useEffect(() => {
    setNotifications(initialMockNotifications);
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      createdAt: Date.now(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Trigger toast
    toast(newNotification.message, {
      description: "Just now",
      action: {
        label: "View",
        onClick: () => console.log("View notification", newNotification),
      },
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
