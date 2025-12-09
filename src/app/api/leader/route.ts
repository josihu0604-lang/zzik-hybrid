import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  generateReferralCode,
  generateReferralLink,
  getTierInfo,
  calculateCommission,
  TIER_COMMISSION_RATES,
  type LeaderTier,
} from '@/lib/leader';
import type { Leader, LeaderReferralWithPopup, LeaderEarning } from '@/types/database';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface LeaderWithStats extends Leader {
  total_referrals: number;
}

interface LeaderInsertResponse {
  id: string;
  referral_code: string;
  created_at: string;
}

interface LeaderLookupResponse {
  id: string;
  user_id: string;
  total_referrals: number;
}

/**
 * Leader API - 리더오퍼 시스템
 *
 * GET: 리더 통계 조회
 * POST: 리더 등록, 리퍼럴 추적
 *
 * Security:
 * - Authentication required for all endpoints
 * - Rate limiting applied
 * - Input validation with Zod
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const LeaderQuerySchema = z.object({
  leaderId: z.string().uuid().optional(),
});

const LeaderActionSchema = z.object({
  action: z.enum(['register', 'track', 'stats']),
  popupId: z.string().uuid().optional(),
  referralCode: z.string().max(8).optional(),
});

type LeaderQuery = z.infer<typeof LeaderQuerySchema>;
type LeaderAction = z.infer<typeof LeaderActionSchema>;

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

// ============================================================================
// ADMIN ROLE VERIFICATION
// ============================================================================

// SEC-004 FIX: Define user role type for admin check
interface UserWithRole {
  id: string;
  role?: string;
}

/**
 * SEC-004 FIX: Check if user has admin role
 *
 * Verifies admin permission by checking the user role in the database.
 * This prevents unauthorized access to other users leader data.
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = createAdminClient();

    // Check user role in the users table
    const { data: user, error } = (await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single()) as { data: UserWithRole | null; error: { message: string } | null };

    if (error || !user) {
      return false;
    }

    // Check if user has admin role
    return user.role === 'admin' || user.role === 'super_admin';
  } catch (error) {
    logger.error('[Leader] Admin role check error', error);
    return false;
  }
}

function getMockLeaderData(userId: string) {
  const referralCode = generateReferralCode(userId);
  return {
    id: userId,
    userId,
    referralCode,
    tier: 'Gold' as LeaderTier,
    totalEarnings: 256000,
    thisMonthEarnings: 128000,
    totalReferrals: 234,
    thisMonthReferrals: 67,
    totalCheckins: 180,
    thisMonthCheckins: 52,
    referralLink: generateReferralLink(referralCode),
    commissionRate: TIER_COMMISSION_RATES.Gold,
    campaigns: [
      {
        id: '1',
        popupId: '550e8400-e29b-41d4-a716-446655440001',
        brandName: 'GENTLE MONSTER',
        title: '성수동 팝업',
        referrals: 43,
        checkins: 35,
        earnings: 26250,
        status: 'active',
      },
      {
        id: '2',
        popupId: '550e8400-e29b-41d4-a716-446655440002',
        brandName: 'ADER ERROR',
        title: '한남동 팝업',
        referrals: 67,
        checkins: 54,
        earnings: 40500,
        status: 'active',
      },
      {
        id: '3',
        popupId: '550e8400-e29b-41d4-a716-446655440004',
        brandName: 'HYBE',
        title: 'BTS 10주년 특별 전시',
        referrals: 124,
        checkins: 91,
        earnings: 61250,
        status: 'completed',
      },
    ],
  };
}

// ============================================================================
// GET: Get leader stats
// ============================================================================

export const GET = withMiddleware<LeaderQuery>(
  async (request, context, validatedData) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('로그인이 필요합니다', 401);
    }

    // Use authenticated user's ID (or query param for admin)
    const targetUserId = validatedData?.leaderId || userId;

    // SEC-004 FIX: Implement admin permission check
    // Only allow viewing other users data if current user is admin
    if (targetUserId !== userId) {
      const isAdmin = await isUserAdmin(userId);
      if (!isAdmin) {
        return apiError(
          '권한이 없습니다. 관리자만 다른 사용자의 데이터를 조회할 수 있습니다.',
          403
        );
      }
    }

    // Try to get from database
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        // Get leader profile
        const { data: leader, error: leaderError } = (await supabase
          .from('leaders')
          .select(
            'id, user_id, referral_code, tier, total_referrals, total_checkins, total_earnings, created_at, updated_at'
          )
          .eq('user_id', targetUserId)
          .single()) as { data: LeaderWithStats | null; error: { message: string } | null };

        if (leaderError || !leader) {
          // Not a leader yet - return empty state
          return apiSuccess({
            isLeader: false,
            message: '리더로 등록되지 않았습니다',
          });
        }

        // Get this month's stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: thisMonthReferrals } = (await supabase
          .from('leader_referrals')
          .select('*', { count: 'exact', head: true })
          .eq('leader_id', leader.id)
          .gte('created_at', startOfMonth.toISOString())) as { count: number | null };

        const { data: thisMonthEarningsData } = (await supabase
          .from('leader_earnings')
          .select('amount')
          .eq('leader_id', leader.id)
          .gte('created_at', startOfMonth.toISOString())) as { data: LeaderEarning[] | null };

        const thisMonthEarnings = thisMonthEarningsData?.reduce((sum, e) => sum + e.amount, 0) || 0;

        // Get campaign stats
        const { data: campaignStats } = (await supabase
          .from('leader_referrals')
          .select(
            `
            popup_id,
            popups!inner(brand_name, title, status),
            checked_in
          `
          )
          .eq('leader_id', leader.id)) as { data: LeaderReferralWithPopup[] | null };

        // Aggregate campaigns
        const campaignMap = new Map();
        for (const ref of campaignStats || []) {
          const key = ref.popup_id;
          if (!campaignMap.has(key)) {
            campaignMap.set(key, {
              popupId: ref.popup_id,
              brandName: ref.popups?.brand_name || 'Unknown',
              title: ref.popups?.title || 'Unknown',
              status: ref.popups?.status || 'unknown',
              referrals: 0,
              checkins: 0,
              earnings: 0,
            });
          }
          const campaign = campaignMap.get(key);
          campaign.referrals++;
          if (ref.checked_in) {
            campaign.checkins++;
            campaign.earnings += calculateCommission(leader.tier as LeaderTier, 1);
          }
        }

        const tierInfo = getTierInfo(leader.tier as LeaderTier);

        return apiSuccess({
          isLeader: true,
          data: {
            id: leader.id,
            userId: leader.user_id,
            referralCode: leader.referral_code,
            tier: leader.tier,
            tierInfo,
            totalEarnings: leader.total_earnings,
            thisMonthEarnings,
            totalReferrals: leader.total_referrals,
            thisMonthReferrals: thisMonthReferrals || 0,
            totalCheckins: leader.total_checkins,
            referralLink: generateReferralLink(leader.referral_code),
            commissionRate: TIER_COMMISSION_RATES[leader.tier as LeaderTier],
            campaigns: Array.from(campaignMap.values()),
          },
          source: 'database',
        });
      } catch (error) {
        logger.error('[Leader] Database error', error);
        // Fall through to mock data
      }
    }

    // Fallback to mock data
    const leaderData = getMockLeaderData(targetUserId);
    return apiSuccess({
      isLeader: true,
      data: leaderData,
      source: 'mock',
    });
  },
  {
    requireAuth: true,
    rateLimit: 'normal',
    querySchema: LeaderQuerySchema,
  }
);

// ============================================================================
// POST: Register as leader or track referral
// ============================================================================

export const POST = withMiddleware<LeaderAction>(
  async (_request, context, data) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('로그인이 필요합니다', 401);
    }

    if (!data) {
      return apiError('요청 데이터가 필요합니다', 400);
    }

    const { action, popupId, referralCode } = data;

    // ========================================
    // ACTION: Register as leader
    // ========================================
    if (action === 'register') {
      const newReferralCode = generateReferralCode(userId);

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();

          // Check if already a leader
          const { data: existing } = (await supabase
            .from('leaders')
            .select('id')
            .eq('user_id', userId)
            .single()) as { data: { id: string } | null };

          if (existing) {
            return apiError('이미 리더로 등록되어 있습니다', 409);
          }

          // Create leader profile
          // Note: Type assertion needed as Supabase types may not be in sync with actual schema
          const { data: leader, error } = (await (
            supabase.from('leaders') as ReturnType<typeof supabase.from>
          )
            .insert({
              user_id: userId,
              referral_code: newReferralCode,
              tier: 'Bronze',
              total_referrals: 0,
              total_checkins: 0,
              total_earnings: 0,
            } as unknown)
            .select()
            .single()) as { data: LeaderInsertResponse | null; error: { message: string } | null };

          if (error) {
            logger.error('[Leader] Registration error', error);
            throw error;
          }

          if (!leader) {
            return apiError('리더 등록에 실패했습니다', 500);
          }

          return apiSuccess({
            message: '리더 등록이 완료되었습니다!',
            data: {
              leaderId: leader.id,
              referralCode: leader.referral_code,
              tier: 'Bronze',
              referralLink: generateReferralLink(leader.referral_code),
              commissionRate: TIER_COMMISSION_RATES.Bronze,
              createdAt: leader.created_at,
            },
          });
        } catch (error) {
          logger.error('[Leader] Registration database error', error);
        }
      }

      // Mock response
      return apiSuccess({
        message: '리더 등록이 완료되었습니다! (데모)',
        data: {
          leaderId: userId,
          referralCode: newReferralCode,
          tier: 'Bronze',
          referralLink: generateReferralLink(newReferralCode),
          commissionRate: TIER_COMMISSION_RATES.Bronze,
          createdAt: new Date().toISOString(),
        },
        isDemo: true,
      });
    }

    // ========================================
    // ACTION: Track referral
    // ========================================
    if (action === 'track') {
      if (!referralCode) {
        return apiError('추천 코드가 필요합니다', 400);
      }

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();

          // Find leader by referral code
          const { data: leader, error: leaderError } = (await supabase
            .from('leaders')
            .select('id, user_id, total_referrals')
            .eq('referral_code', referralCode.toUpperCase())
            .single()) as { data: LeaderLookupResponse | null; error: { message: string } | null };

          if (leaderError || !leader) {
            return apiError('유효하지 않은 추천 코드입니다', 404);
          }

          // Prevent self-referral
          if (leader.user_id === userId) {
            return apiError('자기 자신을 추천할 수 없습니다', 400);
          }

          // Create referral record (if popup specified)
          if (popupId) {
            // Note: Type assertion needed as Supabase types may not be in sync with actual schema
            const { error: refError } = (await (
              supabase.from('leader_referrals') as ReturnType<typeof supabase.from>
            ).insert({
              leader_id: leader.id,
              referred_user_id: userId,
              popup_id: popupId,
              referral_code: referralCode.toUpperCase(),
            } as unknown)) as { error: { message: string; code?: string } | null };

            if (refError && refError.code !== '23505') {
              // Ignore duplicate constraint violation
              logger.error('[Leader] Referral tracking error', refError);
            }
          }

          // Update leader's referral count
          await (supabase.from('leaders') as ReturnType<typeof supabase.from>)
            .update({ total_referrals: leader.total_referrals + 1 } as unknown)
            .eq('id', leader.id);

          return apiSuccess({
            message: '추천이 기록되었습니다',
            data: {
              leaderId: leader.id,
              referralCode,
              trackedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          logger.error('[Leader] Referral tracking database error', error);
        }
      }

      // Mock response
      return apiSuccess({
        message: '추천이 기록되었습니다 (데모)',
        data: {
          referralCode,
          userId,
          trackedAt: new Date().toISOString(),
        },
        isDemo: true,
      });
    }

    return apiError('잘못된 액션입니다', 400);
  },
  {
    requireAuth: true,
    csrf: true,
    rateLimit: 'strict',
    bodySchema: LeaderActionSchema,
  }
);
