import { useEffect } from 'react'

export type ToastVariant = 'success' | 'warning' | 'error'

interface ToastProps {
  message: string
  variant?: ToastVariant
  duration?: number
  onDismiss: () => void
  actionLabel?: string
  onAction?: () => void
}

function Toast({
  message,
  variant = 'success',
  duration = 4000,
  onDismiss,
  actionLabel,
  onAction,
}: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timeoutId)
  }, [duration, onDismiss])

  return (
    <div
      className={`ui-toast ui-toast--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button className="ui-toast__action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
      <button
        className="ui-toast__dismiss"
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  )
}

export default Toast
