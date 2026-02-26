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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-10 pb-24 md:pb-32 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#1a0606)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-red-700/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-rose-600/20 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 backdrop-blur-md mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-red-300 tracking-wide uppercase">Fraud Alert</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Pencurian & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Penipuan</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
                Database kasus pencurian dan penipuan pembayaran. Laporkan dan lindungi komunitas dari kerugian finansial.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
              <div className="text-center px-3">
                <p className="text-xl font-black text-white">{stats.total}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-xl font-black text-red-400">{stats.pencurian}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Curi</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-xl font-black text-rose-400">{stats.penipuan}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tipu</p>
              </div>
              <div className="text-center px-3 border-l border-white/10">
                <p className="text-sm font-black text-amber-400 leading-tight">{formatRupiah(stats.totalNominal)}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Kerugian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lapor */}
          <a href="/fraud/lapor" className="group relative overflow-hidden bg-gradient-to-br from-red-700 to-rose-900 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">🚨</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center text-xl mb-4 backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">🚨</div>
              <h3 className="font-extrabold text-white text-lg mb-1">Lapor Penipuan / Pencurian</h3>
              <p className="text-sm text-red-200 font-medium leading-relaxed">Laporkan kasus penipuan pembayaran</p>
            </div>
          </a>

          {/* Daftar */}
          <a href="/fraud/daftar" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">📋</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">📋</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Lihat Daftar Penipu</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Database pelaku penipuan</p>
            </div>
          </a>

          {/* Banding */}
          <a href="/fraud/banding" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">⚖️</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform">⚖️</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Ajukan Banding</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Merasa data keliru? Ajukan klarifikasi</p>
            </div>
          </a>

          {/* Laporan */}
          <a href="/fraud/laporan" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
              <span className="text-8xl">📊</span>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-red-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">📊</div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Laporan & Statistik</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Lihat tren dan statistik kasus</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
