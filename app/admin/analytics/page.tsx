'use client'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { usePolls } from '../../../lib/hooks/usePolls'
import { createClient } from '../../../lib/supabase/client'

interface AnalyticsData {
  totalPolls: number
  totalVotes: number
  totalUsers: number
  averageVotesPerPoll: number
  mostActivePolls: Array<{
    title: string
    votes: number
  }>
  votesByStatus: Array<{
    status: string
    count: number
  }>
  dailyVotes: Array<{
    date: string
    votes: number
  }>
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']

export default function AnalyticsPage() {
  const { polls, fetchPolls, loading } = usePolls()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPolls()
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)

      // Get total votes
      const { data: votes, error: votesError } = await (supabase
        .from('votes') as any)
        .select('*')

      if (votesError) throw votesError

      // Get total users
      const { data: users, error: usersError } = await (supabase
        .from('profiles') as any)
        .select('id')

      if (usersError) throw usersError

      // Get poll stats
      const { data: pollStats, error: pollStatsError } = await (supabase as any)
        .rpc('get_all_polls_with_stats')

      if (pollStatsError) throw pollStatsError

      // Process data
      const totalVotes = votes?.length || 0
      const totalUsers = users?.length || 0
      const totalPolls = polls.length
      const averageVotesPerPoll = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0

      // Most active polls
      const mostActivePolls = (pollStats as any)
        ?.sort((a: any, b: any) => b.total_votes - a.total_votes)
        .slice(0, 5)
        .map((poll: any) => ({
          title: poll.title.length > 30 ? poll.title.substring(0, 30) + '...' : poll.title,
          votes: poll.total_votes || 0
        })) || []

      // Votes by status
      const statusCounts = polls.reduce((acc: any, poll) => {
        acc[poll.status] = (acc[poll.status] || 0) + 1
        return acc
      }, {})

      const votesByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: count as number
      }))

      // Daily votes (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const dailyVotes = last7Days.map(date => {
        const dayVotes = votes?.filter((vote: any) =>
          vote.created_at.startsWith(date)
        ).length || 0

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          votes: dayVotes
        }
      })

      setAnalytics({
        totalPolls,
        totalVotes,
        totalUsers,
        averageVotesPerPoll,
        mostActivePolls,
        votesByStatus,
        dailyVotes
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (loading || analyticsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your polling system performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Polls',
      value: analytics.totalPolls,
      description: 'All created polls',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Votes',
      value: analytics.totalVotes,
      description: 'Votes cast across all polls',
      color: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      description: 'Registered users in system',
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Votes/Poll',
      value: analytics.averageVotesPerPoll,
      description: 'Average engagement per poll',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive insights into your polling system performance.
        </p>
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
                <div className="h-4 w-4 bg-white rounded-full opacity-75" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Polls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Most Active Polls</CardTitle>
            <CardDescription>Polls with the highest vote counts</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.mostActivePolls.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.mostActivePolls}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No poll data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Poll Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Poll Status Distribution</CardTitle>
            <CardDescription>Breakdown of polls by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.votesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.votesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.votesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No status data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Votes Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Daily Voting Activity</CardTitle>
          <CardDescription>Vote count trend over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyVotes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}