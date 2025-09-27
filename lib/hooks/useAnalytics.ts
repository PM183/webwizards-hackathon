'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '../supabase/client'
import {
  generateAnalyticsDashboard,
  analyzePoll,
  TIME_RANGES,
  type AnalyticsDashboard,
  type PollAnalytics,
  type TrendData
} from '../utils/analytics'

interface AnalyticsHookState {
  dashboard: AnalyticsDashboard | null
  pollAnalytics: Record<string, PollAnalytics>
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UseAnalyticsOptions {
  timeRange?: keyof typeof TIME_RANGES
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    timeRange = '24h',
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealtime = true
  } = options

  const [state, setState] = useState<AnalyticsHookState>({
    dashboard: null,
    pollAnalytics: {},
    loading: true,
    error: null,
    lastUpdated: null
  })

  const supabase = createClient()
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const realtimeChannelRef = useRef<any>()

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const dashboard = await generateAnalyticsDashboard(timeRange)

      setState(prev => ({
        ...prev,
        dashboard,
        loading: false,
        lastUpdated: new Date()
      }))

      return dashboard
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      throw error
    }
  }, [timeRange])

  // Fetch individual poll analytics
  const fetchPollAnalytics = useCallback(async (pollId: string) => {
    try {
      const analytics = await analyzePoll(pollId)

      setState(prev => ({
        ...prev,
        pollAnalytics: {
          ...prev.pollAnalytics,
          [pollId]: analytics
        }
      }))

      return analytics
    } catch (error) {
      console.error(`Failed to fetch analytics for poll ${pollId}:`, error)
      throw error
    }
  }, [])

  // Manual refresh
  const refresh = useCallback(async () => {
    return await fetchDashboard()
  }, [fetchDashboard])

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Set up new timeout
    refreshTimeoutRef.current = setTimeout(() => {
      fetchDashboard()
    }, refreshInterval)

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchDashboard, state.lastUpdated])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return

    // Clean up existing subscription
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
    }

    // Set up new subscription
    const channel = supabase
      .channel('analytics_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          // Debounce rapid updates
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
          }

          refreshTimeoutRef.current = setTimeout(() => {
            fetchDashboard()
          }, 2000) // 2 second debounce
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls'
        },
        (payload) => {
          // Refresh dashboard when polls change
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
          }

          refreshTimeoutRef.current = setTimeout(() => {
            fetchDashboard()
          }, 2000)
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [enableRealtime, fetchDashboard, supabase])

  // Initial fetch
  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [supabase])

  return {
    ...state,
    refresh,
    fetchPollAnalytics,
    timeRange,
    isAutoRefreshing: autoRefresh,
    isRealtimeEnabled: enableRealtime
  }
}

// Real-time metrics hook for live updates
export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    votesPerMinute: 0,
    pollsCreated: 0,
    systemLoad: 0
  })

  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Simulate real-time metrics (in production, use WebSocket or Server-Sent Events)
    const interval = setInterval(() => {
      setMetrics({
        activeUsers: Math.floor(Math.random() * 100) + 50,
        votesPerMinute: Math.floor(Math.random() * 20) + 5,
        pollsCreated: Math.floor(Math.random() * 3),
        systemLoad: Math.random() * 100
      })
      setIsConnected(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    ...metrics,
    isConnected
  }
}

// Analytics export hook
export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false)

  const exportData = useCallback(async (
    dashboard: AnalyticsDashboard,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) => {
    setExporting(true)

    try {
      const { exportAnalyticsToCSV, exportAnalyticsToJSON } = await import('../utils/analytics')

      let content: string
      let mimeType: string
      let extension: string

      switch (format) {
        case 'csv':
          content = exportAnalyticsToCSV(dashboard)
          mimeType = 'text/csv'
          extension = 'csv'
          break
        case 'json':
          content = exportAnalyticsToJSON(dashboard)
          mimeType = 'application/json'
          extension = 'json'
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${dashboard.timeRange.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exportData,
    exporting
  }
}

// Analytics comparison hook for A/B testing
export function useAnalyticsComparison(
  timeRange1: keyof typeof TIME_RANGES,
  timeRange2: keyof typeof TIME_RANGES
) {
  const [comparison, setComparison] = useState<{
    current: AnalyticsDashboard | null
    previous: AnalyticsDashboard | null
    loading: boolean
    error: string | null
  }>({
    current: null,
    previous: null,
    loading: true,
    error: null
  })

  const fetchComparison = useCallback(async () => {
    try {
      setComparison(prev => ({ ...prev, loading: true, error: null }))

      const [current, previous] = await Promise.all([
        generateAnalyticsDashboard(timeRange1),
        generateAnalyticsDashboard(timeRange2)
      ])

      setComparison({
        current,
        previous,
        loading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comparison data'
      setComparison(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
    }
  }, [timeRange1, timeRange2])

  useEffect(() => {
    fetchComparison()
  }, [fetchComparison])

  // Calculate percentage changes
  const getPercentageChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }, [])

  const changes = comparison.current && comparison.previous ? {
    totalUsers: getPercentageChange(
      comparison.current.userEngagement.totalUsers,
      comparison.previous.userEngagement.totalUsers
    ),
    activeUsers: getPercentageChange(
      comparison.current.userEngagement.activeUsers,
      comparison.previous.userEngagement.activeUsers
    ),
    totalVotes: getPercentageChange(
      comparison.current.platformMetrics.totalVotes,
      comparison.previous.platformMetrics.totalVotes
    ),
    integrityScore: getPercentageChange(
      comparison.current.security.integrityScore,
      comparison.previous.security.integrityScore
    )
  } : null

  return {
    ...comparison,
    changes,
    refresh: fetchComparison
  }
}