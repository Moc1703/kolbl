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
