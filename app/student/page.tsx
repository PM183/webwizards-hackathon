'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import Link from 'next/link'
import { Vote, BarChart3, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PollCard } from '../../components/polls/PollCard'
import { usePolls } from '../../lib/hooks/usePolls'
import { useAuth } from '../../lib/hooks/useAuth'
import { isPollActive } from '../../lib/utils/helpers'

export default function StudentDashboard() {
  const { polls, fetchPolls, loading } = usePolls()
  const { profile } = useAuth()

  useEffect(() => {
    fetchPolls({ status: 'active' })
  }, [])

  const activePolls = polls.filter(poll => isPollActive(poll))
  const upcomingPolls = polls.filter(poll =>
    poll.status === 'active' &&
    poll.start_time &&
    new Date(poll.start_time) > new Date()
  )
  const recentPolls = polls.slice(0, 4)

  const stats = [
    {
      title: 'Active Polls',
      value: activePolls.length,
      description: 'Polls you can vote on now',
      icon: Vote,
      color: 'bg-green-500',
    },
    {
      title: 'Upcoming Polls',
      value: upcomingPolls.length,
      description: 'Polls starting soon',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Polls',
      value: polls.length,
      description: 'All available polls',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.full_name}! Participate in active polls and view results.
          </p>
        </div>
        <Link href="/polls">
          <Button className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            View All Polls
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to common tasks and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/polls?filter=active">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <Vote className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Vote on Active Polls</div>
                    <div className="text-sm text-gray-500">
                      {activePolls.length} polls available for voting
                    </div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/polls?filter=results">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">View Poll Results</div>
                    <div className="text-sm text-gray-500">
                      See real-time voting results
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Polls Section */}
      {activePolls.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Polls</h2>
            <Link href="/polls?filter=active">
              <Button variant="outline">View All Active</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePolls.slice(0, 3).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Polls */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Polls</h2>
          <Link href="/polls">
            <Button variant="outline">View All Polls</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : recentPolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls available</h3>
              <p className="text-gray-600 mb-4">
                There are no polls available at the moment. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Welcome Message for New Users */}
      {polls.length === 0 && !loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Welcome to the Polling System!
            </h3>
            <p className="text-blue-700 mb-4">
              You're all set up. When polls become available, you'll see them here and can participate in voting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}