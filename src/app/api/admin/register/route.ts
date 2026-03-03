import { NextResponse } from 'next/server'
import { sanitizeInput } from '@/lib/security'
import { hashPassword } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { username, password, display_name } = await request.json()

  const sanitizedUsername = sanitizeInput(username)?.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const sanitizedDisplayName = sanitizeInput(display_name)

  if (!sanitizedUsername || !password || !sanitizedDisplayName) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
    return NextResponse.json({ error: 'Username harus 3-20 karakter' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  // Check if username already exists
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('username', sanitizedUsername)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 409 })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Insert with is_active = false (pending approval)
  const { error } = await supabase.from('admin_users').insert({
    username: sanitizedUsername,
    password_hash: passwordHash,
    display_name: sanitizedDisplayName,
    role: 'admin',
    is_active: false,
  })

  if (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Registrasi berhasil! Menunggu approval admin utama.' })
}
