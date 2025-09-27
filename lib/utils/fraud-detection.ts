/**
 * Advanced Multi-Layer Fraud Detection System
 * Hackathon-grade vote validation with enterprise security
 */

interface VoteAttempt {
  userId: string
  pollId: string
  optionId: string
  timestamp: number
  userAgent?: string
  ipAddress?: string
  sessionId?: string
}

interface FraudDetectionResult {
  isValid: boolean
  riskScore: number
  flags: string[]
  reason?: string
}

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory stores for fraud detection (in production, use Redis/Database)
const userVoteHistory = new Map<string, VoteAttempt[]>()
const ipVoteHistory = new Map<string, VoteAttempt[]>()
const rateLimits = new Map<string, RateLimitEntry>()
const suspiciousPatterns = new Set<string>()

/**
 * 1. RATE LIMITING PROTECTION
 * Prevents rapid-fire voting attempts
 */
export function checkRateLimit(userId: string, pollId: string): FraudDetectionResult {
  const key = `${userId}:${pollId}`
  const now = Date.now()
  const limit = rateLimits.get(key)

  if (!limit) {
    rateLimits.set(key, { count: 1, firstAttempt: now, lastAttempt: now })
    return { isValid: true, riskScore: 0, flags: [] }
  }

  // Reset if more than 1 minute has passed
  if (now - limit.firstAttempt > 60000) {
    rateLimits.set(key, { count: 1, firstAttempt: now, lastAttempt: now })
    return { isValid: true, riskScore: 0, flags: [] }
  }

  // Check if too many attempts in short time
  const timeDiff = now - limit.lastAttempt
  if (timeDiff < 2000 && limit.count >= 3) { // Max 3 attempts per 2 seconds
    return {
      isValid: false,
      riskScore: 100,
      flags: ['RATE_LIMIT_EXCEEDED'],
      reason: 'Too many vote attempts. Please wait before trying again.'
    }
  }

  limit.count++
  limit.lastAttempt = now
  return { isValid: true, riskScore: Math.min(limit.count * 10, 50), flags: limit.count > 1 ? ['REPEATED_ATTEMPTS'] : [] }
}

/**
 * 2. BEHAVIORAL ANALYSIS
 * Detects suspicious voting patterns
 */
export function analyzeBehavior(userId: string, pollId: string, optionId: string): FraudDetectionResult {
  const userHistory = userVoteHistory.get(userId) || []
  const flags: string[] = []
  let riskScore = 0

  // Check for rapid sequential voting on different polls
  const recentVotes = userHistory.filter(vote => Date.now() - vote.timestamp < 300000) // 5 minutes
  if (recentVotes.length > 10) {
    flags.push('RAPID_VOTING_PATTERN')
    riskScore += 30
  }

  // Check for consistent option preference (always voting for same position)
  const pollVotes = userHistory.filter(vote => vote.pollId === pollId)
  if (pollVotes.length > 0) {
    flags.push('DUPLICATE_POLL_VOTE')
    return {
      isValid: false,
      riskScore: 100,
      flags,
      reason: 'You have already voted on this poll.'
    }
  }

  // Check for bot-like behavior (too consistent timing)
  if (recentVotes.length >= 3) {
    const intervals = []
    for (let i = 1; i < recentVotes.length; i++) {
      intervals.push(recentVotes[i].timestamp - recentVotes[i-1].timestamp)
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length

    if (variance < 1000 && avgInterval < 10000) { // Very consistent timing under 10s
      flags.push('BOT_LIKE_BEHAVIOR')
      riskScore += 40
    }
  }

  return { isValid: riskScore < 70, riskScore, flags }
}

/**
 * 3. IP-BASED DETECTION
 * Prevents IP-based fraud and detects coordinated attacks
 */
export function checkIPReputation(ipAddress: string, pollId: string): FraudDetectionResult {
  if (!ipAddress) return { isValid: true, riskScore: 0, flags: [] }

  const ipHistory = ipVoteHistory.get(ipAddress) || []
  const flags: string[] = []
  let riskScore = 0

  // Check for too many votes from same IP in short time
  const recentVotes = ipHistory.filter(vote => Date.now() - vote.timestamp < 3600000) // 1 hour
  const pollVotes = recentVotes.filter(vote => vote.pollId === pollId)

  if (pollVotes.length > 5) { // Max 5 votes per IP per poll per hour
    flags.push('IP_VOTE_LIMIT_EXCEEDED')
    riskScore += 50
  }

  if (recentVotes.length > 20) { // Max 20 votes per IP per hour across all polls
    flags.push('IP_SUSPICIOUS_ACTIVITY')
    riskScore += 30
  }

  // Check for known suspicious IPs
  if (suspiciousPatterns.has(ipAddress)) {
    flags.push('SUSPICIOUS_IP')
    riskScore += 60
  }

  return { isValid: riskScore < 80, riskScore, flags }
}

/**
 * 4. DEVICE FINGERPRINTING SIMULATION
 * Simulates advanced device detection (in real apps, use proper fingerprinting)
 */
export function checkDeviceFingerprint(userAgent?: string, sessionId?: string): FraudDetectionResult {
  const flags: string[] = []
  let riskScore = 0

  if (!userAgent) {
    flags.push('MISSING_USER_AGENT')
    riskScore += 20
  }

  // Check for headless browsers or automation tools
  if (userAgent) {
    const suspiciousAgents = ['HeadlessChrome', 'PhantomJS', 'Selenium', 'automation']
    if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
      flags.push('AUTOMATED_BROWSER')
      riskScore += 70
    }
  }

  if (!sessionId) {
    flags.push('MISSING_SESSION')
    riskScore += 15
  }

  return { isValid: riskScore < 60, riskScore, flags }
}

