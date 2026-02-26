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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-10 pb-24 md:pb-32 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#1a1006)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-amber-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-orange-600/20 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 backdrop-blur-md mb-4">
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide uppercase">Talent Watch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Indikasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Bermasalah</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
                Database talent dengan indikasi bermasalah: Lelet, Hilang, Ghost, dan lainnya. Bantu komunitas lebih waspada.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
              <div className="text-center px-3">
                <p className="text-xl font-black text-white">{stats.total}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-xl font-black text-amber-400">{stats.lelet}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Lelet</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-xl font-black text-red-400">{stats.hilang}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Hilang</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-xl font-black text-gray-400">{stats.ghost}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ghost</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lapor */}
          <a href="/indikasi/lapor" className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">📢</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center text-xl mb-4 backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">📢</div>
              <h3 className="font-extrabold text-white text-lg mb-1">Lapor Talent Bermasalah</h3>
              <p className="text-sm text-amber-100 font-medium leading-relaxed">Laporkan talent lelet, hilang, atau ghost</p>
            </div>
          </a>

          {/* Daftar */}
          <a href="/indikasi/daftar" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">📋</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-amber-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">📋</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Lihat Daftar Talent</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Database talent bermasalah</p>
            </div>
          </a>

          {/* Banding */}
          <a href="/indikasi/banding" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">⚖️</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-amber-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform">⚖️</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Ajukan Banding</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Merasa data keliru? Ajukan klarifikasi</p>
            </div>
          </a>

          {/* Laporan */}
          <a href="/indikasi/laporan" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">📊</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-amber-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">📊</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Laporan & Statistik</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Lihat tren dan statistik kasus</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
