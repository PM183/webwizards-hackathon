import { User } from '@supabase/supabase-js'
import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface AuthUser extends User {
  profile?: Profile
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName: string
  studentId?: string
  role?: 'admin' | 'student'
}

export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: RegisterCredentials) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdate) => Promise<void>
  isAdmin: boolean
  isStudent: boolean
}