'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { usePolls } from '../../lib/hooks/usePolls'
import { useAuth } from '../../lib/hooks/useAuth'
import { PollWithOptions } from '../../lib/types/polls'
import { formatDate, isPollActive } from '../../lib/utils/helpers'

interface VotingInterfaceProps {
  poll: PollWithOptions
}

export function VotingInterface({ poll }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { castVote, hasVoted, userVote, fetchUserVote } = usePolls()
  const { user } = useAuth()
  const router = useRouter()

  const isActive = isPollActive(poll)
  const canVote = isActive && !hasVoted && user

  useEffect(() => {
    if (poll.id && user) {
      fetchUserVote(poll.id)
    }
  }, [poll.id, user])

  useEffect(() => {
    if (userVote) {
      setSelectedOption(userVote.option_id)
    }
  }, [userVote])

  const handleVote = async () => {
    if (!selectedOption || !canVote) return

    try {
      setIsLoading(true)
      await castVote(poll.id, selectedOption)
      router.push(`/polls/${poll.id}/results`)
    } catch (error) {
      console.error('Error casting vote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusMessage = () => {
    if (!user) return 'Please log in to vote'
    if (!isActive) return 'This poll is not currently active'
    if (hasVoted) return 'You have already voted on this poll'
    return null
  }

  const statusMessage = getStatusMessage()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}

        <div className="flex flex-col space-y-2 text-sm text-gray-600">
          <div>Created by {poll.creator?.full_name || 'Unknown'}</div>
          {poll.start_time && (
            <div>Started: {formatDate(poll.start_time, 'PPp')}</div>
          )}
          {poll.end_time && (
            <div>Ends: {formatDate(poll.end_time, 'PPp')}</div>
          )}
          {poll.allow_multiple_votes && (
            <div className="text-blue-600">Multiple votes allowed</div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {statusMessage ? (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">{statusMessage}</p>
            {hasVoted && userVote && (
              <p className="text-sm text-gray-600 mt-2">
                Your vote: <strong>{userVote.option_text}</strong>
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {poll.poll_options
                .sort((a, b) => a.order_index - b.order_index)
                .map((option) => (
                  <label
                    key={option.id}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                      ${selectedOption === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${!canVote ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => canVote && setSelectedOption(e.target.value)}
                      disabled={!canVote}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="flex-1 text-sm font-medium">
                      {option.text}
                    </span>
                  </label>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={handleVote}
                disabled={!selectedOption || !canVote || isLoading}
                loading={isLoading}
              >
                Cast Vote
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/polls/${poll.id}/results`)}
              >
                View Results
              </Button>
            </div>
          </>
        )}

        {!statusMessage && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push('/polls')}
              className="text-sm"
            >
              ← Back to Polls
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}