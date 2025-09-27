'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { cn } from '@/lib/utils/helpers'

interface Toast {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  dismissible?: boolean
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 150) // Match animation duration
  }

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconMap = {
    success: (
      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        'transform transition-all duration-150 ease-in-out',
        'animate-in slide-in-from-right-full',
        typeClasses[toast.type],
        isExiting && 'animate-out slide-out-to-right-full'
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {iconMap[toast.type]}
        </div>
        <div className="ml-3 flex-1">
          {toast.title && (
            <h4 className="brand-text-sm font-medium mb-1">
              {toast.title}
            </h4>
          )}
          <p className="brand-text-sm">
            {toast.message}
          </p>
        </div>
        {toast.dismissible && (
          <div className="ml-auto flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={handleDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for duration */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-3 w-full bg-black/10 rounded-full h-1">
          <div
            className="h-1 rounded-full bg-current opacity-50"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Utility functions for easier usage
export const toast = {
  success: (message: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'success', message, ...options }
      })
      window.dispatchEvent(event)
    }
  },
  error: (message: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'error', message, ...options }
      })
      window.dispatchEvent(event)
    }
  },
  warning: (message: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'warning', message, ...options }
      })
      window.dispatchEvent(event)
    }
  },
  info: (message: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('toast', {
        detail: { type: 'info', message, ...options }
      })
      window.dispatchEvent(event)
    }
  }
}

// Custom CSS for toast animations
const toastStyles = `
@keyframes toast-progress {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-in {
  animation-fill-mode: both;
}

.animate-out {
  animation-fill-mode: both;
}

.slide-in-from-right-full {
  animation-name: slideInFromRight;
}

.slide-out-to-right-full {
  animation-name: slideOutToRight;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutToRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
`

// Inject styles
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = toastStyles
  document.head.appendChild(styleSheet)
}