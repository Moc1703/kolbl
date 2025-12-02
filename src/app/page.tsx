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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Cek Blacklist KOL/MG
        </h1>
        <p className="text-gray-600 mb-2">
          Cari berdasarkan <strong>Nama</strong>, <strong>No HP/WhatsApp</strong>, <strong>Instagram</strong>, atau <strong>TikTok</strong>
        </p>
        <p className="text-sm text-gray-500">
          Pastikan cek dulu sebelum kerjasama!
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Nama, HP, IG, atau TikTok..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
          >
            {loading ? 'Mencari...' : '🔍 Cari'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Tidak Ditemukan di Blacklist</h3>
              <p className="text-green-600">
                "{search}" tidak ada dalam database blacklist kami.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tetap berhati-hati dan minta bukti kerjasama sebelumnya ya!
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-3">🔍 Cara Menggunakan</h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Masukkan nama KOL/MG yang mau dicek</li>
              <li>• Bisa juga pakai nomor HP/WhatsApp</li>
              <li>• Atau username Instagram/TikTok</li>
              <li>• Klik "Cari" atau tekan Enter</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-lg mb-3">📢 Punya Laporan?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Pernah dirugikan oleh KOL atau Management? Bantu lindungi yang lain dengan melaporkan!
            </p>
            <a 
              href="/lapor" 
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              Buat Laporan →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
