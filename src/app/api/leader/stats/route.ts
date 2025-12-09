import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { TIER_COMMISSION_RATES, type LeaderTier } from '@/lib/leader';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

interface LeaderRecord {
  id: string;
  user_id: string;
  referral_code: string;
  tier: string;
  total_referrals: number;
  total_checkins: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
}

interface EarningRecord {
  amount: number;
  status: string;
  created_at: string;
}

interface ReferralWithPopup {
  id: string;
  popup_id: string;
  checked_in: boolean;
  created_at: string;
  popups: {
    brand_name: string;
    title: string;
    status: string;
  } | null;
}

interface DailyStats {
  date: string;
  referrals: number;
  checkins: number;
  earnings: number;
}

interface TopPerformer {
  popupId: string;
  brandName: string;
  title: string;
  referrals: number;
  checkins: number;
  earnings: number;
  conversionRate: number;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const StatsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', 'all']).optional().default('30d'),
  includeDaily: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

type StatsQuery = z.infer<typeof StatsQuerySchema>;

// ============================================================================
// GET: Leader detailed stats
// ============================================================================

export const GET = withMiddleware<StatsQuery>(
  async (_request, context, query) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('Authentication required', 401);
    }

    const period = query?.period || '30d';
    const includeDaily = query?.includeDaily || false;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        // Get leader profile first (required for subsequent queries)
        const { data: leader, error: leaderError } = (await supabase
          .from('leaders')
          .select(
            'id, user_id, referral_code, tier, total_referrals, total_checkins, total_earnings, created_at'
          )
          .eq('user_id', userId)
          .single()) as { data: LeaderRecord | null; error: { message: string } | null };

        if (leaderError || !leader) {
          return apiError('Leader profile not found', 404);
        }

        // PERF-003: Parallelize independent queries with Promise.all
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [periodEarningsResult, periodReferralsResult, thisMonthEarningsResult] =
          await Promise.all([
            // Get period earnings
            supabase
              .from('leader_earnings')
              .select('amount, status, created_at')
              .eq('leader_id', leader.id)
              .gte('created_at', startDate.toISOString()),

            // Get period referrals (with popup join)
            supabase
              .from('leader_referrals')
              .select(
                `
              id,
              popup_id,
              checked_in,
              created_at,
              popups!inner(brand_name, title, status)
            `
              )
              .eq('leader_id', leader.id)
              .gte('created_at', startDate.toISOString()),

            // Get this month's earnings (for payout calculation)
            supabase
              .from('leader_earnings')
              .select('amount, status')
              .eq('leader_id', leader.id)
              .gte('created_at', thisMonthStart.toISOString()),
          ]);

        const periodEarnings = periodEarningsResult.data as EarningRecord[] | null;
        const periodReferrals = periodReferralsResult.data as ReferralWithPopup[] | null;
        const thisMonthEarnings = thisMonthEarningsResult.data as EarningRecord[] | null;

        // Calculate period stats
        const periodTotalEarnings = (periodEarnings || []).reduce((sum, e) => sum + e.amount, 0);
        const periodConfirmedEarnings = (periodEarnings || [])
          .filter((e) => e.status === 'confirmed' || e.status === 'paid')
          .reduce((sum, e) => sum + e.amount, 0);
        const periodPendingEarnings = (periodEarnings || [])
          .filter((e) => e.status === 'pending')
          .reduce((sum, e) => sum + e.amount, 0);

        const periodReferralCount = (periodReferrals || []).length;
        const periodCheckinCount = (periodReferrals || []).filter((r) => r.checked_in).length;
        const conversionRate =
          periodReferralCount > 0
            ? Math.round((periodCheckinCount / periodReferralCount) * 100)
            : 0;

        // Aggregate by popup (top performers)
        const popupStats = new Map<string, TopPerformer>();
        for (const ref of periodReferrals || []) {
          const key = ref.popup_id;
          if (!popupStats.has(key)) {
            popupStats.set(key, {
              popupId: ref.popup_id,
              brandName: ref.popups?.brand_name || 'Unknown',
              title: ref.popups?.title || 'Unknown',
              referrals: 0,
              checkins: 0,
              earnings: 0,
              conversionRate: 0,
            });
          }
          const stats = popupStats.get(key)!;
          stats.referrals++;
          if (ref.checked_in) {
            stats.checkins++;
            stats.earnings += TIER_COMMISSION_RATES[leader.tier as LeaderTier] || 500;
          }
        }

