'use client'

import { useState, useEffect } from 'react'
import { supabase, Report } from '@/lib/supabase'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
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
  }, [isLoggedIn, filter])

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
    
    const { data } = await query
    setReports(data || [])
    setLoading(false)
  }

  const handleApprove = async (report: Report) => {
    if (!confirm('Yakin approve laporan ini? Akan masuk ke blacklist publik.')) return
    
    setProcessing(report.id)
    
    // Add to blacklist
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

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Yakin approve ${selectedIds.length} laporan sekaligus?`)) return

    setBulkProcessing(true)

    for (const id of selectedIds) {
      const report = reports.find(r => r.id === id)
      if (!report || report.status !== 'pending') continue

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔐 Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password admin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">📋 Admin</h1>
        <button onClick={handleLogout} className="text-red-600 hover:underline text-sm">
          Logout
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-3 mb-4 overflow-x-auto">
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg transition text-sm whitespace-nowrap ${
                filter === f 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'pending' && '⏳ Pending'}
              {f === 'approved' && '✅ OK'}
              {f === 'rejected' && '❌ Reject'}
              {f === 'all' && '📁 Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {filter === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === reports.filter(r => r.status === 'pending').length && selectedIds.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm">Pilih Semua</span>
          </label>
          {selectedIds.length > 0 && (
            <>
              <span className="text-sm text-gray-600">({selectedIds.length} dipilih)</span>
              <button
                onClick={handleBulkApprove}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {bulkProcessing ? 'Processing...' : `✅ Approve ${selectedIds.length} Laporan`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xl md:text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'pending').length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xl md:text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'approved').length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">Approved</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xl md:text-2xl font-bold text-red-600">
            {reports.filter(r => r.status === 'rejected').length}
          </p>
          <p className="text-xs md:text-sm text-gray-600">Rejected</p>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <p className="text-center py-12 text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-500">Tidak ada laporan dengan status ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  {report.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(report.id)}
                      onChange={() => toggleSelect(report.id)}
                      className="w-5 h-5 mt-1"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{report.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {editingId === report.id ? (
                      <>
                        <select
                          value={editKategori}
                          onChange={(e) => setEditKategori(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="KOL">KOL</option>
                          <option value="MG">MG</option>
                        </select>
                        <button
                          onClick={() => handleSaveEdit(report)}
                          disabled={processing === report.id}
                          className="text-green-600 text-sm hover:underline"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 text-sm hover:underline"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          report.kategori === 'KOL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {report.kategori}
                        </span>
                        <button
                          onClick={() => handleEdit(report)}
                          className="text-blue-500 text-xs hover:underline"
                        >
                          ✏️ Edit
                        </button>
                      </>
                    )}
                  </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm bg-gray-50 rounded-lg p-3">
                <div>
                  <span className="text-gray-500">📱 HP:</span>
                  <p className="font-medium">{report.no_hp || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">📷 IG:</span>
                  <p className="font-medium">{report.instagram ? `@${report.instagram}` : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">🎵 TikTok:</span>
                  <p className="font-medium">{report.tiktok ? `@${report.tiktok}` : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">📅 Tanggal:</span>
                  <p className="font-medium">{new Date(report.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Kronologi:</p>
                <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm">{report.kronologi}</p>
              </div>

              {report.bukti_url && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Bukti:</p>
                  <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {report.bukti_url}
                  </a>
                </div>
              )}

              {(report.pelapor_nama || report.pelapor_kontak) && (
                <div className="mb-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 mb-1">Data Pelapor (Rahasia):</p>
                  <p className="text-sm">Nama: {report.pelapor_nama || '-'}</p>
                  <p className="text-sm">Kontak: {report.pelapor_kontak || '-'}</p>
                </div>
              )}

              {report.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(report)}
                    disabled={processing === report.id}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleReject(report)}
                    disabled={processing === report.id}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {report.review_note && (
                <div className="mt-4 bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Catatan Review: {report.review_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
