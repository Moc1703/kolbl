'use client'

import { useState, useEffect } from 'react'
import { supabase, FraudList } from '@/lib/supabase'

export default function FraudDaftarPage() {
  const [data, setData] = useState<FraudList[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Pencurian' | 'Penipuan Pembayaran' | 'Lainnya'>('all')
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru')
  const [selected, setSelected] = useState<FraudList | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter, sort])

  const fetchData = async () => {
    setLoading(true)

    let query = supabase.from('fraud_list').select('*')

    if (filter !== 'all') {
      query = query.eq('jenis_fraud', filter)
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

  const formatRupiah = (num: number) => {
    if (!num) return '-'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
  }

  const jenisColor = (jenis: string) => {
    switch (jenis) {
      case 'Pencurian': return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-600' }
      case 'Penipuan Pembayaran': return { bg: 'bg-rose-100', text: 'text-rose-700', bar: 'bg-rose-500' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-200 pb-4">
        <a href="/fraud" className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-widest flex items-center gap-1 mb-2">
          <span>←</span> KEMBALI
        </a>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <span className="text-red-600">🚨</span> KASUS FRAUD
        </h1>
        <p className="text-gray-500 text-xs font-mono mt-1 uppercase tracking-widest">Financial Crimes Database Archive</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'Pencurian', 'Penipuan Pembayaran', 'Lainnya'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
              filter === f
                ? f === 'all' ? 'bg-red-700 text-white border-red-600' : 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 shadow-sm'
            }`}
          >
            {f === 'all' ? 'SEMUA' : f === 'Pencurian' ? '🔒 PENCURIAN' : f === 'Penipuan Pembayaran' ? '💸 PENIPUAN' : '📌 LAINNYA'}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto px-3 py-2 bg-white border border-gray-200 rounded-sm text-xs font-mono text-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 uppercase cursor-pointer shadow-sm"
        >
          <option value="terbaru">TERBARU</option>
          <option value="terlama">TERLAMA</option>
          <option value="terbanyak">TERBANYAK OFFENSE</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-sm shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-100 border-t-red-600"></div>
          <p className="text-gray-500 mt-4 font-mono text-xs uppercase tracking-widest">Syncing Database...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-50 border-dashed border-2 border-gray-200 rounded-sm p-12 text-center">
          <div className="text-4xl mb-4 opacity-50">📭</div>
          <p className="text-gray-400 font-mono text-sm uppercase">DATABASE KOSONG</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {data.map((item) => {
            const colors = jenisColor(item.jenis_fraud)
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="group bg-white border border-gray-200 rounded-sm p-3 md:p-4 hover:border-red-300 hover:bg-red-50/10 transition-colors cursor-pointer relative overflow-hidden flex items-center gap-3 shadow-sm"
              >
                {/* Indicator Tape */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.bar}`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base group-hover:text-red-700 transition-colors uppercase">{item.nama}</h3>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest shrink-0 border border-transparent ${colors.bg} ${colors.text}`}>
                      {item.jenis_fraud === 'Penipuan Pembayaran' ? 'PENIPUAN' : item.jenis_fraud.toUpperCase()}
                    </span>
                    {item.jumlah_laporan > 1 && (
                      <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold shrink-0 bg-red-50 text-red-700 border border-red-200">
                        {item.jumlah_laporan} OFFENSES
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500 truncate mt-1">
                    {item.nominal_total > 0 && <span className="text-red-600 font-bold mr-1">{formatRupiah(item.nominal_total)}</span>}
                    {item.instagram && <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-sm text-gray-600">IG:@{item.instagram}</span>}
                    {item.no_hp && <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-sm text-gray-600">PH:{item.no_hp}</span>}
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="text-gray-400 group-hover:text-red-600 transition-colors mr-2">
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
          
          <div className="relative bg-white border border-gray-300 rounded-sm max-w-lg w-full max-h-[90vh] shadow-2xl animate-zoom-in flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className={`p-4 md:p-6 border-b-4 flex justify-between items-start border-b-red-600 bg-red-50`}>
              <div>
                 <div className="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded-sm text-[10px] font-bold tracking-widest text-gray-500 mb-2 font-mono shadow-sm">
                  SUBJECT: FRAUD & CRIME
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">{selected.nama}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <p className="font-mono text-xs text-red-600 uppercase tracking-widest font-bold">STATUS: CRITICAL WARNING</p>
                </div>
              </div>

              <button 
                onClick={() => setSelected(null)} 
                className="p-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 rounded-sm transition-colors text-gray-400 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar" style={{ paddingBottom: 'calc(1.5rem + 76px)' }}>
              <div className="flex flex-col gap-1 mb-6 font-mono text-xs text-gray-500">
                <p>RECORD_ID: {selected.id.substring(0,8).toUpperCase()}</p>
                <p>DATE_ADDED: {new Date(selected.created_at).toLocaleDateString('en-GB')}</p>
                <p>CRIME_CATEGORY: {selected.jenis_fraud.toUpperCase()}</p>
              </div>

              <div className="grid gap-3 mb-6 bg-gray-50 rounded-sm p-4 border border-gray-200 shadow-sm">
                {selected.nominal_total > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">FINANCIAL LOSS</span>
                    <span className="font-bold text-red-600 text-lg">{formatRupiah(selected.nominal_total)}</span>
                  </div>
                )}
                {selected.no_hp && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">CONTACT [PHONE]</span>
                    <span className="font-mono text-gray-700">{selected.no_hp}</span>
                  </div>
                )}
                {selected.instagram && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">CONTACT [IG]</span>
                    <a href={`https://instagram.com/${selected.instagram}`} target="_blank" rel="noreferrer" className="font-mono text-blue-600 hover:text-blue-800 hover:underline">@{selected.instagram}</a>
                  </div>
                )}
                {selected.tiktok && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">CONTACT [TIKTOK]</span>
                    <span className="font-mono text-gray-700">@{selected.tiktok}</span>
                  </div>
                )}
                {selected.jumlah_laporan > 1 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">OFFENSE COUNT</span>
                    <span className="font-bold text-red-600">{selected.jumlah_laporan} RECORDS</span>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <span>📄</span> INCIDENT REPORT
                </h3>
                <div className="bg-white text-gray-700 text-sm leading-relaxed p-4 rounded-sm border-l-2 border-l-red-600 border border-gray-200 font-serif italic shadow-sm">
                  {selected.alasan}
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => {
                  const text = `🚨 *LAPORAN FRAUD - ${selected.jenis_fraud}*
Nama: ${selected.nama}
${selected.nominal_total > 0 ? `Kerugian: ${formatRupiah(selected.nominal_total)}` : ''}
${selected.no_hp ? `HP: ${selected.no_hp}` : ''}
${selected.instagram ? `IG: @${selected.instagram}` : ''}

*Detail Kasus:*
${selected.alasan}

_Dossier: Blacklist KOL Indonesia_`;
                  navigator.clipboard.writeText(text);
                  alert('Data disalin ke clipboard!');
                }}
                className="w-full py-4 bg-red-600 text-white rounded-sm font-bold uppercase tracking-widest hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                COPY DATA / SHARE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 bg-white border-dashed border-2 border-red-200 p-6 text-center flex flex-col items-center rounded-sm shadow-sm">
        <p className="text-gray-500 mb-4 text-sm font-medium">
          Ada info entitas bermasalah yang belum tercatat?
        </p>
        <a 
          href="/fraud/lapor" 
          className="inline-flex items-center justify-center px-6 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors uppercase tracking-widest text-xs font-bold shadow-sm"
        >
          LAMPIRKAN LAPORAN BARU
        </a>
      </div>
    </div>
  )
}
