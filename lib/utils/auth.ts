import { AuthUser, Profile } from '../types/auth'
import { UserRole } from '../types/database'

// Auth state utilities
export function isAuthenticated(user: AuthUser | null): user is AuthUser {
  return user !== null && user.id !== undefined
}

export function isAdmin(user: AuthUser | null, profile: Profile | null): boolean {
  return isAuthenticated(user) && profile?.role === 'admin'
}

export function isStudent(user: AuthUser | null, profile: Profile | null): boolean {
  return isAuthenticated(user) && profile?.role === 'student'
}

export function hasRole(user: AuthUser | null, profile: Profile | null, role: UserRole): boolean {
  return isAuthenticated(user) && profile?.role === role
}

// Profile utilities
export function getDisplayName(profile: Profile | null): string {
  if (!profile) return 'Anonymous'
  return profile.full_name || profile.email
}

export function getInitials(profile: Profile | null): string {
  if (!profile?.full_name) return '??'

  const names = profile.full_name.split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

export function getAvatarUrl(profile: Profile | null): string | null {
  return profile?.avatar_url || null
}

// Permission utilities
export function canCreatePoll(user: AuthUser | null, profile: Profile | null): boolean {
  return isAdmin(user, profile)
}

export function canEditPoll(user: AuthUser | null, profile: Profile | null, pollCreatorId: string): boolean {
  if (!isAuthenticated(user)) return false
  return isAdmin(user, profile) && user.id === pollCreatorId
}

export function canDeletePoll(user: AuthUser | null, profile: Profile | null, pollCreatorId: string): boolean {
  if (!isAuthenticated(user)) return false
  return isAdmin(user, profile) && user.id === pollCreatorId
}

export function canVoteOnPoll(user: AuthUser | null, profile: Profile | null): boolean {
  return isAuthenticated(user) // Both admin and student can vote
}

export function canViewAdminDashboard(user: AuthUser | null, profile: Profile | null): boolean {
  return isAdmin(user, profile)
}

export function canViewAnalytics(user: AuthUser | null, profile: Profile | null): boolean {
  return isAdmin(user, profile)
}

export function canManageUsers(user: AuthUser | null, profile: Profile | null): boolean {
  return isAdmin(user, profile)
}

// Route protection utilities
export function getRedirectPath(user: AuthUser | null, profile: Profile | null): string {
  if (!isAuthenticated(user)) return '/login'

  if (isAdmin(user, profile)) {
    return '/admin'
  }

  return '/student'
}

export function shouldRedirectToAuth(user: AuthUser | null): boolean {
  return !isAuthenticated(user)
}

export function shouldRedirectFromAuth(user: AuthUser | null): boolean {
  return isAuthenticated(user)
}

// Error handling
export function getAuthErrorMessage(error: any): string {
  if (typeof error === 'string') return error

  if (error?.message) {
    // Common Supabase auth errors
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link'
      case 'User already registered':
        return 'An account with this email already exists'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long'
      case 'Signup is disabled':
        return 'New registrations are currently disabled'
      case 'Email rate limit exceeded':
        return 'Too many requests. Please try again later'
      default:
        return error.message
    }
  }

  return 'An unexpected error occurred'
}

// Session utilities
export const SESSION_STORAGE_KEY = 'polling_app_session'

export function getStoredSession() {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeSession(session: any) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Validation utilities for auth forms
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters long'
  return null
}

export function validateFullName(fullName: string): string | null {
  if (!fullName) return 'Full name is required'
  if (fullName.length < 2) return 'Full name must be at least 2 characters long'
  return null
}

export function validateStudentId(studentId: string): string | null {
  if (!studentId) return null // Optional field
  if (studentId.length < 3) return 'Student ID must be at least 3 characters long'
  return null
}