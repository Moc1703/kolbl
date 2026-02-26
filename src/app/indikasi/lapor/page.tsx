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
              href="/indikasi"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-block"
            >
              Kembali
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <a href="/indikasi" className="text-amber-600 hover:text-amber-700 text-sm">← Indikasi</a>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">⚠️ Lapor Talent Bermasalah</h1>
        <p className="text-gray-600">
          Laporkan talent dengan indikasi bermasalah (Lelet, Hilang, Ghost, dll). Laporan akan direview sebelum dipublikasikan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-5">
        {/* Data Talent */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Data Talent yang Dilaporkan</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Talent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Masalah <span className="text-red-500">*</span></label>
                <select
                  value={form.kategori_masalah}
                  onChange={(e) => setForm({...form, kategori_masalah: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                >
                  <option value="Lelet">🐢 Lelet (Slow Response)</option>
                  <option value="Hilang">👻 Hilang (Menghilang)</option>
                  <option value="Ghost">💨 Ghost (Ghosting)</option>
                  <option value="Lainnya">📌 Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asal Management</label>
              <input
                type="text"
                value={form.asal_mg}
                onChange={(e) => setForm({...form, asal_mg: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                placeholder="Nama management yang menaungi talent ini (jika ada)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username Instagram</label>
                <div className="flex">
                  <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm({...form, instagram: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ceritakan kronologi: kapan mulai bermasalah, bagaimana responsnya, sudah berapa lama, dll."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Bukti</label>
              <input
                type="url"
                value={form.bukti_url}
                onChange={(e) => setForm({...form, bukti_url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Kamu</label>
              <input
                type="text"
                value={form.pelapor_kontak}
                onChange={(e) => setForm({...form, pelapor_kontak: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
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

        {/* Terms */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-gray-800 leading-relaxed">
              <strong className="text-amber-700">Saya menyatakan bukti ini ASLI & BENAR.</strong> Saya bertanggung jawab penuh secara hukum apabila laporan ini palsu. Platform dibebaskan dari tuntutan.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  )
}
