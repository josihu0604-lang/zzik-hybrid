import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isValidReferralCode, type LeaderTier } from '@/lib/leader';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

interface LeaderLookup {
  id: string;
  user_id: string;
  tier: string;
  total_referrals: number;
}

interface ReferralRecord {
  id: string;
  leader_id: string;
  checked_in: boolean;
}

interface ParticipationRecord {
  id: string;
  user_id: string;
  popup_id: string;
}

// ============================================================================
// SCHEMAS
// ============================================================================

const TrackReferralSchema = z.object({
  action: z.enum(['track', 'checkin']),
  referralCode: z.string().min(6).max(12),
  popupId: z.string().uuid(),
  participationId: z.string().uuid().optional(),
  checkinId: z.string().uuid().optional(),
});

type TrackReferralInput = z.infer<typeof TrackReferralSchema>;

const ReferralQuerySchema = z.object({
  code: z.string().optional(),
  popupId: z.string().uuid().optional(),
});

type ReferralQuery = z.infer<typeof ReferralQuerySchema>;

// ============================================================================
// EARNINGS RATES
// ============================================================================

const PARTICIPATION_EARNINGS: Record<LeaderTier, number> = {
  Bronze: 100,
  Silver: 150,
  Gold: 250,
  Platinum: 500,
};

const CHECKIN_EARNINGS: Record<LeaderTier, number> = {
  Bronze: 500,
  Silver: 600,
  Gold: 750,
  Platinum: 1000,
};

// ============================================================================
// GET: Validate referral code
// ============================================================================

export const GET = withMiddleware<ReferralQuery>(
  async (_request, _context, query) => {
    const { code } = query || {};

    if (!code) {
      return apiError('Referral code required', 400);
    }

    // Validate format
    if (!isValidReferralCode(code)) {
      return apiError('Invalid referral code format', 400);
    }

    // Check database
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();

        const { data: leader, error } = (await supabase
          .from('leaders')
          .select('id, user_id, tier, total_referrals')
          .eq('referral_code', code.toUpperCase())
          .single()) as { data: LeaderLookup | null; error: { message: string } | null };

        if (error || !leader) {
          return apiError('Referral code not found', 404);
        }

        return apiSuccess({
          valid: true,
          data: {
            leaderId: leader.id,
            tier: leader.tier,
            totalReferrals: leader.total_referrals,
          },
        });
      } catch (error) {
        logger.error('[Referral API] Validation error', error);
      }
    }

    // Demo mode - accept any valid format code
    return apiSuccess({
      valid: true,
      data: {
        leaderId: 'demo-leader',
        tier: 'Silver',
        totalReferrals: 67,
      },
      isDemo: true,
    });
  },
  {
    requireAuth: false,
    rateLimit: 'relaxed',
    querySchema: ReferralQuerySchema,
  }
);

// ============================================================================
// POST: Track referral or process checkin
// ============================================================================

