'use client'

import { ReactNode, createContext } from 'react'
import { AuthContext, useAuthProvider } from '../../lib/hooks/useAuth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: ReactNode
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallback = <div>Loading...</div>
}: AuthGuardProps) {
  const { user, profile, loading } = useAuthProvider()

  if (loading) {
    return <>{fallback}</>
  }

  if (requireAuth && !user) {
    return <div>Please log in to access this page.</div>
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <div>Admin access required.</div>
  }

  return <>{children}</>
}