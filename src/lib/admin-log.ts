/**
 * Admin Activity Logger
 * Logs all admin actions to the admin_logs table in Supabase
 */

import { supabase } from './supabase'

export type AdminAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'approve_report'
  | 'reject_report'
  | 'approve_banding'
  | 'reject_banding'
  | 'approve_indikasi'
  | 'reject_indikasi'
  | 'approve_fraud'
  | 'reject_fraud'
  | 'bulk_approve'
  | 'bulk_reject'

export type TargetType = 'report' | 'banding' | 'indikasi' | 'fraud' | 'session' | null

/**
 * Log an admin action to the database
 */
export async function logAdminAction(
  adminUsername: string,
  action: AdminAction,
  targetType: TargetType,
  targetId: string | null,
  details: string,
  ipAddress?: string
): Promise<void> {
  try {
    await supabase.from('admin_logs').insert({
      admin_username: adminUsername,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress || 'unknown',
    })
  } catch (error) {
    // Don't let logging failures break the main flow
    console.error('Failed to log admin action:', error)
  }
}

/**
 * Fetch recent admin logs
 */
export async function getAdminLogs(limit: number = 50) {
  const { data, error } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch admin logs:', error)
    return []
  }

  return data || []
}
