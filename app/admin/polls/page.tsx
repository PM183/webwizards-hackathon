'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { PollCard } from '../../../components/polls/PollCard'
import { usePolls } from '../../../lib/hooks/usePolls'
import { PollFilters, PollWithOptions } from '../../../lib/types/polls'

export default function AdminPollsPage() {
  const { polls, fetchPolls, deletePoll, updatePoll, loading } = usePolls()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filteredPolls, setFilteredPolls] = useState<PollWithOptions[]>([])

  useEffect(() => {
    fetchPolls()
  }, [])

  useEffect(() => {
    let filtered = polls

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(poll =>
        poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(poll => poll.status === statusFilter)
    }

    setFilteredPolls(filtered)
  }, [polls, searchTerm, statusFilter])

  const handleDeletePoll = async (poll: PollWithOptions) => {
    if (window.confirm(`Are you sure you want to delete "${poll.title}"? This action cannot be undone.`)) {
      try {
        await deletePoll(poll.id)
      } catch (error) {
        console.error('Error deleting poll:', error)
      }
    }
  }

  const handleStatusToggle = async (poll: PollWithOptions, newStatus: 'draft' | 'active' | 'closed') => {
    try {
      await updatePoll(poll.id, {
        title: poll.title,
        description: poll.description || undefined,
        options: poll.poll_options.map(option => option.text),
        allowMultipleVotes: poll.allow_multiple_votes,
        status: newStatus,
        startTime: poll.start_time ? new Date(poll.start_time) : null,
        endTime: poll.end_time ? new Date(poll.end_time) : null,
      })
    } catch (error) {
      console.error('Error updating poll status:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Polls</h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage all your polling sessions.
          </p>
        </div>
        <Link href="/admin/polls/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Polls</CardTitle>
          <CardDescription>
            Search and filter your polls by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search polls by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{polls.length}</div>
            <div className="text-sm text-gray-600">Total Polls</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {polls.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {polls.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {polls.filter(p => p.status === 'closed').length}
            </div>
            <div className="text-sm text-gray-600">Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* Polls Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                showActions={true}
                onEdit={(poll) => {
                  // Navigate to edit page
                  window.location.href = `/admin/polls/${poll.id}/edit`
                }}
                onDelete={handleDeletePoll}
                onStatusToggle={handleStatusToggle}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No polls match your filters'
                  : 'No polls yet'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'Create your first poll to get started with collecting votes.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Link href="/admin/polls/create">
                  <Button>Create Your First Poll</Button>
                </Link>
              )}
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}