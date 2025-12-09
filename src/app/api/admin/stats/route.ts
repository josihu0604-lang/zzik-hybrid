/**
 * Admin Dashboard Stats API
 *
 * GET /api/admin/stats - Get dashboard statistics
 *
 * Security:
 * - Admin role required
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-middleware';
import {
  createAdminClient,
  isSupabaseConfigured,
  createServerSupabaseClient,
} from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Admin role check
async function isAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // Allow in dev mode

  const supabase = createAdminClient();
  const { data } = await supabase.from('users').select('role').eq('id', userId).single();

  return data?.role === 'admin';
}

export async function GET(_request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError('Authentication required', 401);
    }

    // Check admin role
    const admin = await isAdmin(user.id);
    if (!admin) {
      logger.warn('[Admin] Non-admin tried to access stats', { userId: user.id });
      return apiError('Admin access required', 403);
    }

    if (isSupabaseConfigured()) {
      const adminClient = createAdminClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch stats in parallel
      const [
        usersResult,
        activePopupsResult,
        participationsResult,
        pendingPayoutsResult,
        todayCheckinsResult,
        openReportsResult,
        recentUsersResult,
        recentPopupsResult,
        recentCheckinsResult,
      ] = await Promise.all([
        // Total users
        adminClient.from('users').select('id', { count: 'exact', head: true }),

        // Active popups (funding or confirmed)
        adminClient
          .from('popups')
          .select('id', { count: 'exact', head: true })
          .in('status', ['funding', 'confirmed']),

        // Total participations
        adminClient.from('popup_participations').select('id', { count: 'exact', head: true }),

        // Pending payouts
        adminClient
          .from('leader_payouts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Today's check-ins
        adminClient
          .from('popup_checkins')
          .select('id', { count: 'exact', head: true })
          .gte('verified_at', today.toISOString()),

        // Open reports (if table exists)
        adminClient
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open')
          .maybeSingle(),

        // Recent user registrations
        adminClient
          .from('users')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent popup activity
        adminClient
          .from('popups')
          .select('id, brand_name, title, status, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),

        // Recent check-ins
        adminClient
          .from('popup_checkins')
          .select(
            `
            id,
            verified_at,
            popups!inner(brand_name, title)
          `
          )
          .order('verified_at', { ascending: false })
          .limit(5),
      ]);

      // Build recent activity
      type ActivityItem = {
        id: string;
        type: 'user' | 'popup' | 'checkin';
        message: string;
        timestamp: string;
      };

      const recentActivity: ActivityItem[] = [];

      // Add recent users
      if (recentUsersResult.data) {
        for (const user of recentUsersResult.data) {
          recentActivity.push({
            id: `user-${user.id}`,
            type: 'user',
            message: `새로운 사용자 가입: ${user.email}`,
            timestamp: user.created_at,
          });
        }
      }

      // Add recent popups
      if (recentPopupsResult.data) {
        for (const popup of recentPopupsResult.data) {
          const statusText = popup.status === 'confirmed' ? '오픈 확정' : '펀딩 중';
          recentActivity.push({
            id: `popup-${popup.id}`,
            type: 'popup',
            message: `${statusText}: ${popup.brand_name} ${popup.title}`,
            timestamp: popup.updated_at,
          });
        }
      }

      // Add recent check-ins
      if (recentCheckinsResult.data) {
        for (const checkin of recentCheckinsResult.data) {
          const popup = checkin.popups as unknown as { brand_name: string; title: string } | null;
          if (popup) {
            recentActivity.push({
              id: `checkin-${checkin.id}`,
              type: 'checkin',
              message: `체크인 완료: ${popup.brand_name} ${popup.title}`,
              timestamp: checkin.verified_at,
            });
          }
        }
      }

      // Sort by timestamp
      recentActivity.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return apiSuccess({
        totalUsers: usersResult.count || 0,
        activePopups: activePopupsResult.count || 0,
        totalParticipations: participationsResult.count || 0,
        pendingPayouts: pendingPayoutsResult.count || 0,
        todayCheckins: todayCheckinsResult.count || 0,
        openReports: openReportsResult.count || 0,
        recentActivity: recentActivity.slice(0, 10),
      });
    }

    // Mock data for development
    return apiSuccess({
      totalUsers: 1234,
      activePopups: 42,
      totalParticipations: 8567,
      pendingPayouts: 15,
      todayCheckins: 156,
      openReports: 3,
      recentActivity: [
        {
          id: '1',
          type: 'user',
          message: '새로운 사용자 가입: demo@example.com',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'popup',
          message: '팝업 오픈 확정: 나이키 강남 팝업',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      demo: true,
    });
  } catch (error) {
    logger.error('[Admin] Stats fetch error', error);
    return apiError('Failed to fetch stats', 500);
  }
}
