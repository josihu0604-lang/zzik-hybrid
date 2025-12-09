import { NextResponse } from 'next/server';
import { withMiddleware, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Account Data Export API
 *
 * GET: Export all user data as JSON
 *
 * GDPR/CCPA Compliance:
 * - Users have the right to receive their personal data
 * - Data must be in a commonly used, machine-readable format
 *
 * Security:
 * - Authentication required
 * - Users can only export their own data
 * - Rate limited to prevent abuse
 */

// ============================================================================
// GET - Export User Data
// ============================================================================

export const GET = withMiddleware(
  async (request, context) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('로그인이 필요합니다', 401);
    }

    logger.info('[Export] Data export requested', { userId });

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        // Parallel fetch all user data
        const [
          userResult,
          participationsResult,
          checkinsResult,
          notificationsResult,
          bookmarksResult,
          leaderResult,
          earningsResult,
        ] = await Promise.all([
          // 1. User profile
          supabase
            .from('users')
            .select('id, name, email, profile_image, created_at, updated_at')
            .eq('id', userId)
            .single(),

          // 2. Popup participations
          supabase
            .from('popup_participations')
            .select(
              `
              id,
              popup_id,
              referral_code,
              created_at,
              popups!inner(brand_name, title)
            `
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

          // 3. Check-ins
          supabase
            .from('popup_checkins')
            .select(
              `
              id,
              popup_id,
              gps_score,
              qr_score,
              receipt_score,
              total_score,
              passed,
              verified_at,
              popups!inner(brand_name, title)
            `
            )
            .eq('user_id', userId)
            .order('verified_at', { ascending: false }),

          // 4. Notifications
          supabase
            .from('notifications')
            .select('id, type, title, message, read, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100),

          // 5. Bookmarks
          supabase
            .from('bookmarks')
            .select(
              `
              id,
              popup_id,
              created_at,
              popups!inner(brand_name, title)
            `
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),

          // 6. Leader profile (if exists)
          supabase
            .from('leaders')
            .select('id, referral_code, tier, total_referrals, total_earnings, created_at')
            .eq('user_id', userId)
            .single(),

          // 7. Leader earnings
          supabase
            .from('leader_earnings')
            .select('id, amount, type, status, created_at')
            .eq('leader_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        // Build export data
        const exportData = {
          exportedAt: new Date().toISOString(),
          exportVersion: '1.0',
          user: userResult.data || { id: userId },
          participations: participationsResult.data || [],
          checkins: checkinsResult.data || [],
          notifications: notificationsResult.data || [],
          bookmarks: bookmarksResult.data || [],
          leader: leaderResult.data || null,
          earnings: earningsResult.data || [],
          metadata: {
            totalParticipations: participationsResult.data?.length || 0,
            totalCheckins: checkinsResult.data?.length || 0,
            totalNotifications: notificationsResult.data?.length || 0,
            totalBookmarks: bookmarksResult.data?.length || 0,
          },
        };

        logger.info('[Export] Data export completed', {
          userId,
          participations: exportData.metadata.totalParticipations,
          checkins: exportData.metadata.totalCheckins,
        });

        // Return as JSON file download
        const jsonString = JSON.stringify(exportData, null, 2);

        return new NextResponse(jsonString, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="zzik-data-${new Date().toISOString().split('T')[0]}.json"`,
            'Cache-Control': 'no-store',
          },
        });
      } catch (error) {
        logger.error('[Export] Database error', error);
        return apiError('데이터 내보내기에 실패했습니다', 500);
      }
    }

    // Fallback for development without database
    const mockExportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: userId,
        name: '데모 사용자',
        email: 'demo@zzik.kr',
        created_at: new Date().toISOString(),
      },
      participations: [],
      checkins: [],
      notifications: [],
      bookmarks: [],
      leader: null,
      earnings: [],
      metadata: {
        totalParticipations: 0,
        totalCheckins: 0,
        totalNotifications: 0,
        totalBookmarks: 0,
        demo: true,
      },
    };

    const jsonString = JSON.stringify(mockExportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="zzik-data-${new Date().toISOString().split('T')[0]}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  },
  {
    requireAuth: true,
    rateLimit: 'strict', // Strict rate limiting to prevent abuse
  }
);
