import React from 'react';
import { useNotification } from '../../context/NotificationContext';

export const HUDNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div id="hud-notifier-container">
      {notifications.map((n) => {
        let iconClass = 'fa-solid fa-circle-info';
        if (n.type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';
        if (n.type === 'success') iconClass = 'fa-solid fa-circle-check';

        return (
          <div key={n.id} className={`hud-popup ${n.type}`}>
            <i className={`${iconClass} hud-icon`} />
            <div
              className="hud-message"
              dangerouslySetInnerHTML={{ __html: n.message }}
            />
            <button
              className="hud-close"
              onClick={() => removeNotification(n.id)}
              aria-label="Close notification"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
