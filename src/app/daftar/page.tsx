'use client'

import { useState, useEffect } from 'react'
import { supabase, Blacklist } from '@/lib/supabase'

export default function DaftarPage() {
  const [data, setData] = useState<Blacklist[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'KOL' | 'MG'>('all')
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru')
  const [selected, setSelected] = useState<Blacklist | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter, sort])

  const fetchData = async () => {
    setLoading(true)
    
    let query = supabase.from('blacklist').select('*')
    
    if (filter !== 'all') {
      query = query.eq('kategori', filter)
    }
    
    if (sort === 'terbaru') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'terlama') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('jumlah_laporan', { ascending: false })
    }
    
    const { data: result } = await query
    setData(result || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gray-900 px-4 pt-10 pb-24 md:pb-32 rounded-b-[2rem] md:rounded-b-[3rem] shadow-2xl">
        {/* Background Gradients & Noise */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#0f172a,#020617)] z-0"></div>
        <div className="absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[80px] mix-blend-screen animate-pulse z-0 pointer-events-none"></div>
        <div className="absolute top-[5rem] -right-[10rem] w-[30rem] h-[30rem] bg-rose-600/20 rounded-full blur-[80px] mix-blend-screen z-0 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back Button */}
          <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md mb-4">
                 <span className="text-[10px] sm:text-xs font-bold text-indigo-300 tracking-wide uppercase">Database Lengkap</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-md">
                Daftar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Blacklist</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-medium max-w-lg">
                Jelajahi seluruh data KOL dan Management yang pernah di-report oleh komunitas.
              </p>
            </div>

            {/* Sticky Stats Summary */}
            <div className="flex gap-4 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
              <div className="text-center px-4 border-r border-white/10">
                <p className="text-2xl font-black text-white">{data.length}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-black text-purple-400">{data.filter(d => d.kategori === 'KOL').length}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">KOL</p>
              </div>
              <div className="text-center px-4 border-l border-white/10">
                <p className="text-2xl font-black text-cyan-400">{data.filter(d => d.kategori === 'MG').length}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MG</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20">
        
        {/* Filters & Sorting */}
        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-xl shadow-indigo-900/5 border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 sm:flex-none ${
                filter === 'all' 
                  ? 'bg-gray-900 text-white shadow-md scale-100' 
                  : 'bg-transparent text-gray-500 hover:bg-gray-50 scale-95 hover:scale-100'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('KOL')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 sm:flex-none ${
                filter === 'KOL' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-100' 
                  : 'bg-transparent text-gray-500 hover:bg-purple-50 hover:text-purple-600 scale-95 hover:scale-100'
              }`}
            >
              KOL Only
            </button>
            <button
              onClick={() => setFilter('MG')}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 sm:flex-none ${
                filter === 'MG' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200 scale-100' 
                  : 'bg-transparent text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 scale-95 hover:scale-100'
              }`}
            >
              Mgmt Only
            </button>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 sm:pl-3 sm:border-l">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Sort:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="w-full sm:w-auto appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
              >
                <option value="terbaru">🆕 Terbaru</option>
                <option value="terbanyak">🔥 Terbanyak (Laporan)</option>
                <option value="terlama">🕰️ Terlama</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 mt-4 font-medium animate-pulse">Sinkronisasi data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Tidak ada data blacklist yang cocok dengan filter yang Anda pilih saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.map((item, index) => (
              <div 
                key={item.id} 
                onClick={() => setSelected(item)}
                className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex items-start gap-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                  item.kategori === 'KOL' ? 'bg-purple-500 group-hover:bg-purple-600' : 'bg-cyan-500 group-hover:bg-cyan-600'
                }`} />
                
                {/* Avatar Icon */}
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                     style={{ background: item.kategori === 'KOL' ? 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' : 'linear-gradient(135deg, #e0f2fe, #bae6fd)' }}>
                  {item.kategori === 'KOL' ? '👤' : '🏢'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                      {item.nama}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      item.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      {item.kategori}
                    </span>
                    {item.jumlah_laporan > 1 && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {item.jumlah_laporan} Laporan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 truncate font-medium">
                    {item.instagram && `@${item.instagram}`}
                    {item.instagram && item.no_hp && <span className="mx-1 text-gray-300">•</span>}
                    {item.no_hp}
                    {!item.instagram && !item.no_hp && item.tiktok && `@${item.tiktok}`}
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="shrink-0 flex self-center text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && (
          <div className="mt-10 mb-8 w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 p-6 md:p-8 rounded-3xl shadow-xl shadow-orange-500/20 text-center flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-orange-500/30">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 text-left md:w-2/3">
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">Punya data KOL/MG bermasalah?</h3>
              <p className="text-orange-100 text-sm md:text-base font-medium">
                Bantu komunitas agar tidak menjadi korban selanjutnya dengan melaporkan mereka.
              </p>
            </div>
            <a 
              href="/lapor" 
              className="relative z-10 w-full md:w-auto px-8 py-3.5 bg-white text-orange-600 rounded-xl font-bold shadow-md hover:bg-orange-50 hover:shadow-lg active:scale-95 transition-all text-center whitespace-nowrap"
            >
              📝 Buat Laporan
            </a>
          </div>
        )}

      </div>

      {/* Detail Modal (Same as Homepage) */}
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
                  selected.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  BLACKLIST {selected.kategori}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">{selected.nama}</h2>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Tercatat: {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid gap-3 mb-8 bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-100">
                {selected.no_hp && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">📱 Nomor HP/WA</span>
                    <span className="font-bold text-gray-900">{selected.no_hp}</span>
                  </div>
                )}
                {selected.instagram && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">📸 Instagram</span>
                    <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      @{selected.instagram}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                )}
                {selected.tiktok && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">🎵 TikTok</span>
                    <span className="font-bold text-gray-900">@{selected.tiktok}</span>
                  </div>
                )}
                {selected.jumlah_laporan > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-gray-200/50 last:border-0 gap-1">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-2">⚠️ Total Laporan</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 font-black rounded-lg text-sm">
                      {selected.jumlah_laporan} Kasus Identik
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
                  {selected.alasan}
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
