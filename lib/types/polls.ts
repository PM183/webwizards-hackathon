import { Database } from './database'

export type Poll = Database['public']['Tables']['polls']['Row']
export type PollInsert = Database['public']['Tables']['polls']['Insert']
export type PollUpdate = Database['public']['Tables']['polls']['Update']

export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type PollOptionInsert = Database['public']['Tables']['poll_options']['Insert']
export type PollOptionUpdate = Database['public']['Tables']['poll_options']['Update']

export type Vote = Database['public']['Tables']['votes']['Row']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']

export interface PollWithOptions extends Poll {
  poll_options: PollOption[]
  creator?: {
    full_name: string
    email: string
  }
}

export interface PollResult {
  option_id: string
  option_text: string
  vote_count: number
  percentage: number
}

export interface PollStats {
  poll_id: string
  title: string
  description: string | null
  status: Database['public']['Enums']['poll_status']
  creator_name: string
  total_votes: number
  unique_voters: number
  created_at: string
  start_time: string | null
  end_time: string | null
}

export interface UserVote {
  option_id: string
  option_text: string
  voted_at: string
}

export interface VoteResponse {
  success: boolean
  error?: string
  message?: string
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[]
  allowMultipleVotes?: boolean
  startTime?: Date | null
  endTime?: Date | null
}

export interface EditPollData extends CreatePollData {
  status?: Database['public']['Enums']['poll_status']
}

export interface PollFilters {
  status?: Database['public']['Enums']['poll_status']
  creatorId?: string
  search?: string
}

export interface PollsState {
  polls: PollWithOptions[]
  loading: boolean
  error: string | null
  currentPoll: PollWithOptions | null
  results: PollResult[]
  userVote: UserVote | null
  hasVoted: boolean
}

export interface PollsContextType extends PollsState {
  fetchPolls: (filters?: PollFilters) => Promise<void>
  fetchPoll: (id: string) => Promise<void>
  createPoll: (data: CreatePollData) => Promise<string>
  updatePoll: (id: string, data: EditPollData) => Promise<void>
  deletePoll: (id: string) => Promise<void>
  castVote: (pollId: string, optionId: string) => Promise<void>
  fetchResults: (pollId: string) => Promise<void>
  fetchUserVote: (pollId: string) => Promise<void>
  clearCurrentPoll: () => void
}