export const POST = withMiddleware<TrackReferralInput>(
  async (_request, context, data) => {
    if (!data) {
      return apiError('Request data required', 400);
    }

    const { action, referralCode, popupId, participationId, checkinId } = data;

    // Validate referral code
    if (!isValidReferralCode(referralCode)) {
      return apiError('Invalid referral code format', 400);
    }

    const userId = context.userId;
    const normalizedCode = referralCode.toUpperCase();

    // ========================================
    // ACTION: Track participation referral
    // ========================================
    if (action === 'track') {
      if (!userId) {
        return apiError('Authentication required', 401);
      }

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();

          // Find leader by referral code
          const { data: leader, error: leaderError } = (await supabase
            .from('leaders')
            .select('id, user_id, tier, total_referrals')
            .eq('referral_code', normalizedCode)
            .eq('is_active', true)
            .single()) as { data: LeaderLookup | null; error: { message: string } | null };

          if (leaderError || !leader) {
            return apiError('Invalid or inactive referral code', 404);
          }

          // Prevent self-referral
          if (leader.user_id === userId) {
            return apiError('Cannot use your own referral code', 400);
          }

          // Check for existing referral (same user, same popup)
          const { data: existingRef } = (await supabase
            .from('leader_referrals')
            .select('id')
            .eq('referred_user_id', userId as string)
            .eq('popup_id', popupId)
            .single()) as { data: ReferralRecord | null };

          if (existingRef) {
            return apiSuccess({
              message: 'Referral already recorded',
              data: { referralId: existingRef.id },
              alreadyTracked: true,
            });
          }

          // Get participation if exists
          let participationRecord: ParticipationRecord | null = null;
          if (participationId) {
            const { data: participation } = (await supabase
              .from('popup_participations')
              .select('id, user_id, popup_id')
              .eq('id', participationId)
              .single()) as { data: ParticipationRecord | null };
            participationRecord = participation;
          }

          // Create referral record
          type ReferralInsert = {
            leader_id: string;
            referred_user_id: string;
            popup_id: string;
            referral_code: string;
            participation_id: string | null;
            checked_in: boolean;
          };
          const { data: newReferral, error: refError } = (await supabase
            .from('leader_referrals')
            .insert({
              leader_id: leader.id,
              referred_user_id: userId,
              popup_id: popupId,
              referral_code: normalizedCode,
              participation_id: participationRecord?.id || null,
              checked_in: false,
            } as ReferralInsert)
            .select('id')
            .single()) as {
            data: { id: string } | null;
            error: { message: string; code?: string } | null;
          };

          if (refError) {
            // Handle duplicate constraint
            if (refError.code === '23505') {
              return apiSuccess({
                message: 'Referral already recorded',
                alreadyTracked: true,
              });
            }
            throw refError;
          }

          // Update leader stats
          const tier = leader.tier as LeaderTier;
          const participationEarning = PARTICIPATION_EARNINGS[tier] || 100;

          type LeaderUpdate = {
            total_referrals: number;
            total_earnings: number;
          };
          await supabase
            .from('leaders')
            .update({
              total_referrals: leader.total_referrals + 1,
              total_earnings:
                (await getLeaderTotalEarnings(supabase, leader.id)) + participationEarning,
            } as LeaderUpdate)
            .eq('id', leader.id);

          // Record earning for participation
          type EarningInsert = {
            leader_id: string;
            referral_id: string | undefined;
            popup_id: string;
            amount: number;
            tier_at_earning: string;
            status: string;
          };
          await supabase.from('leader_earnings').insert({
            leader_id: leader.id,
            referral_id: newReferral?.id,
            popup_id: popupId,
            amount: participationEarning,
            tier_at_earning: tier,
            status: 'pending',
          } as EarningInsert);

          return apiSuccess({
            message: 'Referral tracked successfully',
            data: {
              referralId: newReferral?.id,
              leaderId: leader.id,
              earning: participationEarning,
            },
          });
        } catch (error) {
          logger.error('[Referral API] Track error', error);
          return apiError('Failed to track referral', 500);
        }
      }

      // Demo response
      return apiSuccess({
        message: 'Referral tracked (demo)',
        data: {
          referralId: `demo-${Date.now()}`,
          leaderId: 'demo-leader',
          earning: 150,
        },
        isDemo: true,
      });
    }

    // ========================================
    // ACTION: Process checkin (called by system)
    // ========================================
    if (action === 'checkin') {
      if (!checkinId) {
        return apiError('Checkin ID required', 400);
      }

      if (isSupabaseConfigured()) {
        try {
          const supabase = createAdminClient();

          // Find referral for this user and popup
          type ReferralWithLeader = ReferralRecord & {
            leaders: {
              id: string;
              tier: string;
              total_checkins: number;
              total_earnings: number;
            };
          };
          const { data: referral, error: refError } = (await supabase
            .from('leader_referrals')
            .select(
              `
              id,
              leader_id,
              checked_in,
              leaders!inner(id, tier, total_checkins, total_earnings)
            `
            )
            .eq('referred_user_id', userId as string)
            .eq('popup_id', popupId)
            .eq('checked_in', false)
            .single()) as {
            data: ReferralWithLeader | null;
            error: { message: string } | null;
          };

          if (refError || !referral) {
            // No pending referral for this checkin
            return apiSuccess({
              message: 'No referral to process',
              processed: false,
            });
          }

          const leader = referral.leaders;
          const tier = leader.tier as LeaderTier;
          const checkinEarning = CHECKIN_EARNINGS[tier] || 500;

          // Mark referral as checked in
          type ReferralUpdate = {
            checked_in: boolean;
            checkin_id: string;
          };
          await supabase
            .from('leader_referrals')
            .update({
              checked_in: true,
              checkin_id: checkinId,
            } as ReferralUpdate)
            .eq('id', referral.id);

          // Create earning record for checkin
          type CheckinEarningInsert = {
            leader_id: string;
            referral_id: string;
            popup_id: string;
            checkin_id: string;
            amount: number;
            tier_at_earning: string;
            status: string;
          };
          await supabase.from('leader_earnings').insert({
            leader_id: leader.id,
            referral_id: referral.id,
            popup_id: popupId,
            checkin_id: checkinId,
            amount: checkinEarning,
            tier_at_earning: tier,
            status: 'pending',
          } as CheckinEarningInsert);

          // Update leader stats
          type LeaderCheckinUpdate = {
            total_checkins: number;
            total_earnings: number;
          };
          await supabase
            .from('leaders')
            .update({
              total_checkins: leader.total_checkins + 1,
              total_earnings: leader.total_earnings + checkinEarning,
            } as LeaderCheckinUpdate)
            .eq('id', leader.id);

          return apiSuccess({
            message: 'Checkin processed successfully',
            data: {
              referralId: referral.id,
              leaderId: leader.id,
              earning: checkinEarning,
            },
            processed: true,
          });
        } catch (error) {
          logger.error('[Referral API] Checkin process error', error);
          return apiError('Failed to process checkin', 500);
        }
      }

      // Demo response
      return apiSuccess({
        message: 'Checkin processed (demo)',
        data: {
          earning: 600,
        },
        isDemo: true,
        processed: true,
      });
    }

    return apiError('Invalid action', 400);
  },
  {
    requireAuth: true,
    allowGuest: false,
    csrf: true,
    rateLimit: 'normal',
    bodySchema: TrackReferralSchema,
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getLeaderTotalEarnings(
  supabase: ReturnType<typeof createAdminClient>,
  leaderId: string
): Promise<number> {
  try {
    const { data } = (await supabase
      .from('leaders')
      .select('total_earnings')
      .eq('id', leaderId)
      .single()) as { data: { total_earnings: number } | null };

    return data?.total_earnings || 0;
  } catch {
    return 0;
  }
}
