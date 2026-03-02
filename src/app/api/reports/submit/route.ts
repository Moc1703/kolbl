import { NextResponse } from 'next/server'
import { sanitizeInput, sanitizeUrl } from '@/lib/security'
import { getSupabaseClient, getClientIp } from '@/lib/api-utils'


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
      bukti_url: sanitizeUrl(body.bukti_url) || null,
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
