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
    <div className="max-w-2xl mx-auto font-sans">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10 pt-4 md:pt-8">
        <div className="inline-block relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-red-700 blur-2xl opacity-10 rounded-full"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-neutral-900 border border-red-900/50 rounded-sm flex items-center justify-center">
            <span className="text-4xl md:text-5xl drop-shadow-md">🚨</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 px-4">
          Pencurian & <span className="text-red-500">Penipuan</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed px-4 font-mono uppercase tracking-wider">
          Database kasus pencurian dan penipuan pembayaran. Lindungi komunitas.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8 md:mb-10 px-1">
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-white mb-0 md:mb-1 font-mono">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-red-500 mb-0 md:mb-1 font-mono">{stats.pencurian}</div>
          <p className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wider">Pencurian</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-rose-500 mb-0 md:mb-1 font-mono">{stats.penipuan}</div>
          <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">Penipuan</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center col-span-2 md:col-span-1">
          <div className="text-base md:text-lg font-black text-white mb-0 md:mb-1 font-mono">{formatRupiah(stats.totalNominal)}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Kerugian</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
        <a href="/fraud/lapor" className="group p-5 bg-red-950/30 border border-red-900/40 rounded-sm hover:bg-red-950/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-red-900/50 border border-red-800/50 rounded-sm flex items-center justify-center text-2xl shrink-0">
            🚨
          </div>
          <div>
            <h3 className="font-bold text-red-400 uppercase tracking-wide text-sm">Lapor Penipuan / Pencurian</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Laporkan kasus penipuan</p>
          </div>
        </a>

        <a href="/fraud/daftar" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-red-900/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            📋
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-red-400 transition-colors">Lihat Daftar Penipu</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Database pelaku penipuan</p>
          </div>
        </a>

        <a href="/fraud/banding" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-red-900/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-red-400 transition-colors">Ajukan Banding</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Merasa data keliru? Klarifikasi</p>
          </div>
        </a>

        <a href="/fraud/laporan" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-red-900/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-red-400 transition-colors">Laporan & Statistik</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Tren dan statistik kasus</p>
          </div>
        </a>
      </div>
    </div>
  )
}
