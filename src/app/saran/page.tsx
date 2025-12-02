'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SaranPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    kontak: '',
    jenis: 'saran',
    pesan: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('saran').insert({
      nama: form.nama.trim() || null,
      kontak: form.kontak.trim() || null,
      jenis: form.jenis,
      pesan: form.pesan.trim()
    })

    setLoading(false)
    
    if (!error) {
      setSuccess(true)
      setForm({ nama: '', kontak: '', jenis: 'saran', pesan: '' })
    } else {
      console.error('Error:', error)
      alert('Gagal mengirim: ' + error.message)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">Terima Kasih!</h2>
          <p className="text-green-600 mb-6">
            Saran/masukan kamu sudah kami terima. Kami akan review dan pertimbangkan untuk perbaikan website.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => setSuccess(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Kirim Lagi
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
    <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">💡 Saran & Masukan</h1>
        <p className="text-gray-600 text-sm">
          Punya ide untuk improve website ini? Atau ada bug yang perlu diperbaiki? Kasih tau kami!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama (Opsional)</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({...form, nama: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kontak (Opsional)</label>
            <input
              type="text"
              value={form.kontak}
              onChange={(e) => setForm({...form, kontak: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
              placeholder="Email/WA untuk follow up"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
          <select
            value={form.jenis}
            onChange={(e) => setForm({...form, jenis: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
          >
            <option value="saran">💡 Saran/Ide Fitur</option>
            <option value="bug">🐛 Lapor Bug</option>
            <option value="kritik">📝 Kritik</option>
            <option value="lainnya">💬 Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={form.pesan}
            onChange={(e) => setForm({...form, pesan: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            placeholder="Tulis saran, kritik, atau masukan kamu di sini..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Saran'}
        </button>
      </form>
    </div>
  )
}
