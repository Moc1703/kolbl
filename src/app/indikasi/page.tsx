'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function IndikasiPage() {
  const [stats, setStats] = useState({ total: 0, lelet: 0, hilang: 0, ghost: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await supabase.from('indikasi_list').select('kategori_masalah')
      if (data) {
        setStats({
          total: data.length,
          lelet: data.filter(d => d.kategori_masalah === 'Lelet').length,
          hilang: data.filter(d => d.kategori_masalah === 'Hilang').length,
          ghost: data.filter(d => d.kategori_masalah === 'Ghost').length
        })
      }
    } catch (e) {
      // fallback
    }
  }

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10 pt-4 md:pt-8">
        <div className="inline-block relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-10 rounded-full"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-neutral-900 border border-amber-800/50 rounded-sm flex items-center justify-center">
            <span className="text-4xl md:text-5xl drop-shadow-md">⚠️</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 px-4">
          Indikasi <span className="text-amber-500">Bermasalah</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed px-4 font-mono uppercase tracking-wider">
          Database talent dengan indikasi bermasalah. Bantu komunitas lebih waspada.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 mb-8 md:mb-10 px-1">
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-white mb-0 md:mb-1 font-mono">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-amber-500 mb-0 md:mb-1 font-mono">{stats.lelet}</div>
          <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-wider">Lelet</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-red-500 mb-0 md:mb-1 font-mono">{stats.hilang}</div>
          <p className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wider">Hilang</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-5 text-center">
          <div className="text-xl md:text-3xl font-black text-neutral-400 mb-0 md:mb-1 font-mono">{stats.ghost}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">Ghost</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
        <a href="/indikasi/lapor" className="group p-5 bg-amber-900/30 border border-amber-800/50 rounded-sm hover:bg-amber-900/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-900/50 border border-amber-700/50 rounded-sm flex items-center justify-center text-2xl shrink-0">
            📢
          </div>
          <div>
            <h3 className="font-bold text-amber-400 uppercase tracking-wide text-sm">Lapor Talent Bermasalah</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Laporkan talent lelet, hilang, atau ghost</p>
          </div>
        </a>

        <a href="/indikasi/daftar" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-amber-800/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            📋
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-amber-400 transition-colors">Lihat Daftar Talent</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Database talent bermasalah</p>
          </div>
        </a>

        <a href="/indikasi/banding" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-amber-800/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-amber-400 transition-colors">Ajukan Banding</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Merasa data keliru? Ajukan klarifikasi</p>
          </div>
        </a>

        <a href="/indikasi/laporan" className="group p-5 bg-neutral-900 border border-neutral-800 rounded-sm hover:border-amber-800/50 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-800 rounded-sm flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wide text-sm group-hover:text-amber-400 transition-colors">Laporan & Statistik</h3>
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-0.5">Lihat tren dan statistik kasus</p>
          </div>
        </a>
      </div>
    </div>
  )
}
