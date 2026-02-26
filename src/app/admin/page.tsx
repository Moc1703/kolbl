'use client'

import { useState, useEffect } from 'react'
import { supabase, Report, IndikasiReport, FraudReport, AdminLog } from '@/lib/supabase'

interface UnblacklistRequest {
  id: string
  nama: string
  no_hp: string | null
  instagram: string | null
  alasan_banding: string
  bukti_clear: string | null
  kontak: string | null
  status: string
  created_at: string
}

interface AdminUserInfo {
  username: string
  display_name: string
  role: string
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null)
  const [activeTab, setActiveTab] = useState<'laporan' | 'banding' | 'indikasi' | 'fraud' | 'log'>('laporan')
  const [reports, setReports] = useState<Report[]>([])
  const [bandingRequests, setBandingRequests] = useState<UnblacklistRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'resolved' | 'all'>('pending')
  const [kategoriFilter, setKategoriFilter] = useState<'all' | 'KOL' | 'MG'>('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKategori, setEditKategori] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [indikasiReports, setIndikasiReports] = useState<IndikasiReport[]>([])
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([])

  useEffect(() => {
    // Check for admin_user cookie
    try {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const adminCookie = cookies.find(c => c.startsWith('admin_user='))
      if (adminCookie) {
        const value = decodeURIComponent(adminCookie.split('=').slice(1).join('='))
        const user = JSON.parse(value)
        if (user && user.username) {
          setAdminUser(user)
          setIsLoggedIn(true)
        }
      }
    } catch {
      // Cookie parse failed, stay logged out
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'laporan') {
        fetchReports()
      } else if (activeTab === 'banding') {
        fetchBandingRequests()
      } else if (activeTab === 'indikasi') {
        fetchIndikasiReports()
      } else if (activeTab === 'fraud') {
        fetchFraudReports()
      } else if (activeTab === 'log') {
        fetchAdminLogs()
      }
      // Load banding count for badge
      supabase.from('unblacklist_requests').select('*').then(({ data }) => {
        setBandingRequests(data || [])
      })
    }
  }, [isLoggedIn, filter, kategoriFilter, activeTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    
    if (res.ok) {
      const data = await res.json()
      setAdminUser(data.user)
      setIsLoggedIn(true)
      setPassword('')
      setUsername('')
    } else {
      const data = await res.json()
      setLoginError(data.error || 'Login gagal')
    }
  }

  const fetchAdminLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/logs')
      const data = await res.json()
      setAdminLogs(data.logs || [])
    } catch {
      setAdminLogs([])
    }
    setLoading(false)
  }

  const logAction = async (action: string, targetType: string, targetId: string | null, details: string) => {
    if (!adminUser) return
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUser.username,
          action,
          targetType,
          targetId,
          details
        })
      })
    } catch {
      // Don't break flow if logging fails
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

  const fetchBandingRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('unblacklist_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setBandingRequests(data || [])
    setLoading(false)
  }

  const fetchIndikasiReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('indikasi_reports')
      .select('*')
      .order('created_at', { ascending: false })
    setIndikasiReports(data || [])
    setLoading(false)
  }

  const fetchFraudReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('fraud_reports')
      .select('*')
      .order('created_at', { ascending: false })
    setFraudReports(data || [])
    setLoading(false)
  }

  const handleApproveIndikasi = async (report: IndikasiReport) => {
    if (!confirm('Yakin approve laporan indikasi ini?')) return
    setProcessing(report.id)

    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${report.nama}%`)
    if (report.instagram) conditions.push(`instagram.ilike.${report.instagram}`)

    const { data: existing } = conditions.length > 0 ? await supabase
      .from('indikasi_list').select('*').or(conditions.join(',')).limit(1) : { data: null }

    if (existing && existing.length > 0) {
      await supabase.from('indikasi_list').update({
        jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
        alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
        updated_at: new Date().toISOString()
      }).eq('id', existing[0].id)
    } else {
      await supabase.from('indikasi_list').insert({
        report_id: report.id,
        nama: report.nama,
        no_hp: report.no_hp,
        instagram: report.instagram,
        tiktok: report.tiktok,
        kategori_masalah: report.kategori_masalah,
        alasan: report.kronologi,
        jumlah_laporan: 1
      })
    }

    await supabase.from('indikasi_reports').update({
      status: 'approved', reviewed_at: new Date().toISOString()
    }).eq('id', report.id)

    await logAction('approve_indikasi', 'indikasi', report.id, `Approved indikasi: ${report.nama} (${report.kategori_masalah})`)
    setProcessing(null)
    fetchIndikasiReports()
  }

  const handleRejectIndikasi = async (report: IndikasiReport) => {
    if (!confirm('Yakin reject?')) return
    setProcessing(report.id)
    await supabase.from('indikasi_reports').update({
      status: 'rejected', reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    await logAction('reject_indikasi', 'indikasi', report.id, `Rejected indikasi: ${report.nama}`)
    setProcessing(null)
    fetchIndikasiReports()
  }

  const handleApproveFraud = async (report: FraudReport) => {
    if (!confirm('Yakin approve laporan fraud ini?')) return
    setProcessing(report.id)

    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${report.nama}%`)
    if (report.instagram) conditions.push(`instagram.ilike.${report.instagram}`)

    const { data: existing } = conditions.length > 0 ? await supabase
      .from('fraud_list').select('*').or(conditions.join(',')).limit(1) : { data: null }

    if (existing && existing.length > 0) {
      await supabase.from('fraud_list').update({
        jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
        nominal_total: (existing[0].nominal_total || 0) + (report.nominal || 0),
        alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
        updated_at: new Date().toISOString()
      }).eq('id', existing[0].id)
    } else {
      await supabase.from('fraud_list').insert({
        report_id: report.id,
        nama: report.nama,
        no_hp: report.no_hp,
        instagram: report.instagram,
        tiktok: report.tiktok,
        jenis_fraud: report.jenis_fraud,
        nominal_total: report.nominal || 0,
        alasan: report.kronologi,
        jumlah_laporan: 1
      })
    }

    await supabase.from('fraud_reports').update({
      status: 'approved', reviewed_at: new Date().toISOString()
    }).eq('id', report.id)

    await logAction('approve_fraud', 'fraud', report.id, `Approved fraud: ${report.nama} (${report.jenis_fraud})`)
    setProcessing(null)
    fetchFraudReports()
  }

  const handleRejectFraud = async (report: FraudReport) => {
    if (!confirm('Yakin reject?')) return
    setProcessing(report.id)
    await supabase.from('fraud_reports').update({
      status: 'rejected', reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    await logAction('reject_fraud', 'fraud', report.id, `Rejected fraud: ${report.nama}`)
    setProcessing(null)
    fetchFraudReports()
  }

  const handleApproveBanding = async (req: UnblacklistRequest) => {
    if (!confirm('Yakin approve banding ini? Orang ini akan dihapus dari blacklist.')) return
    
    setProcessing(req.id)
    
    // Find and delete from blacklist
    await supabase.from('blacklist').delete().or(
      `nama.ilike.%${req.nama}%,instagram.ilike.${req.instagram || ''},no_hp.eq.${req.no_hp || ''}`
    )
    
    // Update request status
    await supabase.from('unblacklist_requests').update({
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    
    // Also update related reports to resolved
    await supabase.from('reports').update({
      status: 'resolved'
    }).or(`nama.ilike.%${req.nama}%,instagram.ilike.${req.instagram || ''}`)
    
    await logAction('approve_banding', 'banding', req.id, `Approved banding: ${req.nama} — removed from blacklist`)
    setProcessing(null)
    fetchBandingRequests()
  }

  const handleRejectBanding = async (req: UnblacklistRequest) => {
    if (!confirm('Yakin reject banding ini?')) return
    
    setProcessing(req.id)
    
    await supabase.from('unblacklist_requests').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    
    await logAction('reject_banding', 'banding', req.id, `Rejected banding: ${req.nama}`)
    setProcessing(null)
    fetchBandingRequests()
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
        alasan: entry.alasan + '\n\n---\n\n' + report.kronologi,
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
        alasan: report.kronologi,
        jumlah_laporan: 1
      })
    }
    
    // Update report status
    await supabase.from('reports').update({
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }).eq('id', report.id)
    
    await logAction('approve_report', 'report', report.id, `Approved: ${report.nama} (${report.kategori})`)
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
    
    await logAction('reject_report', 'report', report.id, `Rejected: ${report.nama}${note ? ' — ' + note : ''}`)
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
    
    await logAction('approve_banding', 'report', report.id, `Unblacklisted: ${report.nama}`)
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
          alasan: entry.alasan + '\n\n---\n\n' + report.kronologi,
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
          alasan: report.kronologi,
          jumlah_laporan: 1
        })
      }

      await supabase.from('reports').update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      }).eq('id', id)
    }

    await logAction('bulk_approve', 'report', null, `Bulk approved ${selectedIds.length} reports`)
    setBulkProcessing(false)
    setSelectedIds([])
    fetchReports()
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setAdminUser(null)
  }

  const pendingReports = reports.filter(r => r.status === 'pending').length
  const pendingBanding = bandingRequests.filter(r => r.status === 'pending').length
  const pendingIndikasi = indikasiReports.filter(r => r.status === 'pending').length
  const pendingFraud = fraudReports.filter(r => r.status === 'pending').length
  const totalPending = pendingReports + pendingBanding + pendingIndikasi + pendingFraud

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #e94560, #c23152)', boxShadow: '0 8px 32px rgba(233, 69, 96, 0.4)' }}>
              🛡️
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Blacklist KOL/MG Indonesia</p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  className="w-full px-4 py-3.5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {loginError && (
                <div className="rounded-lg px-3 py-2 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  ⚠️ {loginError}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3.5 text-white font-semibold rounded-xl transition-all active:scale-[0.98] text-sm"
                style={{ background: 'linear-gradient(135deg, #e94560, #c23152)', boxShadow: '0 4px 20px rgba(233, 69, 96, 0.4)' }}
              >
                Masuk ke Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-4 pt-5 pb-16" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, #e94560, #c23152)' }}>
                {(adminUser?.display_name || adminUser?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base font-bold">Dashboard Admin</h1>
                <p className="text-xs text-gray-400">{adminUser?.display_name || adminUser?.username || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-2 rounded-lg transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Laporan', count: pendingReports, color: '#e94560' },
              { label: 'Banding', count: pendingBanding, color: '#f97316' },
              { label: 'Indikasi', count: pendingIndikasi, color: '#eab308' },
              { label: 'Fraud', count: pendingFraud, color: '#dc2626' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - overlaps header */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-1.5 mb-4 overflow-x-auto flex gap-1">
          {([
            { key: 'laporan', label: 'Laporan', icon: '📋', badge: pendingReports },
            { key: 'banding', label: 'Banding', icon: '🔓', badge: pendingBanding },
            { key: 'indikasi', label: 'Indikasi', icon: '⚠️', badge: pendingIndikasi },
            { key: 'fraud', label: 'Fraud', icon: '🚨', badge: pendingFraud },
            { key: 'log', label: 'Log', icon: '📋', badge: 0 },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap relative ${
                activeTab === tab.key
                  ? 'text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              style={activeTab === tab.key ? {
                background: tab.key === 'laporan' ? 'linear-gradient(135deg, #e94560, #c23152)' :
                            tab.key === 'banding' ? 'linear-gradient(135deg, #f97316, #ea580c)' :
                            tab.key === 'indikasi' ? 'linear-gradient(135deg, #eab308, #ca8a04)' :
                            tab.key === 'fraud' ? 'linear-gradient(135deg, #dc2626, #991b1b)' :
                            'linear-gradient(135deg, #374151, #1f2937)'
              } : {}}
            >
              <span>{tab.icon} {tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Laporan Tab */}
        {activeTab === 'laporan' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-3 mb-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
                {[
                  { key: 'all', label: 'Semua', color: 'bg-gray-800' },
                  { key: 'pending', label: '⏳ Pending', color: 'bg-yellow-500' },
                  { key: 'approved', label: '✅ Aktif', color: 'bg-green-500' },
                  { key: 'rejected', label: '❌ Reject', color: 'bg-red-500' },
                  { key: 'resolved', label: '🔓 Clear', color: 'bg-orange-500' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                      filter === f.key ? `${f.color} text-white shadow-sm` : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {['all', 'KOL', 'MG'].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKategoriFilter(k as typeof kategoriFilter)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      kategoriFilter === k
                        ? k === 'KOL' ? 'bg-purple-600 text-white' : k === 'MG' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
                        : k === 'KOL' ? 'bg-purple-50 text-purple-600' : k === 'MG' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {k === 'all' ? `Semua (${reports.length})` : `${k} (${reports.filter(r => r.kategori === k).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {filter === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-3 mb-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === reports.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded accent-blue-600"
                    />
                    <span className="text-sm font-medium text-blue-800">Pilih Semua</span>
                  </label>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 disabled:opacity-50 shadow-sm transition-all"
                    >
                      {bulkProcessing ? '...' : `✅ Approve (${selectedIds.length})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reports */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">Tidak ada laporan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : report.status === 'rejected' ? '#ef4444' : '#f97316'}` }}>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {report.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelect(report.id)}
                            className="w-5 h-5 mt-0.5 rounded accent-blue-600"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800 text-sm">{report.nama}</h3>
                            {editingId === report.id ? (
                              <div className="flex items-center gap-1">
                                <select value={editKategori} onChange={(e) => setEditKategori(e.target.value)} className="px-2 py-0.5 border border-gray-300 rounded text-xs">
                                  <option value="KOL">KOL</option>
                                  <option value="MG">MG</option>
                                </select>
                                <button onClick={() => handleSaveEdit(report)} disabled={processing === report.id} className="text-green-600 text-xs font-bold">✓</button>
                                <button onClick={handleCancelEdit} className="text-gray-400 text-xs">✕</button>
                              </div>
                            ) : (
                              <>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  report.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>{report.kategori}</span>
                                <button onClick={() => handleEdit(report)} className="text-gray-400 text-[10px] hover:text-blue-500">✏️</button>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {report.instagram && `@${report.instagram}`}
                            {report.instagram && report.no_hp && ' • '}
                            {report.no_hp}
                            {' • '}
                            {new Date(report.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-xs text-gray-700 line-clamp-2">{report.kronologi}</p>
                        <button onClick={() => setSelectedReport(report)} className="text-[11px] text-blue-600 font-medium mt-1.5 hover:underline">
                          📖 Baca Lengkap →
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                        {report.bukti_url && (
                          <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100">📎 Bukti</a>
                        )}
                        {report.pelapor_nama && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">👤 {report.pelapor_nama}</span>}
                        {report.pelapor_kontak && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">📞 {report.pelapor_kontak}</span>}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm hover:bg-green-700 transition-all">
                            ✅ Approve
                          </button>
                          <button onClick={() => handleReject(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm hover:bg-red-700 transition-all">
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklist(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">
                          🔓 Clear / Unblacklist
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Banding Tab */}
        {activeTab === 'banding' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            ) : bandingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">Belum ada ajuan banding</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bandingRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                    style={{ borderLeft: `3px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-800 text-sm">{req.nama}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{req.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' • '}{req.no_hp}{' • '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-orange-50 rounded-xl p-3 mb-3 border border-orange-100">
                        <p className="text-[10px] text-orange-600 font-semibold mb-1">Alasan Banding:</p>
                        <p className="text-xs text-gray-700">{req.alasan_banding}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                        {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">📎 Bukti Clear</a>}
                        {req.kontak && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">📞 {req.kontak}</span>}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">✅ Approve</button>
                          <button onClick={() => handleRejectBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">❌ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Indikasi Tab */}
        {activeTab === 'indikasi' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
              </div>
            ) : indikasiReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">Belum ada laporan indikasi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {indikasiReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-800 text-sm">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">{report.kategori_masalah}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          report.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {report.instagram && `@${report.instagram}`}{report.instagram && report.no_hp && ' • '}{report.no_hp}{' • '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-amber-50 rounded-xl p-3 mb-3 border border-amber-100">
                        <p className="text-xs text-gray-700 line-clamp-3">{report.kronologi}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">📎 Bukti</a>}
                        {report.pelapor_nama && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">✅ Approve</button>
                          <button onClick={() => handleRejectIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">❌ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Fraud Tab */}
        {activeTab === 'fraud' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : fraudReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">Belum ada laporan fraud</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fraudReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-800 text-sm">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700">{report.jenis_fraud}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          report.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {report.nominal ? `Rp ${report.nominal.toLocaleString('id-ID')}` : ''}
                        {report.nominal && report.instagram ? ' • ' : ''}
                        {report.instagram && `@${report.instagram}`}
                        {(report.instagram || report.nominal) && report.no_hp ? ' • ' : ''}
                        {report.no_hp}{' • '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-red-50 rounded-xl p-3 mb-3 border border-red-100">
                        <p className="text-xs text-gray-700 line-clamp-3">{report.kronologi}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] mb-3">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">📎 Bukti</a>}
                        {report.metode_pembayaran && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">💳 {report.metode_pembayaran}</span>}
                        {report.pelapor_nama && <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">✅ Approve</button>
                          <button onClick={() => handleRejectFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 active:scale-[0.98] shadow-sm transition-all">❌ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log Tab */}
        {activeTab === 'log' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            ) : adminLogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-400 text-sm">Belum ada log aktivitas</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {adminLogs.map((log, index) => (
                  <div key={log.id} className={`p-3.5 flex items-start gap-3 ${index !== adminLogs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                      log.action.includes('approve') ? 'bg-green-100' :
                      log.action.includes('reject') ? 'bg-red-100' :
                      log.action === 'login' ? 'bg-blue-100' :
                      log.action === 'login_failed' ? 'bg-red-100' :
                      log.action === 'logout' ? 'bg-gray-100' :
                      'bg-purple-100'
                    }`}>
                      {log.action.includes('approve') ? '✅' :
                       log.action.includes('reject') ? '❌' :
                       log.action === 'login' ? '🔑' :
                       log.action === 'login_failed' ? '🚫' :
                       log.action === 'logout' ? '🚪' :
                       log.action.includes('bulk') ? '📦' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-800">{log.admin_username}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          log.action.includes('approve') ? 'bg-green-100 text-green-700' :
                          log.action.includes('reject') ? 'bg-red-100 text-red-700' :
                          log.action === 'login' ? 'bg-blue-100 text-blue-700' :
                          log.action === 'login_failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{log.action}</span>
                        {log.target_type && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-50 text-purple-600">{log.target_type}</span>}
                      </div>
                      {log.details && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{log.details}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-300">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {log.ip_address && log.ip_address !== 'unknown' && (
                          <span className="text-[10px] text-gray-300">• {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedReport(null)}>
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-start rounded-t-3xl sm:rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedReport.nama}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedReport.kategori === 'KOL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>{selectedReport.kategori}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedReport.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>{selectedReport.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 text-lg">&times;</button>
              </div>

              <div className="p-5 space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {selectedReport.no_hp && <div className="flex items-center gap-2 text-sm"><span className="text-gray-400">📱</span> <span className="font-medium">{selectedReport.no_hp}</span></div>}
                  {selectedReport.instagram && <div className="flex items-center gap-2 text-sm"><span className="text-gray-400">📷</span> <span className="font-medium">@{selectedReport.instagram}</span></div>}
                  {selectedReport.tiktok && <div className="flex items-center gap-2 text-sm"><span className="text-gray-400">🎵</span> <span className="font-medium">@{selectedReport.tiktok}</span></div>}
                  {selectedReport.asal_mg && <div className="flex items-center gap-2 text-sm"><span className="text-gray-400">🏢</span> <span className="font-medium">{selectedReport.asal_mg}</span></div>}
                </div>

                {/* Kronologi */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold">📝 Kronologi Lengkap</p>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedReport.kronologi}</p>
                  </div>
                </div>

                {selectedReport.bukti_url && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-semibold">📎 Link Bukti</p>
                    <a href={selectedReport.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm break-all hover:underline">{selectedReport.bukti_url}</a>
                  </div>
                )}

                {(selectedReport.pelapor_nama || selectedReport.pelapor_kontak) && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 mb-2 font-semibold">👤 Data Pelapor (Rahasia)</p>
                    {selectedReport.pelapor_nama && <p className="text-sm">Nama: {selectedReport.pelapor_nama}</p>}
                    {selectedReport.pelapor_kontak && <p className="text-sm">Kontak: {selectedReport.pelapor_kontak}</p>}
                  </div>
                )}

                <p className="text-xs text-gray-300">
                  Dilaporkan: {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { handleApprove(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 shadow-sm">✅ Approve</button>
                    <button onClick={() => { handleReject(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50 shadow-sm">❌ Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </div>
    </div>
  )
}

