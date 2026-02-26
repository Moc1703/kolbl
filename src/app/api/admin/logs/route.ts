/**
 * Admin Log API Route
 * Fetches admin activity logs and allows client-side logging of actions
 */

import { NextResponse } from 'next/server'
import { getAdminLogs, logAdminAction } from '@/lib/admin-log'
import type { AdminAction, TargetType } from '@/lib/admin-log'

// GET: Fetch logs
export async function GET() {
  const logs = await getAdminLogs(100)
  return NextResponse.json({ logs })
}

// POST: Log an action from the client
export async function POST(request: Request) {
  try {
    const { username, action, targetType, targetId, details } = await request.json()

    if (!username || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    await logAdminAction(
      username as string,
      action as AdminAction,
      (targetType || null) as TargetType,
      targetId || null,
      details || '',
      ip
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to log action' }, { status: 500 })
  }
}
