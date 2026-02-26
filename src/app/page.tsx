'use client'

import { useState, useEffect } from 'react'
import { supabase, Blacklist } from '@/lib/supabase'

export default function Home() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Blacklist[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Blacklist | null>(null)
  const [stats, setStats] = useState({ total: 0, kol: 0, mg: 0 })


  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await supabase.from('blacklist').select('kategori')
      if (data) {
        setStats({
          total: data.length,
          kol: data.filter(d => d.kategori === 'KOL').length,
          mg: data.filter(d => d.kategori === 'MG').length
        })
      }
    } catch {
      // Keep default stats (0)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    // Simulate slight delay for "premium feel"
    await new Promise(r => setTimeout(r, 500));

    const searchTerm = search.trim().toLowerCase()
    
    try {
      const { data, error } = await supabase
        .from('blacklist')
        .select('id, report_id, nama, no_hp, instagram, tiktok, kategori, alasan, jumlah_laporan, created_at, updated_at')
        .or(`nama.ilike.%${searchTerm}%,no_hp.ilike.%${searchTerm}%,instagram.ilike.%${searchTerm}%,tiktok.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setResults(data as Blacklist[])
      } else {
        setResults([])
      }
    } catch {
      setResults([])
    }

    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans selection:bg-rose-500 selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-16 pb-32 md:pb-40 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl">
        {/* Background Gradients & Noise */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#020617)] z-0"></div>
        <div className="absolute -top-[20rem] -left-[10rem] w-[40rem] h-[40rem] bg-rose-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[10rem] -right-[15rem] w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center mt-4 md:mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-300 tracking-wide uppercase">Database KOL & MG Bermasalah</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            Cek Rekam Jejak <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 animate-gradient-x">
              KOL & Agency
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-400 md:px-12 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Lindungi brand Anda. Cari nama, nomor HP, Instagram, atau TikTok sebelum deal kerjasama.
          </p>

          {/* Search Bar - Glassmorphism */}
          <div className="relative max-w-2xl mx-auto transition-all group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-violet-600 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
              <span className="pl-4 pr-2 text-xl md:text-2xl text-white/50">🔍</span>
              <input
                type="text"
                placeholder="Cari nama, nomor WA, atau username IG..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-400 text-sm sm:text-base py-3 px-2 font-medium"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-white text-gray-900 px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                {loading ? <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : 'Cari Data'}
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {stats.total.toLocaleString('id-ID')} Total Data
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white backdrop-blur-sm">
                <strong className="text-purple-400">{stats.kol.toLocaleString('id-ID')}</strong> KOL
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white backdrop-blur-sm">
                <strong className="text-cyan-400">{stats.mg.toLocaleString('id-ID')}</strong> MG
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 -mt-24 sm:-mt-28 relative z-20">
        
        {/* Results Section */}
        {searched && (
          <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-xl border border-gray-100 min-h-[300px] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-5xl drop-shadow-sm">✨</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Aman & Bersih!</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  Pencarian untuk "<strong className="text-gray-900">{search}</strong>" tidak ditemukan di database laporan merah kami.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full max-w-md">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tips Aman Transaksi</p>
                  <ul className="text-sm text-gray-600 text-left space-y-2">
                    <li className="flex items-start gap-2">✅ <span>Tetap minta portofolio & insight asli (screen recorder).</span></li>
                    <li className="flex items-start gap-2">✅ <span>Cek kesesuaian nama rekening dengan nama asli/KTP.</span></li>
                    <li className="flex items-start gap-2">✅ <span>Buat SPK atau perjanjian tertulis sebelum transfer.</span></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-2 sm:p-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="font-extrabold text-gray-900 text-xl">Hasil Pencarian</h3>
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 shadow-sm">
                    {results.length} Kasus Ditemukan
                  </span>
                </div>
                
                <div className="space-y-4">
                  {results.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelected(item)}
                      className="group bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col sm:flex-row gap-4 sm:gap-6"
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                        item.kategori === 'KOL' ? 'bg-purple-500 group-hover:bg-purple-600' : 'bg-cyan-500 group-hover:bg-cyan-600'
                      }`} />
                      
                      {/* Avatar / Icon */}
                      <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-full items-center justify-center text-xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform duration-300 relative"
                           style={{ background: item.kategori === 'KOL' ? 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' : 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
                        {item.kategori === 'KOL' ? '👤' : '🏢'}
                        {item.jumlah_laporan > 1 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white shadow-sm" title={`${item.jumlah_laporan} Laporan`}>
                            {item.jumlah_laporan}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg sm:text-xl truncate group-hover:text-rose-600 transition-colors">
                            {item.nama}
                          </h4>
                          <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            item.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
                          }`}>
                            {item.kategori}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 mb-3 font-medium">
                          {item.instagram && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-gray-600">
                              <span>📸</span> <span>@{item.instagram}</span>
                            </div>
                          )}
                          {item.no_hp && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-gray-600">
                              <span>📱</span> <span>{item.no_hp}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          "{item.alasan}"
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="hidden sm:flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Grid (Shows when no search or below search) */}
        {!searched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nav Card 1: Daftar */}
            <a href="/daftar" className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
                <span className="text-8xl">📋</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-4 shadow-sm border border-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">📋</div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">Daftar Lengkap</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Lihat database keseluruhan KOL & Management yang di-blacklist.</p>
              </div>
            </a>

            {/* Nav Card 2: Lapor */}
            <a href="/lapor" className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-violet-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
                <span className="text-8xl">📢</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center text-xl mb-4 backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner">📢</div>
                <h3 className="font-extrabold text-white text-lg mb-1 tracking-wide">Lapor Kasus Baru</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">Bantu komunitas dengan melaporkan KOL/MG bermasalah.</p>
              </div>
            </a>

            {/* Nav Card 3: Indikasi */}
            <a href="/indikasi" className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
                <span className="text-8xl">⚠️</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform">⚠️</div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Indikasi Bermasalah</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">Talent lelet, susah dihubungi, atau ghosting ringan.</p>
              </div>
            </a>

            {/* Nav Card 4: Fraud */}
            <a href="/fraud" className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-3xl border border-rose-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 transform origin-top-right">
                <span className="text-8xl">🚨</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl mb-4 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform">🚨</div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-red-600 transition-colors">Fraud / Penipuan</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">Laporkan pencurian, penipuan uang, atau cyber crime.</p>
              </div>
            </a>
            
            {/* Banding Banner */}
            <div className="sm:col-span-2 mt-4 text-center">
              <a href="/banding" className="inline-flex items-center justify-center gap-2 group">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm group-hover:bg-gray-300 transition-colors">⚖️</span>
                <span className="text-sm font-bold text-gray-500 border-b border-gray-300 border-dashed pb-0.5 group-hover:text-gray-900 group-hover:border-gray-900 transition-all">Data Anda masuk blacklist? Ajukan Banding / Klarifikasi</span>
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Detail Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setSelected(null)}
          ></div>
          
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 origin-bottom sm:origin-center">
            
            {/* Pull Bar for mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
            </div>

            <button 
              onClick={() => setSelected(null)} 
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="overflow-y-auto w-full p-6 sm:p-8 custom-scrollbar">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase mb-3 ${
                  selected?.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  BLACKLIST {selected?.kategori}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">{selected?.nama}</h2>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Tercatat: {new Date(selected?.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid gap-3 mb-8 bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-100">
                {selected?.no_hp && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">📱 Nomor HP/WA</span>
                    <span className="font-bold text-gray-900">{selected?.no_hp}</span>
                  </div>
                )}
                {selected?.instagram && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">📸 Instagram</span>
                    <a href={`https://instagram.com/${selected?.instagram}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      @{selected?.instagram}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                )}
                {selected?.tiktok && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">🎵 TikTok</span>
                    <span className="font-bold text-gray-900">@{selected?.tiktok}</span>
                  </div>
                )}
                {selected?.jumlah_laporan > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">⚠️ Total Laporan</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 font-black rounded-lg text-sm">
                      {selected?.jumlah_laporan} Kasus Identik
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <span className="text-rose-500 text-lg">📝</span> Kronologi & Detail Masalah
                </h3>
                <div className="bg-red-50/50 text-gray-800 text-sm sm:text-base leading-relaxed p-4 sm:p-5 rounded-2xl border border-red-100 shadow-inner overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                  {selected?.alasan}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-safe">
                <a 
                  href="/banding"
                  className="w-full py-3.5 sm:py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  ⚖️ Ajukan Banding
                </a>
                <button
                  onClick={() => {
                    const text = `⚠️ *BLACKLIST CHECK - ${selected?.kategori}*\nNama: ${selected?.nama}\n${selected?.no_hp ? `HP: ${selected?.no_hp}\n` : ''}${selected?.instagram ? `IG: @${selected?.instagram}\n` : ''}\n*Kasus:*\n${selected?.alasan}\n\n_Sumber: Blacklist KOL Indonesia_`;
                    navigator.clipboard.writeText(text);
                    const btn = document.getElementById('copy-btn');
                    if (btn) {
                      const original = btn.innerHTML;
                      btn.innerHTML = '✅ Tersalin!';
                      btn.classList.add('bg-green-600', 'text-white');
                      btn.classList.remove('bg-gray-900');
                      setTimeout(() => {
                        btn.innerHTML = original;
                        btn.classList.remove('bg-green-600', 'text-white');
                        btn.classList.add('bg-gray-900');
                      }, 2000);
                    }
                  }}
                  id="copy-btn"
                  className="w-full py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy Teks Format
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
