/**
 * Simple in-memory rate limiter
 * 
 * ⚠️ IMPORTANT LIMITATIONS:
 * - In serverless (Vercel), each function has its own memory
 * - This works best for development or single-instance deployments
 * - For production on Vercel, use Upstash Redis instead
 * 
 * This implementation uses an LRU (Least Recently Used) cache pattern
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class InMemoryRateLimiter {
  private cache: Map<string, RateLimitEntry>
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly cleanupInterval: number

  constructor(maxRequests: number = 5, windowMinutes: number = 1) {
    this.cache = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMinutes * 60 * 1000
    this.cleanupInterval = 60 * 1000 // Clean up every minute

    // Periodic cleanup to prevent memory leaks
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupInterval)
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Usually IP address or user ID
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    // No entry or window expired - allow and create new entry
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs
      this.cache.set(identifier, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime
      }
    }

    // Entry exists and window is still active
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment count
    entry.count++
    this.cache.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))

    // Optional: Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Get current cache size (for monitoring)
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * Reset rate limit for a specific identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.cache.clear()
  }
}

// Singleton instance - shared across the application
export const rateLimiter = new InMemoryRateLimiter(5, 1) // 5 requests per 1 minute

/**
 * Helper function to get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers
  
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a placeholder (not ideal for production)
  return 'unknown-ip'
}
