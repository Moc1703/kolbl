'use client'

import { useState, useEffect } from 'react'
import { supabase, IndikasiList } from '@/lib/supabase'

export default function IndikasiLaporanPage() {
  const [data, setData] = useState<IndikasiList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: result } = await supabase
      .from('indikasi_list')
      .select('*')
      .order('created_at', { ascending: false })

    setData(result || [])
    setLoading(false)
  }

  const totalKasus = data.length
  const byKategori = {
    lelet: data.filter(d => d.kategori_masalah === 'Lelet').length,
    hilang: data.filter(d => d.kategori_masalah === 'Hilang').length,
    ghost: data.filter(d => d.kategori_masalah === 'Ghost').length,
    lainnya: data.filter(d => d.kategori_masalah === 'Lainnya').length,
  }
  const totalLaporan = data.reduce((a, b) => a + b.jumlah_laporan, 0)
  const terbaru = data.slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <a href="/indikasi" className="text-amber-600 hover:text-amber-700 text-sm">← Indikasi</a>
        <h1 className="text-xl font-bold text-gray-800 mt-2">📊 Laporan & Statistik</h1>
        <p className="text-gray-500 text-sm">Ringkasan data talent bermasalah</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
              <p className="text-amber-100 text-xs font-medium mb-1">Total Talent Bermasalah</p>
              <p className="text-3xl font-extrabold">{totalKasus}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">Total Laporan Masuk</p>
              <p className="text-3xl font-extrabold text-gray-800">{totalLaporan}</p>
            </div>
          </div>

          {/* Breakdown by Kategori */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Breakdown Kategori</h3>
            <div className="space-y-3">
              {[
                { label: '🐢 Lelet', count: byKategori.lelet, color: 'bg-amber-500', bgLight: 'bg-amber-50' },
                { label: '👻 Hilang', count: byKategori.hilang, color: 'bg-red-500', bgLight: 'bg-red-50' },
                { label: '💨 Ghost', count: byKategori.ghost, color: 'bg-gray-500', bgLight: 'bg-gray-50' },
                { label: '📌 Lainnya', count: byKategori.lainnya, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm w-24 shrink-0">{item.label}</span>
                  <div className={`flex-1 h-6 ${item.bgLight} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: totalKasus > 0 ? `${(item.count / totalKasus) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terbaru */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">5 Terbaru</h3>
            {terbaru.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data.</p>
            ) : (
              <div className="space-y-3">
                {terbaru.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <div className={`w-1 h-8 rounded-full ${
                      item.kategori_masalah === 'Lelet' ? 'bg-amber-500' :
                      item.kategori_masalah === 'Hilang' ? 'bg-red-500' :
                      item.kategori_masalah === 'Ghost' ? 'bg-gray-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.nama}</p>
                      <p className="text-xs text-gray-500">
                        {item.kategori_masalah} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    {item.jumlah_laporan > 1 && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{item.jumlah_laporan}x</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
