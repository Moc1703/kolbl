CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  kategori VARCHAR(50) NOT NULL,
  asal_mg VARCHAR(255),
  kronologi TEXT NOT NULL,
  bukti_url TEXT,
  pelapor_nama VARCHAR(255),
  pelapor_kontak VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

CREATE TABLE IF NOT EXISTS saran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255),
  kontak VARCHAR(255),
  jenis VARCHAR(50) NOT NULL,
  pesan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blacklist (
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

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit report" ON reports;
CREATE POLICY "Anyone can submit report" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view reports" ON reports;
CREATE POLICY "Anyone can view reports" ON reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update reports" ON reports;
CREATE POLICY "Anyone can update reports" ON reports FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can view blacklist" ON blacklist;
CREATE POLICY "Public can view blacklist" ON blacklist FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert blacklist" ON blacklist;
CREATE POLICY "Anyone can insert blacklist" ON blacklist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update blacklist" ON blacklist;
CREATE POLICY "Anyone can update blacklist" ON blacklist FOR UPDATE USING (true);

ALTER TABLE saran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit saran" ON saran;
CREATE POLICY "Anyone can submit saran" ON saran FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view saran" ON saran;
CREATE POLICY "Anyone can view saran" ON saran FOR SELECT USING (true);

-- Tabel ajuan unblacklist
CREATE TABLE IF NOT EXISTS unblacklist_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  alasan_banding TEXT NOT NULL,
  bukti_clear TEXT,
  kontak VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

ALTER TABLE unblacklist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit unblacklist request" ON unblacklist_requests;
CREATE POLICY "Anyone can submit unblacklist request" ON unblacklist_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view unblacklist requests" ON unblacklist_requests;
CREATE POLICY "Anyone can view unblacklist requests" ON unblacklist_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update unblacklist requests" ON unblacklist_requests;
CREATE POLICY "Anyone can update unblacklist requests" ON unblacklist_requests FOR UPDATE USING (true);
