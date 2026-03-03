'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sanitizeInput } from '@/lib/security'

export default function FraudBandingPage() {
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

    const { error } = await supabase.from('fraud_banding').insert({
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
      <div className="max-w-lg mx-auto px-4 py-12 font-sans">
        <div className="bg-green-950/30 border border-green-900/50 rounded-sm p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="text-5xl mb-4 opacity-80">✅</div>
          <h2 className="text-xl font-black text-green-500 uppercase tracking-tight mb-2">Ajuan Terkirim!</h2>
          <p className="text-green-400/80 font-mono text-sm mb-6">
            Ajuan banding kamu akan direview oleh admin. Harap tunggu konfirmasi lebih lanjut.
          </p>
          <a
            href="/fraud"
            className="inline-block px-6 py-3 bg-neutral-800 text-white border border-neutral-700 font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-700 transition-colors text-sm"
          >
            Kembali ke Fraud
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-8 border-b-2 border-neutral-800 pb-4">
        <a href="/fraud" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mb-3">
          <span>←</span> KEMBALI
        </a>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2">
          <span className="text-red-500">⚖️</span> BANDING KASUS FRAUD
        </h1>
        <p className="text-neutral-500 font-mono text-sm uppercase tracking-wider">Ajukan banding jika masalah sudah clear</p>
      </div>

      {/* Info */}
      <div className="bg-red-950/20 border border-red-900/40 rounded-sm p-4 mb-6">
        <p className="text-xs font-mono text-red-400 uppercase tracking-widest leading-relaxed">
          <strong className="font-bold">📋 CATATAN:</strong> Ajuan akan direview admin. Sertakan bukti bahwa masalah sudah diselesaikan (bukti pengembalian dana, screenshot chat klarifikasi, dll).
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 space-y-6 rounded-sm relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({...form, nama: e.target.value})}
            placeholder="NAMA SESUAI DI DAFTAR FRAUD"
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm placeholder-neutral-700"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">No HP/WA</label>
            <input
              type="text"
              value={form.no_hp}
              onChange={(e) => setForm({...form, no_hp: e.target.value})}
              placeholder="08XXXXXXXXXX"
              className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm placeholder-neutral-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Instagram</label>
            <div className="flex">
              <span className="px-3 py-3 bg-neutral-900 border border-neutral-800 border-r-0 rounded-l-sm text-neutral-500 font-mono">@</span>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({...form, instagram: e.target.value})}
                placeholder="USERNAME"
                className="flex-1 px-4 py-3 bg-black border border-neutral-800 rounded-r-sm text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm placeholder-neutral-700"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
            Alasan Banding <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.alasan_banding}
            onChange={(e) => setForm({...form, alasan_banding: e.target.value})}
            placeholder="Jelaskan mengapa kamu layak dihapus dari daftar."
            rows={4}
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-neutral-300 focus:outline-none focus:border-red-500 transition-colors font-serif italic text-sm placeholder-neutral-700 leading-relaxed resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Link Bukti Clear</label>
          <input
            type="url"
            value={form.bukti_clear}
            onChange={(e) => setForm({...form, bukti_clear: e.target.value})}
            placeholder="HTTPS://DRIVE.GOOGLE.COM/..."
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-blue-400 focus:outline-none focus:border-red-500 transition-colors font-mono text-sm placeholder-neutral-700"
          />
          <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-600 mt-2">Upload bukti ke Google Drive</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Kontak untuk Konfirmasi</label>
          <input
            type="text"
            value={form.kontak}
            onChange={(e) => setForm({...form, kontak: e.target.value})}
            placeholder="WA / EMAIL"
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm placeholder-neutral-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-red-700 text-white font-black uppercase tracking-widest rounded-sm hover:bg-red-600 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>MENGIRIM...</span>
            </>
          ) : (
             <>
                <span>KIRIM AJUAN BANDING</span>
                <span className="text-xl">→</span>
             </>
          )}
        </button>
      </form>
    </div>
  )
}
