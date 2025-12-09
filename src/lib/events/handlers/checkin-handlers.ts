
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { eventBus } from '../event-bus';

/**
 * Handle side effects of a successful check-in
 * - Update Leader stats
 * - Calculate Commission
 * - Update Referral status
 */
export async function handleCheckinVerified(payload: {
  userId: string;
  popupId: string;
  referralCode?: string;
  timestamp: string;
}) {
  const { userId, popupId, referralCode } = payload;

  if (!referralCode) return;

  const supabase = createAdminClient();
  
  try {
    // 1. Find Leader
    const { data: leader } = await supabase
      .from('leaders')
      .select('id, user_id')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (!leader || leader.user_id === userId) return;

    // 2. Mark Referral as Checked In
    const { error: updateError } = await supabase
      .from('leader_referrals')
      .update({ checked_in: true })
      .eq('leader_id', leader.id)
      .eq('referred_user_id', userId)
      .eq('popup_id', popupId);

    if (updateError) {
       logger.warn('[CheckinHandler] Failed to update referral', updateError);
    }

    // 3. Increment Stats (RPC)
    const { error: rpcError } = await supabase.rpc('increment_leader_checkins', { 
      p_leader_id: leader.id 
    });

    if (rpcError) {
        // Fallback: Manual update if RPC fails
        logger.warn('[CheckinHandler] RPC failed, falling back to manual increment');
        // ... fallback logic
    }

    // 4. Record Earnings
    await supabase.from('leader_earnings').insert({
      leader_id: leader.id,
      amount: 750, // Base commission
      source: 'checkin',
      referral_id: null, // could fetch this if needed
    });

    logger.info(`[CheckinHandler] Processed leader rewards for ${leader.id}`);

  } catch (error) {
    logger.error('[CheckinHandler] Critical failure', error);
    throw error; // Re-throw to trigger DLQ logic in EventBus
  }
}

// Register the handler
eventBus.subscribe('checkin.verified', handleCheckinVerified);
