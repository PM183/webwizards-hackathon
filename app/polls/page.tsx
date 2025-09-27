'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { PollCard } from '../../components/polls/PollCard'
import { usePolls } from '../../lib/hooks/usePolls'
import { PollWithOptions } from '../../lib/types/polls'
import { isPollActive } from '../../lib/utils/helpers'

export default function PollsPage() {
  const { polls, fetchPolls, loading } = usePolls()
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
    if (statusFilter === 'active') {
      filtered = filtered.filter(poll => isPollActive(poll))
    } else if (statusFilter === 'upcoming') {
      filtered = filtered.filter(poll =>
        poll.status === 'active' &&
        poll.start_time &&
        new Date(poll.start_time) > new Date()
      )
    } else if (statusFilter === 'closed') {
      filtered = filtered.filter(poll => poll.status === 'closed')
    }

    setFilteredPolls(filtered)
  }, [polls, searchTerm, statusFilter])

  const activePolls = polls.filter(poll => isPollActive(poll))
  const upcomingPolls = polls.filter(poll =>
    poll.status === 'active' &&
    poll.start_time &&
    new Date(poll.start_time) > new Date()
  )
  const closedPolls = polls.filter(poll => poll.status === 'closed')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Polls</h1>
        <p className="text-gray-600 mt-1">
          Browse and participate in available polls.
        </p>
      </div>

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
              {activePolls.length}
            </div>
            <div className="text-sm text-gray-600">Active Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {upcomingPolls.length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {closedPolls.length}
            </div>
            <div className="text-sm text-gray-600">Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Polls</CardTitle>
          <CardDescription>
            Search and filter polls by status and content
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
                <option value="all">All Polls</option>
                <option value="active">Active Now</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No polls match your filters'
                  : 'No polls available'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'Check back later for new polls to participate in.'
                }
              </p>
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