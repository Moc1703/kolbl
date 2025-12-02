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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Daftar Blacklist</h1>
        <p className="text-gray-500 text-sm">Tap untuk lihat detail</p>
      </div>

      {/* Stats + Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap transition ${
            filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          Semua <span className="bg-white/20 px-1.5 rounded text-xs">{data.length}</span>
        </button>
        <button
          onClick={() => setFilter('KOL')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap transition ${
            filter === 'KOL' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          KOL <span className={`px-1.5 rounded text-xs ${filter === 'KOL' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'}`}>{data.filter(d => d.kategori === 'KOL').length}</span>
        </button>
        <button
          onClick={() => setFilter('MG')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap transition ${
            filter === 'MG' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          MG <span className={`px-1.5 rounded text-xs ${filter === 'MG' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>{data.filter(d => d.kategori === 'MG').length}</span>
        </button>
        
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto px-3 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none"
        >
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
          <option value="terbanyak">Terbanyak</option>
        </select>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {data.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => setSelected(item)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition ${
                index !== data.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* Indicator */}
              <div className={`w-1 h-12 rounded-full ${
                item.kategori === 'KOL' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
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
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.instagram && `@${item.instagram}`}
                  {item.instagram && item.no_hp && ' • '}
                  {item.no_hp}
                  {!item.instagram && !item.no_hp && item.tiktok && `@${item.tiktok}`}
                </p>
              </div>
              
              {/* Arrow */}
              <span className="text-gray-300 text-lg">›</span>
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
