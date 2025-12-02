import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Report = {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  tiktok: string | null
  kategori: 'KOL' | 'MG'
  kronologi: string
  bukti_url: string | null
  pelapor_nama: string | null
  pelapor_kontak: string | null
  status: 'pending' | 'approved' | 'rejected'
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
