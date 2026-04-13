import { useState, useCallback } from 'react'
import { Toast, ToastType } from '@/components/ui/Alert'

interface UseToastReturn {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => string
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  clear: () => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Date.now().toString()
      const newToast: Toast = {
        id,
        message,
        type,
        duration,
      }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message: string, duration = 3000) =>
      addToast(message, 'success', duration),
    [addToast]
  )

  const error = useCallback(
    (message: string, duration = 5000) =>
      addToast(message, 'error', duration),
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration = 4000) =>
      addToast(message, 'warning', duration),
    [addToast]
  )

  const info = useCallback(
    (message: string, duration = 3000) =>
      addToast(message, 'info', duration),
    [addToast]
  )

  const clear = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  }
}
