'use client'

import { useState, useEffect } from 'react'
import { supabase, Report } from '@/lib/supabase'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'resolved' | 'all'>('pending')
  const [kategoriFilter, setKategoriFilter] = useState<'all' | 'KOL' | 'MG'>('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKategori, setEditKategori] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkProcessing, setBulkProcessing] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_logged_in')
    if (saved === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchReports()
    }
  }, [isLoggedIn, filter, kategoriFilter])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    
    if (res.ok) {
      setIsLoggedIn(true)
      sessionStorage.setItem('admin_logged_in', 'true')
    } else {
      alert('Password salah!')
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    if (kategoriFilter !== 'all') {
      query = query.eq('kategori', kategoriFilter)
    }
    
    const { data } = await query
    setReports(data || [])
    setLoading(false)
  }

  const handleApprove = async (report: Report) => {
    if (!confirm('Yakin approve laporan ini? Akan masuk ke blacklist publik.')) return
    
    setProcessing(report.id)
    
    // Check if already exists in blacklist (by name, phone, ig, or tiktok)
    let existingQuery = supabase.from('blacklist').select('*')
    
    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${report.nama}%`)
    if (report.no_hp) conditions.push(`no_hp.eq.${report.no_hp}`)
    if (report.instagram) conditions.push(`instagram.ilike.${report.instagram}`)
    if (report.tiktok) conditions.push(`tiktok.ilike.${report.tiktok}`)
    
    const { data: existing } = await supabase
      .from('blacklist')
      .select('*')
      .or(conditions.join(','))
      .limit(1)
    
    if (existing && existing.length > 0) {
      // Update existing entry - increment jumlah_laporan
      const entry = existing[0]
      await supabase.from('blacklist').update({
        jumlah_laporan: (entry.jumlah_laporan || 1) + 1,
        alasan: entry.alasan + '\n\n---\n\n' + report.kronologi.substring(0, 500),
        updated_at: new Date().toISOString()
      }).eq('id', entry.id)
    } else {
      // Create new entry
      await supabase.from('blacklist').insert({
        report_id: report.id,
        nama: report.nama,
        no_hp: report.no_hp,
        instagram: report.instagram,
        tiktok: report.tiktok,
        kategori: report.kategori,
        alasan: report.kronologi.substring(0, 500),
        jumlah_laporan: 1
      })
    }
    
    // Update report status
    await supabase.from('reports').update({
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    
    setProcessing(null)
    fetchReports()
  }

  const handleReject = async (report: Report) => {
    const note = prompt('Alasan reject (opsional):')
    
    setProcessing(report.id)
    
    await supabase.from('reports').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      review_note: note || null
    }).eq('id', report.id)
    
    setProcessing(null)
    fetchReports()
  }

  const handleEdit = (report: Report) => {
    setEditingId(report.id)
    setEditKategori(report.kategori)
  }

  const handleSaveEdit = async (report: Report) => {
    setProcessing(report.id)
    
    // Update report
    await supabase.from('reports').update({
      kategori: editKategori
    }).eq('id', report.id)
    
    // If already approved, also update blacklist
    if (report.status === 'approved') {
      await supabase.from('blacklist').update({
        kategori: editKategori
      }).eq('report_id', report.id)
    }
    
    setProcessing(null)
    setEditingId(null)
    fetchReports()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditKategori('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const pendingReports = reports.filter(r => r.status === 'pending')
    if (selectedIds.length === pendingReports.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingReports.map(r => r.id))
    }
  }

  const handleUnblacklist = async (report: Report) => {
    if (!confirm('Yakin unblacklist? Entry akan dihapus dari daftar publik.')) return
    
    setProcessing(report.id)
    
    // Remove from blacklist
    await supabase.from('blacklist').delete().eq('report_id', report.id)
    
    // Update report status to 'resolved'
    await supabase.from('reports').update({
      status: 'resolved',
      review_note: 'Unblacklisted - masalah sudah clear'
    }).eq('id', report.id)
    
    setProcessing(null)
    fetchReports()
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Yakin approve ${selectedIds.length} laporan sekaligus?`)) return

    setBulkProcessing(true)

    for (const id of selectedIds) {
      const report = reports.find(r => r.id === id)
      if (!report || report.status !== 'pending') continue

      // Check for existing entry
      const conditions = []
      if (report.nama) conditions.push(`nama.ilike.%${report.nama}%`)
      if (report.no_hp) conditions.push(`no_hp.eq.${report.no_hp}`)
      if (report.instagram) conditions.push(`instagram.ilike.${report.instagram}`)
      if (report.tiktok) conditions.push(`tiktok.ilike.${report.tiktok}`)
      
      const { data: existing } = await supabase
        .from('blacklist')
        .select('*')
        .or(conditions.join(','))
        .limit(1)

      if (existing && existing.length > 0) {
        const entry = existing[0]
        await supabase.from('blacklist').update({
          jumlah_laporan: (entry.jumlah_laporan || 1) + 1,
          alasan: entry.alasan + '\n\n---\n\n' + report.kronologi.substring(0, 500),
          updated_at: new Date().toISOString()
        }).eq('id', entry.id)
      } else {
        await supabase.from('blacklist').insert({
          report_id: report.id,
          nama: report.nama,
          no_hp: report.no_hp,
          instagram: report.instagram,
          tiktok: report.tiktok,
          kategori: report.kategori,
          alasan: report.kronologi.substring(0, 500),
          jumlah_laporan: 1
        })
      }

      await supabase.from('reports').update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      }).eq('id', id)
    }

    setBulkProcessing(false)
    setSelectedIds([])
    fetchReports()
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-500">Masuk untuk kelola laporan</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-4 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 text-base"
            />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
          <p className="text-xs text-gray-500">Kelola laporan masuk</p>
        </div>
        <button onClick={handleLogout} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
          Logout
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button 
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Semua
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          ⏳ Pending
        </button>
        <button 
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filter === 'approved' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700'
          }`}
        >
          ✅ Aktif
        </button>
        <button 
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700'
          }`}
        >
          ❌ Reject
        </button>
        <button 
          onClick={() => setFilter('resolved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            filter === 'resolved' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700'
          }`}
        >
          🔓 Clear
        </button>
      </div>

      {/* Kategori Filter */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setKategoriFilter('all')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
            kategoriFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Semua ({reports.length})
        </button>
        <button 
          onClick={() => setKategoriFilter('KOL')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
            kategoriFilter === 'KOL' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
          }`}
        >
          KOL ({reports.filter(r => r.kategori === 'KOL').length})
        </button>
        <button 
          onClick={() => setKategoriFilter('MG')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
            kategoriFilter === 'MG' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
          }`}
        >
          MG ({reports.filter(r => r.kategori === 'MG').length})
        </button>
      </div>

      {/* Bulk Actions */}
      {filter === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === reports.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium">Pilih Semua</span>
            </label>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {bulkProcessing ? '...' : `✅ Approve (${selectedIds.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <p className="text-center py-12 text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-500">Tidak ada laporan dengan status ini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {reports.map((report, index) => (
            <div key={report.id} className={`p-4 ${index !== reports.length - 1 ? 'border-b border-gray-100' : ''}`}>
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {report.status === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(report.id)}
                    onChange={() => toggleSelect(report.id)}
                    className="w-5 h-5 mt-0.5 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{report.nama}</h3>
                    {editingId === report.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={editKategori}
                          onChange={(e) => setEditKategori(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="KOL">KOL</option>
                          <option value="MG">MG</option>
                        </select>
                        <button onClick={() => handleSaveEdit(report)} disabled={processing === report.id} className="text-green-600 text-xs">✓</button>
                        <button onClick={handleCancelEdit} className="text-gray-500 text-xs">✕</button>
                      </div>
                    ) : (
                      <>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          report.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>{report.kategori}</span>
                        <button onClick={() => handleEdit(report)} className="text-blue-500 text-[10px]">✏️</button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.instagram && `@${report.instagram}`}
                    {report.instagram && report.no_hp && ' • '}
                    {report.no_hp}
                    {' • '}
                    {new Date(report.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Kronologi */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-700 line-clamp-3">{report.kronologi}</p>
              </div>

              {/* Info tambahan */}
              <div className="flex flex-wrap gap-2 text-[10px] mb-3">
                {report.bukti_url && (
                  <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    📎 Bukti
                  </a>
                )}
                {report.pelapor_nama && (
                  <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    👤 {report.pelapor_nama}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(report)}
                    disabled={processing === report.id}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98]"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(report)}
                    disabled={processing === report.id}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98]"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {report.status === 'approved' && (
                <button
                  onClick={() => handleUnblacklist(report)}
                  disabled={processing === report.id}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98]"
                >
                  🔓 Clear / Unblacklist
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
