'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '../supabase/client'
import { AuthContextType, AuthUser, LoginCredentials, RegisterCredentials, Profile } from '../types/auth'
import { getAuthErrorMessage } from '../utils/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user as AuthUser)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError(getAuthErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as AuthUser)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  // Sign in
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(data.user as AuthUser)
        await fetchProfile(data.user.id)
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign up
  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: credentials.email,
            full_name: credentials.fullName,
            role: credentials.role || 'student',
            student_id: credentials.studentId || null,
          } as any)

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Don't throw here, as the user is already created
        }

        setUser(data.user as AuthUser)
        await fetchProfile(data.user.id)
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setProfile(null)
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error('No user logged in')
      }

      setLoading(true)
      setError(null)

      const { data, error } = await (supabase
        .from('profiles') as any)
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Computed properties
  const isAdmin = profile?.role === 'admin'
  const isStudent = profile?.role === 'student'

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isStudent,
  }
}

export { AuthContext }