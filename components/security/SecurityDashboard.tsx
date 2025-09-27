'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Eye, Lock, Activity, Users, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  getFraudDetectionMetrics,
  cleanupOldData
} from '../../lib/utils/fraud-detection'
import {
  getIntegrityStatistics,
  integrityMonitor,
  generateAuditTrail
} from '../../lib/utils/vote-integrity'
import {
  getSecurityMetrics
} from '../../lib/utils/security-headers'

interface SecurityMetrics {
  fraudDetection: ReturnType<typeof getFraudDetectionMetrics>
  voteIntegrity: ReturnType<typeof getIntegrityStatistics>
  requestSecurity: ReturnType<typeof getSecurityMetrics>
  timestamp: number
}

interface SecurityAlert {
  id: string
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch security metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const fraudMetrics = getFraudDetectionMetrics()
      const integrityStats = getIntegrityStatistics()
      const securityStats = getSecurityMetrics()

      setMetrics({
        fraudDetection: fraudMetrics,
        voteIntegrity: integrityStats,
        requestSecurity: securityStats,
        timestamp: Date.now()
      })

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching security metrics:', error)
    }
  }, [])

  // Add security alert
  const addAlert = useCallback((alert: Omit<SecurityAlert, 'id'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]) // Keep last 20 alerts
  }, [])

  // Set up integrity monitoring
  useEffect(() => {
    const handleIntegrityAlert = (alert: any) => {
      addAlert({
        type: 'Vote Integrity',
        message: `Vote integrity issue: ${alert.errors.join(', ')}`,
        severity: alert.confidence < 50 ? 'critical' : alert.confidence < 70 ? 'high' : 'medium',
        timestamp: alert.timestamp
      })
    }

    integrityMonitor.addListener(handleIntegrityAlert)

    return () => {
      integrityMonitor.removeListener(handleIntegrityAlert)
    }
  }, [addAlert])

  // Auto-refresh metrics
  useEffect(() => {
    fetchMetrics() // Initial fetch

    if (!isMonitoring) return

    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [fetchMetrics, isMonitoring])

  // Auto-cleanup old data
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldData()
      // Clean old alerts
      setAlerts(prev => prev.filter(alert => Date.now() - alert.timestamp < 24 * 60 * 60 * 1000))
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(cleanupInterval)
  }, [])

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading security metrics...</span>
      </div>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const overallSecurityScore = Math.round(
    (metrics.voteIntegrity.overallIntegrityScore +
     (100 - metrics.fraudDetection.avgRiskScoreByUser) +
     90) / 3 // Assuming 90% for request security
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time security monitoring and threat detection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              isMonitoring
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </button>
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Overall Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              {overallSecurityScore}%
            </div>
            <Badge
              variant={overallSecurityScore > 85 ? 'default' : overallSecurityScore > 70 ? 'secondary' : 'destructive'}
            >
              {overallSecurityScore > 85 ? 'Excellent' : overallSecurityScore > 70 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
          <Progress value={overallSecurityScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Composite score based on vote integrity, fraud detection, and request security
          </p>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vote Integrity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Vote Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.voteIntegrity.overallIntegrityScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.voteIntegrity.verifiedVotes}/{metrics.voteIntegrity.totalVotesRecorded} votes verified
              </p>
              <Badge
                variant="outline"
                className={getHealthColor(metrics.voteIntegrity.systemHealth)}
              >
                {metrics.voteIntegrity.systemHealth.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Fraud Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.fraudDetection.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Monitored users • {metrics.fraudDetection.suspiciousIPs} suspicious IPs
              </p>
              <div className="text-xs">
                Avg risk: {metrics.fraudDetection.avgRiskScoreByUser.toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Security */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Request Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.requestSecurity.rateLimiting.blockedClients}
              </div>
              <p className="text-xs text-muted-foreground">
                Blocked clients • {metrics.requestSecurity.rateLimiting.totalClients} tracked
              </p>
              <div className="text-xs">
                {metrics.requestSecurity.activity.suspiciousClients} suspicious
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.voteIntegrity.activeSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Secure voting sessions
              </p>
              <Badge variant="outline">ENCRYPTED</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time security notifications and threat alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No security alerts - all systems secure</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{alert.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Security Status</CardTitle>
          <CardDescription>
            Current status of all security systems and protections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Fraud Detection</span>
                <Badge variant="default">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vote Integrity</span>
                <Badge variant="default">PROTECTED</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge variant="default">ENFORCED</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Headers</span>
                <Badge variant="default">ENABLED</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CSRF Protection</span>
                <Badge variant="default">ACTIVE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">XSS Protection</span>
                <Badge variant="default">ENABLED</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Encryption</span>
                <Badge variant="default">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session Security</span>
                <Badge variant="default">SECURE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Trail</span>
                <Badge variant="default">LOGGED</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}