        // Calculate conversion rates and sort by earnings
        const topPerformers = Array.from(popupStats.values())
          .map((p) => ({
            ...p,
            conversionRate: p.referrals > 0 ? Math.round((p.checkins / p.referrals) * 100) : 0,
          }))
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5);

        // Generate daily stats if requested
        let dailyStats: DailyStats[] = [];
        if (includeDaily) {
          dailyStats = generateDailyStats(periodReferrals || [], periodEarnings || [], period);
        }

        // Calculate payout schedule (thisMonthEarnings already fetched in parallel above)
        const thisMonthTotal = (thisMonthEarnings || []).reduce((sum, e) => sum + e.amount, 0);
        const thisMonthPending = (thisMonthEarnings || [])
          .filter((e) => e.status === 'pending')
          .reduce((sum, e) => sum + e.amount, 0);

        // Next payout date (15th of next month)
        const nextPayoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);

        return apiSuccess({
          period,
          stats: {
            total: {
              earnings: leader.total_earnings,
              referrals: leader.total_referrals,
              checkins: leader.total_checkins,
            },
            period: {
              earnings: periodTotalEarnings,
              confirmedEarnings: periodConfirmedEarnings,
              pendingEarnings: periodPendingEarnings,
              referrals: periodReferralCount,
              checkins: periodCheckinCount,
              conversionRate,
            },
            thisMonth: {
              earnings: thisMonthTotal,
              pending: thisMonthPending,
            },
            payout: {
              nextDate: nextPayoutDate.toISOString(),
              estimatedAmount: thisMonthPending,
              minimumPayout: 10000, // 10,000 won minimum
              eligibleForPayout: thisMonthPending >= 10000,
            },
          },
          topPerformers,
          dailyStats,
          tier: leader.tier,
          commissionRate: TIER_COMMISSION_RATES[leader.tier as LeaderTier],
        });
      } catch (error) {
        logger.error('[Leader Stats API] Error:', error);
        return apiError('Failed to fetch stats', 500);
      }
    }

    // Demo response
    return apiSuccess({
      period,
      stats: {
        total: {
          earnings: 125000,
          referrals: 67,
          checkins: 45,
        },
        period: {
          earnings: 42500,
          confirmedEarnings: 35000,
          pendingEarnings: 7500,
          referrals: 23,
          checkins: 18,
          conversionRate: 78,
        },
        thisMonth: {
          earnings: 42500,
          pending: 7500,
        },
        payout: {
          nextDate: getNextPayoutDate().toISOString(),
          estimatedAmount: 7500,
          minimumPayout: 10000,
          eligibleForPayout: false,
        },
      },
      topPerformers: [
        {
          popupId: 'demo-1',
          brandName: '성수 카페',
          title: '겨울 시즌 팝업',
          referrals: 28,
          checkins: 19,
          earnings: 22800,
          conversionRate: 68,
        },
        {
          popupId: 'demo-2',
          brandName: '뷰티 브랜드',
          title: '신제품 체험존',
          referrals: 15,
          checkins: 12,
          earnings: 14400,
          conversionRate: 80,
        },
      ],
      dailyStats: includeDaily ? generateDemoDailyStats(period) : [],
      tier: 'Silver',
      commissionRate: 12,
      isDemo: true,
    });
  },
  {
    requireAuth: true,
    rateLimit: 'normal',
    querySchema: StatsQuerySchema,
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateDailyStats(
  referrals: ReferralWithPopup[],
  earnings: EarningRecord[],
  period: string
): DailyStats[] {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const dailyMap = new Map<string, DailyStats>();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyMap.set(dateKey, {
      date: dateKey,
      referrals: 0,
      checkins: 0,
      earnings: 0,
    });
  }

  // Count referrals
  for (const ref of referrals) {
    const dateKey = new Date(ref.created_at).toISOString().split('T')[0];
    const day = dailyMap.get(dateKey);
    if (day) {
      day.referrals++;
      if (ref.checked_in) {
        day.checkins++;
      }
    }
  }

  // Sum earnings
  for (const earning of earnings) {
    const dateKey = new Date(earning.created_at).toISOString().split('T')[0];
    const day = dailyMap.get(dateKey);
    if (day) {
      day.earnings += earning.amount;
    }
  }

  return Array.from(dailyMap.values()).reverse();
}

function generateDemoDailyStats(period: string): DailyStats[] {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const stats: DailyStats[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate realistic-looking random data
    const referrals = Math.floor(Math.random() * 5) + (i % 7 === 0 || i % 7 === 6 ? 2 : 0);
    const checkins = Math.floor(referrals * (0.6 + Math.random() * 0.3));

    stats.push({
      date: date.toISOString().split('T')[0],
      referrals,
      checkins,
      earnings: checkins * 600, // Silver tier rate
    });
  }

  return stats;
}

function getNextPayoutDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  return nextMonth;
}
