'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  Activity,
  Users,
  Vote,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Eye,
  Shield,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  generateAnalyticsDashboard,
  TIME_RANGES,
  exportAnalyticsToCSV,
  exportAnalyticsToJSON,
  type AnalyticsDashboard as AnalyticsDashboardType
} from '../../lib/utils/analytics'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

interface ChartViewProps {
  title: string
  data: any[]
  type: 'line' | 'bar' | 'area' | 'pie'
  dataKey?: string
  xKey?: string
  color?: string
}

function ChartView({ title, data, type, dataKey = 'value', xKey = 'timestamp', color = '#3B82F6' }: ChartViewProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleString() : undefined}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleString() : undefined}
            />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={xKey === 'timestamp' ? (value) => new Date(value).toLocaleString() : undefined}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<keyof typeof TIME_RANGES>('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch analytics data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await generateAnalyticsDashboard(selectedTimeRange)
      setDashboard(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange])

  // Auto-refresh
  useEffect(() => {
    fetchDashboard()

    if (!autoRefresh) return

    const interval = setInterval(fetchDashboard, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchDashboard, autoRefresh])

  // Export functions
  const handleExportCSV = () => {
    if (!dashboard) return

    const csv = exportAnalyticsToCSV(dashboard)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedTimeRange}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    if (!dashboard) return

    const json = exportAnalyticsToJSON(dashboard)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedTimeRange}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboard} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const kpiCards = [
    {
      title: 'Total Users',
      value: dashboard.userEngagement.totalUsers.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: dashboard.userEngagement.activeUsers.toLocaleString(),
      change: '+8%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total Votes',
      value: dashboard.platformMetrics.totalVotes.toLocaleString(),
      change: '+25%',
      icon: Vote,
      color: 'text-purple-600'
    },
    {
      title: 'Security Score',
      value: `${dashboard.security.integrityScore.toFixed(1)}%`,
      change: '+2%',
      icon: Shield,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights and performance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as keyof typeof TIME_RANGES)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {Object.entries(TIME_RANGES).map(([key, range]) => (
                <option key={key} value={key}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-refresh toggle */}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>

          {/* Manual refresh */}
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        <Clock className="h-4 w-4 inline mr-1" />
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <Badge variant="outline" className="mt-2">
                    {kpi.change}
                  </Badge>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Key engagement indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">
                  {((dashboard.userEngagement.activeUsers / dashboard.userEngagement.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(dashboard.userEngagement.activeUsers / dashboard.userEngagement.totalUsers) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Bounce Rate</span>
                <span className="text-sm font-medium">{dashboard.userEngagement.bounceRate}%</span>
              </div>
              <Progress value={dashboard.userEngagement.bounceRate} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-lg font-semibold">
                  {Math.round(dashboard.userEngagement.averageSessionDuration / 60)}m
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Votes/User</p>
                <p className="text-lg font-semibold">
                  {dashboard.userEngagement.votesPerUser.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>System health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">System Uptime</span>
                <span className="text-sm font-medium">{dashboard.security.uptime.toFixed(2)}%</span>
              </div>
              <Progress value={dashboard.security.uptime} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Integrity Score</span>
                <span className="text-sm font-medium">{dashboard.security.integrityScore.toFixed(1)}%</span>
              </div>
              <Progress value={dashboard.security.integrityScore} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Votes/Poll</p>
                <p className="text-lg font-semibold">
                  {dashboard.platformMetrics.averageVotesPerPoll.toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Peak Users</p>
                <p className="text-lg font-semibold">
                  {dashboard.platformMetrics.peakConcurrentUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartView
          title="Voting Activity Over Time"
          data={dashboard.trends.votes}
          type="area"
          color="#3B82F6"
        />

        <ChartView
          title="User Registration Trend"
          data={dashboard.trends.users}
          type="line"
          color="#10B981"
        />

        <ChartView
          title="Poll Creation Activity"
          data={dashboard.trends.polls}
          type="bar"
          color="#F59E0B"
        />

        <ChartView
          title="Engagement Score Trend"
          data={dashboard.trends.engagement}
          type="area"
          color="#8B5CF6"
        />
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered analytics insights</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.insights.length > 0 ? (
              <ul className="space-y-3">
                {dashboard.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No insights available for this time period.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Actionable improvement suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recommendations.length > 0 ? (
              <ul className="space-y-3">
                {dashboard.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recommendations at this time - everything looks good!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
          <CardDescription>Overview of platform performance for {dashboard.timeRange.label.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Activity Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Polls:</span>
                  <span className="font-medium">{dashboard.platformMetrics.totalPolls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Polls:</span>
                  <span className="font-medium">{dashboard.platformMetrics.activePolls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak Activity:</span>
                  <span className="font-medium">{dashboard.platformMetrics.mostPopularTimeSlot}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-medium">{dashboard.userEngagement.newUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Returning:</span>
                  <span className="font-medium">{dashboard.userEngagement.returningUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Rate:</span>
                  <span className="font-medium">
                    {((dashboard.userEngagement.activeUsers / dashboard.userEngagement.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Security Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Fraud Prevention:</span>
                  <span className="font-medium">{dashboard.security.fraudPrevention.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Incidents:</span>
                  <span className="font-medium">{dashboard.security.securityIncidents}</span>
                </div>
                <div className="flex justify-between">
                  <span>System Health:</span>
                  <Badge variant="default">Excellent</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}