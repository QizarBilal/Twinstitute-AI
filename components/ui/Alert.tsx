import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  onClose?: () => void
  closeable?: boolean
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  onClose,
  closeable = true,
  children,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const variants = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      title: 'text-emerald-400',
      text: 'text-emerald-300',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      title: 'text-red-400',
      text: 'text-red-300',
      icon: '⚠',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      title: 'text-amber-400',
      text: 'text-amber-300',
      icon: '!',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      title: 'text-blue-400',
      text: 'text-blue-300',
      icon: 'ℹ',
    },
  }

  const style = variants[variant]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            ${style.bg} ${style.border}
            border rounded-lg p-4 flex gap-3
            ${className || ''}
          `}
          {...(props as any)}
        >
          <div className={`text-lg font-bold flex-shrink-0 ${style.title}`}>
            {style.icon}
          </div>
          <div className="flex-1">
            {title && (
              <h3 className={`font-semibold ${style.title} mb-1`}>
                {title}
              </h3>
            )}
            <div className={`text-sm ${style.text}`}>{children}</div>
          </div>
          {closeable && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${style.title} hover:opacity-70 transition-opacity`}
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Toast notifications
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  React.useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(
        () => onClose(toast.id),
        toast.duration || 3000
      )
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  const variants = {
    success: {
      bg: 'bg-emerald-600',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-600',
      icon: '⚠',
    },
    warning: {
      bg: 'bg-amber-600',
      icon: '!',
    },
    info: {
      bg: 'bg-blue-600',
      icon: 'ℹ',
    },
  }

  const style = variants[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`
        ${style.bg} text-white px-6 py-3 rounded-lg shadow-lg
        flex items-center gap-3 min-w-[300px]
      `}
    >
      <span className="text-lg font-bold">{style.icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="hover:opacity-70 transition-opacity"
      >
        ✕
      </button>
    </motion.div>
  )
}

// Toast container
interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'bottom-right',
}) => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        flex flex-col gap-2
        ${positions[position]}
      `}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
