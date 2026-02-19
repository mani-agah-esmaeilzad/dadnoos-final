'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Types
export type AlertType = "success" | "error" | "warning" | "info";

export type NotificationButtonVariant = "primary" | "secondary" | "danger" | "success" | "warning";

export interface NotificationButton {
  label: string;
  value: boolean | string;
  variant?: NotificationButtonVariant;
}

export interface BaseNotification {
  id: number;
  message: string;
  isInteractive: boolean;
}

export interface AlertNotification extends BaseNotification {
  type: AlertType;
  alertType: "alert";
  duration: number;
}

export interface ConfirmNotification extends BaseNotification {
  type: "confirm";
  alertType: "confirm";
  buttons: NotificationButton[];
  resolve: (value: boolean) => void;
}

export interface PromptNotification extends BaseNotification {
  type: "prompt";
  alertType: "prompt";
  defaultValue: string;
  inputValue: string;
  buttons: NotificationButton[];
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}

export type Notification =
  | AlertNotification
  | ConfirmNotification
  | PromptNotification;

export interface NotifContextValue {
  notifications: Notification[];
  showAlert: (message: string, type?: AlertType, duration?: number) => number;
  showConfirm: (
    message: string,
    buttons?: NotificationButton[] | null,
  ) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string) => Promise<string>;
  handleButtonClick: (
    notification: ConfirmNotification | PromptNotification,
    buttonValue: boolean,
  ) => void;
  updatePromptInput: (id: number, value: string) => void;
  removeNotification: (id: number) => void;
}

const NotifContext = createContext<NotifContextValue | null>(null);

export const NotifProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info", duration = 300000): number => {
      const id = Date.now() + Math.random();
      const notification: AlertNotification = {
        id,
        message,
        type,
        alertType: "alert",
        duration,
        isInteractive: false,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification],
  );

  const showConfirm = useCallback(
    (message: string, buttons: NotificationButton[] | null = null) => {
      return new Promise<boolean>((resolve) => {
        const id = Date.now() + Math.random();
        const defaultButtons: NotificationButton[] = buttons ?? [
          { label: "بله", value: true, variant: "danger" },
          { label: "خیر", value: false, variant: "secondary" },
        ];

        const notification: ConfirmNotification = {
          id,
          message,
          type: "confirm",
          alertType: "confirm",
          isInteractive: true,
          buttons: defaultButtons,
          resolve,
        };

        setNotifications((prev) => [...prev, notification]);
      });
    },
    [],
  );

  const showPrompt = useCallback(
    (message: string, defaultValue = ""): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const id = Date.now() + Math.random();

        const notification: PromptNotification = {
          id,
          message,
          type: "prompt",
          alertType: "prompt",
          isInteractive: true,
          defaultValue,
          inputValue: defaultValue,
          buttons: [
            { label: "تایید", value: true, variant: "primary" },
            { label: "لغو", value: false, variant: "secondary" },
          ],
          resolve,
          reject,
        };

        setNotifications((prev) => [...prev, notification]);
      });
    },
    [],
  );

  const handleButtonClick = useCallback(
    (
      notification: ConfirmNotification | PromptNotification,
      buttonValue: boolean,
    ) => {
      if (notification.type === "prompt") {
        const promptNotif = notification as PromptNotification;
        if (buttonValue) {
          promptNotif.resolve(promptNotif.inputValue);
        } else {
          promptNotif.reject(new Error("Cancelled"));
        }
      } else {
        (notification as ConfirmNotification).resolve(buttonValue);
      }
      removeNotification(notification.id);
    },
    [removeNotification],
  );

  const updatePromptInput = useCallback((id: number, value: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id && "inputValue" in notif
          ? { ...notif, inputValue: value }
          : notif,
      ),
    );
  }, []);

  const value: NotifContextValue = {
    notifications,
    showAlert,
    showConfirm,
    showPrompt,
    handleButtonClick,
    updatePromptInput,
    removeNotification,
  };

  return <NotifContext.Provider value={value}>{children}</NotifContext.Provider>;
};

export const useNotifContext = (): NotifContextValue => {
  const context = useContext(NotifContext);
  if (!context) {
    throw new Error('useNotifContext must be used within NotifProvider');
  }
  return context;
};
