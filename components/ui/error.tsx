'use client'

import { cn } from '@/lib/utils/helpers'
import { Button } from './button'

interface ErrorAlertProps {
  title?: string
  message: string
  variant?: 'error' | 'warning' | 'info'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({
  title,
  message,
  variant = 'error',
  dismissible = false,
  onDismiss,
  className
}: ErrorAlertProps) {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconMap = {
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
    <div className={cn(
      'rounded-lg border p-4',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {iconMap[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="brand-text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="brand-text-sm">
            {message}
          </p>
        </div>
        {dismissible && (
          <div className="ml-auto flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetError: () => void
  className?: string
}

export function ErrorBoundaryFallback({ error, resetError, className }: ErrorBoundaryFallbackProps) {
  return (
    <div className={cn('brand-card p-8 text-center space-y-6', className)}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="space-y-3">
        <h3 className="brand-heading-md text-red-900">
          Something went wrong
        </h3>
        <p className="brand-text-base text-gray-600 max-w-md mx-auto">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer brand-text-sm font-medium text-gray-700 hover:text-gray-900">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md brand-text-xs text-gray-800 overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>

      <div className="flex justify-center space-x-3">
        <Button onClick={resetError} className="brand-button-primary">
          Try Again
        </Button>
        <Button
          variant="outline"
          className="brand-button-secondary"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  const defaultIcon = (
    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )

  return (
    <div className={cn('text-center py-12 px-6', className)}>
      <div className="mx-auto mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="brand-heading-sm text-gray-900 mb-2">
        {title}
      </h3>
      <p className="brand-text-base text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="brand-button-primary"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface NotFoundProps {
  title?: string
  description?: string
  showHomeLink?: boolean
  className?: string
}

export function NotFound({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showHomeLink = true,
  className
}: NotFoundProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center px-4', className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold brand-gradient-text">
            404
          </h1>
          <h2 className="brand-heading-lg text-gray-900">
            {title}
          </h2>
          <p className="brand-text-base text-gray-600">
            {description}
          </p>
        </div>

        {showHomeLink && (
          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              className="brand-button-primary w-full"
            >
              Go Back
            </Button>
            <Button
              variant="outline"
              className="brand-button-secondary w-full"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <div className={cn('brand-card p-8 text-center space-y-4', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v4m0 12v4m10-10h-4M6 12H2" />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="brand-heading-sm text-gray-900">
          Connection Problem
        </h3>
        <p className="brand-text-sm text-gray-600">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} className="brand-button-primary">
          Try Again
        </Button>
      )}
    </div>
  )
}

interface AccessDeniedProps {
  title?: string
  description?: string
  className?: string
}

export function AccessDenied({
  title = "Access Denied",
  description = "You don't have permission to access this resource.",
  className
}: AccessDeniedProps) {
  return (
    <div className={cn('brand-card p-8 text-center space-y-4', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="brand-heading-sm text-gray-900">
          {title}
        </h3>
        <p className="brand-text-sm text-gray-600">
          {description}
        </p>
      </div>

      <Button
        onClick={() => window.history.back()}
        className="brand-button-secondary"
      >
        Go Back
      </Button>
    </div>
  )
}