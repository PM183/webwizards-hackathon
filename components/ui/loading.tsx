'use client'

import { cn } from '@/lib/utils/helpers'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'loading-spinner',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string
  height?: string
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width = '100%',
  height = '1rem'
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full aspect-square'
  }

  return (
    <div
      className={cn(
        'loading-skeleton',
        variantClasses[variant],
        className
      )}
      style={{ width, height: variant === 'circular' ? width : height }}
      role="status"
      aria-label="Loading content"
    />
  )
}

interface LoadingCardProps {
  lines?: number
  showAvatar?: boolean
  className?: string
}

export function LoadingCard({ lines = 3, showAvatar = false, className }: LoadingCardProps) {
  return (
    <div className={cn('brand-card p-6 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circular" width="40px" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton width="120px" height="16px" />
            <LoadingSkeleton width="80px" height="14px" />
          </div>
        </div>
      )}

      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          width={i === lines - 1 ? '75%' : '100%'}
          height="14px"
        />
      ))}
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
  onClick?: () => void
}

export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  className,
  onClick
}: LoadingButtonProps) {
  const baseClasses = variant === 'primary' ? 'brand-button-primary' : 'brand-button-secondary'

  return (
    <button
      className={cn(
        baseClasses,
        'inline-flex items-center justify-center space-x-2',
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  )
}

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ visible, message = 'Loading...', className }: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-black/50 backdrop-blur-sm',
      className
    )}>
      <div className="brand-card p-8 text-center space-y-4 max-w-sm mx-4">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="brand-text-base font-medium">{message}</p>
      </div>
    </div>
  )
}

interface LoadingListProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function LoadingList({ items = 5, showAvatar = false, className }: LoadingListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <LoadingCard key={i} lines={2} showAvatar={showAvatar} />
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function LoadingTable({ rows = 5, cols = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('brand-card overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <LoadingSkeleton key={i} width="80px" height="16px" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <LoadingSkeleton
                  key={colIndex}
                  width={colIndex === 0 ? '100px' : '60px'}
                  height="14px"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}