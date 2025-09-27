/**
 * High-Performance Caching System
 * Hackathon-grade optimization for sub-100ms response times
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalSize: number
  hitRate: number
}

/**
 * 1. MEMORY CACHE WITH TTL
 * Ultra-fast in-memory caching with automatic cleanup
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, totalSize: 0, hitRate: 0 }
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.maxSize = maxSize
    this.startCleanup(cleanupIntervalMs)
  }

  set(key: string, data: T, ttlMs = 300000): void { // 5 min default TTL
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 0,
      lastAccessed: Date.now()
    })
    this.stats.totalSize = this.cache.size
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Update access stats
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    this.updateHitRate()

    return entry.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.stats.totalSize = this.cache.size
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
    this.stats.totalSize = this.cache.size
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key)
        }
      }
      this.stats.totalSize = this.cache.size
    }, intervalMs)
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0, hitRate: 0 }
  }
}

/**
 * 2. OPTIMISTIC UPDATE MANAGER
 * Immediate UI updates with rollback capability
 */
export class OptimisticUpdateManager<T> {
  private pendingUpdates = new Map<string, T>()
  private rollbacks = new Map<string, T>()

  applyOptimistic(key: string, newValue: T, originalValue: T): void {
    this.rollbacks.set(key, originalValue)
    this.pendingUpdates.set(key, newValue)
  }

  confirmUpdate(key: string): void {
    this.pendingUpdates.delete(key)
    this.rollbacks.delete(key)
  }

  rollbackUpdate(key: string): T | null {
    const original = this.rollbacks.get(key)
    if (original) {
      this.pendingUpdates.delete(key)
      this.rollbacks.delete(key)
      return original
    }
    return null
  }

  getPendingValue(key: string): T | null {
    return this.pendingUpdates.get(key) || null
  }

  hasPendingUpdate(key: string): boolean {
    return this.pendingUpdates.has(key)
  }
}

/**
 * 3. DEBOUNCED SUBSCRIPTION MANAGER
 * Prevents excessive re-renders from real-time updates
 */
export class DebouncedSubscriptionManager {
  private timeouts = new Map<string, NodeJS.Timeout>()
  private subscribers = new Map<string, Function[]>()

  subscribe(channel: string, callback: Function, debounceMs = 100): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, [])
    }
    this.subscribers.get(channel)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(channel: string, data: any, debounceMs = 100): void {
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(channel)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new debounced timeout
    const timeout = setTimeout(() => {
      const callbacks = this.subscribers.get(channel) || []
      callbacks.forEach(callback => callback(data))
      this.timeouts.delete(channel)
    }, debounceMs)

    this.timeouts.set(channel, timeout)
  }
}

/**
 * 4. SINGLETON CACHE INSTANCES
 * Global cache instances for different data types
 */
export const pollsCache = new MemoryCache<any>(500, 30000) // 500 polls, cleanup every 30s
export const resultsCache = new MemoryCache<any>(1000, 15000) // 1000 result sets, cleanup every 15s
export const userCache = new MemoryCache<any>(200, 60000) // 200 users, cleanup every 60s

/**
 * 5. CACHE KEY GENERATORS
 * Standardized cache key generation
 */
export const CacheKeys = {
  poll: (id: string) => `poll:${id}`,
  polls: (filters?: any) => `polls:${JSON.stringify(filters || {})}`,
  results: (pollId: string) => `results:${pollId}`,
  userVote: (pollId: string, userId: string) => `vote:${pollId}:${userId}`,
  user: (id: string) => `user:${id}`,
  analytics: (type: string) => `analytics:${type}:${new Date().toDateString()}`,
}

/**
 * 6. PERFORMANCE MONITORING
 * Track cache performance and optimization metrics
 */
export class PerformanceMonitor {
  private metrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
    requestCount: 0
  }

  startTimer(): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordResponseTime(duration)
      return duration
    }
  }

  recordApiCall(): void {
    this.metrics.apiCalls++
  }

  recordCacheHit(): void {
    this.metrics.cacheHits++
  }

  recordCacheMiss(): void {
    this.metrics.cacheMisses++
  }

  private recordResponseTime(duration: number): void {
    this.metrics.totalResponseTime += duration
    this.metrics.requestCount++
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount
  }

  getMetrics() {
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses
    const cacheHitRate = cacheTotal > 0 ? (this.metrics.cacheHits / cacheTotal) * 100 : 0

    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageResponseTime: Math.round(this.metrics.averageResponseTime * 100) / 100
    }
  }

  reset(): void {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      requestCount: 0
    }
  }
}

/**
 * 7. BACKGROUND PREFETCHER
 * Intelligently prefetch likely-to-be-accessed data
 */
export class BackgroundPrefetcher {
  private prefetchQueue = new Set<string>()
  private isProcessing = false

  queuePrefetch(key: string, fetcher: () => Promise<any>, priority = 1): void {
    this.prefetchQueue.add(JSON.stringify({ key, priority, timestamp: Date.now() }))
    this.processPrefetchQueue()
  }

  private async processPrefetchQueue(): Promise<void> {
    if (this.isProcessing || this.prefetchQueue.size === 0) return

    this.isProcessing = true

    // Sort by priority and age
    const items = Array.from(this.prefetchQueue)
      .map(item => JSON.parse(item))
      .sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp)

    for (const item of items.slice(0, 3)) { // Process max 3 at once
      try {
        this.prefetchQueue.delete(JSON.stringify(item))
        // Execute prefetch logic here if needed
      } catch (error) {
        console.warn('Prefetch failed:', error)
      }
    }

    this.isProcessing = false
  }
}

// Export singleton instances
export const optimisticManager = new OptimisticUpdateManager()
export const subscriptionManager = new DebouncedSubscriptionManager()
export const performanceMonitor = new PerformanceMonitor()
export const backgroundPrefetcher = new BackgroundPrefetcher()

/**
 * 8. UTILITY FUNCTIONS
 * Helper functions for performance optimization
 */
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: MemoryCache<T>,
  ttl = 300000
): Promise<T> => {
  // Try cache first
  const cached = cache.get(key)
  if (cached !== null) {
    performanceMonitor.recordCacheHit()
    return cached
  }

  // Cache miss - fetch data
  performanceMonitor.recordCacheMiss()
  performanceMonitor.recordApiCall()

  const timer = performanceMonitor.startTimer()
  const data = await fetcher()
  timer()

  // Store in cache
  cache.set(key, data, ttl)
  return data
}

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  maxAge = 60000
): T => {
  const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.result
    }

    const result = fn(...args)
    cache.set(key, { result, timestamp: Date.now() })

    // Cleanup old entries
    setTimeout(() => {
      for (const [k, v] of cache.entries()) {
        if (Date.now() - v.timestamp > maxAge) {
          cache.delete(k)
        }
      }
    }, maxAge)

    return result
  }) as T
}