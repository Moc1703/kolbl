import { NextResponse } from 'next/server'
import { sanitizeInput, sanitizeUrl } from '@/lib/security'
import { getSupabaseClient, getClientIp } from '@/lib/api-utils'


export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui syarat dan ketentuan' },
        { status: 400 }
      )
    }

    const nominalValue = body.nominal ? parseInt(body.nominal, 10) : null

    const cleanData: Record<string, unknown> = {
      nama: sanitizeInput(body.nama),
      no_hp: sanitizeInput(body.no_hp) || null,
      instagram: sanitizeInput(body.instagram?.replace('@', '')) || null,
      tiktok: sanitizeInput(body.tiktok?.replace('@', '')) || null,
      jenis_fraud: sanitizeInput(body.jenis_fraud),
      nominal: isNaN(nominalValue as number) ? null : nominalValue,
      metode_pembayaran: sanitizeInput(body.metode_pembayaran) || null,
      kronologi: sanitizeInput(body.kronologi),
      bukti_url: sanitizeUrl(body.bukti_url) || null,
      pelapor_nama: sanitizeInput(body.pelapor_nama) || null,
      pelapor_kontak: sanitizeInput(body.pelapor_kontak) || null,
      status: 'pending',
    }

    // Optional tracking fields
    const reporterIp = getClientIp(request)
    cleanData.reporter_ip = reporterIp
    cleanData.agreed_to_terms = true
    cleanData.agreement_timestamp = new Date().toISOString()

    if (!cleanData.nama || !cleanData.kronologi) {
      return NextResponse.json(
        { error: 'Nama dan kronologi wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    let { data, error } = await supabase
      .from('fraud_reports')
      .insert(cleanData)
      .select()
      .single()

    // Retry without optional tracking fields if insert fails
    if (error) {
      console.error('First insert attempt failed:', error.message)
      delete cleanData.reporter_ip
      delete cleanData.agreed_to_terms
      delete cleanData.agreement_timestamp

      const retryResult = await supabase
        .from('fraud_reports')
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
