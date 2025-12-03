import { NextResponse } from 'next/server'
import { sanitizeInput } from '@/lib/security'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  // Sanitize input to prevent XSS
  const sanitizedPassword = sanitizeInput(password)
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  if (sanitizedPassword === adminPassword) {
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}
