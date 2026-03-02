'use client'

import { useState } from 'react'

export default function IndikasiLaporPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    instagram: '',
    tiktok: '',
    kategori_masalah: 'Lelet',
    asal_mg: '',
    kronologi: '',
    bukti_url: '',
    pelapor_nama: '',
    pelapor_kontak: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      alert('Anda harus menyetujui syarat dan ketentuan terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/indikasi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, agreedToTerms: true })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim laporan')
      }

      setSuccess(true)
      setAgreedToTerms(false)
      setForm({
        nama: '', no_hp: '', instagram: '', tiktok: '',
        kategori_masalah: 'Lelet', asal_mg: '', kronologi: '', bukti_url: '',
        pelapor_nama: '', pelapor_kontak: ''
      })
    } catch (error: any) {
      console.error('Submission error:', error)
      alert('Gagal mengirim laporan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 font-sans">
        <div className="bg-green-950/30 border border-green-900/50 rounded-sm p-8 text-center panel-dark relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="text-5xl mb-4 opacity-80">✅</div>
          <h2 className="text-2xl font-black text-green-500 uppercase tracking-tight mb-3">Laporan Terkirim</h2>
          <p className="text-green-400/80 font-mono text-sm mb-6">
            Terima kasih telah berpartisipasi. Dossier indikasi akan direview dan diverifikasi oleh tim kami.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-3 bg-green-700 text-black font-bold uppercase tracking-widest rounded-sm hover:bg-green-600 transition-colors"
            >
              LAPOR LAGI
            </button>
            <a
              href="/indikasi"
              className="px-6 py-3 bg-neutral-900 text-neutral-400 font-bold uppercase tracking-widest border border-neutral-700 rounded-sm hover:bg-neutral-800 hover:text-white transition-colors flex items-center justify-center"
            >
              KEMBALI KE DAFTAR
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 font-sans">
      <div className="mb-8 border-b-2 border-neutral-800 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <a href="/indikasi" className="text-amber-600 hover:text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <span>←</span> KEMBALI
          </a>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2">
          <span className="text-amber-500">⚠️</span> INDIKASI KASUS
        </h1>
        <p className="text-neutral-500 font-mono text-sm uppercase tracking-wider">
          Laporkan talent dengan indikasi bermasalah. Screening ketat diberlakukan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="panel-dark p-6 md:p-8 space-y-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-900"></div>

        {/* Data Talent */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-neutral-800">
            <span className="bg-amber-900/30 text-amber-500 font-mono text-xs px-2 py-0.5 border border-amber-900/50 rounded-sm">SEC-01</span>
            <h3 className="font-bold text-white uppercase tracking-wider">SUBJEK TERLAPOR</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
                Nama Talent <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                placeholder="NAMA LENGKAP / ALIAS"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">No HP/WhatsApp</label>
                <input
                  type="text"
                  value={form.no_hp}
                  onChange={(e) => setForm({...form, no_hp: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                  placeholder="08XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Kategori Masalah <span className="text-amber-500">*</span></label>
                <select
                  value={form.kategori_masalah}
                  onChange={(e) => setForm({...form, kategori_masalah: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm uppercase cursor-pointer"
                >
                  <option value="Lelet">🐢 LELET (SLOW RESPOND)</option>
                  <option value="Hilang">👻 HILANG (MENGHILANG)</option>
                  <option value="Ghost">💨 GHOSTING</option>
                  <option value="Lainnya">📌 LAINNYA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Asal Management</label>
              <input
                type="text"
                value={form.asal_mg}
                onChange={(e) => setForm({...form, asal_mg: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                placeholder="NAMA MANAGEMENT (JIKA ADA)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Instagram</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-neutral-900 border border-neutral-800 border-r-0 rounded-l-sm text-neutral-500 font-mono">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({...form, instagram: e.target.value})}
                    className="flex-1 px-4 py-3 bg-black border border-neutral-800 rounded-r-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                    placeholder="USERNAME"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">TikTok</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-neutral-900 border border-neutral-800 border-r-0 rounded-l-sm text-neutral-500 font-mono">@</span>
                  <input
                    type="text"
                    value={form.tiktok}
                    onChange={(e) => setForm({...form, tiktok: e.target.value})}
                    className="flex-1 px-4 py-3 bg-black border border-neutral-800 rounded-r-sm text-white focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                    placeholder="USERNAME"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kronologi */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-neutral-800">
            <span className="bg-amber-900/30 text-amber-500 font-mono text-xs px-2 py-0.5 border border-amber-900/50 rounded-sm">SEC-02</span>
            <h3 className="font-bold text-white uppercase tracking-wider">INCIDENT REPORT</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
                Kronologi Kejadian <span className="text-amber-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={form.kronologi}
                onChange={(e) => setForm({...form, kronologi: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-neutral-300 focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-serif italic text-sm placeholder-neutral-700 leading-relaxed"
                placeholder="Tuliskan kronologi lengkap, kapan mulai bermasalah, dan rincian tanggapan subjek."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Link Bukti Pendukung</label>
              <input
                type="url"
                value={form.bukti_url}
                onChange={(e) => setForm({...form, bukti_url: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-blue-400 focus:outline-none focus:border-amber-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-700"
                placeholder="HTTPS://DRIVE.GOOGLE.COM/..."
              />
              <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mt-2">Masukan link GDrive/Imgur yang berisi bukti pendukung.</p>
            </div>
          </div>
        </section>

        {/* Data Pelapor */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-neutral-800">
            <span className="bg-neutral-800 text-neutral-400 font-mono text-xs px-2 py-0.5 rounded-sm">SEC-EX</span>
            <h3 className="font-bold text-neutral-300 uppercase tracking-wider">DATA PELAPOR (RAHASIA)</h3>
          </div>
          <p className="text-xs font-mono text-neutral-500 mb-5 uppercase tracking-widest border-l-2 border-neutral-700 pl-3">Data ini dienkripsi dan hanya diakses oleh Admin untuk verifikasi.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Identitas</label>
              <input
                type="text"
                value={form.pelapor_nama}
                onChange={(e) => setForm({...form, pelapor_nama: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-sm text-neutral-400 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-800"
                placeholder="NAMA ANDA"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Kontak Darurat</label>
              <input
                type="text"
                value={form.pelapor_kontak}
                onChange={(e) => setForm({...form, pelapor_kontak: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-sm text-neutral-400 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-colors font-mono text-sm placeholder-neutral-800"
                placeholder="HP / EMAIL"
              />
            </div>
          </div>
        </section>

        <div className="bg-yellow-900/10 border border-yellow-900/50 rounded-sm p-4">
          <p className="text-xs font-mono text-yellow-600 uppercase tracking-widest leading-relaxed">
            <span className="font-bold">⚠️ PERINGATAN HUKUM:</span> Laporan palsu atau fitnah dapat dituntut sesuai undang-undang ITE yang berlaku.
          </p>
        </div>

        {/* Terms */}
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-sm p-5 hover:bg-amber-950/40 transition-colors">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-600 bg-neutral-900 border-neutral-700 rounded-sm focus:ring-amber-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-xs font-mono text-neutral-400 leading-relaxed uppercase tracking-wider">
              <strong className="text-amber-500">SAYA MENYATAKAN BUKTI INI ASLI & BENAR.</strong> Saya bertanggung jawab penuh secara hukum apabila laporan ini palsu. Platform dibebaskan dari tuntutan.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full py-4 bg-amber-700 text-black font-black uppercase tracking-widest rounded-sm hover:bg-amber-600 active:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>MEMPROSES DOSSIER...</span>
            </>
          ) : (
            <>
              <span>KIRIM DOSSIER INDIKASI</span>
              <span className="text-xl">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
