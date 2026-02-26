-- ============================================
-- FITUR 1: Indikasi Talent Bermasalah
-- ============================================

-- Tabel laporan indikasi masuk
CREATE TABLE IF NOT EXISTS indikasi_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  kategori_masalah VARCHAR(50) NOT NULL, -- Lelet, Hilang, Ghost, Lainnya
  asal_mg VARCHAR(255),
  kronologi TEXT NOT NULL,
  bukti_url TEXT,
  pelapor_nama VARCHAR(255),
  pelapor_kontak VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  reporter_ip VARCHAR(50),
  agreed_to_terms BOOLEAN DEFAULT false,
  agreement_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

-- Tabel daftar talent bermasalah (sudah diverifikasi)
CREATE TABLE IF NOT EXISTS indikasi_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES indikasi_reports(id),
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  kategori_masalah VARCHAR(50) NOT NULL,
  alasan TEXT NOT NULL,
  jumlah_laporan INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel banding indikasi
CREATE TABLE IF NOT EXISTS indikasi_banding (
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

-- RLS Policies for indikasi_reports
ALTER TABLE indikasi_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit indikasi report" ON indikasi_reports;
CREATE POLICY "Anyone can submit indikasi report" ON indikasi_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view indikasi reports" ON indikasi_reports;
CREATE POLICY "Anyone can view indikasi reports" ON indikasi_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update indikasi reports" ON indikasi_reports;
CREATE POLICY "Anyone can update indikasi reports" ON indikasi_reports FOR UPDATE USING (true);

-- RLS Policies for indikasi_list
ALTER TABLE indikasi_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view indikasi list" ON indikasi_list;
CREATE POLICY "Public can view indikasi list" ON indikasi_list FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert indikasi list" ON indikasi_list;
CREATE POLICY "Anyone can insert indikasi list" ON indikasi_list FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update indikasi list" ON indikasi_list;
CREATE POLICY "Anyone can update indikasi list" ON indikasi_list FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete indikasi list" ON indikasi_list;
CREATE POLICY "Anyone can delete indikasi list" ON indikasi_list FOR DELETE USING (true);

-- RLS Policies for indikasi_banding
ALTER TABLE indikasi_banding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit indikasi banding" ON indikasi_banding;
CREATE POLICY "Anyone can submit indikasi banding" ON indikasi_banding FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view indikasi banding" ON indikasi_banding;
CREATE POLICY "Anyone can view indikasi banding" ON indikasi_banding FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update indikasi banding" ON indikasi_banding;
CREATE POLICY "Anyone can update indikasi banding" ON indikasi_banding FOR UPDATE USING (true);


-- ============================================
-- FITUR 2: Pencurian / Penipuan Pembayaran
-- ============================================

-- Tabel laporan fraud masuk
CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  jenis_fraud VARCHAR(50) NOT NULL, -- Pencurian, Penipuan Pembayaran, Lainnya
  nominal BIGINT,
  metode_pembayaran VARCHAR(100),
  kronologi TEXT NOT NULL,
  bukti_url TEXT,
  pelapor_nama VARCHAR(255),
  pelapor_kontak VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  reporter_ip VARCHAR(50),
  agreed_to_terms BOOLEAN DEFAULT false,
  agreement_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT
);

-- Tabel daftar fraud (sudah diverifikasi)
CREATE TABLE IF NOT EXISTS fraud_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES fraud_reports(id),
  nama VARCHAR(255) NOT NULL,
  no_hp VARCHAR(50),
  instagram VARCHAR(100),
  tiktok VARCHAR(100),
  jenis_fraud VARCHAR(50) NOT NULL,
  nominal_total BIGINT DEFAULT 0,
  alasan TEXT NOT NULL,
  jumlah_laporan INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel banding fraud
CREATE TABLE IF NOT EXISTS fraud_banding (
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

-- RLS Policies for fraud_reports
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit fraud report" ON fraud_reports;
CREATE POLICY "Anyone can submit fraud report" ON fraud_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view fraud reports" ON fraud_reports;
CREATE POLICY "Anyone can view fraud reports" ON fraud_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update fraud reports" ON fraud_reports;
CREATE POLICY "Anyone can update fraud reports" ON fraud_reports FOR UPDATE USING (true);

-- RLS Policies for fraud_list
ALTER TABLE fraud_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view fraud list" ON fraud_list;
CREATE POLICY "Public can view fraud list" ON fraud_list FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert fraud list" ON fraud_list;
CREATE POLICY "Anyone can insert fraud list" ON fraud_list FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update fraud list" ON fraud_list;
CREATE POLICY "Anyone can update fraud list" ON fraud_list FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete fraud list" ON fraud_list;
CREATE POLICY "Anyone can delete fraud list" ON fraud_list FOR DELETE USING (true);

-- RLS Policies for fraud_banding
ALTER TABLE fraud_banding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit fraud banding" ON fraud_banding;
CREATE POLICY "Anyone can submit fraud banding" ON fraud_banding FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view fraud banding" ON fraud_banding;
CREATE POLICY "Anyone can view fraud banding" ON fraud_banding FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update fraud banding" ON fraud_banding;
CREATE POLICY "Anyone can update fraud banding" ON fraud_banding FOR UPDATE USING (true);


-- ============================================
-- FITUR 3: Admin Users & Activity Log
-- ============================================

-- Tabel admin users (username + hashed password)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin', -- admin, superadmin
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel admin activity log
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL, -- login, logout, approve_report, reject_report, etc.
  target_type VARCHAR(30), -- report, banding, indikasi, fraud, session
  target_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster log queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_username ON admin_logs(admin_username);

-- RLS Policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admin users" ON admin_users;
CREATE POLICY "Anyone can read admin users" ON admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update admin users" ON admin_users;
CREATE POLICY "Anyone can update admin users" ON admin_users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can insert admin users" ON admin_users;
CREATE POLICY "Anyone can insert admin users" ON admin_users FOR INSERT WITH CHECK (true);

-- RLS Policies for admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read admin logs" ON admin_logs;
CREATE POLICY "Anyone can read admin logs" ON admin_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert admin logs" ON admin_logs;
CREATE POLICY "Anyone can insert admin logs" ON admin_logs FOR INSERT WITH CHECK (true);
