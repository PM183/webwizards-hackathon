'use client'

import { useEffect } from 'react'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Plus, BarChart3, Users, Vote } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { PollCard } from '../../components/polls/PollCard'
import { usePolls } from '../../lib/hooks/usePolls'
import { useAuth } from '../../lib/hooks/useAuth'

export default function AdminDashboard() {
  const { polls, fetchPolls, loading, error } = usePolls()
  const { user, profile } = useAuth()

  console.log('AdminDashboard - Auth state:', {
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!profile,
    profileRole: profile?.role
  })

  useEffect(() => {
    fetchPolls()
  }, [])

  const recentPolls = polls.slice(0, 3)
  const activePolls = polls.filter(poll => poll.status === 'active')
  const draftPolls = polls.filter(poll => poll.status === 'draft')
  const closedPolls = polls.filter(poll => poll.status === 'closed')

  const stats = [
    {
      title: 'Total Polls',
      value: polls.length,
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Polls',
      value: activePolls.length,
      icon: Vote,
      color: 'bg-green-500',
    },
    {
      title: 'Draft Polls',
      value: draftPolls.length,
      icon: Users,
      color: 'bg-yellow-500',
    },
    {
      title: 'Closed Polls',
      value: closedPolls.length,
      icon: BarChart3,
      color: 'bg-gray-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.full_name}! Manage your polls and view analytics.
          </p>
          {/* Debug Info */}
          {error && (
            <p className="text-red-600 text-sm mt-1">
              Error: {error}
            </p>
          )}
        </div>
        <Link href="/admin/polls/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for poll management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/polls/create">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Create New Poll</div>
                    <div className="text-sm text-gray-500">Start a new polling session</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/polls">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manage Polls</div>
                    <div className="text-sm text-gray-500">Edit or delete existing polls</div>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-gray-500">Detailed poll statistics</div>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Polls */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Polls</h2>
          <Link href="/admin/polls">
            <Button variant="outline">View All Polls</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
          <>
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
              Debug: Found {polls.length} total polls, showing {recentPolls.length} recent polls
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showActions={true}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first poll to get started with collecting votes.
              </p>
              <Link href="/admin/polls/create">
                <Button>Create Your First Poll</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}