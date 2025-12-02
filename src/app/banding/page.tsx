'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

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
      nama: form.nama.trim(),
      no_hp: form.no_hp.trim() || null,
      instagram: form.instagram.trim() || null,
      alasan_banding: form.alasan_banding.trim(),
      bukti_clear: form.bukti_clear.trim() || null,
      kontak: form.kontak.trim() || null
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
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-green-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-2">Ajuan Terkirim!</h2>
          <p className="text-green-700 text-sm mb-6">
            Ajuan banding kamu akan direview oleh admin. Harap tunggu konfirmasi lebih lanjut.
          </p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-medium"
          >
            Kembali ke Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
          <span className="text-3xl">🔓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Ajuan Unblacklist</h1>
        <p className="text-gray-500 text-sm">Ajukan banding jika masalah sudah clear</p>
      </div>

      {/* Info */}
      <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
        <p className="text-xs text-amber-800">
          <strong>Catatan:</strong> Ajuan akan direview admin. Sertakan bukti bahwa masalah sudah diselesaikan (screenshot chat klarifikasi, bukti TF penggantian, dll).
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({...form, nama: e.target.value})}
            placeholder="Nama sesuai di blacklist"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No HP/WA</label>
            <input
              type="text"
              value={form.no_hp}
              onChange={(e) => setForm({...form, no_hp: e.target.value})}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({...form, instagram: e.target.value})}
              placeholder="username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alasan Banding <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.alasan_banding}
            onChange={(e) => setForm({...form, alasan_banding: e.target.value})}
            placeholder="Jelaskan mengapa kamu layak di-unblacklist. Masalah sudah diselesaikan seperti apa?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link Bukti Clear</label>
          <input
            type="url"
            value={form.bukti_clear}
            onChange={(e) => setForm({...form, bukti_clear: e.target.value})}
            placeholder="Link Google Drive / Imgur (screenshot klarifikasi)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Upload bukti ke Google Drive, pastikan akses "Anyone with link"</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kontak untuk Konfirmasi</label>
          <input
            type="text"
            value={form.kontak}
            onChange={(e) => setForm({...form, kontak: e.target.value})}
            placeholder="WA / Email untuk dihubungi admin"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
        >
          {loading ? 'Mengirim...' : 'Kirim Ajuan Banding'}
        </button>
      </form>
    </div>
  )
}
