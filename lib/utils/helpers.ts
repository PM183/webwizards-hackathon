import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

// Tailwind CSS class utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr: string = 'PPP') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

export function formatRelativeTime(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function isDateInPast(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return isBefore(dateObj, new Date())
}

export function isDateInFuture(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return isAfter(dateObj, new Date())
}

// Poll status utilities
export function isPollActive(poll: {
  status: string
  start_time?: string | null
  end_time?: string | null
}) {
  if (poll.status !== 'active') return false

  const now = new Date()

  if (poll.start_time && isAfter(new Date(poll.start_time), now)) {
    return false // Poll hasn't started yet
  }

  if (poll.end_time && isBefore(new Date(poll.end_time), now)) {
    return false // Poll has ended
  }

  return true
}

export function getPollStatusText(poll: {
  status: string
  start_time?: string | null
  end_time?: string | null
}) {
  if (poll.status === 'draft') return 'Draft'
  if (poll.status === 'closed') return 'Closed'

  if (poll.status === 'active') {
    if (poll.start_time && isDateInFuture(poll.start_time)) {
      return `Starts ${formatRelativeTime(poll.start_time)}`
    }
    if (poll.end_time && isDateInPast(poll.end_time)) {
      return 'Ended'
    }
    if (poll.end_time) {
      return `Ends ${formatRelativeTime(poll.end_time)}`
    }
    return 'Active'
  }

  return 'Unknown'
}

export function getPollStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'closed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Vote percentage utilities
export function calculatePercentage(count: number, total: number) {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

export function formatPercentage(percentage: number) {
  return `${percentage}%`
}

// Array utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// String utilities
export function truncate(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Validation utilities
export function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL utilities
export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function constructUrl(path: string) {
  return `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

export function isApiError(error: any): error is { message: string; status?: number } {
  return error && typeof error.message === 'string'
}

// Local storage utilities (safe for SSR)
export function getFromLocalStorage(key: string, defaultValue?: string): string | null {
  if (typeof window === 'undefined') return defaultValue || null
  try {
    return localStorage.getItem(key) || defaultValue || null
  } catch {
    return defaultValue || null
  }
}

export function setToLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently fail if localStorage is not available
  }
}