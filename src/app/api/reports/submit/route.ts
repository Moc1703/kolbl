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

    // Sanitize all inputs to prevent XSS attacks
    const cleanData: Record<string, unknown> = {
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
    }

    // Only add optional tracking fields if they might exist in the table
    const reporterIp = getClientIp(request)
    cleanData.reporter_ip = reporterIp
    cleanData.agreed_to_terms = true
    cleanData.agreement_timestamp = new Date().toISOString()

    // Validate required fields
    if (!cleanData.nama || !cleanData.kronologi) {
      return NextResponse.json(
        { error: 'Nama dan kronologi wajib diisi' },
        { status: 400 }
      )
    }

    // Insert into database
    const supabase = getSupabaseClient()
    let { data, error } = await supabase
      .from('reports')
      .insert(cleanData)
      .select()
      .single()

    // If insert fails (possibly due to extra columns), retry without optional tracking fields
    if (error) {
      console.error('First insert attempt failed:', error.message)
      
      // Remove optional tracking fields and retry
      delete cleanData.reporter_ip
      delete cleanData.agreed_to_terms
      delete cleanData.agreement_timestamp

      const retryResult = await supabase
        .from('reports')
        .insert(cleanData)
        .select()
        .single()
      
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Gagal mengirim laporan: ${error.message}` },
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
