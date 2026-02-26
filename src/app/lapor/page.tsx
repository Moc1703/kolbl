'use client'

import { useState } from 'react'

export default function LaporPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    instagram: '',
    tiktok: '',
    kategori: 'KOL',
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
      const response = await fetch('/api/reports/submit', {
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
        kategori: 'KOL', asal_mg: '', kronologi: '', bukti_url: '',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center max-w-md w-full animate-in zoom-in-95 fade-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Laporan Terkirim!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Terima kasih sudah melapor. Tim kami akan review dan verifikasi laporan kamu dalam 1-3 hari kerja.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setSuccess(false)}
              className="flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all"
            >
              Buat Laporan Lagi
            </button>
            <a 
              href="/"
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-center"
            >
              Kembali ke Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-10 pb-20 md:pb-24 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#020617)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-rose-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-orange-600/15 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 backdrop-blur-md mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-rose-300 tracking-wide uppercase">Form Laporan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Lapor KOL / MG <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Bermasalah</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
            Bantu komunitas dengan melaporkan KOL atau Management yang merugikan. Laporan akan direview sebelum dipublikasikan.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 space-y-8">
          
          {/* Section 1: Data KOL/MG */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-sm">👤</div>
              <h3 className="font-bold text-gray-900">Data KOL/MG yang Dilaporkan</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nama KOL/MG <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                  placeholder="Nama lengkap atau nama yang dikenal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">No HP/WhatsApp</label>
                  <input
                    type="text"
                    value={form.no_hp}
                    onChange={(e) => setForm({...form, no_hp: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Kategori <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select
                      value={form.kategori}
                      onChange={(e) => setForm({...form, kategori: e.target.value})}
                      className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium pr-10 cursor-pointer"
                    >
                      <option value="KOL">KOL (Key Opinion Leader)</option>
                      <option value="MG">MG (Management)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {form.kategori === 'KOL' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Asal Management</label>
                  <input
                    type="text"
                    value={form.asal_mg}
                    onChange={(e) => setForm({...form, asal_mg: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                    placeholder="Nama management yang menaungi (jika ada)"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Username Instagram</label>
                  <div className="flex">
                    <span className="px-3.5 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm flex items-center">@</span>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => setForm({...form, instagram: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Username TikTok</label>
                  <div className="flex">
                    <span className="px-3.5 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm flex items-center">@</span>
                    <input
                      type="text"
                      value={form.tiktok}
                      onChange={(e) => setForm({...form, tiktok: e.target.value})}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Laporan */}
          <div>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">📝</div>
              <h3 className="font-bold text-gray-900">Detail Laporan</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Kronologi Kejadian <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.kronologi}
                  onChange={(e) => setForm({...form, kronologi: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium resize-none"
                  placeholder="Ceritakan kronologi kejadian secara detail: kapan, bagaimana kerjasamanya, apa yang terjadi, kerugian yang dialami, dll."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Link Bukti</label>
                <input
                  type="url"
                  value={form.bukti_url}
                  onChange={(e) => setForm({...form, bukti_url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                  placeholder="Link Google Drive, Imgur, atau cloud storage lainnya"
                />
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Upload bukti ke Google Drive/Imgur lalu paste linknya di sini</p>
              </div>
            </div>
          </div>

          {/* Section 3: Data Pelapor */}
          <div>
            <div className="flex items-center gap-3 mb-2 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🔒</div>
              <div>
                <h3 className="font-bold text-gray-900">Data Pelapor</h3>
                <p className="text-xs text-gray-400 font-medium">Opsional — tidak akan dipublikasikan</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Kamu</label>
                <input
                  type="text"
                  value={form.pelapor_nama}
                  onChange={(e) => setForm({...form, pelapor_nama: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kontak Kamu</label>
                <input
                  type="text"
                  value={form.pelapor_kontak}
                  onChange={(e) => setForm({...form, pelapor_kontak: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all text-base font-medium"
                  placeholder="No HP/Email untuk konfirmasi"
                />
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">⚠️</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Perhatian:</strong> Pastikan laporan berdasarkan fakta. Laporan palsu atau fitnah dapat berakibat hukum.
            </p>
          </div>

          {/* Terms */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500 focus:ring-2 cursor-pointer flex-shrink-0 accent-rose-600"
              />
              <span className="text-sm text-gray-800 leading-relaxed font-medium">
                <strong className="text-rose-700">Saya menyatakan bukti ini ASLI & BENAR.</strong> Saya bertanggung jawab penuh secara hukum apabila laporan ini palsu. Platform dibebaskan dari tuntutan.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-2xl hover:from-rose-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200 active:scale-[0.98] text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Mengirim...
              </>
            ) : (
              <>📨 Kirim Laporan</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
