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
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10 pt-4 md:pt-8">
        <div className="inline-block relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 rounded-full"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-200 rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="text-4xl md:text-5xl drop-shadow-md">⚠️</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 px-4">
          Indikasi Talent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Bermasalah</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-4">
          Database talent dengan indikasi bermasalah: Lelet, Hilang, Ghost, dan lainnya. Bantu komunitas lebih waspada.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8 md:mb-10 px-1 md:px-2">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-gray-800 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">Total</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-amber-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.lelet}</div>
          <p className="text-[10px] md:text-xs font-semibold text-amber-400 uppercase tracking-wider leading-tight">Lelet</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-red-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.hilang}</div>
          <p className="text-[10px] md:text-xs font-semibold text-red-400 uppercase tracking-wider leading-tight">Hilang</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-gray-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.ghost}</div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">Ghost</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <a href="/indikasi/lapor" className="group p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-200 text-white hover:shadow-xl hover:shadow-amber-300 transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
            📢
          </div>
          <div>
            <h3 className="font-bold">Lapor Talent Bermasalah</h3>
            <p className="text-xs text-amber-100">Laporkan talent lelet, hilang, atau ghost</p>
          </div>
        </a>

        <a href="/indikasi/daftar" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📋
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Lihat Daftar Talent</h3>
            <p className="text-xs text-gray-500">Database talent bermasalah</p>
          </div>
        </a>

        <a href="/indikasi/banding" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ⚖️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Ajukan Banding</h3>
            <p className="text-xs text-gray-500">Merasa data keliru? Ajukan klarifikasi</p>
          </div>
        </a>

        <a href="/indikasi/laporan" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            📊
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Laporan & Statistik</h3>
            <p className="text-xs text-gray-500">Lihat tren dan statistik kasus</p>
          </div>
        </a>
      </div>
    </div>
  )
}