/**
 * 5. COMPREHENSIVE FRAUD VALIDATION
 * Master function that runs all fraud detection checks
 */
export function validateVoteIntegrity(voteAttempt: VoteAttempt): FraudDetectionResult {
  const checks = [
    checkRateLimit(voteAttempt.userId, voteAttempt.pollId),
    analyzeBehavior(voteAttempt.userId, voteAttempt.pollId, voteAttempt.optionId),
    checkIPReputation(voteAttempt.ipAddress || '', voteAttempt.pollId),
    checkDeviceFingerprint(voteAttempt.userAgent, voteAttempt.sessionId)
  ]

  // Combine all results
  const totalRiskScore = checks.reduce((sum, check) => sum + check.riskScore, 0)
  const allFlags = checks.flatMap(check => check.flags)
  const failedChecks = checks.filter(check => !check.isValid)

  const result: FraudDetectionResult = {
    isValid: failedChecks.length === 0 && totalRiskScore < 100,
    riskScore: Math.min(totalRiskScore, 100),
    flags: allFlags,
    reason: failedChecks[0]?.reason || (totalRiskScore >= 100 ? 'Vote blocked due to suspicious activity' : undefined)
  }

  // Log the vote attempt for future analysis
  if (result.isValid) {
    recordValidVote(voteAttempt)
  } else {
    recordSuspiciousActivity(voteAttempt, result)
  }

  return result
}

/**
 * 6. VOTE HISTORY TRACKING
 * Records valid votes for pattern analysis
 */
function recordValidVote(voteAttempt: VoteAttempt) {
  // Update user history
  const userHistory = userVoteHistory.get(voteAttempt.userId) || []
  userHistory.push(voteAttempt)
  // Keep only last 100 votes per user
  if (userHistory.length > 100) userHistory.shift()
  userVoteHistory.set(voteAttempt.userId, userHistory)

  // Update IP history
  if (voteAttempt.ipAddress) {
    const ipHistory = ipVoteHistory.get(voteAttempt.ipAddress) || []
    ipHistory.push(voteAttempt)
    // Keep only last 200 votes per IP
    if (ipHistory.length > 200) ipHistory.shift()
    ipVoteHistory.set(voteAttempt.ipAddress, ipHistory)
  }
}

/**
 * 7. SUSPICIOUS ACTIVITY LOGGING
 * Tracks and learns from fraud attempts
 */
function recordSuspiciousActivity(voteAttempt: VoteAttempt, result: FraudDetectionResult) {
  // Mark IP as suspicious if high risk score
  if (voteAttempt.ipAddress && result.riskScore > 80) {
    suspiciousPatterns.add(voteAttempt.ipAddress)
  }

  // Log for security monitoring (in production, send to security system)
  console.warn('Suspicious vote attempt blocked:', {
    userId: voteAttempt.userId,
    pollId: voteAttempt.pollId,
    riskScore: result.riskScore,
    flags: result.flags,
    timestamp: new Date().toISOString()
  })
}

/**
 * 8. FRAUD DETECTION METRICS
 * Get system-wide fraud detection statistics
 */
export function getFraudDetectionMetrics() {
  return {
    totalUsers: userVoteHistory.size,
    totalIPs: ipVoteHistory.size,
    suspiciousIPs: suspiciousPatterns.size,
    rateLimitedUsers: rateLimits.size,
    avgRiskScoreByUser: Array.from(userVoteHistory.entries()).map(([userId, votes]) => {
      // Simulate risk score calculation
      return votes.length > 10 ? 25 : 5
    }).reduce((a, b) => a + b, 0) / Math.max(userVoteHistory.size, 1)
  }
}

/**
 * 9. CLEANUP UTILITIES
 * Maintain system performance by cleaning old data
 */
export function cleanupOldData() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours

  // Clean user history
  for (const [userId, votes] of userVoteHistory.entries()) {
    const recentVotes = votes.filter(vote => vote.timestamp > cutoff)
    if (recentVotes.length === 0) {
      userVoteHistory.delete(userId)
    } else {
      userVoteHistory.set(userId, recentVotes)
    }
  }

  // Clean IP history
  for (const [ip, votes] of ipVoteHistory.entries()) {
    const recentVotes = votes.filter(vote => vote.timestamp > cutoff)
    if (recentVotes.length === 0) {
      ipVoteHistory.delete(ip)
    } else {
      ipVoteHistory.set(ip, recentVotes)
    }
  }

  // Clean rate limits
  for (const [key, limit] of rateLimits.entries()) {
    if (Date.now() - limit.lastAttempt > 60000) { // 1 minute
      rateLimits.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupOldData, 5 * 60 * 1000)
}