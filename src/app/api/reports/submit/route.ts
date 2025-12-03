import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeInput } from '@/lib/security'

/**
 * Create Supabase client inside function to avoid build-time errors
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Get client IP address from request headers
 * Works with Vercel and other hosting providers
 */
function getClientIp(request: Request): string {
  const headers = request.headers
  
  // Try x-forwarded-for first (Vercel, most proxies)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one (client IP)
    return forwardedFor.split(',')[0].trim()
  }

  // Try x-real-ip (some proxies)
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Fallback
  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate that user agreed to terms
    if (!body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui syarat dan ketentuan' },
        { status: 400 }
      )
    }

    // Capture IP address
    const reporterIp = getClientIp(request)

    // Sanitize all inputs to prevent XSS attacks
    const cleanData = {
      nama: sanitizeInput(body.nama),
      no_hp: sanitizeInput(body.no_hp) || null,
      instagram: sanitizeInput(body.instagram?.replace('@', '')) || null,
      tiktok: sanitizeInput(body.tiktok?.replace('@', '')) || null,
      kategori: sanitizeInput(body.kategori),
      asal_mg: body.kategori === 'KOL' ? (sanitizeInput(body.asal_mg) || null) : null,
      kronologi: sanitizeInput(body.kronologi),
      bukti_url: sanitizeInput(body.bukti_url) || null,
      pelapor_nama: sanitizeInput(body.pelapor_nama) || null,
      pelapor_kontak: sanitizeInput(body.pelapor_kontak) || null,
      status: 'pending',
      // New fields for terms agreement and IP tracking
      reporter_ip: reporterIp,
      agreed_to_terms: true,
      agreement_timestamp: new Date().toISOString()
    }

    // Validate required fields
    if (!cleanData.nama || !cleanData.kronologi) {
      return NextResponse.json(
        { error: 'Nama dan kronologi wajib diisi' },
        { status: 400 }
      )
    }

    // Insert into database
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('reports')
      .insert(cleanData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Gagal mengirim laporan. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Laporan berhasil dikirim',
        data 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
