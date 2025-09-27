'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { PollForm } from '../../../../../components/polls/PollForm'
import { usePolls } from '../../../../../lib/hooks/usePolls'

export default function EditPollPage() {
  const params = useParams()
  const router = useRouter()
  const { currentPoll, fetchPoll, loading, error, clearCurrentPoll } = usePolls()
  const [isLoading, setIsLoading] = useState(false)

  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      fetchPoll(pollId)
    }

    return () => {
      clearCurrentPoll()
    }
  }, [pollId])

  const handleSuccess = () => {
    router.push('/admin/polls')
  }

  const handleCancel = () => {
    router.push('/admin/polls')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/polls')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Poll</h1>
          </div>
        </div>

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

  if (error || !currentPoll) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/polls')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Poll</h1>
          </div>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? 'Error Loading Poll' : 'Poll Not Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'The poll you\'re trying to edit doesn\'t exist or has been removed.'}
            </p>
            <Button onClick={() => router.push('/admin/polls')}>
              Back to Polls
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/polls')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Polls
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Poll</h1>
          <p className="text-gray-600 mt-1">
            Update poll details, options, and status.
          </p>
        </div>
      </div>

      <PollForm
        poll={currentPoll}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}