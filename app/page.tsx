'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../lib/hooks/useAuth'
import { RoleBasedRedirect } from '../components/auth/RoleBasedRedirect'

export default function Home() {
  const { user, loading } = useAuth()
  const [showRedirect, setShowRedirect] = useState(false)

  useEffect(() => {
    // If user is authenticated, show redirect component after a short delay
    // This acts as a fallback if middleware doesn't redirect properly
    if (user && !loading) {
      const timer = setTimeout(() => {
        console.log('Home page: User detected, showing redirect fallback')
        setShowRedirect(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, loading])

  // Show redirect component for authenticated users
  if (user && showRedirect) {
    return <RoleBasedRedirect />
  }
  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-30 animate-float"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-white/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-32 w-8 h-8 bg-white/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-white/25 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        <Card className="brand-card text-center backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl hover-lift interactive-card">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl brand-gradient shadow-lg animate-scale-in hover-glow">
              <svg
                className="h-12 w-12 text-white animate-heartbeat"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>

            {/* Title */}
            <div className="space-y-3 animate-fade-in-down" style={{animationDelay: '0.2s'}}>
              <CardTitle className="brand-heading-xl brand-gradient-text">
                PollWizard
              </CardTitle>
              <CardDescription className="brand-text-lg text-gray-600">
                Real-time polling and voting platform for the modern web
              </CardDescription>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-4 stagger-children">
              <div className="text-center hover-grow">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 hover-lift">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="brand-text-xs font-medium">Real-time</p>
              </div>
              <div className="text-center hover-grow">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 hover-lift">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="brand-text-xs font-medium">Secure</p>
              </div>
              <div className="text-center hover-grow">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 hover-lift">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="brand-text-xs font-medium">Analytics</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            <p className="brand-text-base text-gray-600 leading-relaxed animate-fade-in" style={{animationDelay: '0.5s'}}>
              Create interactive polls, gather votes in real-time, and analyze results with comprehensive analytics and fraud detection.
            </p>

            <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
              <Link href="/login" className="block">
                <Button className="w-full brand-button-primary h-12 text-base font-medium button-ripple hover-lift">
                  Sign In to Dashboard
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button variant="outline" className="w-full brand-button-secondary h-12 text-base font-medium button-ripple hover-lift">
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="pt-6 border-t border-gray-100 animate-fade-in" style={{animationDelay: '0.9s'}}>
              <p className="brand-text-xs text-gray-500 mb-3">Trusted by students and institutions</p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2 hover-grow">
                  <div className="w-2 h-2 bg-green-500 rounded-full pulse"></div>
                  <span className="brand-text-xs font-medium text-gray-600">10K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2 hover-grow">
                  <div className="w-2 h-2 bg-blue-500 rounded-full pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="brand-text-xs font-medium text-gray-600">99.9% Uptime</span>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center animate-fade-in" style={{animationDelay: '1.1s'}}>
              <p className="brand-text-xs text-gray-500">
                Built with <span className="font-medium hover-glow">Next.js 15</span>, <span className="font-medium hover-glow">React 19</span>, and <span className="font-medium hover-glow">Supabase</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced floating elements */}
        <div className="absolute -bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute -top-8 right-8 w-12 h-12 bg-white/20 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-md animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-sm animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '0s'}}></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '5s'}}></div>
    </div>
  )
}
