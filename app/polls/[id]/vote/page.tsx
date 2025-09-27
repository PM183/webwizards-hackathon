'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { VotingInterface } from '../../../../components/polls/VotingInterface'
import { usePolls } from '../../../../lib/hooks/usePolls'
import { Card, CardContent } from '../../../../components/ui/card'

export default function VotePage() {
  const params = useParams()
  const { currentPoll, fetchPoll, loading, error } = usePolls()
  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      fetchPoll(pollId)
    }
  }, [pollId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="animate-pulse p-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3 mt-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded mt-6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Poll</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentPoll) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Poll Not Found</h3>
            <p className="text-gray-600">The poll you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Cast Your Vote</h1>
        <p className="text-gray-600 mt-1">
          Select your preferred option and submit your vote
        </p>
      </div>

      <VotingInterface poll={currentPoll} />
    </div>
  )
}