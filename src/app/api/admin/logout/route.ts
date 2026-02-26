import { NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin-log'

export async function POST(request: Request) {
  // Get admin info from cookie before clearing
  const cookieHeader = request.headers.get('cookie') || ''
  let adminUsername = 'unknown'

  try {
    const adminUserMatch = cookieHeader.match(/admin_user=([^;]+)/)
    if (adminUserMatch) {
      const decoded = decodeURIComponent(adminUserMatch[1])
      const adminUser = JSON.parse(decoded)
      adminUsername = adminUser.username || 'unknown'
    }
  } catch {
    // Ignore parse errors
  }

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // Log logout
  await logAdminAction(adminUsername, 'logout', 'session', null, 'Admin logged out', ip)

  // Clear cookies
  const response = NextResponse.json({ success: true })

  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  response.cookies.set('admin_user', '', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
