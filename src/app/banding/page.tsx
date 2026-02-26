'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sanitizeInput } from '@/lib/security'

export default function BandingPage() {
  const [form, setForm] = useState({
    nama: '',
    no_hp: '',
    instagram: '',
    alasan_banding: '',
    bukti_clear: '',
    kontak: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.nama.trim() || !form.alasan_banding.trim()) {
      alert('Nama dan alasan banding wajib diisi!')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.from('unblacklist_requests').insert({
      nama: sanitizeInput(form.nama),
      no_hp: sanitizeInput(form.no_hp) || null,
      instagram: sanitizeInput(form.instagram) || null,
      alasan_banding: sanitizeInput(form.alasan_banding),
      bukti_clear: sanitizeInput(form.bukti_clear) || null,
      kontak: sanitizeInput(form.kontak) || null
    })

    setLoading(false)

    if (error) {
      alert('Gagal mengirim ajuan: ' + error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center max-w-md w-full animate-in zoom-in-95 fade-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Ajuan Terkirim!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Ajuan banding kamu akan direview oleh admin. Harap tunggu konfirmasi lebih lanjut.
          </p>
          <a 
            href="/"
            className="inline-block w-full px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all text-center"
          >
            Kembali ke Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-10 pb-20 md:pb-24 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#1a130a)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-orange-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-amber-600/15 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-lg mx-auto">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 backdrop-blur-md mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-orange-300 tracking-wide uppercase">Klarifikasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Ajuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Unblacklist</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
            Ajukan banding jika masalah sudah clear. Sertakan bukti bahwa masalah sudah diselesaikan.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 -mt-12 relative z-20">
        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
          <span className="text-lg shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong>Catatan:</strong> Ajuan akan direview admin. Sertakan bukti bahwa masalah sudah diselesaikan (screenshot chat klarifikasi, bukti TF penggantian, dll).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({...form, nama: e.target.value})}
              placeholder="Nama sesuai di blacklist"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">No HP/WA</label>
              <input
                type="text"
                value={form.no_hp}
                onChange={(e) => setForm({...form, no_hp: e.target.value})}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Instagram</label>
              <div className="flex">
                <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm flex items-center">@</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({...form, instagram: e.target.value})}
                  placeholder="username"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Alasan Banding <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={form.alasan_banding}
              onChange={(e) => setForm({...form, alasan_banding: e.target.value})}
              placeholder="Jelaskan mengapa kamu layak di-unblacklist. Masalah sudah diselesaikan seperti apa?"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Link Bukti Clear</label>
            <input
              type="url"
              value={form.bukti_clear}
              onChange={(e) => setForm({...form, bukti_clear: e.target.value})}
              placeholder="Link Google Drive / Imgur (screenshot klarifikasi)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium"
            />
            <p className="text-xs text-gray-400 mt-1.5 font-medium">Upload bukti ke Google Drive, pastikan akses &quot;Anyone with link&quot;</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Kontak untuk Konfirmasi</label>
            <input
              type="text"
              value={form.kontak}
              onChange={(e) => setForm({...form, kontak: e.target.value})}
              placeholder="WA / Email untuk dihubungi admin"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all text-base font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 active:scale-[0.98] text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Mengirim...
              </>
            ) : (
              <>⚖️ Kirim Ajuan Banding</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
