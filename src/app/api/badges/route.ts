/**
 * User Badges API
 *
 * GET /api/badges - Get user's badges and progress
 *
 * Security:
 * - Authentication required
 * - Users can only view their own badges
 */

import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { calculateUserBadges, type UserStats } from '@/lib/badges';
import { logger } from '@/lib/logger';

export const GET = withMiddleware(
  async (_request, context) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('로그인이 필요합니다', 401);
    }

    logger.info('[Badges] Fetching user badges', { userId });

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        // Fetch user stats in parallel
        const [
          userResult,
          participationsResult,
          checkinsResult,
          leaderResult,
          referralsResult,
          earningsResult,
        ] = await Promise.all([
          // 1. User registration date
          supabase.from('users').select('created_at').eq('id', userId).single(),

          // 2. Participation count
          supabase
            .from('popup_participations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),

          // 3. Check-in stats
          supabase.from('popup_checkins').select('total_score, passed').eq('user_id', userId),

          // 4. Leader status
          supabase.from('leaders').select('id, total_earnings').eq('user_id', userId).single(),

          // 5. Referral count
          supabase
            .from('leader_referrals')
            .select('id', { count: 'exact', head: true })
            .eq('leader_id', userId),

          // 6. Total earnings
          supabase
            .from('leader_earnings')
            .select('amount')
            .eq('leader_id', userId)
            .eq('status', 'paid'),
        ]);

        // Calculate stats
        const checkins = checkinsResult.data || [];
        const perfectCheckins = checkins.filter((c) => c.total_score === 100).length;
        const totalEarnings = (earningsResult.data || []).reduce(
          (sum, e) => sum + (e.amount || 0),
          0
        );

        const stats: UserStats = {
          participationCount: participationsResult.count || 0,
          checkinCount: checkins.length,
          perfectCheckinCount: perfectCheckins,
          referralCount: referralsResult.count || 0,
          earningsTotal: leaderResult.data?.total_earnings || totalEarnings,
          consecutiveDays: 0, // TODO: Implement streak tracking
          registeredAt: userResult.data?.created_at
            ? new Date(userResult.data.created_at)
            : new Date(),
          isLeader: !!leaderResult.data,
        };

        // Calculate badges
        const userBadges = calculateUserBadges(stats);

        logger.info('[Badges] Badges calculated', {
          userId,
          earned: userBadges.earned.length,
          inProgress: userBadges.inProgress.length,
        });

        return apiSuccess({
          badges: userBadges,
          stats: {
            totalEarned: userBadges.earned.length,
            totalPoints: userBadges.earned.reduce((sum, b) => sum + b.points, 0),
            participationCount: stats.participationCount,
            checkinCount: stats.checkinCount,
            perfectCheckinCount: stats.perfectCheckinCount,
          },
        });
      } catch (error) {
        logger.error('[Badges] Database error', error);
        return apiError('배지 정보를 불러오는데 실패했습니다', 500);
      }
    }

    // Fallback for development without database
    const mockStats: UserStats = {
      participationCount: 5,
      checkinCount: 3,
      perfectCheckinCount: 1,
      referralCount: 0,
      earningsTotal: 0,
      consecutiveDays: 2,
      registeredAt: new Date('2024-01-15'),
      isLeader: false,
    };

    const mockBadges = calculateUserBadges(mockStats);

    return apiSuccess({
      badges: mockBadges,
      stats: {
        totalEarned: mockBadges.earned.length,
        totalPoints: mockBadges.earned.reduce((sum, b) => sum + b.points, 0),
        participationCount: mockStats.participationCount,
        checkinCount: mockStats.checkinCount,
        perfectCheckinCount: mockStats.perfectCheckinCount,
      },
      demo: true,
    });
  },
  {
    requireAuth: true,
    rateLimit: 'normal',
  }
);
