export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'student'
export type PollStatus = 'draft' | 'active' | 'closed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          student_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          student_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          student_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          status: PollStatus
          allow_multiple_votes: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          status?: PollStatus
          allow_multiple_votes?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          status?: PollStatus
          allow_multiple_votes?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          order_index?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      poll_results_view: {
        Row: {
          poll_id: string | null
          poll_title: string | null
          option_id: string | null
          option_text: string | null
          order_index: number | null
          vote_count: number | null
          percentage: number | null
        }
      }
    }
    Functions: {
      get_poll_results: {
        Args: {
          poll_uuid: string
        }
        Returns: {
          option_id: string
          option_text: string
          vote_count: number
          percentage: number
        }[]
      }
      has_user_voted: {
        Args: {
          poll_uuid: string
          user_uuid: string
        }
        Returns: boolean
      }
      get_user_vote: {
        Args: {
          poll_uuid: string
          user_uuid: string
        }
        Returns: {
          option_id: string
          option_text: string
          voted_at: string
        }[]
      }
      cast_vote: {
        Args: {
          poll_uuid: string
          option_uuid: string
          user_uuid: string
        }
        Returns: Json
      }
      get_poll_statistics: {
        Args: {
          poll_uuid: string
        }
        Returns: Json
      }
      get_all_polls_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          poll_id: string
          title: string
          description: string | null
          status: PollStatus
          creator_name: string
          total_votes: number
          unique_voters: number
          created_at: string
          start_time: string | null
          end_time: string | null
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_vote_on_poll: {
        Args: {
          poll_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      poll_status: PollStatus
    }
  }
}