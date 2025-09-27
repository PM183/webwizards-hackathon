import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/database'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Create a single supabase client for interacting with your database
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export a default client instance for convenience
export const supabase = createClient()