'use client'

import { useState, useEffect } from 'react'
import { supabase, Blacklist } from '@/lib/supabase'

export default function Home() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Blacklist[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Blacklist | null>(null)
  const [stats, setStats] = useState({ total: 0, kol: 0, mg: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data } = await supabase.from('blacklist').select('kategori')
    if (data) {
      setStats({
        total: data.length,
        kol: data.filter(d => d.kategori === 'KOL').length,
        mg: data.filter(d => d.kategori === 'MG').length
      })
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    const searchTerm = search.trim().toLowerCase()
    
    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .or(`nama.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%,instagram.ilike.%${searchTerm}%,tiktok.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setResults(data)
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Blacklist KOL/MG
        </h1>
        <p className="text-gray-500 text-sm">
          Database KOL & Management bermasalah
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.kol}</p>
          <p className="text-xs text-gray-500">KOL</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.mg}</p>
          <p className="text-xs text-gray-500">MG</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
        <p className="text-xs text-gray-500 mb-3 text-center">Cek sebelum kerjasama</p>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Nama, HP, IG, atau TikTok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base bg-gray-50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 active:scale-[0.98] transition-all disabled:opacity-50 font-semibold text-base shadow-lg shadow-red-200"
          >
            {loading ? 'Mencari...' : 'Cari Sekarang'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Aman! Tidak Ada di Blacklist</h3>
              <p className="text-green-600 text-sm">
                "<strong>{search}</strong>" tidak ditemukan di database kami
              </p>
              <p className="text-xs text-gray-500 mt-3 bg-white/50 rounded-lg p-2">
                💡 Tetap minta bukti kerjasama sebelumnya ya!
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">⚠️</span>
                </div>
                <p className="text-sm text-gray-600">
                  Ditemukan <strong className="text-red-600">{results.length}</strong> hasil
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {results.map((item, index) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelected(item)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition ${
                      index !== results.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-12 rounded-full shrink-0 ${
                        item.kategori === 'KOL' ? 'bg-purple-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800 truncate">{item.nama}</h3>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                            item.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.kategori}
                          </span>
                          {item.jumlah_laporan > 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 bg-red-100 text-red-700">
                              {item.jumlah_laporan}x
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {item.instagram && `@${item.instagram}`}
                          {item.instagram && item.no_hp && ' • '}
                          {item.no_hp}
                        </p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.alasan}</p>
                      </div>
                      <span className="text-gray-300 text-lg shrink-0">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selected.nama}</h2>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                    selected.kategori === 'KOL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selected.kategori}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="space-y-3 mb-4">
                {selected.no_hp && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📱 HP/WA:</span>
                    <span className="font-medium">{selected.no_hp}</span>
                  </div>
                )}
                {selected.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📷 Instagram:</span>
                    <span className="font-medium">@{selected.instagram}</span>
                  </div>
                )}
                {selected.tiktok && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">🎵 TikTok:</span>
                    <span className="font-medium">@{selected.tiktok}</span>
                  </div>
                )}
                {selected.jumlah_laporan > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">📊 Jumlah Laporan:</span>
                    <span className="font-medium text-red-600">{selected.jumlah_laporan}x</span>
                  </div>
                )}
              </div>

              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">Alasan Blacklist:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selected.alasan}</p>
              </div>

              <p className="text-xs text-gray-400">
                Ditambahkan: {new Date(selected.created_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', month: 'long', year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      {!searched && (
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a href="/daftar" className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-md transition-all active:scale-[0.98]">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                <span className="text-lg">📋</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">Lihat Semua</p>
              <p className="text-xs text-gray-500">Daftar lengkap</p>
            </a>
            <a href="/lapor" className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 hover:shadow-lg transition-all active:scale-[0.98] shadow-lg shadow-red-200">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2">
                <span className="text-lg">📢</span>
              </div>
              <p className="text-sm font-semibold text-white">Lapor</p>
              <p className="text-xs text-red-100">Buat aduan baru</p>
            </a>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">Tips Aman</p>
                <p className="text-xs text-amber-700">Selalu cek track record sebelum kerjasama. Minta bukti kerjasama sebelumnya dan jangan transfer fee di awal.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
