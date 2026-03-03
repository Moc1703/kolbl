'use client'

import { useState, useEffect } from 'react'
import { supabase, FraudList } from '@/lib/supabase'

export default function FraudLaporanPage() {
  const [data, setData] = useState<FraudList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: result } = await supabase
      .from('fraud_list')
      .select('*')
      .order('created_at', { ascending: false })

    setData(result || [])
    setLoading(false)
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  const totalKasus = data.length
  const totalNominal = data.reduce((a, b) => a + (b.nominal_total || 0), 0)
  const byJenis = {
    pencurian: data.filter(d => d.jenis_fraud === 'Pencurian').length,
    penipuan: data.filter(d => d.jenis_fraud === 'Penipuan Pembayaran').length,
    lainnya: data.filter(d => d.jenis_fraud === 'Lainnya').length,
  }
  const totalLaporan = data.reduce((a, b) => a + b.jumlah_laporan, 0)
  const terbaru = data.slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 border-b-2 border-neutral-800 pb-4">
        <a href="/fraud" className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mb-2">
          <span>←</span> FRAUD
        </a>
        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 mt-2">
          <span className="text-red-500">📊</span> LAPORAN & STATISTIK
        </h1>
        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-1">Ringkasan data penipuan & pencurian</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-800 border-t-red-500"></div>
          <p className="text-neutral-500 mt-4 font-mono text-xs uppercase tracking-widest">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-900 border border-red-900/40 rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Total Kasus Fraud</p>
              <p className="text-3xl font-black text-red-400 font-mono">{totalKasus}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-600"></div>
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Total Kerugian</p>
              <p className="text-xl font-black text-white font-mono">{formatRupiah(totalNominal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5">
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Total Laporan</p>
              <p className="text-3xl font-black text-white font-mono">{totalLaporan}</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5">
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest mb-2">Rata-rata Kerugian</p>
              <p className="text-xl font-black text-white font-mono">{totalKasus > 0 ? formatRupiah(Math.round(totalNominal / totalKasus)) : 'Rp 0'}</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5 mb-6">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-5 flex items-center gap-2">
              <span className="text-neutral-500">📊</span> BREAKDOWN JENIS FRAUD
            </h3>
            <div className="space-y-4">
              {[
                { label: '🔒 Pencurian', count: byJenis.pencurian, bar: 'bg-red-600', track: 'bg-red-900/30' },
                { label: '💸 Penipuan', count: byJenis.penipuan, bar: 'bg-rose-500', track: 'bg-rose-900/30' },
                { label: '📌 Lainnya', count: byJenis.lainnya, bar: 'bg-neutral-500', track: 'bg-neutral-800' },
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
              <span className="text-neutral-500">🕐</span> 5 KASUS TERBARU
            </h3>
            {terbaru.length === 0 ? (
              <p className="text-neutral-600 font-mono text-sm uppercase">Belum ada data.</p>
            ) : (
              <div className="space-y-2">
                {terbaru.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-black border border-neutral-800 rounded-sm">
                    <div className={`w-1 h-8 rounded-sm shrink-0 ${
                      item.jenis_fraud === 'Pencurian' ? 'bg-red-600' :
                      item.jenis_fraud === 'Penipuan Pembayaran' ? 'bg-rose-500' : 'bg-neutral-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate uppercase">{item.nama}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">
                        {item.jenis_fraud === 'Penipuan Pembayaran' ? 'Penipuan' : item.jenis_fraud} &bull; {item.nominal_total > 0 ? formatRupiah(item.nominal_total) : '-'} &bull; {new Date(item.created_at).toLocaleDateString('id-ID')}
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
