'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PollResults } from '../../../../components/polls/PollResults'
import { usePolls } from '../../../../lib/hooks/usePolls'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent } from '../../../../components/ui/card'

export default function ResultsPage() {
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="animate-pulse p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/polls">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Polls
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poll Results</h1>
          </div>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Results</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentPoll) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/polls">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Polls
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poll Results</h1>
          </div>
        </div>

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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/polls">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Poll Results</h1>
          <p className="text-gray-600 mt-1">
            Real-time voting results and statistics
          </p>
        </div>
      </div>

      <PollResults poll={currentPoll} />
    </div>
  )
}