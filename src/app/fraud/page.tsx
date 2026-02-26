'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FraudPage() {
  const [stats, setStats] = useState({ total: 0, pencurian: 0, penipuan: 0, lainnya: 0, totalNominal: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await supabase.from('fraud_list').select('jenis_fraud, nominal_total')
      if (data) {
        setStats({
          total: data.length,
          pencurian: data.filter(d => d.jenis_fraud === 'Pencurian').length,
          penipuan: data.filter(d => d.jenis_fraud === 'Penipuan Pembayaran').length,
          lainnya: data.filter(d => d.jenis_fraud === 'Lainnya').length,
          totalNominal: data.reduce((a, b) => a + (b.nominal_total || 0), 0)
        })
      }
    } catch (e) {
      // fallback
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10 pt-4 md:pt-8">
        <div className="inline-block relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-red-700 blur-2xl opacity-20 rounded-full"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-700 to-rose-900 rounded-3xl flex items-center justify-center shadow-xl shadow-red-300 rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="text-4xl md:text-5xl drop-shadow-md">🚨</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 px-4">
          Pencurian & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-rose-600">Penipuan</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-4">
          Database kasus pencurian dan penipuan pembayaran. Laporkan dan lindungi komunitas dari kerugian finansial.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8 md:mb-10 px-1 md:px-2">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-gray-800 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">Total Kasus</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-red-700 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.pencurian}</div>
          <p className="text-[10px] md:text-xs font-semibold text-red-400 uppercase tracking-wider leading-tight">Pencurian</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-rose-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.penipuan}</div>
          <p className="text-[10px] md:text-xs font-semibold text-rose-400 uppercase tracking-wider leading-tight">Penipuan</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group col-span-2 md:col-span-1">
          <div className="text-base md:text-lg font-extrabold text-gray-800 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{formatRupiah(stats.totalNominal)}</div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">Total Kerugian</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <a href="/fraud/lapor" className="group p-5 bg-gradient-to-br from-red-700 to-rose-900 rounded-2xl shadow-lg shadow-red-300 text-white hover:shadow-xl hover:shadow-red-400 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
            🚨
          </div>
          <div>
            <h3 className="font-bold">Lapor Penipuan / Pencurian</h3>
            <p className="text-xs text-red-200">Laporkan kasus penipuan pembayaran</p>
          </div>
        </a>

        <a href="/fraud/daftar" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-red-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📋
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Lihat Daftar Penipu</h3>
            <p className="text-xs text-gray-500">Database pelaku penipuan</p>
          </div>
        </a>

        <a href="/fraud/banding" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-red-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Ajukan Banding</h3>
            <p className="text-xs text-gray-500">Merasa data keliru? Ajukan klarifikasi</p>
          </div>
        </a>

        <a href="/fraud/laporan" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-red-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📊
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Laporan & Statistik</h3>
            <p className="text-xs text-gray-500">Lihat tren dan statistik kasus</p>
          </div>
        </a>
      </div>
    </div>
  )
}
