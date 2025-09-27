'use client'

import Link from 'next/link'
import { formatDate, formatRelativeTime, getPollStatusText, getPollStatusColor } from '../../lib/utils/helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { PollWithOptions } from '../../lib/types/polls'
import { useAuth } from '../../lib/hooks/useAuth'

interface PollCardProps {
  poll: PollWithOptions
  showActions?: boolean
  onEdit?: (poll: PollWithOptions) => void
  onDelete?: (poll: PollWithOptions) => void
  onStatusToggle?: (poll: PollWithOptions, newStatus: 'draft' | 'active' | 'closed') => void
}

export function PollCard({ poll, showActions = false, onEdit, onDelete, onStatusToggle }: PollCardProps) {
  const { isAdmin } = useAuth()
  const canEdit = isAdmin && showActions
  const canVote = poll.status === 'active'

  const statusText = getPollStatusText(poll)
  const statusColor = getPollStatusColor(poll.status)

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return 'active'
      case 'active':
        return 'closed'
      case 'closed':
        return 'draft'
      default:
        return 'draft'
    }
  }

  const handleStatusToggle = () => {
    if (onStatusToggle) {
      const nextStatus = getNextStatus(poll.status) as 'draft' | 'active' | 'closed'
      onStatusToggle(poll, nextStatus)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{poll.title}</CardTitle>
            <CardDescription className="mt-1">
              Created by {poll.creator?.full_name || 'Unknown'} • {formatRelativeTime(poll.created_at)}
            </CardDescription>
          </div>
          <div className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
            {statusText}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {poll.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{poll.description}</p>
        )}

        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            {poll.poll_options.length} option{poll.poll_options.length !== 1 ? 's' : ''}
          </div>

          {poll.start_time && (
            <div className="text-sm text-gray-500">
              Starts: {formatDate(poll.start_time, 'PPp')}
            </div>
          )}

          {poll.end_time && (
            <div className="text-sm text-gray-500">
              Ends: {formatDate(poll.end_time, 'PPp')}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {canVote && (
            <Link href={`/polls/${poll.id}/vote`} className="flex-1">
              <Button className="w-full" size="sm">
                Vote Now
              </Button>
            </Link>
          )}

          <Link href={`/polls/${poll.id}/results`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              View Results
            </Button>
          </Link>

          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(poll)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete?.(poll)}
              >
                Delete
              </Button>
              {onStatusToggle && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStatusToggle}
                  title={`Change status to ${getNextStatus(poll.status)}`}
                >
                  {poll.status === 'draft' && '▶️ Activate'}
                  {poll.status === 'active' && '⏹️ Close'}
                  {poll.status === 'closed' && '📝 Draft'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}