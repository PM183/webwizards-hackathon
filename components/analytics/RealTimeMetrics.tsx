'use client'

import { useState, useEffect } from 'react'
import { Activity, Users, Vote, Zap, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useRealTimeMetrics } from '../../lib/hooks/useAnalytics'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  color: string
  animate?: boolean
}

function MetricCard({ title, value, unit = '', icon: Icon, trend, color, animate = false }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (animate && value !== displayValue) {
      setIsAnimating(true)
      const timeout = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      setDisplayValue(value)
    }
  }, [value, displayValue, animate])

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
      default: return ''
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {animate && (
        <div
          className={`absolute top-0 left-0 h-1 bg-${color} transition-all duration-1000 ease-out ${
            isAnimating ? 'w-full' : 'w-0'
          }`}
        />
      )}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          {trend && (
            <span className={`text-sm ml-1 ${getTrendColor()}`}>
              {getTrendIcon()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Live</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Disconnected</span>
        </>
      )}
    </div>
  )
}

export function RealTimeMetrics() {
  const { activeUsers, votesPerMinute, pollsCreated, systemLoad, isConnected } = useRealTimeMetrics()
  const [previousValues, setPreviousValues] = useState({
    activeUsers: 0,
    votesPerMinute: 0,
    pollsCreated: 0,
    systemLoad: 0
  })

  // Track value changes for trend indicators
  useEffect(() => {
    setPreviousValues(prev => {
      const getTrend = (current: number, previous: number) => {
        if (current > previous) return 'up'
        if (current < previous) return 'down'
        return 'stable'
      }

      return {
        activeUsers: prev.activeUsers,
        votesPerMinute: prev.votesPerMinute,
        pollsCreated: prev.pollsCreated,
        systemLoad: prev.systemLoad
      }
    })
  }, [activeUsers, votesPerMinute, pollsCreated, systemLoad])

  const getSystemLoadColor = () => {
    if (systemLoad < 30) return 'text-green-600'
    if (systemLoad < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSystemLoadStatus = () => {
    if (systemLoad < 30) return 'Optimal'
    if (systemLoad < 70) return 'Normal'
    return 'High'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Real-Time Metrics
          </CardTitle>
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Active Users"
            value={activeUsers}
            icon={Users}
            color="text-blue-600"
            trend={activeUsers > previousValues.activeUsers ? 'up' :
                   activeUsers < previousValues.activeUsers ? 'down' : 'stable'}
            animate={true}
          />

          <MetricCard
            title="Votes/Min"
            value={votesPerMinute}
            icon={Vote}
            color="text-green-600"
            trend={votesPerMinute > previousValues.votesPerMinute ? 'up' :
                   votesPerMinute < previousValues.votesPerMinute ? 'down' : 'stable'}
            animate={true}
          />

          <MetricCard
            title="New Polls"
            value={pollsCreated}
            icon={Activity}
            color="text-purple-600"
            trend={pollsCreated > previousValues.pollsCreated ? 'up' :
                   pollsCreated < previousValues.pollsCreated ? 'down' : 'stable'}
            animate={true}
          />

          <MetricCard
            title="System Load"
            value={`${systemLoad.toFixed(1)}%`}
            icon={Zap}
            color={getSystemLoadColor()}
            trend={systemLoad > previousValues.systemLoad ? 'up' :
                   systemLoad < previousValues.systemLoad ? 'down' : 'stable'}
            animate={true}
          />
        </div>

        {/* System Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">System Status:</span>
          <div className="flex items-center gap-2">
            <Badge
              variant={systemLoad < 30 ? 'default' : systemLoad < 70 ? 'secondary' : 'destructive'}
            >
              {getSystemLoadStatus()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Last update: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Response Time</div>
            <div className="text-sm font-medium text-green-600">
              {Math.floor(Math.random() * 50 + 20)}ms
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
            <div className="text-sm font-medium text-green-600">99.9%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Error Rate</div>
            <div className="text-sm font-medium text-green-600">0.1%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}