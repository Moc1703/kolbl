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

    const reporterIp = getClientIp(request)

    const nominalValue = body.nominal ? parseInt(body.nominal, 10) : null

    const cleanData = {
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
      .from('fraud_reports')
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
