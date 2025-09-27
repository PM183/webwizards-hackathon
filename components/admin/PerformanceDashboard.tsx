'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { performanceMonitor, pollsCache, resultsCache, userCache } from '../../lib/utils/performance-cache'

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>({})
  const [cacheStats, setCacheStats] = useState<any>({})

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
      setCacheStats({
        polls: pollsCache.getStats(),
        results: resultsCache.getStats(),
        users: userCache.getStats(),
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics.averageResponseTime?.toFixed(1) || 0}ms
          </div>
          <p className="text-xs text-gray-500">Average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cache Hit Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {cacheStats.polls?.hitRate?.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-gray-500">Polls Cache</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics.apiCalls || 0}
          </div>
          <p className="text-xs text-gray-500">Total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cache Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {(cacheStats.polls?.totalSize || 0) + (cacheStats.results?.totalSize || 0)}
          </div>
          <p className="text-xs text-gray-500">Entries</p>
        </CardContent>
      </Card>
    </div>
  )
}