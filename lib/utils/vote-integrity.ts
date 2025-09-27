/**
 * Cryptographic Vote Integrity System
 * Advanced vote verification and tamper-proof audit trail
 */

import { createHash, randomBytes } from 'crypto'

interface VoteIntegrityData {
  voteId: string
  userId: string
  pollId: string
  optionId: string
  timestamp: number
  nonce: string
  hash: string
  signature: string
}

interface IntegrityCheckResult {
  isValid: boolean
  errors: string[]
  confidence: number
}

// In-memory store for vote integrity data (in production, use secure database)
const voteIntegrityStore = new Map<string, VoteIntegrityData>()
const votingSessionStore = new Map<string, { timestamp: number, challenges: string[] }>()

/**
 * 1. CRYPTOGRAPHIC VOTE HASHING
 * Generate tamper-proof vote hash with salt and timestamp
 */
export function generateVoteHash(
  userId: string,
  pollId: string,
  optionId: string,
  timestamp: number,
  nonce: string
): string {
  const data = `${userId}:${pollId}:${optionId}:${timestamp}:${nonce}`
  return createHash('sha256').update(data).digest('hex')
}

/**
 * 2. SECURE VOTE NONCE GENERATION
 * Create cryptographically secure random nonce for each vote
 */
export function generateSecureNonce(): string {
  return randomBytes(32).toString('hex')
}

/**
 * 3. VOTE SIGNATURE CREATION
 * Create digital signature for vote verification (simplified for demo)
 */
export function createVoteSignature(voteHash: string, userSecret: string): string {
  const signatureData = `${voteHash}:${userSecret}`
  return createHash('sha256').update(signatureData).digest('hex')
}

/**
 * 4. COMPREHENSIVE VOTE INTEGRITY RECORDING
 * Record all vote integrity data for audit trail
 */
export function recordVoteIntegrity(
  voteId: string,
  userId: string,
  pollId: string,
  optionId: string
): VoteIntegrityData {
  const timestamp = Date.now()
  const nonce = generateSecureNonce()
  const hash = generateVoteHash(userId, pollId, optionId, timestamp, nonce)
  const userSecret = getUserSecret(userId) // In production, derive from secure user data
  const signature = createVoteSignature(hash, userSecret)

  const integrityData: VoteIntegrityData = {
    voteId,
    userId,
    pollId,
    optionId,
    timestamp,
    nonce,
    hash,
    signature
  }

  voteIntegrityStore.set(voteId, integrityData)
  return integrityData
}

/**
 * 5. VOTE INTEGRITY VERIFICATION
 * Verify vote has not been tampered with
 */
export function verifyVoteIntegrity(voteId: string): IntegrityCheckResult {
  const integrityData = voteIntegrityStore.get(voteId)
  if (!integrityData) {
    return {
      isValid: false,
      errors: ['Vote integrity data not found'],
      confidence: 0
    }
  }

  const errors: string[] = []
  let confidence = 100

  // Verify hash integrity
  const expectedHash = generateVoteHash(
    integrityData.userId,
    integrityData.pollId,
    integrityData.optionId,
    integrityData.timestamp,
    integrityData.nonce
  )

  if (expectedHash !== integrityData.hash) {
    errors.push('Vote hash verification failed - data may be tampered')
    confidence -= 50
  }

  // Verify signature
  const userSecret = getUserSecret(integrityData.userId)
  const expectedSignature = createVoteSignature(integrityData.hash, userSecret)

  if (expectedSignature !== integrityData.signature) {
    errors.push('Vote signature verification failed - unauthorized modification')
    confidence -= 40
  }

  // Check timestamp validity (votes shouldn't be too old or in future)
  const now = Date.now()
  const ageHours = (now - integrityData.timestamp) / (1000 * 60 * 60)

  if (ageHours > 24) {
    errors.push('Vote timestamp is suspiciously old')
    confidence -= 10
  }

  if (integrityData.timestamp > now + 60000) { // 1 minute future tolerance
    errors.push('Vote timestamp is in the future')
    confidence -= 30
  }

  return {
    isValid: errors.length === 0,
    errors,
    confidence: Math.max(0, confidence)
  }
}

/**
 * 6. BATCH INTEGRITY VERIFICATION
 * Verify integrity of multiple votes efficiently
 */
export function verifyBatchIntegrity(voteIds: string[]): {
  totalChecked: number
  validVotes: number
  invalidVotes: number
  averageConfidence: number
  errors: { voteId: string, errors: string[] }[]
} {
  let validCount = 0
  let totalConfidence = 0
  const allErrors: { voteId: string, errors: string[] }[] = []

  for (const voteId of voteIds) {
    const result = verifyVoteIntegrity(voteId)
    if (result.isValid) {
      validCount++
    } else {
      allErrors.push({ voteId, errors: result.errors })
    }
    totalConfidence += result.confidence
  }

  return {
    totalChecked: voteIds.length,
    validVotes: validCount,
    invalidVotes: voteIds.length - validCount,
    averageConfidence: voteIds.length > 0 ? totalConfidence / voteIds.length : 0,
    errors: allErrors
  }
}

/**
 * 7. SECURE VOTING SESSION MANAGEMENT
 * Enhanced session security with challenge-response
 */
