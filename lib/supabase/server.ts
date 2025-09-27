import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../types/database'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get authenticated user and profile
export async function getAuthenticatedUser() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { user: null, profile: null, error: userError }
    }

    const { data: profile, error: profileError } = await (supabase
      .from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      user,
      profile,
      error: profileError
    }
  } catch (error) {
    return {
      user: null,
      profile: null,
      error: error as Error
    }
  }
}

// Helper function to check if user is admin
export async function isUserAdmin(): Promise<boolean> {
  const { profile } = await getAuthenticatedUser()
  return (profile as any)?.role === 'admin'
}

// Helper function to require authentication
export async function requireAuth() {
  const { user, profile, error } = await getAuthenticatedUser()

  if (error || !user || !profile) {
    throw new Error('Authentication required')
  }

  return { user, profile }
}

// Helper function to require admin privileges
export async function requireAdmin() {
  const { user, profile } = await requireAuth()

  if ((profile as any).role !== 'admin') {
    throw new Error('Admin privileges required')
  }

  return { user, profile }
}