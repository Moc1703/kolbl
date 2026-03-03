'use client'

import { useState } from 'react'

export default function AdminRegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name: displayName })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Registrasi gagal')
      }
    } catch {
      setError('Terjadi kesalahan')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-sans bg-neutral-950">
        <div className="w-full max-w-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-green-600 flex items-center justify-center text-2xl bg-neutral-950 rounded-sm">
              <span className="text-green-500 font-black">✓</span>
            </div>
            <h1 className="text-lg font-black text-white uppercase tracking-widest mb-2">REGISTRASI BERHASIL</h1>
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-6">Menunggu approval dari admin utama</p>
            <a href="/admin" className="inline-block px-6 py-3 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors">
              KE HALAMAN LOGIN
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-sans bg-neutral-950">
      <div className="w-full max-w-sm relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-700 blur opacity-10"></div>

        <div className="relative bg-neutral-900 border border-neutral-800 p-8 rounded-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-blue-600 flex items-center justify-center text-2xl bg-neutral-950 rounded-sm">
              <span className="text-blue-500 font-black">+</span>
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-widest">DAFTAR ADMIN</h1>
            <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest border-t border-neutral-800 pt-2 inline-block">Registrasi Operator Baru</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-widest">Nama Lengkap</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="NAMA TAMPILAN"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-blue-600 transition-colors text-sm font-mono rounded-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="USERNAME"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-blue-600 transition-colors text-sm font-mono rounded-sm"
                required
                minLength={3}
                maxLength={20}
              />
              <p className="text-[9px] text-neutral-600 mt-1 font-mono">Huruf kecil, angka, underscore. 3-20 karakter.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-blue-600 transition-colors text-sm font-mono rounded-sm"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 px-3 py-2 text-xs text-red-500 font-mono rounded-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span> <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-700 text-white font-black uppercase tracking-widest transition-colors hover:bg-blue-800 active:bg-blue-900 text-xs rounded-sm mt-2 disabled:opacity-50"
            >
              {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/admin" className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest hover:text-neutral-400 transition-colors">
              Sudah punya akun? LOGIN →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
