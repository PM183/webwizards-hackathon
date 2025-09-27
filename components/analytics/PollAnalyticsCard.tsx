'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Button } from '../ui/button'
import { PollWithOptions } from '../../lib/types/polls'
import { analyzePoll, type PollAnalytics } from '../../lib/utils/analytics'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface PollAnalyticsCardProps {
  poll: PollWithOptions
  onViewDetails?: () => void
}

export function PollAnalyticsCard({ poll, onViewDetails }: PollAnalyticsCardProps) {
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)
        const data = await analyzePoll(poll.id)
        setAnalytics(data)
      } catch (err) {
        setError('Failed to load analytics')
        console.error('Error fetching poll analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [poll.id])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error || 'Failed to load analytics'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data for poll options
  const optionData = poll.poll_options.map((option, index) => ({
    name: option.text.length > 20 ? option.text.substring(0, 20) + '...' : option.text,
    fullName: option.text,
    votes: Math.floor(Math.random() * analytics.totalVotes), // Demo data
    percentage: Math.floor(Math.random() * 100),
    color: COLORS[index % COLORS.length]
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'archived': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 10) return { level: 'High', color: 'text-green-600' }
    if (score >= 5) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'Low', color: 'text-red-600' }
  }

  const engagement = getEngagementLevel(analytics.engagementScore)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {analytics.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(poll.status)}>
                {poll.status?.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                ID: {poll.id.substring(0, 8)}...
              </Badge>
            </div>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{analytics.totalVotes}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">{analytics.uniqueVoters}</div>
            <div className="text-xs text-muted-foreground">Unique Voters</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${engagement.color}`} />
            <div className={`text-lg font-bold ${engagement.color}`}>
              {analytics.engagementScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>

          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-600">{analytics.peakVotingTime}</div>
            <div className="text-xs text-muted-foreground">Peak Time</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm text-muted-foreground">
              {analytics.completionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={analytics.completionRate} />
        </div>

        {/* Vote Distribution Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Vote Distribution</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={optionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${value} votes`,
                    props.payload.fullName
                  ]}
                />
                <Bar dataKey="votes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security & Integrity */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Vote Integrity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-600">
              {analytics.integrityScore.toFixed(1)}%
            </span>
            {analytics.fraudAttempts === 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
        </div>

        {/* Additional Insights */}
        {analytics.fraudAttempts > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Security Alert</span>
            </div>
            <p className="text-xs text-yellow-700">
              {analytics.fraudAttempts} suspicious voting attempt(s) detected and blocked
            </p>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Response Rate</div>
            <div className="font-medium">
              {Math.min(100, (analytics.uniqueVoters / Math.max(analytics.totalVotes, 1)) * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg. Time</div>
            <div className="font-medium">{analytics.averageResponseTime}s</div>
          </div>
          <div>
            <div className="text-muted-foreground">Quality Score</div>
            <div className="font-medium">
              {Math.round((analytics.integrityScore + analytics.completionRate) / 2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}