/**
 * Server-side Admin Auth Guard
 * Validates admin session from cookies before allowing access to admin APIs
 */

import { NextResponse } from 'next/server'

export interface AdminSession {
  username: string
  display_name: string
  role: string
  token: string
}

/**
 * Validate admin session from request cookies.
 * Checks that:
 * 1. The httpOnly admin_session cookie exists (set during login)
 * 2. The admin_user cookie with display info exists
 * Returns the admin session if valid, or null if invalid.
 */
export function getAdminSession(request: Request): AdminSession | null {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/)
    const userMatch = cookieHeader.match(/admin_user=([^;]+)/)

    // Both cookies must be present
    if (!sessionMatch || !sessionMatch[1] || !userMatch || !userMatch[1]) {
      return null
    }

    const sessionToken = sessionMatch[1]
    if (!sessionToken || sessionToken.length < 10) {
      return null
    }

    const decoded = decodeURIComponent(userMatch[1])
    const adminUser = JSON.parse(decoded)

    if (!adminUser.username) {
      return null
    }

    return {
      username: adminUser.username,
      display_name: adminUser.display_name || adminUser.username,
      role: adminUser.role || 'admin',
      token: sessionToken,
    }
  } catch {
    return null
  }
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized — silakan login terlebih dahulu' },
    { status: 401 }
  )
}
