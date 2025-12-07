import { useEffect } from 'react';
import './ToastNotification.css';

/**
 * ToastNotification Component
 * 
 * Displays temporary success or error messages.
 * Auto-dismisses after specified duration and provides manual dismiss button.
 * 
 * Requirements: 9.5, 9.6
 */

export type ToastType = 'success' | 'error';

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  duration?: number; // Duration in milliseconds (default: 4000ms = 4 seconds)
  onDismiss: () => void;
}

export function ToastNotification({ 
  message, 
  type, 
  duration = 4000, 
  onDismiss 
}: ToastNotificationProps) {
  /**
   * Auto-dismiss after duration
   * Requirements: 9.5
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  /**
   * Get icon based on type
   */
  const getIcon = () => {
    if (type === 'success') {
      return '✓';
    }
    return '✕';
  };

  return (
    <div 
      className={`toast-notification toast-notification--${type}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast-notification__content">
        <span className="toast-notification__icon" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="toast-notification__message">{message}</span>
      </div>
      <button
        className="toast-notification__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
