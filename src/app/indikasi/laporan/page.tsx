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
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 border-b-2 border-neutral-800 pb-4">
        <a href="/indikasi" className="text-amber-500 hover:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mb-2">
          <span>←</span> INDIKASI
        </a>
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-2">
          <span className="text-amber-500">📊</span> LAPORAN & STATISTIK
        </h1>
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-1">Ringkasan data talent bermasalah</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-800 border-t-amber-500"></div>
          <p className="text-neutral-500 mt-4 font-mono text-xs uppercase tracking-widest">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-900 border border-amber-900/40 rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-600"></div>
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Total Talent Bermasalah</p>
              <p className="text-3xl font-black text-amber-400 font-mono">{totalKasus}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-600"></div>
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Total Laporan Masuk</p>
              <p className="text-3xl font-black text-white font-mono">{totalLaporan}</p>
            </div>
          </div>

          {/* Breakdown by Kategori */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5 mb-6">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-5 flex items-center gap-2">
              <span className="text-neutral-500">📊</span> BREAKDOWN KATEGORI
            </h3>
            <div className="space-y-4">
              {[
                { label: '🐢 Lelet', count: byKategori.lelet, bar: 'bg-amber-500', track: 'bg-amber-900/30' },
                { label: '👻 Hilang', count: byKategori.hilang, bar: 'bg-red-500', track: 'bg-red-900/30' },
                { label: '💨 Ghost', count: byKategori.ghost, bar: 'bg-neutral-500', track: 'bg-neutral-800' },
                { label: '📌 Lainnya', count: byKategori.lainnya, bar: 'bg-blue-500', track: 'bg-blue-900/30' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-neutral-400 w-24 shrink-0 font-mono">{item.label}</span>
                  <div className={`flex-1 h-5 ${item.track} rounded-sm overflow-hidden`}>
                    <div
                      className={`h-full ${item.bar} rounded-sm transition-all duration-500`}
                      style={{ width: totalKasus > 0 ? `${(item.count / totalKasus) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-bold text-neutral-300 w-8 text-right font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terbaru */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-5 flex items-center gap-2">
              <span className="text-neutral-500">🕐</span> 5 TERBARU
            </h3>
            {terbaru.length === 0 ? (
              <p className="text-neutral-600 font-mono text-sm uppercase">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {terbaru.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-sm">
                    <div className={`w-1 h-8 rounded-sm shrink-0 ${
                      item.kategori_masalah === 'Lelet' ? 'bg-amber-500' :
                      item.kategori_masalah === 'Hilang' ? 'bg-red-500' :
                      item.kategori_masalah === 'Ghost' ? 'bg-neutral-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate uppercase">{item.nama}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">
                        {item.kategori_masalah} &bull; {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    {item.jumlah_laporan > 1 && (
                      <span className="text-xs font-bold text-red-500 bg-red-900/30 border border-red-900/50 px-2 py-0.5 rounded-sm font-mono shrink-0">{item.jumlah_laporan}x</span>
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
