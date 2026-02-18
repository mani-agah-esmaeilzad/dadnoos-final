'use client'

import { AnimatePresence } from 'framer-motion';
import { useNotifContext } from './NotifContext';
import Notification from './Notification';

function NotificationContainer() {
  const {
    notifications,
    handleButtonClick,
    updatePromptInput,
    removeNotification,
  } = useNotifContext();

  const confirmNotifications = notifications.filter(
    (notification) =>
      notification.alertType === "confirm" ||
      notification.alertType === "prompt",
  );

  return (
    <AnimatePresence mode="wait">
      {confirmNotifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onButtonClick={handleButtonClick}
          onInputChange={updatePromptInput}
          onClose={removeNotification}
        />
      ))}
    </AnimatePresence>
  );
}

export default NotificationContainer;
