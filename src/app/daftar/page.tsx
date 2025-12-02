'use client'

import { useState, useEffect } from 'react'
import { supabase, Blacklist } from '@/lib/supabase'

export default function DaftarPage() {
  const [data, setData] = useState<Blacklist[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'KOL' | 'MG'>('all')
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru')
  const [selected, setSelected] = useState<Blacklist | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter, sort])

  const fetchData = async () => {
    setLoading(true)
    
    let query = supabase.from('blacklist').select('*')
    
    if (filter !== 'all') {
      query = query.eq('kategori', filter)
    }
    
    if (sort === 'terbaru') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'terlama') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('jumlah_laporan', { ascending: false })
    }
    
    const { data: result } = await query
    setData(result || [])
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📋 Daftar Blacklist</h1>
        <p className="text-gray-600 text-sm md:text-base">Semua KOL dan Management yang sudah terverifikasi bermasalah</p>
      </div>

      {/* Filter & Sort */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-4 md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'KOL', 'MG'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                filter === f 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-sm">Urutkan:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="flex-1 md:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="terbanyak">Laporan Terbanyak</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-red-600">{data.length}</p>
          <p className="text-xs md:text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-purple-600">
            {data.filter(d => d.kategori === 'KOL').length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">KOL</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-blue-600">
            {data.filter(d => d.kategori === 'MG').length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">MG</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">Belum ada data blacklist.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelected(item)}
              className="bg-white border-l-4 border-red-500 rounded-lg shadow hover:shadow-lg transition p-4 md:p-5 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800">{item.nama}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.kategori === 'KOL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.kategori}
                  </span>
                  {item.jumlah_laporan > 1 && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      {item.jumlah_laporan}x dilaporkan
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3 text-xs md:text-sm">
                {item.no_hp && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    📱 {item.no_hp}
                  </span>
                )}
                {item.instagram && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    📷 @{item.instagram}
                  </span>
                )}
                {item.tiktok && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                    🎵 @{item.tiktok}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-3 bg-red-50 rounded p-3">
                {item.alasan}
              </p>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('id-ID', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                  })}
                </p>
                <span className="text-xs text-blue-500">Tap untuk detail →</span>
              </div>
            </div>
          ))}
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

      {/* CTA */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-800 mb-3">
          Punya informasi tentang KOL/MG bermasalah yang belum ada di daftar?
        </p>
        <a 
          href="/lapor" 
          className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Buat Laporan
        </a>
      </div>
    </div>
  )
}
