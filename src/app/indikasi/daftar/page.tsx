'use client'

import { useState, useEffect } from 'react'
import { supabase, IndikasiList } from '@/lib/supabase'

export default function IndikasiDaftarPage() {
  const [data, setData] = useState<IndikasiList[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Lelet' | 'Hilang' | 'Ghost' | 'Lainnya'>('all')
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru')
  const [selected, setSelected] = useState<IndikasiList | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter, sort])

  const fetchData = async () => {
    setLoading(true)

    let query = supabase.from('indikasi_list').select('*')

    if (filter !== 'all') {
      query = query.eq('kategori_masalah', filter)
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

  const kategoriColor = (kat: string) => {
    switch (kat) {
      case 'Lelet': return { bg: 'bg-amber-900/30', text: 'text-amber-500', bar: 'bg-amber-500' }
      case 'Hilang': return { bg: 'bg-red-900/30', text: 'text-red-500', bar: 'bg-red-500' }
      case 'Ghost': return { bg: 'bg-neutral-800', text: 'text-neutral-300', bar: 'bg-neutral-9000' }
      default: return { bg: 'bg-blue-900/30', text: 'text-blue-400', bar: 'bg-blue-500' }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 border-b-2 border-neutral-800 pb-4">
        <a href="/indikasi" className="text-amber-500 hover:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mb-2">
          <span>←</span> KEMBALI
        </a>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> INDIKASI KASUS
        </h1>
        <p className="text-neutral-500 text-xs font-mono mt-1 uppercase tracking-widest">Pre-Warning Database Archive</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'Lelet', 'Hilang', 'Ghost', 'Lainnya'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
              filter === f
                ? f === 'all' ? 'bg-amber-600 text-white border-amber-500' : 'bg-amber-900/20 border-amber-800/50 text-amber-500'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'
            }`}
          >
            {f === 'all' ? 'SEMUA' : f === 'Lelet' ? '🐢 LELET' : f === 'Hilang' ? '👻 HILANG' : f === 'Ghost' ? '💨 GHOST' : '📌 LAINNYA'}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-xs font-mono text-neutral-400 focus:outline-none focus:border-amber-600 uppercase cursor-pointer "
        >
          <option value="terbaru">TERBARU</option>
          <option value="terlama">TERLAMA</option>
          <option value="terbanyak">TERBANYAK OFFENSE</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-sm ">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-800 border-t-amber-500"></div>
          <p className="text-neutral-500 mt-4 font-mono text-xs uppercase tracking-widest">Syncing Database...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-neutral-900 border-dashed border-2 border-neutral-800 rounded-sm p-12 text-center">
          <div className="text-4xl mb-4 opacity-50">📭</div>
          <p className="text-neutral-600 font-mono text-sm uppercase">DATABASE KOSONG</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {data.map((item) => {
            const colors = kategoriColor(item.kategori_masalah)
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-neutral-900 border border-neutral-800 rounded-sm p-3 md:p-4 hover:border-amber-800/50 hover:bg-amber-900/10 transition-colors cursor-pointer relative overflow-hidden flex items-center gap-3 "
              >
                {/* Indicator Tape */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.bar}`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate text-sm md:text-base group-hover:text-amber-400 transition-colors uppercase">{item.nama}</h3>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest shrink-0 border border-transparent ${colors.bg} ${colors.text}`}>
                      {item.kategori_masalah}
                    </span>
                    {item.jumlah_laporan > 1 && (
                      <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold shrink-0 bg-red-50 text-red-500 border border-red-800/50">
                        {item.jumlah_laporan} OFFENSES
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 truncate mt-1">
                    {item.instagram && <span className="bg-neutral-800 border border-neutral-800 px-1.5 py-0.5 rounded-sm text-neutral-400">IG:@{item.instagram}</span>}
                    {item.no_hp && <span className="bg-neutral-800 border border-neutral-800 px-1.5 py-0.5 rounded-sm text-neutral-400">PH:{item.no_hp}</span>}
                    {!item.instagram && !item.no_hp && item.tiktok && <span className="bg-neutral-800 border border-neutral-800 px-1.5 py-0.5 rounded-sm text-neutral-400">TT:@{item.tiktok}</span>}
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="text-neutral-600 group-hover:text-amber-600 transition-colors mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal - Dossier Document View */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          ></div>
          
          <div className="relative bg-neutral-950 border border-neutral-700 rounded-sm max-w-lg w-full max-h-[90vh]  animate-zoom-in flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-4 md:p-6 border-b-4 flex justify-between items-start border-b-amber-500 bg-amber-950/30`}>
              <div>
                 <div className="inline-block px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded-sm text-[10px] font-bold tracking-widest text-neutral-500 mb-2 font-mono ">
                  SUBJECT: PRE-WARNING
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{selected.nama}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <p className="font-mono text-xs text-amber-600 uppercase tracking-widest font-bold">STATUS: INDIKASI MASALAH</p>
                </div>
              </div>

              <button 
                onClick={() => setSelected(null)} 
                className="p-2 bg-neutral-950 border border-neutral-800 hover:bg-amber-900/30 hover:text-amber-600 rounded-sm transition-colors text-neutral-600 "
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar" style={{ paddingBottom: 'calc(1.5rem + 76px)' }}>
              <div className="flex flex-col gap-1 mb-6 font-mono text-xs text-neutral-500">
                <p>RECORD_ID: {selected.id.substring(0,8).toUpperCase()}</p>
                <p>DATE_ADDED: {new Date(selected.created_at).toLocaleDateString('en-GB')}</p>
                <p>KATEGORI_MASALAH: {selected.kategori_masalah.toUpperCase()}</p>
              </div>

              <div className="grid gap-3 mb-6 bg-neutral-900 rounded-sm p-4 border border-neutral-800 ">
                {selected.no_hp && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [PHONE]</span>
                    <span className="font-mono text-neutral-300">{selected.no_hp}</span>
                  </div>
                )}
                {selected.instagram && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [IG]</span>
                    <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:text-blue-300 hover:underline">@{selected.instagram}</a>
                  </div>
                )}
                {selected.tiktok && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">CONTACT [TIKTOK]</span>
                    <span className="font-mono text-neutral-300">@{selected.tiktok}</span>
                  </div>
                )}
                {selected.jumlah_laporan > 1 && (
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800 last:border-0">
                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">OFFENSE COUNT</span>
                    <span className="font-bold text-red-600">{selected.jumlah_laporan} RECORDS</span>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <h3 className="text-xs font-bold text-neutral-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span>📄</span> INCIDENT REPORT
                </h3>
                <div className="bg-neutral-950 text-neutral-300 text-sm leading-relaxed p-4 rounded-sm border-l-2 border-l-amber-500 border border-neutral-800 font-serif italic ">
                  {selected.alasan}
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-neutral-950 border-t border-neutral-800 ">
              <button
                onClick={() => {
                  const text = `⚠️ *INDIKASI TALENT BERMASALAH - ${selected.kategori_masalah}*
Nama: ${selected.nama}
${selected.no_hp ? `HP: ${selected.no_hp}` : ''}
${selected.instagram ? `IG: @${selected.instagram}` : ''}

*Detail Masalah:*
${selected.alasan}

_Dossier: Blacklist KOL Indonesia_

Untuk pengajuan banding silahkan isi form banding dan melakukan klarifikasi terhadap pihak yang di rugikan. Penghapusan Blacklist dilakukan apabila pihak yang dirugikan telah menyatakan bahwa masalah telah selesai`;
                  navigator.clipboard.writeText(text);
                  alert('Data disalin ke clipboard!');
                }}
                className="w-full py-4 bg-amber-600 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-amber-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 "
              >
                COPY DATA / SHARE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 bg-neutral-950 border-dashed border-2 border-amber-200 p-6 text-center flex flex-col items-center rounded-sm ">
        <p className="text-neutral-500 mb-4 text-sm font-medium">
          Ada info entitas bermasalah yang belum tercatat?
        </p>
        <a 
          href="/indikasi/lapor" 
          className="inline-flex items-center justify-center px-6 py-2 bg-neutral-900 text-white border border-neutral-800 rounded-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-500 transition-colors uppercase tracking-widest text-xs font-bold "
        >
          LAMPIRKAN LAPORAN BARU
        </a>
      </div>
    </div>
  )
}
