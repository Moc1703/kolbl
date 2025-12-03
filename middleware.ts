import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Rate Limiting Middleware
 * 
 * Applies rate limiting to API routes to prevent spam and abuse.
 * Limits: 5 requests per minute per IP address
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory cache for rate limiting
// ⚠️ Note: In serverless environments (Vercel), this cache is per-instance
// For production, consider using Upstash Redis
const rateLimitCache = new Map<string, RateLimitEntry>()

const MAX_REQUESTS = 5
const WINDOW_MS = 60 * 1000 // 1 minute

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback
  return 'unknown-ip'
}

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitCache.get(ip)

  // No entry or window expired - allow and create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + WINDOW_MS
    rateLimitCache.set(ip, { count: 1, resetTime })
    
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime
    }
  }

  // Entry exists and window is still active
  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Increment count
  entry.count++
  rateLimitCache.set(ip, entry)

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Cleanup expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  const keysToDelete: string[] = []

  rateLimitCache.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach(key => rateLimitCache.delete(key))
}

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60 * 1000)

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIp(request)
    const { allowed, remaining, resetTime } = checkRateLimit(ip)

    if (!allowed) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
      
      return NextResponse.json(
        { 
          message: 'Too many requests, slow down!',
          retryAfter: `${retryAfter} seconds`
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      )
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
  }

  // For non-API routes, continue without rate limiting
  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: '/api/:path*', // Only run on /api/* routes
}
