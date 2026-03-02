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
        .or(`nama.ilike.%${searchTerm.replace(/[,()."'\\]/g, '')}%,no_hp.ilike.%${searchTerm.replace(/[,()."'\\]/g, '')}%,instagram.ilike.%${searchTerm.replace(/[,()."'\\]/g, '')}%,tiktok.ilike.%${searchTerm.replace(/[,()."'\\]/g, '')}%`)
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in font-sans">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12 pt-6 md:pt-10">
        <div className="inline-flex relative mb-6 md:mb-8 justify-center items-center">
          <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 rounded-full"></div>
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-neutral-900 border border-red-900/50 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)] rotate-3 hover:rotate-0 transition-transform duration-300">
             <span className="text-3xl md:text-4xl">🛑</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 px-4 uppercase">
          KLASIFIKASI <span className="text-red-600">BLACKLIST</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed px-4 font-medium">
          Sistem pangkalan data komunitas. Identifikasi KOL & Management dengan riwayat kasus sebelum Anda bekerjasama.
        </p>
      </div>

      {/* Stats Cards - Dossier Style */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-10 px-1 md:px-2">
        <div className="panel-dark p-3 md:p-5 text-center group border-t-2 border-t-neutral-700">
          <div className="text-2xl md:text-4xl font-black text-white mb-1 font-mono tracking-tight group-hover:text-red-500 transition-colors">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-tight">Total Data</p>
        </div>
        <div className="panel-dark p-3 md:p-5 text-center group border-t-2 border-t-purple-900/50">
          <div className="text-2xl md:text-4xl font-black text-white mb-1 font-mono tracking-tight group-hover:text-purple-400 transition-colors">{stats.kol}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-tight">ENTITAS KOL</p>
        </div>
        <div className="panel-dark p-3 md:p-5 text-center group border-t-2 border-t-cyan-900/50">
          <div className="text-2xl md:text-4xl font-black text-white mb-1 font-mono tracking-tight group-hover:text-cyan-400 transition-colors">{stats.mg}</div>
          <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-tight">ENTITAS MGMT</p>
        </div>
      </div>

      {/* Modern Search Box - Dark Protocol */}
      <div className="relative z-10 mb-8 md:mb-12 px-2">
        <div className="panel-dark p-1 shadow-lg shadow-black/50 border-neutral-700 focus-within:border-red-600/50 transition-colors">
          <div className="relative flex items-center bg-neutral-950 rounded-sm">
            <div className="absolute left-4 md:left-5 text-neutral-500 pointer-events-none font-mono text-xs">
              &gt;_
            </div>
            <input
              type="text"
              placeholder="Input Nomor HP, IG, atau Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 md:pl-12 pr-24 py-4 md:py-5 bg-transparent border-none outline-none focus:ring-0 text-white placeholder-neutral-600 font-mono text-sm md:text-base tracking-wide"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 md:px-8 bg-red-700 text-white rounded-sm font-bold hover:bg-red-600 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : 'LACAK'}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] md:text-xs text-neutral-500 mt-4 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          ACCESSING GLOBAL DATABASE
        </p>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="animate-fade-in-up">
          {results.length === 0 ? (
            <div className="panel-dark border-dashed border-emerald-900/50 p-8 text-center">
              <div className="w-16 h-16 bg-neutral-900 border border-emerald-900/50 rounded-sm flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-500 mb-2 uppercase tracking-wide">TIDAK ADA REKAM JEJAK BURUK</h3>
              <p className="text-neutral-400 mb-6 text-sm">
                Entitas "<span className="font-bold text-white font-mono">{search}</span>" tidak ditemukan dalam database Blacklist.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-bold text-neutral-300">
                <span>⚠️</span> REKOMENDASI: TETAP MINTA BUKTI PORTOFOLIO
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2 border-b border-neutral-800 pb-2">
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">HASIL PELACAKAN</h3>
                <span className="px-2 py-0.5 bg-red-900/30 text-red-500 border border-red-900/50 text-[10px] font-mono font-bold rounded-sm">
                  {results.length} MATCHES
                </span>
              </div>
              
              <div className="grid gap-3">
                {results.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelected(item)}
                    className="group panel-accent p-3 md:p-4 hover:border-r-red-600/20 hover:bg-neutral-800 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                      item.kategori === 'KOL' ? 'bg-purple-600' : 'bg-cyan-600'
                    }`} />
                    
                    <div className="flex items-start gap-3 md:gap-4 pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-bold text-white text-base md:text-lg group-hover:text-red-400 transition-colors truncate w-full">
                            {item.nama}
                          </h3>
                          <span className={`self-start sm:self-auto px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                            item.kategori === 'KOL' 
                              ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' 
                              : 'bg-cyan-900/20 text-cyan-400 border-cyan-800/50'
                          }`}>
                            ID: {item.kategori}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-3 font-mono">
                          {item.instagram && (
                            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-sm border border-neutral-800">
                              <span className="opacity-50 text-[10px]">IG</span>
                              <span className="text-neutral-300">@{item.instagram}</span>
                            </div>
                          )}
                          {item.no_hp && (
                            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-sm border border-neutral-800">
                              <span className="opacity-50 text-[10px]">HP</span>
                              <span className="text-neutral-300">{item.no_hp}</span>
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-900/30 group-hover:bg-red-600/50 transition-colors"></div>
                          <p className="text-sm text-neutral-400 bg-neutral-950/50 p-3 pl-4 rounded-sm border border-neutral-800/50 italic font-serif line-clamp-2">
                            "{item.alasan}"
                          </p>
                        </div>
                      </div>
                      
                      <div className="self-center hidden sm:block opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-neutral-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards Grid (When no search) - Dossier Index View */}
      {!searched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <a href="/daftar" className="group p-5 panel-dark hover:border-neutral-600 transition-all flex items-center gap-4">
             <div className="w-10 h-10 bg-neutral-800 rounded-sm border border-neutral-700 flex items-center justify-center text-xl group-hover:bg-neutral-700 transition-colors">
               📄
             </div>
             <div>
               <h3 className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors">DATABASE LENGKAP</h3>
               <p className="text-xs text-neutral-500 font-mono mt-0.5">ARSIP BLACKLIST</p>
             </div>
          </a>

          <a href="/lapor" className="group p-5 bg-red-900/20 border border-red-900/50 rounded-sm hover:bg-red-900/40 hover:border-red-700 transition-all flex items-center gap-4">
             <div className="w-10 h-10 bg-red-950 rounded-sm border border-red-900 flex items-center justify-center text-xl group-hover:bg-red-900 transition-colors">
               🔴
             </div>
             <div>
               <h3 className="font-bold text-red-50 text-sm uppercase tracking-wide group-hover:text-white transition-colors">LAPOR KASUS BARU</h3>
               <p className="text-xs text-red-400/70 font-mono mt-0.5">+ TAMBAH ENTRI</p>
             </div>
          </a>

          <a href="/indikasi" className="group p-5 bg-amber-900/10 border border-amber-900/30 rounded-sm hover:bg-amber-900/20 hover:border-amber-700/50 transition-all flex items-center gap-4">
             <div className="w-10 h-10 bg-amber-950/50 rounded-sm border border-amber-900/50 flex items-center justify-center text-xl">
               ⚠️
             </div>
             <div>
               <h3 className="font-bold text-amber-500 text-sm uppercase tracking-wide">INDIKASI BERMASALAH</h3>
               <p className="text-xs text-amber-600/70 font-mono mt-0.5">GHOSTING / LAMBAT</p>
             </div>
          </a>

          <a href="/fraud" className="group p-5 bg-rose-900/10 border border-rose-900/30 rounded-sm hover:bg-rose-900/20 hover:border-rose-700/50 transition-all flex items-center gap-4">
             <div className="w-10 h-10 bg-rose-950/50 rounded-sm border border-rose-900/50 flex items-center justify-center text-xl">
               🚨
             </div>
             <div>
               <h3 className="font-bold text-rose-500 text-sm uppercase tracking-wide">FRAUD / PENIPUAN</h3>
               <p className="text-xs text-rose-600/70 font-mono mt-0.5">PENCURIAN / DANA</p>
             </div>
          </a>
          
          <a href="/banding" className="md:col-span-2 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-sm transition-colors flex items-center justify-center gap-3 cursor-pointer group mt-2">
             <span className="text-neutral-500 group-hover:text-neutral-400 text-sm">⚖️</span>
             <p className="text-xs md:text-sm font-bold text-neutral-400 group-hover:text-white uppercase tracking-widest">PENGAJUAN BANDING & KLARIFIKASI</p>
          </a>
        </div>
      )}

      {/* Detail Modal - Dossier Document View */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          ></div>
          
          <div className="relative bg-neutral-900 border border-neutral-700 rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-zoom-in p-0 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className={`p-4 md:p-6 border-b-4 flex justify-between items-start ${
              selected.kategori === 'KOL' ? 'border-b-purple-600 bg-purple-900/10' : 'border-b-cyan-600 bg-cyan-900/10'
            }`}>
              <div>
                 <div className="inline-block px-2 py-0.5 bg-black border border-neutral-800 rounded-sm text-[10px] font-bold tracking-widest text-neutral-400 mb-2 font-mono">
                  SUBJECT: {selected.kategori}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{selected.nama}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <p className="font-mono text-xs text-red-500 uppercase tracking-widest font-bold">STATUS: BLACKLISTED</p>
                </div>
              </div>

              <button 
                onClick={() => setSelected(null)} 
                className="p-2 bg-neutral-950 border border-neutral-800 hover:bg-red-900/30 hover:text-red-500 rounded-sm transition-colors text-neutral-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
              <div className="flex flex-col gap-1 mb-6 font-mono text-xs text-neutral-500">
                <p>RECORD_ID: {selected.id.substring(0,8).toUpperCase()}</p>
                <p>DATE_ADDED: {new Date(selected.created_at).toLocaleDateString('en-GB')}</p>
              </div>

              <div className="grid gap-3 mb-6 bg-black rounded-sm p-4 border border-neutral-800">
                {selected.no_hp && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [PHONE]</span>
                    <span className="font-mono text-neutral-300">{selected.no_hp}</span>
                  </div>
                )}
                {selected.instagram && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [IG]</span>
                    <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:text-blue-300 hover:underline">@{selected.instagram}</a>
                  </div>
                )}
                {selected.tiktok && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [TIKTOK]</span>
                    <span className="font-mono text-neutral-300">@{selected.tiktok}</span>
                  </div>
                )}
                {selected.jumlah_laporan > 1 && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-900 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">OFFENSE COUNT</span>
                    <span className="font-bold text-red-500">{selected.jumlah_laporan} RECORDS</span>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <h3 className="text-xs font-bold text-neutral-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span>📄</span> INCIDENT REPORT
                </h3>
                <div className="bg-neutral-950 text-neutral-300 text-sm leading-relaxed p-4 rounded-sm border-l-2 border-l-red-600 border border-neutral-800 font-serif italic">
                  {selected.alasan}
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky on Mobile) */}
            <div className="absolute md:static bottom-0 left-0 w-full p-4 bg-neutral-900 border-t border-neutral-800">
              <button
                onClick={() => {
                  const text = `⚠️ *BLACKLIST RECORD - ${selected.kategori}*
Nama: ${selected.nama}
${selected.no_hp ? `HP: ${selected.no_hp}` : ''}
${selected.instagram ? `IG: @${selected.instagram}` : ''}

*Kasus:*
${selected.alasan}

_Dossier: Blacklist KOL Indonesia_`;
                  navigator.clipboard.writeText(text);
                  alert('Data disalin ke clipboard!');
                }}
                className="w-full py-4 bg-red-700 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                COPY DATA / SHARE
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