export function initializeVotingSession(userId: string): string {
  const sessionId = randomBytes(16).toString('hex')
  const challenges = generateSessionChallenges()

  votingSessionStore.set(sessionId, {
    timestamp: Date.now(),
    challenges
  })

  return sessionId
}

/**
 * 8. SESSION CHALLENGE GENERATION
 * Create unique challenges to prevent replay attacks
 */
function generateSessionChallenges(): string[] {
  return Array.from({ length: 3 }, () => randomBytes(8).toString('hex'))
}

/**
 * 9. VALIDATE VOTING SESSION
 * Ensure session is valid and not expired
 */
export function validateVotingSession(sessionId: string): {
  isValid: boolean
  remainingTime: number
  challenges: string[]
} {
  const session = votingSessionStore.get(sessionId)
  if (!session) {
    return { isValid: false, remainingTime: 0, challenges: [] }
  }

  const age = Date.now() - session.timestamp
  const maxAge = 30 * 60 * 1000 // 30 minutes
  const remainingTime = Math.max(0, maxAge - age)

  return {
    isValid: age < maxAge,
    remainingTime,
    challenges: session.challenges
  }
}

/**
 * 10. VOTE AUDIT TRAIL GENERATION
 * Create comprehensive audit trail for compliance
 */
export function generateAuditTrail(pollId: string): {
  pollId: string
  totalVotes: number
  verifiedVotes: number
  integrityScore: number
  auditTimestamp: number
  issues: string[]
} {
  const pollVotes = Array.from(voteIntegrityStore.values())
    .filter(vote => vote.pollId === pollId)

  const voteIds = pollVotes.map(vote => vote.voteId)
  const batchResult = verifyBatchIntegrity(voteIds)

  const issues: string[] = []
  if (batchResult.invalidVotes > 0) {
    issues.push(`${batchResult.invalidVotes} votes failed integrity verification`)
  }
  if (batchResult.averageConfidence < 90) {
    issues.push(`Low average confidence score: ${batchResult.averageConfidence.toFixed(1)}%`)
  }

  return {
    pollId,
    totalVotes: pollVotes.length,
    verifiedVotes: batchResult.validVotes,
    integrityScore: batchResult.averageConfidence,
    auditTimestamp: Date.now(),
    issues
  }
}

/**
 * 11. REAL-TIME INTEGRITY MONITORING
 * Monitor vote integrity in real-time
 */
class IntegrityMonitor {
  private alertThreshold = 70 // Alert if confidence below 70%
  private listeners: ((alert: IntegrityAlert) => void)[] = []

  addListener(callback: (alert: IntegrityAlert) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (alert: IntegrityAlert) => void) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  checkVote(voteId: string) {
    const result = verifyVoteIntegrity(voteId)
    if (result.confidence < this.alertThreshold) {
      this.triggerAlert({
        type: 'low_confidence',
        voteId,
        confidence: result.confidence,
        errors: result.errors,
        timestamp: Date.now()
      })
    }
  }

  private triggerAlert(alert: IntegrityAlert) {
    this.listeners.forEach(listener => {
      try {
        listener(alert)
      } catch (error) {
        console.error('Error in integrity alert listener:', error)
      }
    })
  }
}

interface IntegrityAlert {
  type: 'low_confidence' | 'tampering_detected' | 'batch_failure'
  voteId?: string
  pollId?: string
  confidence?: number
  errors: string[]
  timestamp: number
}

export const integrityMonitor = new IntegrityMonitor()

/**
 * 12. HELPER FUNCTIONS
 */
function getUserSecret(userId: string): string {
  // In production, derive from secure user data or key management system
  return createHash('sha256').update(`user_secret_${userId}`).digest('hex')
}

/**
 * 13. INTEGRITY SYSTEM STATISTICS
 */
export function getIntegrityStatistics() {
  const totalVotes = voteIntegrityStore.size
  const allVoteIds = Array.from(voteIntegrityStore.keys())
  const batchResult = verifyBatchIntegrity(allVoteIds)

  return {
    totalVotesRecorded: totalVotes,
    verifiedVotes: batchResult.validVotes,
    failedVerifications: batchResult.invalidVotes,
    overallIntegrityScore: batchResult.averageConfidence,
    activeSessions: votingSessionStore.size,
    averageVoteAge: calculateAverageVoteAge(),
    systemHealth: batchResult.averageConfidence > 95 ? 'excellent' :
                   batchResult.averageConfidence > 85 ? 'good' :
                   batchResult.averageConfidence > 70 ? 'fair' : 'poor'
  }
}

function calculateAverageVoteAge(): number {
  const now = Date.now()
  const ages = Array.from(voteIntegrityStore.values())
    .map(vote => now - vote.timestamp)

  return ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
}

/**
 * 14. CLEANUP AND MAINTENANCE
 */
export function cleanupIntegrityData() {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days

  // Clean old vote integrity data
  for (const [voteId, data] of voteIntegrityStore.entries()) {
    if (data.timestamp < cutoff) {
      voteIntegrityStore.delete(voteId)
    }
  }

  // Clean expired sessions
  for (const [sessionId, session] of votingSessionStore.entries()) {
    if (Date.now() - session.timestamp > 30 * 60 * 1000) { // 30 minutes
      votingSessionStore.delete(sessionId)
    }
  }
}

// Auto-cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanupIntegrityData, 60 * 60 * 1000)
}