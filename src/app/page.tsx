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
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10 pt-4 md:pt-8">
        <div className="inline-block relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 rounded-full"></div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-200 rotate-3 hover:rotate-6 transition-transform duration-300">
            <span className="text-4xl md:text-5xl drop-shadow-md">🚫</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3 px-4">
          Cek Blacklist <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">KOL & MG</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed px-4">
          Database komunitas untuk melindungi bisnis Anda dari influencer & manajemen bermasalah.
        </p>
      </div>

      {/* Stats Cards - Glass Style */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-10 px-1 md:px-2">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-gray-800 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.total}</div>
          <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">Total Kasus</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-purple-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.kol}</div>
          <p className="text-[10px] md:text-xs font-semibold text-purple-300/80 uppercase tracking-wider leading-tight">KOL</p>
        </div>
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center group">
          <div className="text-xl md:text-3xl font-extrabold text-cyan-600 mb-0 md:mb-1 group-hover:scale-110 transition-transform">{stats.mg}</div>
          <p className="text-[10px] md:text-xs font-semibold text-cyan-300/80 uppercase tracking-wider leading-tight">Mgmt</p>
        </div>
      </div>

      {/* Modern Search Box */}
      <div className="relative z-10 mb-8 md:mb-12 px-2">
        <div className="glass rounded-3xl p-1.5 md:p-2 shadow-2xl shadow-rose-100/50">
          <div className="relative flex items-center">
            <div className="absolute left-4 md:left-6 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama, No HP, IG, atau TikTok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 md:pl-16 pr-20 md:pr-24 py-4 md:py-5 bg-transparent border-none focus:outline-none text-base md:text-lg text-gray-800 placeholder-gray-400 font-medium"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-1.5 md:right-2 top-1.5 bottom-1.5 px-4 md:px-8 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 active:scale-95 transition-all text-xs md:text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : 'Cari'}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] md:text-xs text-gray-400 mt-3 md:mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Database selalu diupdate oleh komunitas
        </p>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="animate-fade-in-up">
          {results.length === 0 ? (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 text-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Bersih! Tidak Ditemukan</h3>
              <p className="text-emerald-700/80 mb-6">
                Data "<span className="font-semibold text-emerald-800">{search}</span>" belum ada di blacklist kami.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-semibold text-emerald-700 shadow-sm">
                <span>💡</span> Tetap minta portofolio & bukti amanah ya!
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-gray-800 text-lg">Hasil Pencarian</h3>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                  {results.length} Kasus
                </span>
              </div>
              
              <div className="grid gap-3">
                {results.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelected(item)}
                    className="group bg-white rounded-2xl p-3 md:p-4 border border-gray-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                      item.kategori === 'KOL' ? 'bg-purple-500 group-hover:bg-purple-600' : 'bg-cyan-500 group-hover:bg-cyan-600'
                    }`} />
                    
                    <div className="flex items-start gap-3 md:gap-4 pl-2 md:pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-rose-600 transition-colors truncate w-full">
                            {item.nama}
                          </h3>
                          <span className={`self-start sm:self-auto px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                            item.kategori === 'KOL' 
                              ? 'bg-purple-50 text-purple-700 border-purple-100' 
                              : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                          }`}>
                            {item.kategori}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          {item.instagram && (
                            <div className="flex items-center gap-1">
                              <span className="opacity-50">IG</span>
                              <span className="font-medium text-gray-700">@{item.instagram}</span>
                            </div>
                          )}
                          {item.no_hp && (
                            <div className="flex items-center gap-1">
                              <span className="opacity-50">HP</span>
                              <span className="font-medium text-gray-700">{item.no_hp}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic line-clamp-2 group-hover:bg-rose-50/30 group-hover:border-rose-100 transition-colors">
                          "{item.alasan}"
                        </p>
                      </div>
                      
                      <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Info Cards Grid (When no search) */}
      {!searched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <a href="/daftar" className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📋
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">Lihat Semua Data</h3>
              <p className="text-xs text-gray-500">Cek daftar lengkap blacklist</p>
            </div>
          </a>

          <a href="/lapor" className="group p-5 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg shadow-rose-200 text-white hover:shadow-xl hover:shadow-rose-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
              📢
            </div>
            <div>
              <h3 className="font-bold">Lapor Kasus Baru</h3>
              <p className="text-xs text-rose-100">Bantu komunitas lebih aman</p>
            </div>
          </a>

          <a href="/indikasi" className="group p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-200 text-white hover:shadow-xl hover:shadow-amber-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
              ⚠️
            </div>
            <div>
              <h3 className="font-bold">Indikasi Talent Bermasalah</h3>
              <p className="text-xs text-amber-100">Lelet, Hilang, Ghost, dll</p>
            </div>
          </a>

          <a href="/fraud" className="group p-5 bg-gradient-to-br from-red-700 to-rose-900 rounded-2xl shadow-lg shadow-red-300 text-white hover:shadow-xl hover:shadow-red-400 transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
              🚨
            </div>
            <div>
              <h3 className="font-bold">Pencurian & Penipuan</h3>
              <p className="text-xs text-red-200">Lapor kasus fraud pembayaran</p>
            </div>
          </a>
          
          <a href="/banding" className="md:col-span-2 p-5 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-colors flex items-center gap-4 cursor-pointer group">
             <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-xl group-hover:scale-110 transition-transform">
               ⚖️
             </div>
             <div>
               <p className="text-sm font-bold text-indigo-900">Merasa data ini keliru?</p>
               <p className="text-xs text-indigo-700">Ajukan permohonan banding atau klarifikasi resmi di sini.</p>
             </div>
          </a>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-zoom-in p-6 md:p-8">
            <button 
              onClick={() => setSelected(null)} 
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 ${
                selected.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'
              }`}>
                BLACKLIST {selected.kategori}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selected.nama}</h2>
              <p className="text-gray-400 text-xs mt-1">
                Ditambahkan: {new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="grid gap-3 mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              {selected.no_hp && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500 text-sm">Nomor HP/WA</span>
                  <span className="font-semibold text-gray-900">{selected.no_hp}</span>
                </div>
              )}
              {selected.instagram && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500 text-sm">Instagram</span>
                  <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">@{selected.instagram}</a>
                </div>
              )}
              {selected.tiktok && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500 text-sm">TikTok</span>
                  <span className="font-semibold text-gray-900">@{selected.tiktok}</span>
                </div>
              )}
              {selected.jumlah_laporan > 1 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500 text-sm">Total Laporan</span>
                  <span className="font-bold text-rose-600">{selected.jumlah_laporan} Kasus</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>⚠️</span> Detail Masalah
              </h3>
              <div className="bg-rose-50 text-gray-800 text-sm leading-relaxed p-4 rounded-xl border border-rose-100">
                {selected.alasan}
              </div>
            </div>

            <button
              onClick={() => {
                const text = `⚠️ *BLACKLIST CHECK - ${selected.kategori}*
Nama: ${selected.nama}
${selected.no_hp ? `HP: ${selected.no_hp}` : ''}
${selected.instagram ? `IG: @${selected.instagram}` : ''}

*Kasus:*
${selected.alasan}

_Sumber: Blacklist KOL Indonesia_`;
                navigator.clipboard.writeText(text);
                alert('Teks berhasil disalin!');
              }}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Copy Detail untuk Share
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
