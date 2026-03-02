'use client'

import { useState, useEffect } from 'react'
import { supabase, Report, IndikasiReport, FraudReport, AdminLog, IndikasiBanding, FraudBanding } from '@/lib/supabase'

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
  const [initialCounts, setInitialCounts] = useState({ reports: 0, banding: 0, indikasi: 0, fraud: 0 })

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
      // Fetch initial pending counts for all tabs
      const fetchCounts = async () => {
        const [r1, r2, r3, r4] = await Promise.all([
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('unblacklist_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('indikasi_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('fraud_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])
        setInitialCounts({
          reports: r1.count || 0,
          banding: r2.count || 0,
          indikasi: r3.count || 0,
          fraud: r4.count || 0
        })
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
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100)
    
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
    let query = supabase.from('unblacklist_requests').select('*').order('created_at', { ascending: false }).limit(100)
    if (bandingFilter !== 'all') query = query.eq('status', bandingFilter)
    const { data } = await query
    setBandingRequests(data || [])
    setLoading(false)
  }

  const fetchIndikasiReports = async () => {
    setLoading(true)
    let query = supabase.from('indikasi_reports').select('*').order('created_at', { ascending: false }).limit(100)
    if (indikasiFilter !== 'all') query = query.eq('status', indikasiFilter)
    const { data } = await query
    setIndikasiReports(data || [])
    setLoading(false)
  }

  const fetchFraudReports = async () => {
    setLoading(true)
    let query = supabase.from('fraud_reports').select('*').order('created_at', { ascending: false }).limit(100)
    if (fraudFilter !== 'all') query = query.eq('status', fraudFilter)
    const { data } = await query
    setFraudReports(data || [])
    setLoading(false)
  }

  const fetchIndikasiBanding = async () => {
    const { data } = await supabase.from('indikasi_banding').select('*').order('created_at', { ascending: false })
    setIndikasiBandingList(data || [])
  }

  const fetchFraudBanding = async () => {
    const { data } = await supabase.from('fraud_banding').select('*').order('created_at', { ascending: false })
    setFraudBandingList(data || [])
  }

  const handleApproveIndikasi = async (report: IndikasiReport) => {
    if (!confirm('Yakin approve laporan indikasi ini?')) return
    setProcessing(report.id)

    try {
      const conditions = []
      if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
      if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)

      let existing = null;
      if (conditions.length > 0) {
        const { data, error } = await supabase
          .from('indikasi_list').select('*').or(conditions.join(',')).limit(1)
        if (error) throw error;
        existing = data;
      }

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('indikasi_list').update({
          jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
          alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
          updated_at: new Date().toISOString()
        }).eq('id', existing[0].id)
        if (error) throw error;
      } else {
        const { error } = await supabase.from('indikasi_list').insert({
          report_id: report.id,
          nama: report.nama,
          no_hp: report.no_hp,
          instagram: report.instagram,
          tiktok: report.tiktok,
          kategori_masalah: report.kategori_masalah,
          alasan: report.kronologi,
          jumlah_laporan: 1
        })
        if (error) throw error;
      }

      const { error: updateError } = await supabase.from('indikasi_reports').update({
        status: 'approved', reviewed_at: new Date().toISOString()
      }).eq('id', report.id)
      if (updateError) throw updateError;

      await logAction('approve_indikasi', 'indikasi', report.id, `Approved indikasi: ${report.nama} (${report.kategori_masalah})`)
      fetchIndikasiReports()
    } catch (error: any) {
      console.error('Approve indikasi error:', error)
      alert(`Gagal approve: ${error.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setProcessing(null)
    }
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

    try {
      const conditions = []
      if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
      if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)

      let existing = null;
      if (conditions.length > 0) {
        const { data, error } = await supabase
          .from('fraud_list').select('*').or(conditions.join(',')).limit(1)
        if (error) throw error;
        existing = data;
      }

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('fraud_list').update({
          jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
          nominal_total: (existing[0].nominal_total || 0) + (report.nominal || 0),
          alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
          updated_at: new Date().toISOString()
        }).eq('id', existing[0].id)
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fraud_list').insert({
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
        if (error) throw error;
      }

      const { error: updateError } = await supabase.from('fraud_reports').update({
        status: 'approved', reviewed_at: new Date().toISOString()
      }).eq('id', report.id)
      if (updateError) throw updateError;

      await logAction('approve_fraud', 'fraud', report.id, `Approved fraud: ${report.nama} (${report.jenis_fraud})`)
      fetchFraudReports()
    } catch (error: any) {
      console.error('Approve fraud error:', error)
      alert(`Gagal approve: ${error.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setProcessing(null)
    }
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

  // NEW: Unblacklist Indikasi
  const handleUnblacklistIndikasi = async (report: IndikasiReport) => {
    if (!confirm('Yakin clear/unblacklist indikasi ini?')) return
    setProcessing(report.id)
    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
    if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)
    if (conditions.length > 0) {
      await supabase.from('indikasi_list').delete().or(conditions.join(','))
    }
    await supabase.from('indikasi_reports').update({
      status: 'resolved', review_note: 'Unblacklisted - masalah sudah clear'
    }).eq('id', report.id)
    await logAction('approve_banding', 'indikasi', report.id, `Unblacklisted indikasi: ${report.nama}`)
    setProcessing(null)
    fetchIndikasiReports()
  }

  // NEW: Unblacklist Fraud
  const handleUnblacklistFraud = async (report: FraudReport) => {
    if (!confirm('Yakin clear/unblacklist fraud ini?')) return
    setProcessing(report.id)
    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
    if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)
    if (conditions.length > 0) {
      await supabase.from('fraud_list').delete().or(conditions.join(','))
    }
    await supabase.from('fraud_reports').update({
      status: 'resolved', review_note: 'Unblacklisted - masalah sudah clear'
    }).eq('id', report.id)
    await logAction('approve_banding', 'fraud', report.id, `Unblacklisted fraud: ${report.nama}`)
    setProcessing(null)
    fetchFraudReports()
  }

  // NEW: Approve/Reject Indikasi Banding
  const handleApproveIndikasiBanding = async (req: IndikasiBanding) => {
    if (!confirm('Yakin approve banding indikasi ini?')) return
    setProcessing(req.id)
    const conditions = []
    if (req.nama) conditions.push(`nama.ilike.%${escapeFilterValue(req.nama)}%`)
    if (req.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(req.instagram)}`)
    if (conditions.length > 0) {
      await supabase.from('indikasi_list').delete().or(conditions.join(','))
    }
    await supabase.from('indikasi_banding').update({
      status: 'approved', reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    await logAction('approve_banding', 'indikasi', req.id, `Approved indikasi banding: ${req.nama}`)
    setProcessing(null)
    fetchIndikasiBanding()
  }

  const handleRejectIndikasiBanding = async (req: IndikasiBanding) => {
    if (!confirm('Yakin reject banding ini?')) return
    setProcessing(req.id)
    await supabase.from('indikasi_banding').update({
      status: 'rejected', reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    await logAction('reject_banding', 'indikasi', req.id, `Rejected indikasi banding: ${req.nama}`)
    setProcessing(null)
    fetchIndikasiBanding()
  }

  // NEW: Approve/Reject Fraud Banding
  const handleApproveFraudBanding = async (req: FraudBanding) => {
    if (!confirm('Yakin approve banding fraud ini?')) return
    setProcessing(req.id)
    const conditions = []
    if (req.nama) conditions.push(`nama.ilike.%${escapeFilterValue(req.nama)}%`)
    if (req.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(req.instagram)}`)
    if (conditions.length > 0) {
      await supabase.from('fraud_list').delete().or(conditions.join(','))
    }
    await supabase.from('fraud_banding').update({
      status: 'approved', reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    await logAction('approve_banding', 'fraud', req.id, `Approved fraud banding: ${req.nama}`)
    setProcessing(null)
    fetchFraudBanding()
  }

  const handleRejectFraudBanding = async (req: FraudBanding) => {
    if (!confirm('Yakin reject banding ini?')) return
    setProcessing(req.id)
    await supabase.from('fraud_banding').update({
      status: 'rejected', reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    await logAction('reject_banding', 'fraud', req.id, `Rejected fraud banding: ${req.nama}`)
    setProcessing(null)
    fetchFraudBanding()
  }

  const handleApproveBanding = async (req: UnblacklistRequest) => {
    if (!confirm('Yakin approve banding ini? Orang ini akan dihapus dari blacklist.')) return
    
    setProcessing(req.id)
    
    // Find and delete from blacklist
    await supabase.from('blacklist').delete().or(
      `nama.ilike.%${escapeFilterValue(req.nama)}%,instagram.ilike.${escapeFilterValue(req.instagram || '')},no_hp.eq.${escapeFilterValue(req.no_hp || '')}`
    )
    
    // Update request status
    await supabase.from('unblacklist_requests').update({
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }).eq('id', req.id)
    
    // Also update related reports to resolved
    await supabase.from('reports').update({
      status: 'resolved'
    }).or(`nama.ilike.%${escapeFilterValue(req.nama)}%,instagram.ilike.${escapeFilterValue(req.instagram || '')}`)
    
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
    
    try {
      // Check if already exists in blacklist (by name, phone, ig, or tiktok)
      const conditions = []
      if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
      if (report.no_hp) conditions.push(`no_hp.eq.${escapeFilterValue(report.no_hp)}`)
      if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)
      if (report.tiktok) conditions.push(`tiktok.ilike.${escapeFilterValue(report.tiktok)}`)
      
      let existing = null;
      if (conditions.length > 0) {
        const { data, error } = await supabase
          .from('blacklist')
          .select('*')
          .or(conditions.join(','))
          .limit(1)
        
        if (error) throw error;
        existing = data;
      }
      
      if (existing && existing.length > 0) {
        // Update existing entry - increment jumlah_laporan
        const entry = existing[0]
        const { error } = await supabase.from('blacklist').update({
          jumlah_laporan: (entry.jumlah_laporan || 1) + 1,
          alasan: entry.alasan + '\n\n---\n\n' + report.kronologi,
          updated_at: new Date().toISOString()
        }).eq('id', entry.id)
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase.from('blacklist').insert({
          report_id: report.id,
          nama: report.nama,
          no_hp: report.no_hp,
          instagram: report.instagram,
          tiktok: report.tiktok,
          kategori: report.kategori,
          alasan: report.kronologi,
          jumlah_laporan: 1
        })
        if (error) throw error;
      }
      
      // Update report status
      const { error: updateError } = await supabase.from('reports').update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      }).eq('id', report.id)
      if (updateError) throw updateError;
      
      await logAction('approve_report', 'report', report.id, `Approved: ${report.nama} (${report.kategori})`)
      fetchReports()
    } catch (error: any) {
      console.error('Approve error:', error)
      alert(`Gagal approve: ${error.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setProcessing(null)
    }
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
    
    // Remove from blacklist — match by multiple fields since report_id may differ for merged entries
    const conditions = []
    if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
    if (report.no_hp) conditions.push(`no_hp.eq.${escapeFilterValue(report.no_hp)}`)
    if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)
    if (report.tiktok) conditions.push(`tiktok.ilike.${escapeFilterValue(report.tiktok)}`)
    
    if (conditions.length > 0) {
      await supabase.from('blacklist').delete().or(conditions.join(','))
    }
    // Also try by report_id as fallback
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

    try {
      for (const id of selectedIds) {
        const report = reports.find(r => r.id === id)
        if (!report || report.status !== 'pending') continue

        // Check for existing entry
        const conditions = []
        if (report.nama) conditions.push(`nama.ilike.%${escapeFilterValue(report.nama)}%`)
        if (report.no_hp) conditions.push(`no_hp.eq.${escapeFilterValue(report.no_hp)}`)
        if (report.instagram) conditions.push(`instagram.ilike.${escapeFilterValue(report.instagram)}`)
        if (report.tiktok) conditions.push(`tiktok.ilike.${escapeFilterValue(report.tiktok)}`)
        
        let existing = null;
        if (conditions.length > 0) {
          const { data, error } = await supabase
            .from('blacklist')
            .select('*')
            .or(conditions.join(','))
            .limit(1)
          if (error) throw error;
          existing = data;
        }

        if (existing && existing.length > 0) {
          const entry = existing[0]
          const { error } = await supabase.from('blacklist').update({
            jumlah_laporan: (entry.jumlah_laporan || 1) + 1,
            alasan: entry.alasan + '\n\n---\n\n' + report.kronologi,
            updated_at: new Date().toISOString()
          }).eq('id', entry.id)
          if (error) throw error;
        } else {
          const { error } = await supabase.from('blacklist').insert({
            report_id: report.id,
            nama: report.nama,
            no_hp: report.no_hp,
            instagram: report.instagram,
            tiktok: report.tiktok,
            kategori: report.kategori,
            alasan: report.kronologi,
            jumlah_laporan: 1
          })
          if (error) throw error;
        }

        const { error: updateError } = await supabase.from('reports').update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        }).eq('id', id)
        if (updateError) throw updateError;
      }

      await logAction('bulk_approve', 'report', null, `Bulk approved ${selectedIds.length} reports`)
      setSelectedIds([])
      fetchReports()
    } catch (error: any) {
      console.error('Bulk approve error:', error)
      alert(`Gagal approve beberapa laporan: ${error.message || 'Terjadi kesalahan sistem'}`)
    } finally {
      setBulkProcessing(false)
    }
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
      <div className="min-h-screen flex items-center justify-center px-4 font-sans bg-black">
        <div className="w-full max-w-sm relative">
          {/* Background Accent */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 blur opacity-20"></div>
          
          <div className="relative bg-neutral-950 border border-neutral-800 p-8 shadow-2xl rounded-sm">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-red-600 flex items-center justify-center text-2xl bg-black">
                <span className="text-red-600 font-black">B</span>
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-widest">KOLBL ADMIN</h1>
              <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest border-t border-neutral-800 pt-2 inline-block">Authorized Access Only</p>
            </div>

            {/* Login Card */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 mb-1.5 uppercase tracking-widest">Operator ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-black border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-red-600 transition-colors text-sm font-mono rounded-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 mb-1.5 uppercase tracking-widest">Passcode</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-black border border-neutral-800 text-white placeholder-neutral-700 focus:outline-none focus:border-red-600 transition-colors text-sm font-mono rounded-sm"
                />
              </div>
              {loginError && (
                <div className="bg-red-950/50 border border-red-900/50 px-3 py-2 text-xs text-red-500 font-mono rounded-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span> <span>{loginError}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-4 bg-red-700 text-white font-black uppercase tracking-widest transition-colors hover:bg-neutral-100 hover:text-black active:bg-neutral-300 text-xs rounded-sm mt-2"
              >
                INITIALIZE SESSION
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans selection:bg-red-900/50 pb-20">
      {/* Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-4 pt-6 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black border border-red-800 flex items-center justify-center text-lg font-black text-red-500 rounded-sm">
                {(adminUser?.display_name || adminUser?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">COMMAND CENTER</h1>
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">OP: {adminUser?.display_name || adminUser?.username || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors rounded-sm"
            >
              TERMINATE
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'LAPORAN', count: pendingReports, color: 'text-red-500', border: 'border-red-900/30', bg: 'bg-red-950/10' },
              { label: 'BANDING', count: pendingBanding, color: 'text-orange-500', border: 'border-orange-900/30', bg: 'bg-orange-950/10' },
              { label: 'INDIKASI', count: pendingIndikasi, color: 'text-amber-500', border: 'border-amber-900/30', bg: 'bg-amber-950/10' },
              { label: 'FRAUD', count: pendingFraud, color: 'text-rose-500', border: 'border-rose-900/30', bg: 'bg-rose-950/10' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-sm p-4 text-center border ${stat.border} ${stat.bg} shadow-md relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-neutral-800"></div>
                <p className={`text-2xl md:text-3xl font-black ${stat.color} font-mono leading-none mb-1 md:mb-2`}>{stat.count}</p>
                <p className="text-[9px] md:text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - overlaps header */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-neutral-900 border border-neutral-800 p-1 mb-6 flex overflow-x-auto rounded-sm scrollbar-hide">
          {([
            { key: 'laporan', label: 'LAPORAN', icon: '📋', badge: pendingReports },
            { key: 'banding', label: 'BANDING', icon: '🔓', badge: pendingBanding },
            { key: 'indikasi', label: 'INDIKASI', icon: '⚠️', badge: pendingIndikasi },
            { key: 'fraud', label: 'FRAUD', icon: '🚨', badge: pendingFraud },
            { key: 'log', label: 'SYS LOG', icon: '🖥️', badge: 0 },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[100px] py-3 px-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap relative rounded-sm flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-950 hover:text-neutral-300'
              }`}
            >
              <span>{tab.icon} {tab.label}</span>
              {tab.badge > 0 && (
                <span className="w-4 h-4 bg-red-600 text-white text-[9px] flex items-center justify-center font-black ml-1 rounded-sm">
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
            <div className="bg-neutral-900 border border-neutral-800 p-3 mb-4 rounded-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 border-b border-neutral-800 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-400', activeStyles: 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-400', activeStyles: 'bg-green-900/30 text-green-500 border-green-900/50' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/30 text-red-500 border-red-900/50' },
                  { key: 'resolved', label: '🔓 CLEAR', color: 'hover:text-orange-400', activeStyles: 'bg-orange-900/30 text-orange-500 border-orange-900/50' },
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
                        ? k === 'KOL' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : k === 'MG' ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' : 'bg-neutral-800 text-white border-neutral-700'
                        : 'bg-black text-neutral-500 border-neutral-800 hover:bg-neutral-950 hover:text-neutral-300'
                    }`}
                  >
                    {k === 'all' ? `SEMUA (${reports.length})` : `${k} (${reports.filter(r => r.kategori === k).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {filter === 'pending' && reports.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-blue-950/20 rounded-sm p-3 mb-4 border border-blue-900/30">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === reports.filter(r => r.status === 'pending').length && selectedIds.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded-sm accent-red-600 bg-neutral-900 border-neutral-700"
                    />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">PILIH SEMUA PENDING</span>
                  </label>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkProcessing}
                      className="px-4 py-2 bg-green-700 text-black rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-green-600 disabled:opacity-50 transition-colors"
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DATA DOSSIER</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                    style={{ borderLeft: `2px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : report.status === 'rejected' ? '#ef4444' : '#f97316'}` }}>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {report.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelect(report.id)}
                            className="w-4 h-4 mt-0.5 rounded-sm accent-red-600 bg-black border-neutral-700"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                            {editingId === report.id ? (
                              <div className="flex items-center gap-1">
                                <select value={editKategori} onChange={(e) => setEditKategori(e.target.value)} className="px-2 py-0.5 bg-black border border-neutral-700 text-white rounded-sm text-[10px] font-mono">
                                  <option value="KOL">KOL</option>
                                  <option value="MG">MG</option>
                                </select>
                                <button onClick={() => handleSaveEdit(report)} disabled={processing === report.id} className="text-green-500 text-[10px] font-bold hover:text-green-400">✓ SAVE</button>
                                <button onClick={handleCancelEdit} className="text-neutral-500 text-[10px] hover:text-neutral-400">✕ CANCEL</button>
                              </div>
                            ) : (
                              <>
                                <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                                  report.kategori === 'KOL' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-blue-900/30 text-blue-400 border-blue-900/50'
                                }`}>{report.kategori}</span>
                                <button onClick={() => handleEdit(report)} className="text-neutral-500 text-[10px] hover:text-blue-500">✏️</button>
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

                      <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedReport(report)} className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest hover:text-red-400 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-3">
                        {report.bukti_url && (
                          <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI</a>
                        )}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                        {report.pelapor_kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 CONTACT</span>}
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">
                            ✅ APPROVE
                          </button>
                          <button onClick={() => handleReject(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">
                            ❌ REJECT
                          </button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklist(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-900/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/40 transition-colors">
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
            <div className="bg-neutral-900 border border-neutral-800 p-3 mb-4 rounded-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-400', activeStyles: 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' },
                  { key: 'approved', label: '✅ APPROVED', color: 'hover:text-green-400', activeStyles: 'bg-green-900/30 text-green-500 border-green-900/50' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/30 text-red-500 border-red-900/50' },
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
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : bandingRequests.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DATA BANDING</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bandingRequests.map((req) => (
                  <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                    style={{ borderLeft: `2px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          req.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                          req.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                          'bg-red-900/30 text-red-500 border-red-900/50'
                        }`}>{req.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                        <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI CLEAR</a>}
                        {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">✅ APPROVE</button>
                          <button onClick={() => handleRejectBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">❌ REJECT</button>
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
            <div className="bg-neutral-900 border border-neutral-800 p-3 mb-4 rounded-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-400', activeStyles: 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-400', activeStyles: 'bg-green-900/30 text-green-500 border-green-900/50' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/30 text-red-500 border-red-900/50' },
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DOSSIER INDIKASI</p>
              </div>
            ) : (
              <div className="space-y-3">
                {indikasiReports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                    style={{ borderLeft: `2px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border bg-amber-900/30 text-amber-500 border-amber-900/50">{report.kategori_masalah}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          report.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                          report.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                          'bg-red-900/30 text-red-500 border-red-900/50'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {report.instagram && `@${report.instagram}`}{report.instagram && report.no_hp && ' ⚡ '}{report.no_hp}{' ⚡ '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedIndikasi(report)} className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-widest hover:text-amber-400 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI</a>}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">✅ APPROVE</button>
                          <button onClick={() => handleRejectIndikasi(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">❌ REJECT</button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklistIndikasi(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-900/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/40 transition-colors">
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
                    <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                      style={{ borderLeft: `2px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                            req.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                            req.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                            'bg-red-900/30 text-red-500 border-red-900/50'
                          }`}>{req.status}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                          {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                          <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                          <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                          {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI CLEAR</a>}
                          {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveIndikasiBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">✅ APPROVE</button>
                            <button onClick={() => handleRejectIndikasiBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">❌ REJECT</button>
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
            <div className="bg-neutral-900 border border-neutral-800 p-3 mb-4 rounded-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { key: 'all', label: 'SEMUA', color: 'hover:text-white', activeStyles: 'bg-neutral-800 text-white' },
                  { key: 'pending', label: '⏳ PENDING', color: 'hover:text-yellow-400', activeStyles: 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' },
                  { key: 'approved', label: '✅ AKTIF', color: 'hover:text-green-400', activeStyles: 'bg-green-900/30 text-green-500 border-green-900/50' },
                  { key: 'rejected', label: '❌ REJECTED', color: 'hover:text-red-400', activeStyles: 'bg-red-900/30 text-red-500 border-red-900/50' },
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
              <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA DOSSIER FRAUD</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fraudReports.map((report) => (
                  <div key={report.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                    style={{ borderLeft: `2px solid ${report.status === 'pending' ? '#eab308' : report.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{report.nama}</h3>
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border bg-red-900/30 text-red-500 border-red-900/50">{report.jenis_fraud}</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                          report.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                          report.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                          'bg-red-900/30 text-red-500 border-red-900/50'
                        }`}>{report.status}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                        {report.nominal ? `RP ${report.nominal.toLocaleString('id-ID')}` : ''}
                        {report.nominal && report.instagram ? ' ⚡ ' : ''}
                        {report.instagram && `@${report.instagram}`}
                        {(report.instagram || report.nominal) && report.no_hp ? ' ⚡ ' : ''}
                        {report.no_hp}{' ⚡ '}{new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                        <p className="text-xs text-neutral-400 line-clamp-2 font-serif italic">{report.kronologi}</p>
                        <button onClick={() => setSelectedFraud(report)} className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest hover:text-red-400 transition-colors">
                          BACA DOSSIER →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                        {report.bukti_url && <a href={report.bukti_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI</a>}
                        {report.metode_pembayaran && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">💳 {report.metode_pembayaran}</span>}
                        {report.pelapor_nama && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">👤 {report.pelapor_nama}</span>}
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">✅ APPROVE</button>
                          <button onClick={() => handleRejectFraud(report)} disabled={processing === report.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">❌ REJECT</button>
                        </div>
                      )}
                      {report.status === 'approved' && (
                        <button onClick={() => handleUnblacklistFraud(report)} disabled={processing === report.id} className="w-full py-2.5 bg-orange-900/20 border border-orange-900/50 text-orange-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-orange-900/40 transition-colors">
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
                    <div key={req.id} className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden relative hover:bg-neutral-900/50 transition-colors"
                      style={{ borderLeft: `2px solid ${req.status === 'pending' ? '#eab308' : req.status === 'approved' ? '#22c55e' : '#ef4444'}` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{req.nama}</h3>
                          <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border ${
                            req.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                            req.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                            'bg-red-900/30 text-red-500 border-red-900/50'
                          }`}>{req.status}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest mb-3">
                          {req.instagram && `@${req.instagram}`}{req.instagram && req.no_hp && ' ⚡ '}{req.no_hp}{' ⚡ '}{new Date(req.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <div className="bg-black border border-neutral-800 rounded-sm p-3 mb-3">
                          <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-1.5">ALASAN BANDING:</p>
                          <p className="text-xs text-neutral-400 font-serif italic">{req.alasan_banding}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase tracking-widest mb-4">
                          {req.bukti_clear && <a href={req.bukti_clear} target="_blank" rel="noopener noreferrer" className="text-blue-400 border border-blue-900/50 bg-blue-950/20 px-2 py-1 rounded-sm hover:bg-blue-900/40">📎 BUKTI CLEAR</a>}
                          {req.kontak && <span className="text-neutral-400 border border-neutral-800 bg-neutral-900 px-2 py-1 rounded-sm">📞 {req.kontak}</span>}
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveFraudBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-green-700/20 border border-green-700/50 text-green-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-green-700/40 transition-colors">✅ APPROVE</button>
                            <button onClick={() => handleRejectFraudBanding(req)} disabled={processing === req.id} className="flex-1 py-2.5 bg-red-900/20 border border-red-900/50 text-red-500 rounded-sm text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-red-900/40 transition-colors">❌ REJECT</button>
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

        {/* Log Tab */}
        {activeTab === 'log' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-neutral-800 border-t-neutral-500 rounded-full animate-spin"></div>
              </div>
            ) : adminLogs.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-12 text-center">
                <p className="text-3xl mb-2 opacity-50">📭</p>
                <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">TIDAK ADA LOG AKTIVITAS</p>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden">
                {adminLogs.map((log, index) => (
                  <div key={log.id} className={`p-4 flex items-start gap-3 hover:bg-neutral-900/50 transition-colors ${index !== adminLogs.length - 1 ? 'border-b border-neutral-800' : ''}`}>
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm flex-shrink-0 border ${
                      log.action.includes('approve') ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                      log.action.includes('reject') ? 'bg-red-900/30 text-red-500 border-red-900/50' :
                      log.action === 'login' ? 'bg-blue-900/30 text-blue-500 border-blue-900/50' :
                      log.action === 'login_failed' ? 'bg-red-900/30 text-red-500 border-red-900/50' :
                      log.action === 'logout' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                      'bg-purple-900/30 text-purple-500 border-purple-900/50'
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
                          log.action.includes('approve') ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                          log.action.includes('reject') ? 'bg-red-900/30 text-red-500 border-red-900/50' :
                          log.action === 'login' ? 'bg-blue-900/30 text-blue-500 border-blue-900/50' :
                          log.action === 'login_failed' ? 'bg-red-900/30 text-red-500 border-red-900/50' :
                          'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}>{log.action}</span>
                        {log.target_type && <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase bg-purple-900/30 text-purple-400 border border-purple-900/50">{log.target_type}</span>}
                      </div>
                      {log.details && <p className="text-[10px] text-neutral-400 mt-0.5 font-mono truncate">{log.details}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {log.ip_address && log.ip_address !== 'unknown' && (
                          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">• IP: {log.ip_address}</span>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
            <div className="bg-neutral-950 border border-neutral-800 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedReport.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedReport.kategori === 'KOL' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-blue-900/30 text-blue-400 border-blue-900/50'
                    }`}>{selectedReport.kategori}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedReport.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                      selectedReport.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                      'bg-red-900/30 text-red-500 border-red-900/50'
                    }`}>{selectedReport.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-8 h-8 bg-black border border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm">&times;</button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                {/* Contact Info */}
                <div className="bg-black border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedReport.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedReport.no_hp}</span></div>}
                  {selectedReport.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedReport.instagram}</span></div>}
                  {selectedReport.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedReport.tiktok}</span></div>}
                  {selectedReport.asal_mg && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🏢</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedReport.asal_mg}</span></div>}
                </div>

                {/* Kronologi */}
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedReport.kronologi}</p>
                  </div>
                </div>

                {selectedReport.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedReport.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/40 transition-colors rounded-sm break-all">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}

                {(selectedReport.pelapor_nama || selectedReport.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-900/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-950/10 border border-red-900/30 rounded-sm p-4 space-y-2">
                      {selectedReport.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">NID:</span> {selectedReport.pelapor_nama}</p>}
                      {selectedReport.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">COM:</span> {selectedReport.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}

                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApprove(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-green-700 text-black font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-600 transition-colors">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleReject(selectedReport); setSelectedReport(null); }} disabled={processing === selectedReport.id} className="flex-1 py-3 bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-600 transition-colors">❌ DENY [REJECT]</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Indikasi Detail Modal */}
        {selectedIndikasi && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedIndikasi(null)}>
            <div className="bg-neutral-950 border border-neutral-800 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedIndikasi.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-amber-900/30 text-amber-500 border-amber-900/50">{selectedIndikasi.kategori_masalah}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedIndikasi.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                      selectedIndikasi.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                      'bg-red-900/30 text-red-500 border-red-900/50'
                    }`}>{selectedIndikasi.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedIndikasi(null)} className="w-8 h-8 bg-black border border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm">&times;</button>
              </div>
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                <div className="bg-black border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedIndikasi.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedIndikasi.no_hp}</span></div>}
                  {selectedIndikasi.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedIndikasi.instagram}</span></div>}
                  {selectedIndikasi.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedIndikasi.tiktok}</span></div>}
                  {selectedIndikasi.asal_mg && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🏢</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedIndikasi.asal_mg}</span></div>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedIndikasi.kronologi}</p>
                  </div>
                </div>
                {selectedIndikasi.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedIndikasi.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/40 transition-colors rounded-sm break-all">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}
                {(selectedIndikasi.pelapor_nama || selectedIndikasi.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-900/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-950/10 border border-red-900/30 rounded-sm p-4 space-y-2">
                      {selectedIndikasi.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">NID:</span> {selectedIndikasi.pelapor_nama}</p>}
                      {selectedIndikasi.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">COM:</span> {selectedIndikasi.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}
                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedIndikasi.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {selectedIndikasi.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApproveIndikasi(selectedIndikasi); setSelectedIndikasi(null); }} disabled={processing === selectedIndikasi.id} className="flex-1 py-3 bg-green-700 text-black font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-600 transition-colors">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleRejectIndikasi(selectedIndikasi); setSelectedIndikasi(null); }} disabled={processing === selectedIndikasi.id} className="flex-1 py-3 bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-600 transition-colors">❌ DENY [REJECT]</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detail Modal */}
        {selectedFraud && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedFraud(null)}>
            <div className="bg-neutral-950 border border-neutral-800 rounded-sm w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="border-b border-neutral-800 px-5 py-4 flex justify-between items-start bg-neutral-900 shrinks-0">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">{selectedFraud.nama}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-red-900/30 text-red-500 border-red-900/50">{selectedFraud.jenis_fraud}</span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                      selectedFraud.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50' :
                      selectedFraud.status === 'approved' ? 'bg-green-900/30 text-green-500 border-green-900/50' :
                      'bg-red-900/30 text-red-500 border-red-900/50'
                    }`}>{selectedFraud.status}</span>
                    {selectedFraud.nominal && <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border bg-neutral-800 border-neutral-700 text-neutral-300">RP {selectedFraud.nominal.toLocaleString('id-ID')}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedFraud(null)} className="w-8 h-8 bg-black border border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors text-lg rounded-sm">&times;</button>
              </div>
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                <div className="bg-black border border-neutral-800 rounded-sm p-4 space-y-3">
                  {selectedFraud.no_hp && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📱</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedFraud.no_hp}</span></div>}
                  {selectedFraud.instagram && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">📷</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedFraud.instagram}</span></div>}
                  {selectedFraud.tiktok && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">🎵</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">@{selectedFraud.tiktok}</span></div>}
                  {selectedFraud.metode_pembayaran && <div className="flex items-center gap-3"><span className="text-neutral-500 text-xs">💳</span> <span className="font-mono text-neutral-300 tracking-wider text-[11px] uppercase">{selectedFraud.metode_pembayaran}</span></div>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📝 DOSSIER KRONOLOGI</p>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed font-serif">{selectedFraud.kronologi}</p>
                  </div>
                </div>
                {selectedFraud.bukti_url && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 border-b border-neutral-800 pb-1 w-max">📎 BUKTI LAMPIRAN</p>
                    <a href={selectedFraud.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 text-[10px] font-mono tracking-widest uppercase hover:bg-blue-900/40 transition-colors rounded-sm break-all">BUKA TAUTAN BUKTI →</a>
                  </div>
                )}
                {(selectedFraud.pelapor_nama || selectedFraud.pelapor_kontak) && (
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-red-900/50 pb-1 w-max">👤 DATA PELAPOR (RAHASIA)</p>
                    <div className="bg-red-950/10 border border-red-900/30 rounded-sm p-4 space-y-2">
                      {selectedFraud.pelapor_nama && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">NID:</span> {selectedFraud.pelapor_nama}</p>}
                      {selectedFraud.pelapor_kontak && <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-wider"><span className="text-red-500/70 mr-2">COM:</span> {selectedFraud.pelapor_kontak}</p>}
                    </div>
                  </div>
                )}
                <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest pt-2">
                  DILAPORKAN: {new Date(selectedFraud.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {selectedFraud.status === 'pending' && (
                  <div className="flex gap-2 pt-4 mt-4 border-t border-neutral-800">
                    <button onClick={() => { handleApproveFraud(selectedFraud); setSelectedFraud(null); }} disabled={processing === selectedFraud.id} className="flex-1 py-3 bg-green-700 text-black font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-green-600 transition-colors">✅ AUTHORIZE [APPROVE]</button>
                    <button onClick={() => { handleRejectFraud(selectedFraud); setSelectedFraud(null); }} disabled={processing === selectedFraud.id} className="flex-1 py-3 bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-sm disabled:opacity-50 hover:bg-red-600 transition-colors">❌ DENY [REJECT]</button>
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
