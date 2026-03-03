/**
 * Centralized Admin Action API Route
 * ALL admin database operations go through here, protected by auth guard.
 * This prevents any client-side Supabase abuse.
 */

import { NextResponse } from 'next/server'
import { getAdminSession, unauthorizedResponse } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/admin-log'
import { supabase } from '@/lib/supabase'

function getIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

function escapeFilter(value: string) {
  return value.replace(/[,.*()\\]/g, (c) => '\\' + c)
}

export async function POST(request: Request) {
  const session = getAdminSession(request)
  if (!session) return unauthorizedResponse()

  const ip = getIp(request)
  const { action, payload } = await request.json()

  if (!action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 })
  }

  try {
    switch (action) {
      // ===================== FETCH OPERATIONS =====================
      case 'fetch_reports': {
        let query = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100)
        if (payload?.filter && payload.filter !== 'all') query = query.eq('status', payload.filter)
        if (payload?.kategoriFilter && payload.kategoriFilter !== 'all') query = query.eq('kategori', payload.kategoriFilter)
        const { data } = await query
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_banding': {
        const { data } = await supabase.from('unblacklist_requests').select('*').order('created_at', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_indikasi': {
        let query = supabase.from('indikasi_reports').select('*').order('created_at', { ascending: false }).limit(100)
        if (payload?.filter && payload.filter !== 'all') query = query.eq('status', payload.filter)
        const { data } = await query
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_fraud': {
        let query = supabase.from('fraud_reports').select('*').order('created_at', { ascending: false }).limit(100)
        if (payload?.filter && payload.filter !== 'all') query = query.eq('status', payload.filter)
        const { data } = await query
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_indikasi_banding': {
        const { data } = await supabase.from('indikasi_banding').select('*').order('created_at', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_fraud_banding': {
        const { data } = await supabase.from('fraud_banding').select('*').order('created_at', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_pending_admins': {
        const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
        return NextResponse.json({ data: data || [] })
      }

      case 'fetch_counts': {
        const [r1, r2, r3, r4] = await Promise.all([
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('unblacklist_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('indikasi_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('fraud_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])
        return NextResponse.json({
          data: { reports: r1.count || 0, banding: r2.count || 0, indikasi: r3.count || 0, fraud: r4.count || 0 }
        })
      }

      // ===================== APPROVE/REJECT REPORTS =====================
      case 'approve_report': {
        const report = payload
        // Check existing in blacklist
        const conditions: string[] = []
        if (report.nama) conditions.push(`nama.ilike.%${escapeFilter(report.nama)}%`)
        if (report.no_hp) conditions.push(`no_hp.eq.${escapeFilter(report.no_hp)}`)
        if (report.instagram) conditions.push(`instagram.ilike.${escapeFilter(report.instagram)}`)
        if (report.tiktok) conditions.push(`tiktok.ilike.${escapeFilter(report.tiktok)}`)

        let existing = null
        if (conditions.length > 0) {
          const { data } = await supabase.from('blacklist').select('*').or(conditions.join(',')).limit(1)
          existing = data
        }

        if (existing && existing.length > 0) {
          const entry = existing[0]
          await supabase.from('blacklist').update({
            jumlah_laporan: (entry.jumlah_laporan || 1) + 1,
            alasan: entry.alasan + '\n\n---\n\n' + report.kronologi,
            updated_at: new Date().toISOString()
          }).eq('id', entry.id)
        } else {
          await supabase.from('blacklist').insert({
            report_id: report.id, nama: report.nama, no_hp: report.no_hp,
            instagram: report.instagram, tiktok: report.tiktok, kategori: report.kategori,
            alasan: report.kronologi, jumlah_laporan: 1
          })
        }

        await supabase.from('reports').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', report.id)
        await logAdminAction(session.username, 'approve_report', 'report', report.id, `Approved: ${report.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_report': {
        await supabase.from('reports').update({ status: 'rejected', reviewed_at: new Date().toISOString(), review_note: payload.note || null }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_report', 'report', payload.id, `Rejected: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'edit_report': {
        await supabase.from('reports').update(payload.updates).eq('id', payload.id)
        await logAdminAction(session.username, 'edit_report', 'report', payload.id, `Edited: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'unblacklist_report': {
        await supabase.from('reports').update({ status: 'resolved', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        const conditions: string[] = []
        if (payload.nama) conditions.push(`nama.ilike.%${escapeFilter(payload.nama)}%`)
        if (payload.no_hp) conditions.push(`no_hp.eq.${escapeFilter(payload.no_hp)}`)
        if (payload.instagram) conditions.push(`instagram.ilike.${escapeFilter(payload.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('blacklist').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('blacklist').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'unblacklist', 'report', payload.id, `Unblacklisted: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'bulk_approve': {
        const ids = payload.ids as string[]
        for (const id of ids) {
          const { data: report } = await supabase.from('reports').select('*').eq('id', id).single()
          if (!report) continue

          const conditions: string[] = []
          if (report.nama) conditions.push(`nama.ilike.%${escapeFilter(report.nama)}%`)
          if (report.instagram) conditions.push(`instagram.ilike.${escapeFilter(report.instagram)}`)

          let existing = null
          if (conditions.length > 0) {
            const { data } = await supabase.from('blacklist').select('*').or(conditions.join(',')).limit(1)
            existing = data
          }

          if (existing && existing.length > 0) {
            await supabase.from('blacklist').update({
              jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
              alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
              updated_at: new Date().toISOString()
            }).eq('id', existing[0].id)
          } else {
            await supabase.from('blacklist').insert({
              report_id: report.id, nama: report.nama, no_hp: report.no_hp,
              instagram: report.instagram, tiktok: report.tiktok, kategori: report.kategori,
              alasan: report.kronologi, jumlah_laporan: 1
            })
          }

          await supabase.from('reports').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', report.id)
        }
        await logAdminAction(session.username, 'bulk_approve', 'report', null, `Bulk approved ${ids.length} reports`, ip)
        return NextResponse.json({ success: true })
      }

      // ===================== INDIKASI =====================
      case 'approve_indikasi': {
        const report = payload
        const conditions: string[] = []
        if (report.nama) conditions.push(`nama.ilike.%${escapeFilter(report.nama)}%`)
        if (report.instagram) conditions.push(`instagram.ilike.${escapeFilter(report.instagram)}`)

        let existing = null
        if (conditions.length > 0) {
          const { data } = await supabase.from('indikasi_list').select('*').or(conditions.join(',')).limit(1)
          existing = data
        }

        if (existing && existing.length > 0) {
          await supabase.from('indikasi_list').update({
            jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
            alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
            updated_at: new Date().toISOString()
          }).eq('id', existing[0].id)
        } else {
          await supabase.from('indikasi_list').insert({
            report_id: report.id, nama: report.nama, no_hp: report.no_hp,
            instagram: report.instagram, tiktok: report.tiktok,
            kategori_masalah: report.kategori_masalah, alasan: report.kronologi, jumlah_laporan: 1
          })
        }

        await supabase.from('indikasi_reports').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', report.id)
        await logAdminAction(session.username, 'approve_indikasi', 'indikasi', report.id, `Approved: ${report.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_indikasi': {
        await supabase.from('indikasi_reports').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_indikasi', 'indikasi', payload.id, `Rejected: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'unblacklist_indikasi': {
        await supabase.from('indikasi_reports').update({ status: 'resolved', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        const conditions: string[] = []
        if (payload.nama) conditions.push(`nama.ilike.%${escapeFilter(payload.nama)}%`)
        if (payload.instagram) conditions.push(`instagram.ilike.${escapeFilter(payload.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('indikasi_list').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('indikasi_list').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'unblacklist_indikasi', 'indikasi', payload.id, `Unblacklisted: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      // ===================== FRAUD =====================
      case 'approve_fraud': {
        const report = payload
        const conditions: string[] = []
        if (report.nama) conditions.push(`nama.ilike.%${escapeFilter(report.nama)}%`)
        if (report.instagram) conditions.push(`instagram.ilike.${escapeFilter(report.instagram)}`)

        let existing = null
        if (conditions.length > 0) {
          const { data } = await supabase.from('fraud_list').select('*').or(conditions.join(',')).limit(1)
          existing = data
        }

        if (existing && existing.length > 0) {
          await supabase.from('fraud_list').update({
            jumlah_laporan: (existing[0].jumlah_laporan || 1) + 1,
            nominal_total: (existing[0].nominal_total || 0) + (report.nominal || 0),
            alasan: existing[0].alasan + '\n\n---\n\n' + report.kronologi,
            updated_at: new Date().toISOString()
          }).eq('id', existing[0].id)
        } else {
          await supabase.from('fraud_list').insert({
            report_id: report.id, nama: report.nama, no_hp: report.no_hp,
            instagram: report.instagram, tiktok: report.tiktok,
            jenis_fraud: report.jenis_fraud, nominal_total: report.nominal || 0,
            alasan: report.kronologi, jumlah_laporan: 1
          })
        }

        await supabase.from('fraud_reports').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', report.id)
        await logAdminAction(session.username, 'approve_fraud', 'fraud', report.id, `Approved: ${report.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_fraud': {
        await supabase.from('fraud_reports').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_fraud', 'fraud', payload.id, `Rejected: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'unblacklist_fraud': {
        await supabase.from('fraud_reports').update({ status: 'resolved', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        const conditions: string[] = []
        if (payload.nama) conditions.push(`nama.ilike.%${escapeFilter(payload.nama)}%`)
        if (payload.instagram) conditions.push(`instagram.ilike.${escapeFilter(payload.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('fraud_list').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('fraud_list').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'unblacklist_fraud', 'fraud', payload.id, `Unblacklisted: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      // ===================== BANDING =====================
      case 'approve_banding': {
        const req = payload
        await supabase.from('unblacklist_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', req.id)
        // Remove from blacklist
        const conditions: string[] = []
        if (req.nama) conditions.push(`nama.ilike.%${escapeFilter(req.nama)}%`)
        if (req.no_hp) conditions.push(`no_hp.eq.${escapeFilter(req.no_hp)}`)
        if (req.instagram) conditions.push(`instagram.ilike.${escapeFilter(req.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('blacklist').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('blacklist').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'approve_banding', 'banding', req.id, `Approved banding: ${req.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_banding': {
        await supabase.from('unblacklist_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_banding', 'banding', payload.id, `Rejected banding: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'approve_indikasi_banding': {
        const req = payload
        await supabase.from('indikasi_banding').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', req.id)
        const conditions: string[] = []
        if (req.nama) conditions.push(`nama.ilike.%${escapeFilter(req.nama)}%`)
        if (req.instagram) conditions.push(`instagram.ilike.${escapeFilter(req.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('indikasi_list').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('indikasi_list').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'approve_indikasi_banding', 'indikasi_banding', req.id, `Approved: ${req.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_indikasi_banding': {
        await supabase.from('indikasi_banding').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_indikasi_banding', 'indikasi_banding', payload.id, `Rejected: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'approve_fraud_banding': {
        const req = payload
        await supabase.from('fraud_banding').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', req.id)
        const conditions: string[] = []
        if (req.nama) conditions.push(`nama.ilike.%${escapeFilter(req.nama)}%`)
        if (req.instagram) conditions.push(`instagram.ilike.${escapeFilter(req.instagram)}`)
        if (conditions.length > 0) {
          const { data } = await supabase.from('fraud_list').select('id').or(conditions.join(',')).limit(1)
          if (data && data.length > 0) {
            await supabase.from('fraud_list').delete().eq('id', data[0].id)
          }
        }
        await logAdminAction(session.username, 'approve_fraud_banding', 'fraud_banding', req.id, `Approved: ${req.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_fraud_banding': {
        await supabase.from('fraud_banding').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', payload.id)
        await logAdminAction(session.username, 'reject_fraud_banding', 'fraud_banding', payload.id, `Rejected: ${payload.nama}`, ip)
        return NextResponse.json({ success: true })
      }

      // ===================== ADMIN MANAGEMENT =====================
      case 'approve_admin': {
        if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        await supabase.from('admin_users').update({ is_active: true }).eq('id', payload.id)
        await logAdminAction(session.username, 'approve_admin', 'admin', payload.id, `Approved admin: ${payload.display_name}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'reject_admin': {
        if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        await supabase.from('admin_users').delete().eq('id', payload.id)
        await logAdminAction(session.username, 'reject_admin', 'admin', payload.id, `Rejected admin: ${payload.display_name}`, ip)
        return NextResponse.json({ success: true })
      }

      case 'deactivate_admin': {
        if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        await supabase.from('admin_users').update({ is_active: false }).eq('id', payload.id)
        await logAdminAction(session.username, 'deactivate_admin', 'admin', payload.id, `Deactivated admin: ${payload.display_name}`, ip)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error(`Admin action error [${action}]:`, error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
