"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type {
  ConfirmNotification,
  PromptNotification,
  NotificationButtonVariant,
} from "./NotifContext";
import { cn } from "@/app/_lib/utils";

type InteractiveNotification = ConfirmNotification | PromptNotification;

interface NotificationProps {
  notification: InteractiveNotification;
  onButtonClick: (
    notification: InteractiveNotification,
    buttonValue: boolean,
  ) => void;
  onInputChange: (id: number, value: string) => void;
  onClose: (id: number) => void;
}

function Notification({
  notification,
  onButtonClick,
  onInputChange,
  onClose,
}: NotificationProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (notification.type === "prompt" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [notification.type]);

  const handleButtonClick = (buttonValue: boolean) => {
    onButtonClick(notification, buttonValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && notification.type === "prompt") {
      const confirmButton = notification.buttons.find(
        (btn) => btn.value === true,
      );
      if (confirmButton) {
        handleButtonClick(true);
      }
    } else if (e.key === "Escape") {
      const cancelButton = notification.buttons?.find(
        (btn) => btn.value === false,
      );
      if (cancelButton) {
        handleButtonClick(false);
      } else {
        onClose(notification.id);
      }
    }
  };

  const getButtonClasses = (
    variant?: NotificationButtonVariant,
    buttonValue?: boolean | string,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors outline-none ring-0 disabled:pointer-events-none disabled:opacity-25 whitespace-nowrap cursor-pointer h-10 px-6";

    // برای confirm با دو دکمه پیش‌فرض: بله قرمز، خیر آبی
    if (
      notification.type === "confirm" &&
      notification.buttons?.length === 2 &&
      (buttonValue === true || buttonValue === false)
    ) {
      if (buttonValue === true) {
        return cn(
          baseClasses,
          "bg-red-600 text-white md:hover:bg-red-700 active:bg-red-700",
        );
      }
      return cn(
        baseClasses,
        "bg-blue-600 text-white md:hover:bg-blue-700 active:bg-blue-700",
      );
    }

    // رنگ بر اساس variant دکمه: آبی، قرمز، زرد، سبز، یا primary
    const variants: Record<string, string> = {
      primary:
        "bg-[#C8A175] text-white md:hover:bg-[#C8A175]/75 active:bg-[#C8A175]/75",
      secondary:
        "bg-blue-600 text-white md:hover:bg-blue-700 active:bg-blue-700",
      danger:
        "bg-red-600 text-white md:hover:bg-red-700 active:bg-red-700",
      success:
        "bg-green-600 text-white md:hover:bg-green-700 active:bg-green-700",
      warning:
        "bg-amber-500 text-white md:hover:bg-amber-600 active:bg-amber-600",
    };
    return cn(baseClasses, variants[variant ?? "primary"] ?? variants.primary);
  };

  const inputValue =
    notification.type === "prompt" ? notification.inputValue : "";

  const handleOverlayClick = () => {
    const cancelButton = notification.buttons?.find(
      (btn) => btn.value === false,
    );
    if (cancelButton) {
      handleButtonClick(false);
    } else if (notification.buttons?.length === 1) {
      // فقط یک دکمه: کلیک بیرون = لغو (false)
      handleButtonClick(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={handleOverlayClick}
    >
      <motion.div
        className="absolute inset-0 bg-black/85"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      <motion.div
        className={cn(
          "relative z-50 grid w-full max-h-fit gap-4 py-6 px-6 rounded-3xl rtl",
          "min-w-[400px] max-w-[90%]",
          notification.type === "confirm"
            ? "bg-neutral-900 dark:bg-neutral-900"
            : "bg-white dark:bg-neutral-700",
        )}
        style={{
          width: "calc(100% - 24px)",
          maxWidth: "500px",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <p
            className={cn(
              "m-0 leading-relaxed",
              notification.type === "confirm"
                ? "text-base text-white text-center"
                : "text-base text-gray-800 dark:text-neutral-200 text-center",
            )}
          >
            {notification.message}
          </p>

          {notification.type === "prompt" && (
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-3 border border-neutral-400/25 dark:border-neutral-500 rounded-3xl text-sm transition-colors duration-200 rtl text-right focus:outline-none focus:ring-2 focus:ring-[#C8A175]/50 focus:border-[#C8A175] bg-white dark:bg-neutral-600 text-gray-800 dark:text-neutral-100"
              value={inputValue}
              onChange={(e) => onInputChange(notification.id, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="مقدار را وارد کنید..."
            />
          )}

          {notification.isInteractive && notification.buttons && (
            <div
              className={cn(
                "grid gap-3 mt-4 w-full",
                notification.buttons.length === 1 && "grid-cols-1",
                notification.buttons.length === 2 && "grid-cols-2",
                notification.buttons.length >= 3 && "grid-cols-3",
                "max-sm:grid-cols-1",
              )}
              style={{
                gridTemplateColumns:
                  notification.buttons.length > 3
                    ? `repeat(${Math.min(notification.buttons.length, 3)}, 1fr)`
                    : undefined,
              }}
            >
              {notification.buttons.map((button, index) => (
                <button
                  key={index}
                  className={cn(
                    getButtonClasses(button.variant, button.value),
                    "w-full",
                  )}
                  onClick={() => handleButtonClick(button.value as boolean)}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Notification;
