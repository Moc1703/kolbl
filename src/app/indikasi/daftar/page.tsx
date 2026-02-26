'use client'

import { useState, useEffect } from 'react'
import { supabase, IndikasiList } from '@/lib/supabase'

export default function IndikasiDaftarPage() {
  const [data, setData] = useState<IndikasiList[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Lelet' | 'Hilang' | 'Ghost' | 'Lainnya'>('all')
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru')
  const [selected, setSelected] = useState<IndikasiList | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter, sort])

  const fetchData = async () => {
    setLoading(true)

    let query = supabase.from('indikasi_list').select('*')

    if (filter !== 'all') {
      query = query.eq('kategori_masalah', filter)
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

  const kategoriColor = (kat: string) => {
    switch (kat) {
      case 'Lelet': return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' }
      case 'Hilang': return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' }
      case 'Ghost': return { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' }
      default: return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <a href="/indikasi" className="text-amber-600 hover:text-amber-700 text-sm">← Indikasi</a>
        <h1 className="text-xl font-bold text-gray-800 mt-2">Daftar Talent Bermasalah</h1>
        <p className="text-gray-500 text-sm">Tap untuk lihat detail</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'Lelet', 'Hilang', 'Ghost', 'Lainnya'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filter === f
                ? f === 'all' ? 'bg-amber-600 text-white' : `${kategoriColor(f).bg} ${kategoriColor(f).text} font-bold ring-2 ring-offset-1 ring-amber-300`
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'Lelet' ? '🐢 Lelet' : f === 'Hilang' ? '👻 Hilang' : f === 'Ghost' ? '💨 Ghost' : '📌 Lainnya'}
          </button>
        ))}

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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">Belum ada data talent bermasalah.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {data.map((item, index) => {
            const colors = kategoriColor(item.kategori_masalah)
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition ${
                  index !== data.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-1 h-12 rounded-full ${colors.bar}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{item.nama}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${colors.bg} ${colors.text}`}>
                      {item.kategori_masalah}
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
                <span className="text-gray-300 text-lg">›</span>
              </div>
            )
          })}
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
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${kategoriColor(selected.kategori_masalah).bg} ${kategoriColor(selected.kategori_masalah).text}`}>
                    {selected.kategori_masalah}
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

              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">Detail Masalah:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selected.alasan}</p>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Ditambahkan: {new Date(selected.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>

              <button
                onClick={() => {
                  const text = `⚠️ *INDIKASI TALENT BERMASALAH - ${selected.kategori_masalah}*

*Nama:* ${selected.nama}
${selected.no_hp ? `*HP/WA:* ${selected.no_hp}` : ''}
${selected.instagram ? `*Instagram:* @${selected.instagram}` : ''}
${selected.tiktok ? `*TikTok:* @${selected.tiktok}` : ''}
${selected.jumlah_laporan > 1 ? `*Jumlah Laporan:* ${selected.jumlah_laporan}x` : ''}

*Detail:*
${selected.alasan}

_Sumber: Blacklist KOL Indonesia_`;
                  navigator.clipboard.writeText(text);
                  alert('Info berhasil dicopy! Silakan paste di grup.');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>📋</span> Copy untuk Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 mb-3">
          Punya informasi tentang talent bermasalah yang belum ada di daftar?
        </p>
        <a
          href="/indikasi/lapor"
          className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          Buat Laporan
        </a>
      </div>
    </div>
  )
}
