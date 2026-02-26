import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeInput } from '@/lib/security'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

function getClientIp(request: Request): string {
  const headers = request.headers

  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp

  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui syarat dan ketentuan' },
        { status: 400 }
      )
    }

    const reporterIp = getClientIp(request)

    const cleanData = {
      nama: sanitizeInput(body.nama),
      no_hp: sanitizeInput(body.no_hp) || null,
      instagram: sanitizeInput(body.instagram?.replace('@', '')) || null,
      tiktok: sanitizeInput(body.tiktok?.replace('@', '')) || null,
      kategori_masalah: sanitizeInput(body.kategori_masalah),
      asal_mg: sanitizeInput(body.asal_mg) || null,
      kronologi: sanitizeInput(body.kronologi),
      bukti_url: sanitizeInput(body.bukti_url) || null,
      pelapor_nama: sanitizeInput(body.pelapor_nama) || null,
      pelapor_kontak: sanitizeInput(body.pelapor_kontak) || null,
      status: 'pending',
      reporter_ip: reporterIp,
      agreed_to_terms: true,
      agreement_timestamp: new Date().toISOString()
    }

    if (!cleanData.nama || !cleanData.kronologi) {
      return NextResponse.json(
        { error: 'Nama dan kronologi wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('indikasi_reports')
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
      { success: true, message: 'Laporan berhasil dikirim', data },
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
