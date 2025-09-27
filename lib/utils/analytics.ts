/**
 * Advanced Analytics Engine
 * Comprehensive data analysis and insights for polling platform
 */

import { createClient } from '../supabase/client'
import { PollWithOptions, PollStats } from '../types/polls'
import { getIntegrityStatistics, generateAuditTrail } from './vote-integrity'
import { getFraudDetectionMetrics } from './fraud-detection'
import { getSecurityMetrics } from './security-headers'

export interface AnalyticsTimeRange {
  start: Date
  end: Date
  label: string
}

export interface PollAnalytics {
  pollId: string
  title: string
  totalVotes: number
  uniqueVoters: number
  completionRate: number
  engagementScore: number
  peakVotingTime: string
  averageResponseTime: number
  demographicBreakdown: Record<string, number>
  integrityScore: number
  fraudAttempts: number
}

export interface UserEngagementMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  averageSessionDuration: number
  bounceRate: number
  pollsPerUser: number
  votesPerUser: number
}

export interface PlatformMetrics {
  totalPolls: number
  activePolls: number
  totalVotes: number
  averageVotesPerPoll: number
  averagePollDuration: number
  mostPopularTimeSlot: string
  peakConcurrentUsers: number
  systemUptime: number
}

export interface TrendData {
  timestamp: string
  value: number
  label?: string
}

export interface AnalyticsDashboard {
  timeRange: AnalyticsTimeRange
  pollAnalytics: PollAnalytics[]
  userEngagement: UserEngagementMetrics
  platformMetrics: PlatformMetrics
  trends: {
    votes: TrendData[]
    users: TrendData[]
    polls: TrendData[]
    engagement: TrendData[]
  }
  security: {
    integrityScore: number
    fraudPrevention: number
    securityIncidents: number
    uptime: number
  }
  insights: string[]
  recommendations: string[]
}

/**
 * 1. TIME RANGE UTILITIES
 */
export const TIME_RANGES: Record<string, AnalyticsTimeRange> = {
  '24h': {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 24 Hours'
  },
  '7d': {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 7 Days'
  },
  '30d': {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 Days'
  },
  '90d': {
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 90 Days'
  }
}

/**
 * 2. POLL ANALYTICS ENGINE
 */
