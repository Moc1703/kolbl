/**
 * Shared API utilities
 * Centralizes common functions used across multiple API routes
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Create Supabase client inside function to avoid build-time errors
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Get client IP address from request headers
 * Works with Vercel, Cloudflare, and other hosting providers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  return 'unknown'
}
