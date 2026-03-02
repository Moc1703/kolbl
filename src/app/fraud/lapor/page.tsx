'use client'

import { useState } from 'react'

export default function FraudLaporPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    instagram: '',
    tiktok: '',
    jenis_fraud: 'Penipuan Pembayaran',
    nominal: '',
    metode_pembayaran: '',
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
      const response = await fetch('/api/fraud/submit', {
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
        jenis_fraud: 'Penipuan Pembayaran', nominal: '', metode_pembayaran: '',
        kronologi: '', bukti_url: '', pelapor_nama: '', pelapor_kontak: ''
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
        <div className="bg-green-50 border border-green-200 rounded-sm p-8 text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="text-5xl mb-4 opacity-80">✅</div>
          <h2 className="text-2xl font-black text-green-700 uppercase tracking-tight mb-3">Laporan Terkirim</h2>
          <p className="text-green-800 font-mono text-sm mb-6">
            Terima kasih telah berpartisipasi. Dossier fraud akan direview dan diverifikasi oleh tim kami.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-3 bg-green-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-green-700 transition-colors shadow-sm"
            >
              LAPOR LAGI
            </button>
            <a
              href="/fraud"
              className="px-6 py-3 bg-white text-gray-700 font-bold uppercase tracking-widest border border-gray-300 rounded-sm hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center shadow-sm"
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
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <a href="/fraud" className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <span>←</span> KEMBALI
          </a>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-2">
          <span className="text-red-600">🚨</span> LAPOR PENIPUAN
        </h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-wider">
          Laporkan kasus pencurian atau penipuan pembayaran.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 md:p-8 space-y-8 relative shadow-sm rounded-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

        {/* Data Pelaku */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
            <span className="bg-red-50 text-red-700 font-mono text-xs px-2 py-0.5 border border-red-200 rounded-sm">SEC-01</span>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider">SUBJEK PELAKU</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                Nama Pelaku <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                placeholder="NAMA LENGKAP / ALIAS / REKENING"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">No HP/WhatsApp</label>
                <input
                  type="text"
                  value={form.no_hp}
                  onChange={(e) => setForm({...form, no_hp: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                  placeholder="08XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Jenis Fraud <span className="text-red-500">*</span></label>
                <select
                  value={form.jenis_fraud}
                  onChange={(e) => setForm({...form, jenis_fraud: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm uppercase cursor-pointer"
                >
                  <option value="Pencurian">🔒 PENCURIAN</option>
                  <option value="Penipuan Pembayaran">💸 PENIPUAN PEMBAYARAN</option>
                  <option value="Lainnya">📌 LAINNYA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Nominal Kerugian</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-gray-200 border-r-0 rounded-l-sm text-gray-500 font-mono text-sm">RP</span>
                  <input
                    type="number"
                    value={form.nominal}
                    onChange={(e) => setForm({...form, nominal: e.target.value})}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Metode Transaksi</label>
                <input
                  type="text"
                  value={form.metode_pembayaran}
                  onChange={(e) => setForm({...form, metode_pembayaran: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                  placeholder="BCA, GOPAY, DLL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Instagram</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-gray-200 border-r-0 rounded-l-sm text-gray-500 font-mono">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({...form, instagram: e.target.value})}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                    placeholder="USERNAME"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">TikTok</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-gray-200 border-r-0 rounded-l-sm text-gray-500 font-mono">@</span>
                  <input
                    type="text"
                    value={form.tiktok}
                    onChange={(e) => setForm({...form, tiktok: e.target.value})}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                    placeholder="USERNAME"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kronologi */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
            <span className="bg-red-50 text-red-700 font-mono text-xs px-2 py-0.5 border border-red-200 rounded-sm">SEC-02</span>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider">INCIDENT REPORT</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                Kronologi Kejadian <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={form.kronologi}
                onChange={(e) => setForm({...form, kronologi: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-serif italic text-sm placeholder-gray-400 leading-relaxed custom-scrollbar"
                placeholder="Tuliskan kronologi lengkap, detail transaksi, bukti komunikasi, dll."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Link Bukti Pendukung</label>
              <input
                type="url"
                value={form.bukti_url}
                onChange={(e) => setForm({...form, bukti_url: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-blue-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                placeholder="HTTPS://DRIVE.GOOGLE.COM/..."
              />
              <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 mt-2">Masukan link GDrive/Imgur yang berisi bukti pendukung pembayaran dan chat.</p>
            </div>
          </div>
        </section>

        {/* Data Pelapor */}
        <section>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
            <span className="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-0.5 border border-gray-200 rounded-sm">SEC-EX</span>
            <h3 className="font-bold text-gray-700 uppercase tracking-wider">DATA PELAPOR (RAHASIA)</h3>
          </div>
          <p className="text-xs font-mono text-gray-500 mb-5 uppercase tracking-widest border-l-2 border-gray-300 pl-3">Data ini dienkripsi dan hanya diakses oleh Admin untuk keperluan penyidikan internal.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Identitas</label>
              <input
                type="text"
                value={form.pelapor_nama}
                onChange={(e) => setForm({...form, pelapor_nama: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                placeholder="NAMA ANDA"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Kontak Darurat</label>
              <input
                type="text"
                value={form.pelapor_kontak}
                onChange={(e) => setForm({...form, pelapor_kontak: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:bg-white transition-colors font-mono text-sm placeholder-gray-400"
                placeholder="HP / EMAIL"
              />
            </div>
          </div>
        </section>

        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <p className="text-xs font-mono text-red-700 uppercase tracking-widest leading-relaxed">
            <span className="font-bold text-red-800">🚨 PERINGATAN HUKUM:</span> Kasus penipuan adalah tindak pidana. Laporan palsu dapat berakibat hukum.
          </p>
        </div>

        {/* Terms */}
        <div className="bg-red-50/50 border border-red-200 rounded-sm p-5 hover:bg-red-50 transition-colors cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 accent-red-600 bg-white border-gray-300 rounded-sm focus:ring-red-500 cursor-pointer flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs font-mono text-gray-600 leading-relaxed uppercase tracking-wider">
              <strong className="text-red-700">SAYA MENYATAKAN BUKTI INI ASLI & BENAR.</strong> Saya bertanggung jawab penuh secara hukum apabila laporan ini palsu. Platform dibebaskan dari tuntutan hukum.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-sm hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>MEMPROSES DOSSIER...</span>
            </>
          ) : (
            <>
              <span>KIRIM DOSSIER FRAUD</span>
              <span className="text-xl">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
