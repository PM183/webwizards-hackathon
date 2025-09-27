'use client'

import React from 'react'
import { ErrorBoundaryFallback } from './error'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorBoundaryFallback

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error)
    setError(error)
  }, [])

  // Throw error to be caught by ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}