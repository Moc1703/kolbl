'use client'

import { useState, useEffect } from 'react'
import { Report, IndikasiReport, FraudReport, AdminLog, IndikasiBanding, FraudBanding } from '@/lib/supabase'

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

/**
 * Escape special characters for Supabase PostgREST filter values
 * Prevents query injection via special characters like comma, period, parentheses
 */
function escapeFilterValue(value: string): string {
  return value.replace(/[,()."'\\]/g, '')
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null)
  const [activeTab, setActiveTab] = useState<'laporan' | 'banding' | 'indikasi' | 'fraud' | 'log' | 'users'>('laporan')
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
  // NEW: filters for indikasi/fraud/banding tabs
  const [indikasiFilter, setIndikasiFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [fraudFilter, setFraudFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [bandingFilter, setBandingFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  // NEW: indikasi/fraud banding management
  const [indikasiBandingList, setIndikasiBandingList] = useState<IndikasiBanding[]>([])
  const [fraudBandingList, setFraudBandingList] = useState<FraudBanding[]>([])
  // NEW: detail modals for indikasi/fraud
  const [selectedIndikasi, setSelectedIndikasi] = useState<IndikasiReport | null>(null)
  const [selectedFraud, setSelectedFraud] = useState<FraudReport | null>(null)
  // NEW: initial pending counts (before tabs are clicked)
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([])
  const [initialCounts, setInitialCounts] = useState({ reports: 0, banding: 0, indikasi: 0, fraud: 0 })
  const [copied, setCopied] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const confirmAction = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({ message, onConfirm: () => { setConfirmModal(null); resolve(true) } })
    })
  }

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

// Helper to call the protected admin API
  const adminApi = async (action: string, payload?: any) => {
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Request failed')
    }
    return res.json()
  }

  useEffect(() => {
    if (isLoggedIn) {
      const fetchCounts = async () => {
        try {
          const { data } = await adminApi('fetch_counts')
          setInitialCounts(data)
        } catch { /* ignore */ }
      }
      fetchCounts()

      if (activeTab === 'laporan') {
        fetchReports()
      } else if (activeTab === 'banding') {
        fetchBandingRequests()
      } else if (activeTab === 'indikasi') {
        fetchIndikasiReports()
        fetchIndikasiBanding()
      } else if (activeTab === 'fraud') {
        fetchFraudReports()
        fetchFraudBanding()
      } else if (activeTab === 'log') {
        fetchAdminLogs()
      } else if (activeTab === 'users') {
        fetchPendingAdmins()
      }
    }
  }, [isLoggedIn, filter, kategoriFilter, indikasiFilter, fraudFilter, bandingFilter, activeTab])

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
    } catch { setAdminLogs([]) }
    setLoading(false)
  }

  const logAction = async (action: string, targetType: string, targetId: string | null, details: string) => {
    if (!adminUser) return
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser.username, action, targetType, targetId, details })
      })
    } catch { /* ignore */ }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi('fetch_reports', { filter, kategoriFilter })
      setReports(data)
    } catch { setReports([]) }
    setLoading(false)
  }

  const fetchBandingRequests = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi('fetch_banding')
      setBandingRequests(data)
    } catch { setBandingRequests([]) }
    setLoading(false)
  }

  const fetchIndikasiReports = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi('fetch_indikasi', { filter: indikasiFilter })
      setIndikasiReports(data)
    } catch { setIndikasiReports([]) }
    setLoading(false)
  }

  const fetchFraudReports = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi('fetch_fraud', { filter: fraudFilter })
      setFraudReports(data)
    } catch { setFraudReports([]) }
    setLoading(false)
  }

  const fetchIndikasiBanding = async () => {
    try {
      const { data } = await adminApi('fetch_indikasi_banding')
      setIndikasiBandingList(data)
    } catch { setIndikasiBandingList([]) }
  }

  const fetchFraudBanding = async () => {
    try {
      const { data } = await adminApi('fetch_fraud_banding')
      setFraudBandingList(data)
    } catch { setFraudBandingList([]) }
  }

  const handleApproveIndikasi = async (report: IndikasiReport) => {
    if (!(await confirmAction('Yakin approve laporan indikasi ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('approve_indikasi', report)
      fetchIndikasiReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectIndikasi = async (report: IndikasiReport) => {
    if (!(await confirmAction('Yakin reject laporan ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('reject_indikasi', { id: report.id, nama: report.nama })
      fetchIndikasiReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleApproveFraud = async (report: FraudReport) => {
    if (!(await confirmAction('Yakin approve laporan fraud ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('approve_fraud', report)
      fetchFraudReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectFraud = async (report: FraudReport) => {
    if (!(await confirmAction('Yakin reject laporan ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('reject_fraud', { id: report.id, nama: report.nama })
      fetchFraudReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  // Unblacklist Indikasi
  const handleUnblacklistIndikasi = async (report: IndikasiReport) => {
    if (!(await confirmAction('Yakin clear/unblacklist indikasi ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('unblacklist_indikasi', { id: report.id, nama: report.nama, instagram: report.instagram })
      fetchIndikasiReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  // Unblacklist Fraud
  const handleUnblacklistFraud = async (report: FraudReport) => {
    if (!(await confirmAction('Yakin clear/unblacklist fraud ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('unblacklist_fraud', { id: report.id, nama: report.nama, instagram: report.instagram })
      fetchFraudReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  // Approve/Reject Indikasi Banding
  const handleApproveIndikasiBanding = async (req: IndikasiBanding) => {
    if (!(await confirmAction('Yakin approve banding indikasi ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('approve_indikasi_banding', req)
      fetchIndikasiBanding()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectIndikasiBanding = async (req: IndikasiBanding) => {
    if (!(await confirmAction('Yakin reject banding ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('reject_indikasi_banding', { id: req.id, nama: req.nama })
      fetchIndikasiBanding()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  // Approve/Reject Fraud Banding
  const handleApproveFraudBanding = async (req: FraudBanding) => {
    if (!(await confirmAction('Yakin approve banding fraud ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('approve_fraud_banding', req)
      fetchFraudBanding()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectFraudBanding = async (req: FraudBanding) => {
    if (!(await confirmAction('Yakin reject banding ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('reject_fraud_banding', { id: req.id, nama: req.nama })
      fetchFraudBanding()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleApproveBanding = async (req: UnblacklistRequest) => {
    if (!(await confirmAction('Yakin approve banding ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('approve_banding', req)
      fetchBandingRequests()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectBanding = async (req: UnblacklistRequest) => {
    if (!(await confirmAction('Yakin reject banding ini?'))) return
    setProcessing(req.id)
    try {
      await adminApi('reject_banding', { id: req.id, nama: req.nama })
      fetchBandingRequests()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleApprove = async (report: Report) => {
    if (!(await confirmAction('Yakin approve laporan ini? Akan masuk ke blacklist publik.'))) return
    setProcessing(report.id)
    try {
      await adminApi('approve_report', report)
      fetchReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleReject = async (report: Report) => {
    if (!(await confirmAction('Yakin reject laporan ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('reject_report', { id: report.id, nama: report.nama })
      fetchReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleEdit = (report: Report) => {
    setEditingReport(report.id)
    setEditFields({ nama: report.nama, no_hp: report.no_hp || '', instagram: report.instagram || '', tiktok: report.tiktok || '' })
  }

  const handleSaveEdit = async (report: Report) => {
    setProcessing(report.id)
    try {
      await adminApi('edit_report', {
        id: report.id,
        nama: editFields.nama,
        updates: {
          nama: editFields.nama,
          no_hp: editFields.no_hp || null,
          instagram: editFields.instagram || null,
          tiktok: editFields.tiktok || null
        }
      })
      setEditingReport(null)
      fetchReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleCancelEdit = () => {
    setEditingReport(null)
    setEditFields({ nama: '', no_hp: '', instagram: '', tiktok: '' })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
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
    if (!(await confirmAction('Yakin clear/unblacklist ini?'))) return
    setProcessing(report.id)
    try {
      await adminApi('unblacklist_report', { id: report.id, nama: report.nama, no_hp: report.no_hp, instagram: report.instagram })
      fetchReports()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    if (!(await confirmAction(`Yakin approve ${selectedIds.length} laporan sekaligus?`))) return
    setBulkProcessing(true)
    try {
      await adminApi('bulk_approve', { ids: selectedIds })
      setSelectedIds([])
      fetchReports()
    } catch (e: any) { console.error(e) }
    setBulkProcessing(false)
  }

  const fetchPendingAdmins = async () => {
    try {
      const { data } = await adminApi('fetch_pending_admins')
      setPendingAdmins(data)
    } catch { setPendingAdmins([]) }
  }

  const handleApproveAdmin = async (admin: any) => {
    if (!(await confirmAction('Yakin approve admin ini?'))) return
    setProcessing(admin.id)
    try {
      await adminApi('approve_admin', { id: admin.id, display_name: admin.display_name })
      fetchPendingAdmins()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleRejectAdmin = async (admin: any) => {
    if (!(await confirmAction('Yakin reject dan hapus admin ini?'))) return
    setProcessing(admin.id)
    try {
      await adminApi('reject_admin', { id: admin.id, display_name: admin.display_name })
      fetchPendingAdmins()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleDeactivateAdmin = async (admin: any) => {
    if (!(await confirmAction('Yakin nonaktifkan admin ini?'))) return
    setProcessing(admin.id)
    try {
      await adminApi('deactivate_admin', { id: admin.id, display_name: admin.display_name })
      fetchPendingAdmins()
    } catch (e: any) { console.error(e) }
    setProcessing(null)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setAdminUser(null)
  }

  const pendingReports = initialCounts.reports
  const pendingBanding = initialCounts.banding
  const pendingIndikasi = initialCounts.indikasi
  const pendingFraud = initialCounts.fraud
  const pendingIndikasiBanding = indikasiBandingList.filter(r => r.status === 'pending').length
  const pendingFraudBanding = fraudBandingList.filter(r => r.status === 'pending').length
  const totalPending = pendingReports + pendingBanding + pendingIndikasi + pendingFraud

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-sans bg-neutral-900">
        <div className="w-full max-w-sm relative">
          {/* Background Accent */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-700 blur opacity-10"></div>
          
          <div className="relative bg-neutral-950 border border-neutral-800 p-8 shadow-none rounded-sm">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-red-600 flex items-center justify-center text-2xl bg-neutral-950">
                <span className="text-red-500 font-black">B</span>
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-widest">KOLBL ADMIN</h1>
              <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest border-t border-neutral-800 pt-2 inline-block">Authorized Access Only</p>
            </div>

            {/* Login Card */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-widest">Operator ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-red-600 transition-colors text-sm font-mono rounded-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-widest">Passcode</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-red-600 transition-colors text-sm font-mono rounded-sm"
                />
              </div>
              {loginError && (
                <div className="bg-red-900/20 border border-red-800/50 px-3 py-2 text-xs text-red-600 font-mono rounded-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> <span>{loginError}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-4 bg-red-700 text-white font-black uppercase tracking-widest transition-colors hover:bg-red-800 active:bg-red-900 text-xs rounded-sm mt-2 shadow-none"
              >
                INITIALIZE SESSION
              </button>
            </form>

          <div className="mt-4 text-center">
            <a href="/admin/register" className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest hover:text-neutral-400 transition-colors">
              Belum punya akun? DAFTAR 
            </a>
          </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-red-600 selection:text-white pt-0 pb-20">
      {/* Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-4 pt-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-700"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-950 border border-red-800/50 flex items-center justify-center text-lg font-black text-red-600 rounded-sm shadow-none">
                {(adminUser?.display_name || adminUser?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">OPERATOR LOGIN</p>
                <p className="font-bold text-white text-sm">{adminUser?.display_name || adminUser?.username}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-neutral-950 border border-neutral-800 text-neutral-500 text-[10px] font-bold uppercase tracking-widest hover:border-red-800/50 hover:text-red-400 transition-colors rounded-sm shadow-none"
            >
              TERMINATE
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-sm shadow-none relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-2">ANTREAN LAPORAN</p>
              <div className="text-3xl font-black text-white pl-2">{pendingReports}</div>
            </div>
            
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-sm shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-2">ANTREAN BANDING</p>
              <div className="text-3xl font-black text-white pl-2">{pendingBanding}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-sm shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-2">ANTREAN INDIKASI</p>
              <div className="text-3xl font-black text-white pl-2">{(pendingIndikasi + pendingIndikasiBanding)}</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-sm shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1 pl-2">ANTREAN FRAUD</p>
              <div className="text-3xl font-black text-white pl-2">{(pendingFraud + pendingFraudBanding)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - overlaps header */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {['laporan', 'banding', 'indikasi', 'fraud', 'log', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors rounded-sm shadow-none border ${
                activeTab === tab 
                  ? 'bg-neutral-950 text-white border-neutral-800 border-b-2 border-b-red-600' 
                  : 'bg-neutral-950 border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              DIR: {tab}
            </button>
          ))}
        </div>

        {/* Laporan Tab */}
        {activeTab === 'laporan' && (
          <>
            {/* Filters */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 mb-4 rounded-sm shadow-none">
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 border-b border-neutral-800 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white border-neutral-800' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-500', activeStyles: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-500', activeStyles: 'bg-green-900/20 border-green-800/50 text-green-500' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/20 border-red-800/50 text-red-500' },
                  { key: 'resolved', label: '🔓 CLEAR', color: 'hover:text-orange-500', activeStyles: 'bg-orange-900/20 border-orange-800/50 text-orange-500' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border border-transparent rounded-sm ${
                      filter === f.key ? f.activeStyles : `text-neutral-500 ${f.color}`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['all', 'KOL', 'MG'].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKategoriFilter(k as typeof kategoriFilter)}
                    className={`flex-1 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors border ${
                      kategoriFilter === k
                        ? k === 'KOL' ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' : k === 'MG' ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-white text-neutral-950 border-neutral-200'
                        : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:bg-neutral-900 hover:text-neutral-300'
                    }`}
                  >
                    {k === 'all' ? `SEMUA (${reports.length})` : `${k} (${reports.filter(r => r.kategori === k).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {filter === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-blue-900/20 rounded-sm p-3 mb-4 border border-blue-800/50 shadow-none">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === reports.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded-sm accent-red-600 bg-neutral-950 border-neutral-700"
                    />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">PILIH SEMUA PENDING</span>
                  </label>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-green-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 transition-colors shadow-none"
                    >
                      {bulkProcessing ? 'MEMPROSES...' : `✅ APPROVE (${selectedIds.length})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reports */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center shadow-none">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DATA DOSSIER</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : report.status === 'rejected' ? '#ef4444' : '#f97316'}` }}>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {report.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelect(report.id)}
                            className="w-4 h-4 mt-0.5 rounded-sm accent-red-600 bg-neutral-950 border-neutral-700"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                            {editingId === report.id ? (
                              <div className="flex items-center gap-1">
                                <select value={editKategori} onChange={(e) => setEditKategori(e.target.value)} className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-white rounded-sm text-[10px] font-mono shadow-none">
                                  <option value="KOL">KOL</option>
                                  <option value="MG">MG</option>
                                </select>
                                <button onClick={() => handleSaveEdit(report)} disabled={processing === report.id} className="text-green-500 text-[10px] font-bold hover:text-green-500">✓ SAVE</button>
                                <button onClick={handleCancelEdit} className="text-neutral-500 text-[10px] hover:text-neutral-300">✕ CANCEL</button>
                              </div>
                            ) : (
                              <>
                                <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                                  report.kategori === 'KOL' ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' : 'bg-blue-900/20 text-blue-400 border-blue-800/50'
                                }`}>{report.kategori}</span>
                                <button onClick={() => handleEdit(report)} className="text-neutral-600 text-[10px] hover:text-blue-400">✏️</button>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest">
                            {report.instagram && `@${report.instagram}`}
                            {report.instagram && report.no_hp && ' ⚡ '}
                            {report.no_hp}
                            {' ⚡ '}
                            {new Date(report.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedReport(report)} className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-widest hover:text-red-500 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-3">
                        {report.bukti_url && (
                          <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI</a>
                        )}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                        {report.pelapor_kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 CONTACT</span>}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">
                            ✅ APPROVE
                          </button>
                          <button onClick={() => handleReject(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">
                            ❌ REJECT
                          </button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklist(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-800/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/30 transition-colors shadow-none">
                          🔓 CLEAR / UNBLACKLIST
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
            {/* Status Filter */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 mb-4 rounded-sm shadow-none">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white border-neutral-800' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-500', activeStyles: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' },
                  { key: 'approved', label: '✅ APPROVED', color: 'hover:text-green-500', activeStyles: 'bg-green-900/20 border-green-800/50 text-green-500' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/20 border-red-800/50 text-red-500' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setBandingFilter(f.key as typeof bandingFilter)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border border-transparent rounded-sm ${
                      bandingFilter === f.key ? f.activeStyles : `text-neutral-500 ${f.color}`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : bandingRequests.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center shadow-none">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DATA BANDING</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bandingRequests.map((req) => (
                  <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                    style={{ borderLeft: `3px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          req.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                          req.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                          'bg-red-900/20 border-red-800/50 text-red-500'
                        }`}>{req.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                        <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI CLEAR</a>}
                        {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                      </div>
                      <button
                        onClick={() => {
                          const text = `📋 *AJUAN BANDING*\nNama: ${req.nama}\n${req.no_hp ? `HP: ${req.no_hp}` : ''}${req.instagram ? `\nIG: @${req.instagram}` : ''}\n\n*Alasan Banding:*\n${req.alasan_banding}\n${req.bukti_clear ? `\nBukti: ${req.bukti_clear}` : ''}${req.kontak ? `\nKontak: ${req.kontak}` : ''}\n\n_Tanggal: ${new Date(req.created_at).toLocaleDateString('id-ID')}_`;
                          navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="w-full py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors mb-2"
                      >📋 COPY DATA BANDING</button>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">✅ APPROVE</button>
                          <button onClick={() => handleRejectBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">❌ REJECT</button>
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
            {/* Status Filter */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 mb-4 rounded-sm shadow-none">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white border-neutral-800' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-500', activeStyles: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-500', activeStyles: 'bg-green-900/20 border-green-800/50 text-green-500' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/20 border-red-800/50 text-red-500' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setIndikasiFilter(f.key as typeof indikasiFilter)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border border-transparent rounded-sm ${
                      indikasiFilter === f.key ? f.activeStyles : `text-neutral-500 ${f.color}`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            ) : indikasiReports.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center shadow-none">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DOSSIER INDIKASI</p>
              </div>
            ) : (
              <div className="space-y-3">
                {indikasiReports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border bg-amber-900/20 text-amber-500 border-amber-800/50">{report.kategori_masalah}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          report.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                          report.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                          'bg-red-900/20 border-red-800/50 text-red-500'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {report.instagram && `@${report.instagram}`}{report.instagram && report.no_hp && ' ⚡ '}{report.no_hp}{' ⚡ '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedIndikasi(report)} className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-widest hover:text-amber-500 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI</a>}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">✅ APPROVE</button>
                          <button onClick={() => handleRejectIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">❌ REJECT</button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklistIndikasi(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-800/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/30 transition-colors shadow-none">
                          🔓 CLEAR / UNBLACKLIST
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indikasi Banding Sub-section */}
            {indikasiBandingList.length > 0 && (
              <div className="mt-8 border-t border-neutral-800 pt-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                  ⚖️ BANDING INDIKASI
                  {pendingIndikasiBanding > 0 && <span className="w-4 h-4 bg-amber-600 text-white text-[9px] rounded-sm flex items-center justify-center font-black">{pendingIndikasiBanding}</span>}
                </h3>
                <div className="space-y-3">
                  {indikasiBandingList.map((req) => (
                    <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                      style={{ borderLeft: `3px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                            req.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                            req.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                            'bg-red-900/20 border-red-800/50 text-red-500'
                          }`}>{req.status}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                          {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                          <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                          <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                          {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI CLEAR</a>}
                          {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                        </div>
                        <button
                          onClick={() => {
                            const text = `📋 *BANDING INDIKASI*\nNama: ${req.nama}\n${req.no_hp ? `HP: ${req.no_hp}` : ''}${req.instagram ? `\nIG: @${req.instagram}` : ''}\n\n*Alasan Banding:*\n${req.alasan_banding}\n${req.bukti_clear ? `\nBukti: ${req.bukti_clear}` : ''}${req.kontak ? `\nKontak: ${req.kontak}` : ''}\n\n_Tanggal: ${new Date(req.created_at).toLocaleDateString('id-ID')}_`;
                            navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          }}
                          className="w-full py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors mb-2"
                        >📋 COPY DATA BANDING</button>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveIndikasiBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">✅ APPROVE</button>
                            <button onClick={() => handleRejectIndikasiBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">❌ REJECT</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fraud Tab */}
        {activeTab === 'fraud' && (
          <div>
            {/* Status Filter */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 mb-4 rounded-sm shadow-none">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white border-neutral-800' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-500', activeStyles: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-500', activeStyles: 'bg-green-900/20 border-green-800/50 text-green-500' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/20 border-red-800/50 text-red-500' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFraudFilter(f.key as typeof fraudFilter)}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border border-transparent rounded-sm ${
                      fraudFilter === f.key ? f.activeStyles : `text-neutral-500 ${f.color}`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : fraudReports.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center shadow-none">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DOSSIER FRAUD</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fraudReports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                    style={{ borderLeft: `3px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border bg-red-900/20 text-red-500 border-red-800/50">{report.jenis_fraud}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          report.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                          report.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                          'bg-red-900/20 border-red-800/50 text-red-500'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {report.nominal ? `RP ${report.nominal.toLocaleString('id-ID')}` : ''}
                        {report.nominal && report.instagram ? ' ⚡ ' : ''}
                        {report.instagram && `@${report.instagram}`}
                        {(report.instagram || report.nominal) && report.no_hp ? ' ⚡ ' : ''}
                        {report.no_hp}{' ⚡ '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedFraud(report)} className="text-[10px] text-red-600 font-bold mt-2 uppercase tracking-widest hover:text-red-500 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI</a>}
                        {report.metode_pembayaran && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">💳 {report.metode_pembayaran}</span>}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">✅ APPROVE</button>
                          <button onClick={() => handleRejectFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">❌ REJECT</button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklistFraud(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-800/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/30 transition-colors shadow-none">
                          🔓 CLEAR / UNBLACKLIST
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fraud Banding Sub-section */}
            {fraudBandingList.length > 0 && (
              <div className="mt-8 border-t border-neutral-800 pt-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                  ⚖️ BANDING FRAUD
                  {pendingFraudBanding > 0 && <span className="w-4 h-4 bg-red-600 text-white text-[9px] rounded-sm flex items-center justify-center font-black">{pendingFraudBanding}</span>}
                </h3>
                <div className="space-y-3">
                  {fraudBandingList.map((req) => (
                    <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900 transition-colors shadow-none"
                      style={{ borderLeft: `3px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                            req.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                            req.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                            'bg-red-900/20 border-red-800/50 text-red-500'
                          }`}>{req.status}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                          {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 mb-3">
                          <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                          <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                          {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-800/50 bg-blue-900/20 px-2 py-1 rounded-sm hover:bg-blue-900/30">📎 BUKTI CLEAR</a>}
                          {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                        </div>
                        <button
                          onClick={() => {
                            const text = `📋 *BANDING FRAUD*\nNama: ${req.nama}\n${req.no_hp ? `HP: ${req.no_hp}` : ''}${req.instagram ? `\nIG: @${req.instagram}` : ''}\n\n*Alasan Banding:*\n${req.alasan_banding}\n${req.bukti_clear ? `\nBukti: ${req.bukti_clear}` : ''}${req.kontak ? `\nKontak: ${req.kontak}` : ''}\n\n_Tanggal: ${new Date(req.created_at).toLocaleDateString('id-ID')}_`;
                            navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          }}
                          className="w-full py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors mb-2"
                        >📋 COPY DATA BANDING</button>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveFraudBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors shadow-none">✅ APPROVE</button>
                            <button onClick={() => handleRejectFraudBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors shadow-none">❌ REJECT</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-neutral-900 border border-neutral-800 p-4 mb-4 rounded-sm flex items-center justify-between">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">MANAGE ADMIN USERS</p>
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">{pendingAdmins.filter((a: any) => !a.is_active).length} PENDING</span>
            </div>
            {pendingAdmins.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">👥</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DATA ADMIN</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAdmins.map((admin: any) => (
                  <div key={admin.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative transition-colors"
                    style={{ borderLeft: `3px solid ${!admin.is_active ? '#eab308' : admin.role === 'superadmin' ? '#8b5cf6' : '#22c55e'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{admin.display_name || admin.username}</h3>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${!admin.is_active ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' : 'bg-green-900/20 border-green-800/50 text-green-500'}`}>{admin.is_active ? 'AKTIF' : 'PENDING'}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${admin.role === 'superadmin' ? 'bg-purple-900/20 border-purple-800/50 text-purple-400' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}>{admin.role}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-3">
                        @{admin.username} ⚡ {new Date(admin.created_at).toLocaleDateString('id-ID')}
                        {admin.last_login && ` ⚡ Last: ${new Date(admin.last_login).toLocaleDateString('id-ID')}`}
                      </p>
                      {!admin.is_active && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveAdmin(admin)} disabled={processing === admin.id} className="flex-1 py-2.5 bg-green-900/20 border border-green-800/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-900/30 transition-colors">✅ APPROVE</button>
                          <button onClick={() => handleRejectAdmin(admin)} disabled={processing === admin.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-800/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/30 transition-colors">❌ HAPUS</button>
                        </div>
                      )}
                      {admin.is_active && admin.role !== 'superadmin' && adminUser?.role === 'superadmin' && (
                        <button onClick={() => handleDeactivateAdmin(admin)} disabled={processing === admin.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-800/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/30 transition-colors">🚫 NONAKTIFKAN</button>
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
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-gray-500 rounded-full animate-spin"></div>
              </div>
            ) : adminLogs.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-12 text-center shadow-none">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA LOG AKTIVITAS</p>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden shadow-none">
                {adminLogs.map((log, index) => (
                  <div key={log.id} className={`p-4 flex items-start gap-3 hover:bg-neutral-900 transition-colors ${index !== adminLogs.length - 1 ? 'border-b border-neutral-800' : ''}`}>
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm flex-shrink-0 border ${
                      log.action.includes('approve') ? 'bg-green-900/20 text-green-500 border-green-800/50' :
                      log.action.includes('reject') ? 'bg-red-900/20 text-red-500 border-red-800/50' :
                      log.action === 'login' ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' :
                      log.action === 'login_failed' ? 'bg-red-900/20 text-red-500 border-red-800/50' :
                      log.action === 'logout' ? 'bg-neutral-800 text-neutral-500 border-neutral-800' :
                      'bg-purple-900/20 text-purple-400 border-purple-800/50'
                    }`}>
                      {log.action.includes('approve') ? '✅' :
                       log.action.includes('reject') ? '❌' :
                       log.action === 'login' ? '🔑' :
                       log.action === 'login_failed' ? '🚫' :
                       log.action === 'logout' ? '🚪' :
                       log.action.includes('bulk') ? '📦' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{log.admin_username}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase border ${
                          log.action.includes('approve') ? 'bg-green-900/20 text-green-500 border-green-800/50' :
                          log.action.includes('reject') ? 'bg-red-900/20 text-red-500 border-red-800/50' :
                          log.action === 'login' ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' :
                          log.action === 'login_failed' ? 'bg-red-900/20 text-red-500 border-red-800/50' :
                          'bg-neutral-800 text-neutral-500 border-neutral-800'
                        }`}>{log.action}</span>
                        {log.target_type && <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase bg-purple-900/20 text-purple-400 border border-purple-800/50">{log.target_type}</span>}
                      </div>
                      {log.details && <p className="text-[10px] text-neutral-500 mt-0.5 font-mono truncate">{log.details}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {log.ip_address && log.ip_address !== 'unknown' && (
                          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">• IP: {log.ip_address}</span>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
            <div className="bg-neutral-950 border border-neutral-700 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-none" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedReport.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedReport.kategori === 'KOL' ? 'bg-purple-900/30 text-purple-400 border-purple-800/50' : 'bg-blue-100 text-blue-400 border-blue-800/50'
                    }`}>{selectedReport.kategori}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedReport.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                      selectedReport.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                      'bg-red-900/20 border-red-800/50 text-red-500'
                    }`}>{selectedReport.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-8 h-8 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm shadow-none">&times;</button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                {/* Contact Info */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedReport.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedReport.no_hp}</span></div>}
                  {selectedReport.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedReport.instagram}</span></div>}
                  {selectedReport.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedReport.tiktok}</span></div>}
                  {selectedReport.asal_mg && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🏢</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedReport.asal_mg}</span></div>}
                </div>

                {/* Kronologi */}
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-4 shadow-none">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedReport.kronologi}</p>
                  </div>
                </div>

                {selectedReport.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedReport.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-900/20 border border-blue-800/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/30 transition-colors rounded-sm break-all shadow-none">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}

                {(selectedReport.pelapor_nama || selectedReport.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 border-b border-red-800/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-900/20 border border-red-800/50 rounded-sm p-4 space-y-2">
                      {selectedReport.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">NID:</span> {selectedReport.pelapor_nama}</p>}
                      {selectedReport.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">COM:</span> {selectedReport.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}

                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApprove(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-700 transition-colors shadow-none">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleReject(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-700 transition-colors shadow-none">❌ DENY [REJECT]</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Indikasi Detail Modal */}
        {selectedIndikasi && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedIndikasi(null)}>
            <div className="bg-neutral-950 border border-neutral-700 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-none" onClick={e => e.stopPropagation()}>
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedIndikasi.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-amber-900/20 text-amber-500 border-amber-800/50">{selectedIndikasi.kategori_masalah}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedIndikasi.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                      selectedIndikasi.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                      'bg-red-900/20 border-red-800/50 text-red-500'
                    }`}>{selectedIndikasi.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedIndikasi(null)} className="w-8 h-8 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm shadow-none">&times;</button>
              </div>
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedIndikasi.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedIndikasi.no_hp}</span></div>}
                  {selectedIndikasi.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedIndikasi.instagram}</span></div>}
                  {selectedIndikasi.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedIndikasi.tiktok}</span></div>}
                  {selectedIndikasi.asal_mg && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🏢</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedIndikasi.asal_mg}</span></div>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-4 shadow-none">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedIndikasi.kronologi}</p>
                  </div>
                </div>
                {selectedIndikasi.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedIndikasi.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-900/20 border border-blue-800/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/30 transition-colors rounded-sm break-all shadow-none">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}
                {(selectedIndikasi.pelapor_nama || selectedIndikasi.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 border-b border-red-800/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-900/20 border border-red-800/50 rounded-sm p-4 space-y-2">
                      {selectedIndikasi.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">NID:</span> {selectedIndikasi.pelapor_nama}</p>}
                      {selectedIndikasi.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">COM:</span> {selectedIndikasi.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}
                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedIndikasi.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {selectedIndikasi.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApproveIndikasi(selectedIndikasi); setSelectedIndikasi(null); }} disabled={processing === selectedIndikasi.id} className="flex-1 py-3 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-700 transition-colors shadow-none">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleRejectIndikasi(selectedIndikasi); setSelectedIndikasi(null); }} disabled={processing === selectedIndikasi.id} className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-700 transition-colors shadow-none">❌ DENY [REJECT]</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detail Modal */}
        {selectedFraud && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedFraud(null)}>
            <div className="bg-neutral-950 border border-neutral-700 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-none" onClick={e => e.stopPropagation()}>
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedFraud.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-red-900/20 text-red-500 border-red-800/50">{selectedFraud.jenis_fraud}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedFraud.status === 'pending' ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-500' :
                      selectedFraud.status === 'approved' ? 'bg-green-900/20 border-green-800/50 text-green-500' :
                      'bg-red-900/20 border-red-800/50 text-red-500'
                    }`}>{selectedFraud.status}</span>
                    {selectedFraud.nominal && <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-neutral-800 border-neutral-800 text-neutral-300">RP {selectedFraud.nominal.toLocaleString('id-ID')}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedFraud(null)} className="w-8 h-8 bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm shadow-none">&times;</button>
              </div>
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedFraud.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedFraud.no_hp}</span></div>}
                  {selectedFraud.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedFraud.instagram}</span></div>}
                  {selectedFraud.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedFraud.tiktok}</span></div>}
                  {selectedFraud.metode_pembayaran && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">💳</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedFraud.metode_pembayaran}</span></div>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-4 shadow-none">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedFraud.kronologi}</p>
                  </div>
                </div>
                {selectedFraud.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedFraud.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-900/20 border border-blue-800/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/30 transition-colors rounded-sm break-all shadow-none">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}
                {(selectedFraud.pelapor_nama || selectedFraud.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 border-b border-red-800/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-900/20 border border-red-800/50 rounded-sm p-4 space-y-2">
                      {selectedFraud.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">NID:</span> {selectedFraud.pelapor_nama}</p>}
                      {selectedFraud.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500 mr-2">COM:</span> {selectedFraud.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}
                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedFraud.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {selectedFraud.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApproveFraud(selectedFraud); setSelectedFraud(null); }} disabled={processing === selectedFraud.id} className="flex-1 py-3 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-700 transition-colors shadow-none">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleRejectFraud(selectedFraud); setSelectedFraud(null); }} disabled={processing === selectedFraud.id} className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-700 transition-colors shadow-none">❌ DENY [REJECT]</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </div>
            {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-neutral-900 border border-neutral-700 rounded-sm p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <p className="text-white text-sm font-bold mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors">BATAL</button>
              <button onClick={() => { confirmModal.onConfirm() }} className="flex-1 py-3 bg-red-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-800 transition-colors">YA, LANJUTKAN</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-neutral-900 border border-neutral-700 rounded-sm p-6 max-w-sm w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <p className="text-white text-sm font-bold mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-700 hover:text-white transition-colors">BATAL</button>
              <button onClick={() => { confirmModal.onConfirm() }} className="flex-1 py-3 bg-red-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-800 transition-colors">YA, LANJUTKAN</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-neutral-800 border border-neutral-700 text-white text-xs font-bold uppercase tracking-widest rounded-sm">
          Data disalin ke clipboard
        </div>
      )}
    </div>
  )
}
