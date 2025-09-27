'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { PollForm } from '../../../../components/polls/PollForm'

export default function CreatePollPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
        <p className="text-gray-600 mt-1">
          Create a new poll for students to participate in.
        </p>
      </div>

      <PollForm />
    </div>
  )
}