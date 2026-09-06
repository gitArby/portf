import React, { createContext, useContext, useState } from 'react';
import { NotificationItem, NotificationType } from '../types';
import { useAudio } from './AudioContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  showHUDNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { playNotificationSound } = useAudio();

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showHUDNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);
    playNotificationSound(type);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showHUDNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  showHUDNotification: () => {},
  removeNotification: () => {},
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  return context || defaultNotificationContext;
};
