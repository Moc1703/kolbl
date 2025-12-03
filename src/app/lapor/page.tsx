'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sanitizeInput } from '@/lib/security'

export default function LaporPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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
    setLoading(true)

    // Sanitize all inputs to prevent XSS attacks
    const cleanData = {
      nama: sanitizeInput(form.nama),
      no_hp: sanitizeInput(form.no_hp) || null,
      instagram: sanitizeInput(form.instagram.replace('@', '')) || null,
      tiktok: sanitizeInput(form.tiktok.replace('@', '')) || null,
      kategori: sanitizeInput(form.kategori),
      asal_mg: form.kategori === 'KOL' ? (sanitizeInput(form.asal_mg) || null) : null,
      kronologi: sanitizeInput(form.kronologi),
      bukti_url: sanitizeInput(form.bukti_url) || null,
      pelapor_nama: sanitizeInput(form.pelapor_nama) || null,
      pelapor_kontak: sanitizeInput(form.pelapor_kontak) || null,
      status: 'pending'
    }

    const { error } = await supabase.from('reports').insert(cleanData)

    setLoading(false)
    
    if (!error) {
      setSuccess(true)
      setForm({
        nama: '', no_hp: '', instagram: '', tiktok: '',
        kategori: 'KOL', asal_mg: '', kronologi: '', bukti_url: '',
        pelapor_nama: '', pelapor_kontak: ''
      })
    } else {
      console.error('Supabase error:', error)
      alert('Gagal mengirim laporan: ' + error.message)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">Laporan Terkirim!</h2>
          <p className="text-green-600 mb-6">
            Terima kasih sudah melapor. Tim kami akan review dan verifikasi laporan kamu.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => setSuccess(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Buat Laporan Lagi
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-block"
            >
              Kembali ke Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">📝 Form Laporan</h1>
        <p className="text-gray-600">
          Laporkan KOL atau Management yang merugikan. Laporan akan direview sebelum dipublikasikan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-5">
        {/* Data KOL/MG */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Data KOL/MG yang Dilaporkan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama KOL/MG <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nama lengkap atau nama yang dikenal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No HP/WhatsApp</label>
                <input
                  type="text"
                  value={form.no_hp}
                  onChange={(e) => setForm({...form, no_hp: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({...form, kategori: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                >
                  <option value="KOL">KOL (Key Opinion Leader)</option>
                  <option value="MG">MG (Management)</option>
                </select>
              </div>
            </div>

            {form.kategori === 'KOL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asal Management</label>
                <input
                  type="text"
                  value={form.asal_mg}
                  onChange={(e) => setForm({...form, asal_mg: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                  placeholder="Nama management yang menaungi KOL ini (jika ada)"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username Instagram</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({...form, instagram: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username TikTok</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">@</span>
                  <input
                    type="text"
                    value={form.tiktok}
                    onChange={(e) => setForm({...form, tiktok: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kronologi */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Detail Laporan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kronologi Kejadian <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.kronologi}
                onChange={(e) => setForm({...form, kronologi: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ceritakan kronologi kejadian secara detail: kapan, bagaimana kerjasamanya, apa yang terjadi, kerugian yang dialami, dll."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Bukti</label>
              <input
                type="url"
                value={form.bukti_url}
                onChange={(e) => setForm({...form, bukti_url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Link Google Drive, Imgur, atau cloud storage lainnya"
              />
              <p className="text-xs text-gray-500 mt-1">Upload bukti ke Google Drive/Imgur lalu paste linknya di sini</p>
            </div>
          </div>
        </div>

        {/* Data Pelapor */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Data Pelapor (Opsional)</h3>
          <p className="text-sm text-gray-500 mb-4">Data ini tidak akan dipublikasikan, hanya untuk verifikasi oleh admin.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamu</label>
              <input
                type="text"
                value={form.pelapor_nama}
                onChange={(e) => setForm({...form, pelapor_nama: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Kamu</label>
              <input
                type="text"
                value={form.pelapor_kontak}
                onChange={(e) => setForm({...form, pelapor_kontak: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                placeholder="No HP/Email untuk konfirmasi"
              />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Perhatian:</strong> Pastikan laporan berdasarkan fakta. Laporan palsu atau fitnah dapat berakibat hukum.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  )
}
