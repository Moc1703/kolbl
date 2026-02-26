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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center max-w-md w-full animate-in zoom-in-95 fade-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl">💌</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Terima Kasih!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Saran/masukan kamu sudah kami terima. Kami akan review dan pertimbangkan untuk perbaikan website.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setSuccess(false)}
              className="flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all"
            >
              Kirim Lagi
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
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#0a0f1a)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-violet-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-xl mx-auto">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 backdrop-blur-md mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-violet-300 tracking-wide uppercase">Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Saran & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Masukan</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
            Punya ide untuk improve website ini? Atau ada bug yang perlu diperbaiki? Kasih tau kami!
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 -mt-12 relative z-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama (Opsional)</label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({...form, nama: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-base font-medium"
                placeholder="Nama kamu"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Kontak (Opsional)</label>
              <input
                type="text"
                value={form.kontak}
                onChange={(e) => setForm({...form, kontak: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-base font-medium"
                placeholder="Email/WA untuk follow up"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Jenis</label>
            <div className="relative">
              <select
                value={form.jenis}
                onChange={(e) => setForm({...form, jenis: e.target.value})}
                className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-base font-medium pr-10 cursor-pointer"
              >
                <option value="saran">💡 Saran/Ide Fitur</option>
                <option value="bug">🐛 Lapor Bug</option>
                <option value="kritik">📝 Kritik</option>
                <option value="lainnya">💬 Lainnya</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Pesan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={form.pesan}
              onChange={(e) => setForm({...form, pesan: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-base font-medium resize-none"
              placeholder="Tulis saran, kritik, atau masukan kamu di sini..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 active:scale-[0.98] text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Mengirim...
              </>
            ) : (
              <>💌 Kirim Saran</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
