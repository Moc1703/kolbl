# 🚫 Blacklist KOL/MG Indonesia

Sistem database untuk melacak KOL (Key Opinion Leader) dan Management yang bermasalah. Bantu lindungi sesama dari kerjasama yang merugikan.

## Fitur

- ✅ **Halaman Publik** - Search blacklist by nama, HP, Instagram, TikTok
- ✅ **Form Laporan** - Submit aduan dengan kronologi dan bukti
- ✅ **Admin Dashboard** - Review, approve/reject laporan
- ✅ **Database Supabase** - Gratis & scalable
- ✅ **Deploy Vercel** - Gratis & cepat

---

## 🚀 Cara Deploy

### 1. Setup Supabase (Database)

1. Buka https://supabase.com dan login/signup
2. Klik **"New Project"**
3. Isi nama project (misal: `blacklist-kol`)
4. Set password database (simpan untuk jaga-jaga)
5. Pilih region **Singapore** (terdekat)
6. Tunggu sampai project ready

7. Buka **SQL Editor** di sidebar
8. Copy-paste isi file `supabase/schema.sql`
9. Klik **Run** untuk buat tabel

10. Buka **Settings > API**
11. Copy:
    - `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Deploy ke Vercel

1. Push code ini ke GitHub repository
2. Buka https://vercel.com dan login dengan GitHub
3. Klik **"Add New Project"**
4. Import repository yang sudah di-push
5. Di bagian **Environment Variables**, tambahkan:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxxxx
ADMIN_PASSWORD = passwordadminkamu123
```

6. Klik **Deploy**
7. Tunggu build selesai, website ready!

---

## 📁 Struktur Project

```
/BLMG
├── src/
│   ├── app/
│   │   ├── page.tsx          # Halaman utama (search blacklist)
│   │   ├── lapor/page.tsx    # Form laporan
│   │   ├── admin/page.tsx    # Admin dashboard
│   │   └── api/admin/login/  # API login admin
│   └── lib/
│       └── supabase.ts       # Supabase client
├── supabase/
│   └── schema.sql            # Database schema
└── package.json
```

---

## 🔐 Akses Admin

- URL: `https://domain-kamu.vercel.app/admin`
- Password: sesuai `ADMIN_PASSWORD` di environment variable

---

## 💡 Tips

- **Ganti password admin** secara berkala
- **Backup database** via Supabase dashboard
- **Monitor laporan** secara rutin biar ga numpuk
- Bisa tambah admin lain dengan share password (atau upgrade ke auth system)

---

## ⚠️ Disclaimer

Sistem ini dibuat untuk membantu sesama KOL specialist menghindari kerjasama yang bermasalah. Pastikan semua laporan berdasarkan fakta. Penyalahgunaan untuk fitnah dapat berakibat hukum.
