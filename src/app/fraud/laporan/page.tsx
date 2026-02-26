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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <a href="/fraud" className="text-red-700 hover:text-red-800 text-sm">← Fraud</a>
        <h1 className="text-xl font-bold text-gray-800 mt-2">📊 Laporan & Statistik</h1>
        <p className="text-gray-500 text-sm">Ringkasan data penipuan & pencurian</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-700 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gradient-to-br from-red-700 to-rose-900 rounded-2xl p-5 text-white shadow-lg shadow-red-300">
              <p className="text-red-200 text-xs font-medium mb-1">Total Kasus Fraud</p>
              <p className="text-3xl font-extrabold">{totalKasus}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-lg">
              <p className="text-gray-400 text-xs font-medium mb-1">Total Kerugian</p>
              <p className="text-xl font-extrabold">{formatRupiah(totalNominal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">Total Laporan Masuk</p>
              <p className="text-3xl font-extrabold text-gray-800">{totalLaporan}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-xs font-medium mb-1">Rata-rata Kerugian</p>
              <p className="text-xl font-extrabold text-gray-800">{totalKasus > 0 ? formatRupiah(Math.round(totalNominal / totalKasus)) : 'Rp 0'}</p>
            </div>
          </div>

          {/* Breakdown by Jenis */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Breakdown Jenis Fraud</h3>
            <div className="space-y-3">
              {[
                { label: '🔒 Pencurian', count: byJenis.pencurian, color: 'bg-red-600', bgLight: 'bg-red-50' },
                { label: '💸 Penipuan', count: byJenis.penipuan, color: 'bg-rose-500', bgLight: 'bg-rose-50' },
                { label: '📌 Lainnya', count: byJenis.lainnya, color: 'bg-gray-500', bgLight: 'bg-gray-50' },
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
            <h3 className="font-bold text-gray-800 mb-4">5 Kasus Terbaru</h3>
            {terbaru.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data.</p>
            ) : (
              <div className="space-y-3">
                {terbaru.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <div className={`w-1 h-8 rounded-full ${
                      item.jenis_fraud === 'Pencurian' ? 'bg-red-600' :
                      item.jenis_fraud === 'Penipuan Pembayaran' ? 'bg-rose-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.nama}</p>
                      <p className="text-xs text-gray-500">
                        {item.jenis_fraud === 'Penipuan Pembayaran' ? 'Penipuan' : item.jenis_fraud} • {item.nominal_total > 0 ? formatRupiah(item.nominal_total) : '-'} • {new Date(item.created_at).toLocaleDateString('id-ID')}
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
