'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sanitizeInput } from '@/lib/security'

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
      nama: sanitizeInput(form.nama) || null,
      kontak: sanitizeInput(form.kontak) || null,
      jenis: sanitizeInput(form.jenis),
      pesan: sanitizeInput(form.pesan)
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
      <div className="max-w-xl mx-auto px-4 py-12 font-sans">
        <div className="bg-green-950/30 border border-green-900/50 rounded-sm p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="text-5xl mb-4 opacity-80">💌</div>
          <h2 className="text-2xl font-black text-green-500 uppercase tracking-tight mb-3">Terima Kasih!</h2>
          <p className="text-green-400/80 font-mono text-sm mb-6">
            Saran/masukan kamu sudah kami terima. Kami akan review dan pertimbangkan untuk perbaikan website.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="px-5 py-2.5 bg-neutral-800 text-white border border-neutral-700 rounded-sm hover:bg-neutral-700 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Kirim Lagi
            </button>
            <a
              href="/"
              className="px-5 py-2.5 bg-red-700 text-white rounded-sm hover:bg-red-600 transition-colors font-bold uppercase tracking-widest text-xs inline-flex items-center"
            >
              Kembali ke Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-8 font-sans">
      <div className="mb-8 border-b-2 border-neutral-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2">
          <span className="text-yellow-500">💡</span> SARAN & MASUKAN
        </h1>
        <p className="text-neutral-500 font-mono text-sm uppercase tracking-wider">
          Punya ide untuk improve website ini? Kasih tau kami!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-sm p-6 md:p-8 space-y-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-red-700"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Nama (Opsional)</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({...form, nama: e.target.value})}
              className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-yellow-500 transition-colors font-mono text-sm placeholder-neutral-700"
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Kontak (Opsional)</label>
            <input
              type="text"
              value={form.kontak}
              onChange={(e) => setForm({...form, kontak: e.target.value})}
              className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-yellow-500 transition-colors font-mono text-sm placeholder-neutral-700"
              placeholder="Email/WA untuk follow up"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">Jenis</label>
          <select
            value={form.jenis}
            onChange={(e) => setForm({...form, jenis: e.target.value})}
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-white focus:outline-none focus:border-yellow-500 transition-colors font-mono text-sm cursor-pointer"
          >
            <option value="saran">💡 Saran/Ide Fitur</option>
            <option value="bug">🐛 Lapor Bug</option>
            <option value="kritik">📝 Kritik</option>
            <option value="lainnya">💬 Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest">
            Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={form.pesan}
            onChange={(e) => setForm({...form, pesan: e.target.value})}
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-sm text-neutral-300 focus:outline-none focus:border-yellow-500 transition-colors font-serif italic text-sm placeholder-neutral-700 leading-relaxed resize-none"
            placeholder="Tulis saran, kritik, atau masukan kamu di sini..."
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
              <span>KIRIM SARAN</span>
              <span className="text-xl">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
