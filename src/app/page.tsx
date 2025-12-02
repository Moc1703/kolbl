'use client'

import { useState, useEffect } from 'react'
import { supabase, Blacklist } from '@/lib/supabase'

export default function Home() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Blacklist[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Blacklist | null>(null)

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
          🛡️ Lindungi Dirimu
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Cek Blacklist KOL/MG
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Cari by <strong>Nama</strong>, <strong>HP</strong>, <strong>IG</strong>, atau <strong>TikTok</strong>
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Ketik nama, HP, IG, atau TikTok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base bg-gray-50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 font-semibold text-base"
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ⚠️ Ditemukan {results.length} hasil
              </h2>
              <div className="space-y-4">
                {results.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelected(item)}
                    className="bg-white border-l-4 border-red-500 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{item.nama}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.kategori === 'KOL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.kategori}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4 text-xs md:text-sm">
                      {item.no_hp && (
                        <span className="bg-gray-100 px-2 py-1 rounded">📱 {item.no_hp}</span>
                      )}
                      {item.instagram && (
                        <span className="bg-gray-100 px-2 py-1 rounded">📷 @{item.instagram}</span>
                      )}
                      {item.tiktok && (
                        <span className="bg-gray-100 px-2 py-1 rounded">🎵 @{item.tiktok}</span>
                      )}
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded">📊 {item.jumlah_laporan}x laporan</span>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Alasan Blacklist:</p>
                      <p className="text-gray-800">{item.alasan}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-xs text-gray-400">
                        Ditambahkan: {new Date(item.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </p>
                      <span className="text-xs text-blue-500">Tap untuk detail →</span>
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
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">📊 Jumlah Laporan:</span>
                  <span className="font-medium text-red-600">{selected.jumlah_laporan}x</span>
                </div>
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
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <a href="/daftar" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-all active:scale-[0.98]">
              <div className="text-2xl mb-1">📋</div>
              <p className="text-sm font-medium text-gray-800">Lihat Daftar</p>
              <p className="text-xs text-gray-500">Blacklist lengkap</p>
            </a>
            <a href="/lapor" className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-4 text-center hover:shadow-md transition-all active:scale-[0.98]">
              <div className="text-2xl mb-1">📢</div>
              <p className="text-sm font-medium text-white">Buat Laporan</p>
              <p className="text-xs text-red-100">Laporkan KOL/MG</p>
            </a>
          </div>

          {/* How to use */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <span className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">💡</span>
              Cara Pakai
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-lg">👤</span>
                <p className="text-gray-600 mt-1">Cari nama</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-lg">📱</span>
                <p className="text-gray-600 mt-1">Cari no HP</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-lg">📷</span>
                <p className="text-gray-600 mt-1">Cari IG</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-lg">🎵</span>
                <p className="text-gray-600 mt-1">Cari TikTok</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