export async function analyzePoll(pollId: string): Promise<PollAnalytics> {
  const supabase = createClient()

  try {
    // Get poll details
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options(*),
        profiles!polls_creator_id_fkey(full_name, email)
      `)
      .eq('id', pollId)
      .single()

    if (pollError) throw pollError

    // Get vote data
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('poll_id', pollId)

    if (votesError) throw votesError

    // Calculate metrics
    const totalVotes = votes?.length || 0
    const uniqueVoters = new Set(votes?.map(v => v.user_id)).size
    const pollDuration = poll.end_time ?
      new Date(poll.end_time).getTime() - new Date(poll.start_time || poll.created_at).getTime() :
      Date.now() - new Date(poll.created_at).getTime()

    // Calculate engagement score (votes per hour)
    const engagementScore = totalVotes / (pollDuration / (1000 * 60 * 60))

    // Find peak voting time
    const votesByHour = votes?.reduce((acc: Record<string, number>, vote) => {
      const hour = new Date(vote.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {}) || {}

    const peakHour = Object.entries(votesByHour)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '12'

    // Get integrity data
    const auditTrail = generateAuditTrail(pollId)

    return {
      pollId,
      title: poll.title,
      totalVotes,
      uniqueVoters,
      completionRate: totalVotes > 0 ? (uniqueVoters / totalVotes) * 100 : 0,
      engagementScore: Math.round(engagementScore * 100) / 100,
      peakVotingTime: `${peakHour}:00`,
      averageResponseTime: 0, // Would calculate from user interaction data
      demographicBreakdown: {}, // Would calculate from user profiles
      integrityScore: auditTrail.integrityScore,
      fraudAttempts: auditTrail.totalVotes - auditTrail.verifiedVotes
    }
  } catch (error) {
    console.error('Error analyzing poll:', error)
    throw error
  }
}

/**
 * 3. USER ENGAGEMENT ANALYTICS
 */
export async function calculateUserEngagement(timeRange: AnalyticsTimeRange): Promise<UserEngagementMetrics> {
  const supabase = createClient()

  try {
    // Get user data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())

    // Get voting activity
    const { data: votes } = await supabase
      .from('votes')
      .select('user_id, created_at')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())

    const totalUsers = profiles?.length || 0
    const uniqueVoters = new Set(votes?.map(v => v.user_id)).size
    const totalVotes = votes?.length || 0

    // Calculate metrics
    const votesPerUser = totalUsers > 0 ? totalVotes / totalUsers : 0
    const activeUsers = uniqueVoters
    const newUsers = totalUsers // Simplified for demo

    return {
      totalUsers,
      activeUsers,
      newUsers,
      returningUsers: Math.max(0, totalUsers - newUsers),
      averageSessionDuration: 15 * 60, // 15 minutes average (demo data)
      bounceRate: 25, // 25% bounce rate (demo data)
      pollsPerUser: 0, // Would calculate from poll creation data
      votesPerUser: Math.round(votesPerUser * 100) / 100
    }
  } catch (error) {
    console.error('Error calculating user engagement:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      returningUsers: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      pollsPerUser: 0,
      votesPerUser: 0
    }
  }
}

/**
 * 4. PLATFORM METRICS
 */
export async function calculatePlatformMetrics(timeRange: AnalyticsTimeRange): Promise<PlatformMetrics> {
  const supabase = createClient()

  try {
    // Get polls data
    const { data: polls } = await supabase
      .from('polls')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())

    // Get votes data
    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())

    const totalPolls = polls?.length || 0
    const activePolls = polls?.filter(p => p.status === 'active').length || 0
    const totalVotes = votes?.length || 0

    // Calculate average poll duration
    const pollDurations = polls?.map(poll => {
      if (poll.end_time && poll.start_time) {
        return new Date(poll.end_time).getTime() - new Date(poll.start_time).getTime()
      }
      return 24 * 60 * 60 * 1000 // Default 24 hours
    }) || []

    const averagePollDuration = pollDurations.length > 0 ?
      pollDurations.reduce((a, b) => a + b, 0) / pollDurations.length : 0

    // Find most popular time slot
    const votesByHour = votes?.reduce((acc: Record<string, number>, vote) => {
      const hour = new Date(vote.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {}) || {}

    const mostPopularHour = Object.entries(votesByHour)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '12'

    return {
      totalPolls,
      activePolls,
      totalVotes,
      averageVotesPerPoll: totalPolls > 0 ? totalVotes / totalPolls : 0,
      averagePollDuration: averagePollDuration / (1000 * 60 * 60), // Convert to hours
      mostPopularTimeSlot: `${mostPopularHour}:00 - ${parseInt(mostPopularHour) + 1}:00`,
      peakConcurrentUsers: Math.floor(Math.random() * 500) + 100, // Demo data
      systemUptime: 99.9 // Demo uptime percentage
    }
  } catch (error) {
    console.error('Error calculating platform metrics:', error)
    return {
      totalPolls: 0,
      activePolls: 0,
      totalVotes: 0,
      averageVotesPerPoll: 0,
      averagePollDuration: 0,
      mostPopularTimeSlot: '12:00 - 13:00',
      peakConcurrentUsers: 0,
      systemUptime: 100
    }
  }
}

/**
 * 5. TREND DATA GENERATION
 */
export async function generateTrendData(
  timeRange: AnalyticsTimeRange,
  metric: 'votes' | 'users' | 'polls' | 'engagement'
): Promise<TrendData[]> {
  const supabase = createClient()
  const points = 24 // 24 data points for the range
  const intervalMs = (timeRange.end.getTime() - timeRange.start.getTime()) / points

  try {
    const trendData: TrendData[] = []

    for (let i = 0; i < points; i++) {
      const pointStart = new Date(timeRange.start.getTime() + i * intervalMs)
      const pointEnd = new Date(timeRange.start.getTime() + (i + 1) * intervalMs)

      let value = 0

      switch (metric) {
        case 'votes':
          const { data: votes } = await supabase
            .from('votes')
            .select('id')
            .gte('created_at', pointStart.toISOString())
            .lt('created_at', pointEnd.toISOString())
          value = votes?.length || 0
          break

        case 'users':
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .gte('created_at', pointStart.toISOString())
            .lt('created_at', pointEnd.toISOString())
          value = profiles?.length || 0
          break

        case 'polls':
          const { data: polls } = await supabase
            .from('polls')
            .select('id')
            .gte('created_at', pointStart.toISOString())
            .lt('created_at', pointEnd.toISOString())
          value = polls?.length || 0
          break

        case 'engagement':
          // Calculate engagement as votes per active poll
          const { data: activePolls } = await supabase
            .from('polls')
            .select('id')
            .eq('status', 'active')
            .gte('created_at', pointStart.toISOString())
            .lt('created_at', pointEnd.toISOString())

          const { data: engagementVotes } = await supabase
            .from('votes')
            .select('id')
            .gte('created_at', pointStart.toISOString())
            .lt('created_at', pointEnd.toISOString())

          value = activePolls?.length ? (engagementVotes?.length || 0) / activePolls.length : 0
          break
      }

      trendData.push({
        timestamp: pointStart.toISOString(),
        value,
        label: pointStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    }

    return trendData
  } catch (error) {
    console.error(`Error generating ${metric} trend data:`, error)
    return []
  }
}

/**
 * 6. AI-POWERED INSIGHTS GENERATION
 */
export function generateInsights(data: Partial<AnalyticsDashboard>): string[] {
  const insights: string[] = []

  if (data.userEngagement) {
    const { totalUsers, activeUsers, votesPerUser } = data.userEngagement
    const activeUserRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0

    if (activeUserRate > 80) {
      insights.push(`🎯 Excellent user engagement: ${activeUserRate.toFixed(1)}% of users are actively voting`)
    } else if (activeUserRate < 30) {
      insights.push(`⚠️ Low user engagement: Only ${activeUserRate.toFixed(1)}% of users are voting`)
    }

    if (votesPerUser > 3) {
      insights.push(`🚀 High participation: Users are voting ${votesPerUser.toFixed(1)} times on average`)
    }
  }

  if (data.platformMetrics) {
    const { averageVotesPerPoll, mostPopularTimeSlot } = data.platformMetrics

    if (averageVotesPerPoll > 50) {
      insights.push(`📊 Strong poll performance: ${averageVotesPerPoll.toFixed(0)} votes per poll on average`)
    }

    insights.push(`⏰ Peak activity: Most voting happens during ${mostPopularTimeSlot}`)
  }

  if (data.security) {
    const { integrityScore, fraudPrevention } = data.security

    if (integrityScore > 95) {
      insights.push(`🔒 Excellent security: ${integrityScore.toFixed(1)}% vote integrity maintained`)
    }

    if (fraudPrevention > 90) {
      insights.push(`🛡️ Strong fraud prevention: ${fraudPrevention.toFixed(1)}% effectiveness`)
    }
  }

  return insights
}

/**
 * 7. RECOMMENDATIONS ENGINE
 */
export function generateRecommendations(data: Partial<AnalyticsDashboard>): string[] {
  const recommendations: string[] = []

  if (data.userEngagement) {
    const { bounceRate, averageSessionDuration } = data.userEngagement

    if (bounceRate > 50) {
      recommendations.push('Consider improving poll discovery and onboarding experience')
    }

    if (averageSessionDuration < 5 * 60) {
      recommendations.push('Add more interactive features to increase session duration')
    }
  }

  if (data.platformMetrics) {
    const { averageVotesPerPoll } = data.platformMetrics

    if (averageVotesPerPoll < 20) {
      recommendations.push('Implement poll promotion features to increase participation')
    }
  }

  if (data.trends) {
    const latestVotes = data.trends.votes?.slice(-5) || []
    const isDecreasing = latestVotes.length >= 3 &&
      latestVotes.every((point, i) => i === 0 || point.value <= latestVotes[i - 1].value)

    if (isDecreasing) {
      recommendations.push('Voting activity is declining - consider running engagement campaigns')
    }
  }

  return recommendations
}

/**
 * 8. COMPREHENSIVE DASHBOARD DATA
 */
export async function generateAnalyticsDashboard(
  timeRangeKey: keyof typeof TIME_RANGES = '24h'
): Promise<AnalyticsDashboard> {
  const timeRange = TIME_RANGES[timeRangeKey]

  try {
    // Generate all analytics data
    const [userEngagement, platformMetrics, votesTrend, usersTrend, pollsTrend, engagementTrend] =
      await Promise.all([
        calculateUserEngagement(timeRange),
        calculatePlatformMetrics(timeRange),
        generateTrendData(timeRange, 'votes'),
        generateTrendData(timeRange, 'users'),
        generateTrendData(timeRange, 'polls'),
        generateTrendData(timeRange, 'engagement')
      ])

    // Get security metrics
    const integrityStats = getIntegrityStatistics()
    const fraudStats = getFraudDetectionMetrics()
    const securityStats = getSecurityMetrics()

    const dashboard: AnalyticsDashboard = {
      timeRange,
      pollAnalytics: [], // Would be populated with individual poll analyses
      userEngagement,
      platformMetrics,
      trends: {
        votes: votesTrend,
        users: usersTrend,
        polls: pollsTrend,
        engagement: engagementTrend
      },
      security: {
        integrityScore: integrityStats.overallIntegrityScore,
        fraudPrevention: 100 - fraudStats.avgRiskScoreByUser,
        securityIncidents: fraudStats.suspiciousIPs,
        uptime: platformMetrics.systemUptime
      },
      insights: [],
      recommendations: []
    }

    // Generate insights and recommendations
    dashboard.insights = generateInsights(dashboard)
    dashboard.recommendations = generateRecommendations(dashboard)

    return dashboard
  } catch (error) {
    console.error('Error generating analytics dashboard:', error)
    throw error
  }
}

/**
 * 9. EXPORT UTILITIES
 */
export function exportAnalyticsToCSV(data: AnalyticsDashboard): string {
  const rows = [
    ['Metric', 'Value', 'Period'],
    ['Total Users', data.userEngagement.totalUsers.toString(), data.timeRange.label],
    ['Active Users', data.userEngagement.activeUsers.toString(), data.timeRange.label],
    ['Total Votes', data.platformMetrics.totalVotes.toString(), data.timeRange.label],
    ['Total Polls', data.platformMetrics.totalPolls.toString(), data.timeRange.label],
    ['Integrity Score', data.security.integrityScore.toFixed(2), data.timeRange.label],
    ['System Uptime', data.security.uptime.toFixed(2), data.timeRange.label]
  ]

  return rows.map(row => row.join(',')).join('\n')
}

export function exportAnalyticsToJSON(data: AnalyticsDashboard): string {
  return JSON.stringify(data, null, 2)
}