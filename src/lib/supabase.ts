import { createClient } from '@supabase/supabase-js'

// Remove any non-ASCII characters that might cause header issues
const cleanString = (str: string) => str.replace(/[^\x00-\x7F]/g, '').trim()

const supabaseUrl = cleanString(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co')
const supabaseAnonKey = cleanString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Report = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  kategori: 'KOL' | 'MG'
  asal_mg: string | null
  kronologi: string
  bukti_url: string | null
  pelapor_nama: string | null
  pelapor_kontak: string | null
  status: 'pending' | 'approved' | 'rejected' | 'resolved'
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}

export type Blacklist = {
  id: string
  report_id: string | null
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  kategori: 'KOL' | 'MG'
  alasan: string
  jumlah_laporan: number
  created_at: string
  updated_at: string
}

// ============================================
// Indikasi Talent Bermasalah Types
// ============================================

export type IndikasiReport = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  kategori_masalah: 'Lelet' | 'Hilang' | 'Ghost' | 'Lainnya'
  asal_mg: string | null
  kronologi: string
  bukti_url: string | null
  pelapor_nama: string | null
  pelapor_kontak: string | null
  status: 'pending' | 'approved' | 'rejected' | 'resolved'
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}

export type IndikasiList = {
  id: string
  report_id: string | null
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  kategori_masalah: 'Lelet' | 'Hilang' | 'Ghost' | 'Lainnya'
  alasan: string
  jumlah_laporan: number
  created_at: string
  updated_at: string
}

export type IndikasiBanding = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  alasan_banding: string
  bukti_clear: string | null
  kontak: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}

// ============================================
// Pencurian / Penipuan Pembayaran Types
// ============================================

export type FraudReport = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  jenis_fraud: 'Pencurian' | 'Penipuan Pembayaran' | 'Lainnya'
  nominal: number | null
  metode_pembayaran: string | null
  kronologi: string
  bukti_url: string | null
  pelapor_nama: string | null
  pelapor_kontak: string | null
  status: 'pending' | 'approved' | 'rejected' | 'resolved'
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}

export type FraudList = {
  id: string
  report_id: string | null
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  jenis_fraud: 'Pencurian' | 'Penipuan Pembayaran' | 'Lainnya'
  nominal_total: number
  alasan: string
  jumlah_laporan: number
  created_at: string
  updated_at: string
}

export type FraudBanding = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  alasan_banding: string
  bukti_clear: string | null
  kontak: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}
