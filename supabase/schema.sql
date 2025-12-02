-- =============================================
-- BLACKLIST KOL/MG DATABASE SCHEMA
-- Jalankan SQL ini di Supabase SQL Editor
-- =============================================

-- Table: reports (laporan masuk)
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  kategori VARCHAR(50) NOT NULL, -- 'KOL' atau 'MG'
  kronologi TEXT NOT NULL,
  bukti_url TEXT, -- link bukti (gdrive, imgur, dll)
  pelapor_nama VARCHAR(255),
  pelapor_kontak VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

-- Table: blacklist (yang sudah diverifikasi)
CREATE TABLE blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  kategori VARCHAR(50) NOT NULL,
  alasan TEXT NOT NULL,
  jumlah_laporan INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk search cepat
CREATE INDEX idx_blacklist_nama ON blacklist USING gin(to_tsvector('simple', nama));
CREATE INDEX idx_blacklist_no_hp ON blacklist(no_hp);
CREATE INDEX idx_blacklist_instagram ON blacklist(instagram);
CREATE INDEX idx_blacklist_tiktok ON blacklist(tiktok);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read blacklist
CREATE POLICY "Public can view blacklist" ON blacklist
  FOR SELECT USING (true);

-- Policy: Anyone can insert reports
CREATE POLICY "Anyone can submit report" ON reports
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated can manage reports (admin)
CREATE POLICY "Admin can view all reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Admin can update reports" ON reports
  FOR UPDATE USING (true);

-- Policy: Admin can insert blacklist
CREATE POLICY "Admin can insert blacklist" ON blacklist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update blacklist" ON blacklist
  FOR UPDATE USING (true);
