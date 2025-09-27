'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, User, Settings, BarChart3 } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '../../lib/hooks/useAuth'
import { getDisplayName, getInitials } from '../../lib/utils/auth'

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user || !profile) {
    return null
  }

  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href={isAdmin ? '/admin' : '/student'} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Polling System</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              {isAdmin ? (
                <>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/polls"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Manage Polls
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/student"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/polls"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  >
                    All Polls
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">{displayName}</div>
                <div className="text-xs text-gray-500 capitalize">{profile.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{displayName}</div>
                  <div className="text-xs text-gray-500">{profile.email}</div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    handleSignOut()
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="px-4 py-2 space-y-1">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/polls"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Manage Polls
              </Link>
              <Link
                href="/admin/analytics"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Analytics
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/polls"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                All Polls
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}