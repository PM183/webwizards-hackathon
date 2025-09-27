'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/hooks/useAuth'

interface RoleBasedRedirectProps {
  fallbackPath?: string
}

export function RoleBasedRedirect({ fallbackPath = '/student' }: RoleBasedRedirectProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('RoleBasedRedirect:', { user: !!user, profile, role: profile?.role })

      if (profile?.role === 'admin') {
        console.log('Redirecting admin to /admin')
        router.replace('/admin')
      } else if (profile?.role === 'student' || profile) {
        console.log('Redirecting student to /student')
        router.replace('/student')
      } else {
        // No profile yet, wait a bit then fallback
        setTimeout(() => {
          console.log('Fallback redirect to', fallbackPath)
          router.replace(fallbackPath)
        }, 2000)
      }
    }
  }, [user, profile, loading, router, fallbackPath])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your dashboard...</p>
      </div>
    </div>
  )
}