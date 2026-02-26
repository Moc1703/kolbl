import { NextResponse } from 'next/server'
import { sanitizeInput } from '@/lib/security'
import { verifyPassword, generateSessionToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin-log'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  // Sanitize username (not password — we need raw for hash comparison)
  const sanitizedUsername = sanitizeInput(username)

  if (!sanitizedUsername || !password) {
    return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
  }

  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

  // Look up admin user
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', sanitizedUsername)
    .eq('is_active', true)
    .single()

  if (error || !adminUser) {
    // Log failed login attempt
    await logAdminAction(sanitizedUsername, 'login_failed', 'session', null, 'User not found', ip)
    return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
  }

  // Verify password
  const isValid = await verifyPassword(password, adminUser.password_hash)

  if (!isValid) {
    await logAdminAction(sanitizedUsername, 'login_failed', 'session', null, 'Invalid password', ip)
    return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
  }

  // Generate session token
  const sessionToken = generateSessionToken()

  // Update last login
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminUser.id)

  // Log successful login
  await logAdminAction(sanitizedUsername, 'login', 'session', adminUser.id, `Login berhasil sebagai ${adminUser.display_name || sanitizedUsername}`, ip)

  // Set httpOnly cookie with session token
  const response = NextResponse.json({
    success: true,
    user: {
      username: adminUser.username,
      display_name: adminUser.display_name,
      role: adminUser.role,
    }
  })

  response.cookies.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  // Also store the session info as a non-httpOnly cookie for client-side access
  response.cookies.set('admin_user', JSON.stringify({
    username: adminUser.username,
    display_name: adminUser.display_name,
    role: adminUser.role,
    token: sessionToken,
  }), {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return response
}
