import { z } from 'zod';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

/**
 * Leader Payout API - 리더 정산 시스템
 *
 * POST /api/leader/payout
 * - action: 'request' - 정산 요청
 * - action: 'cancel' - 정산 취소
 * - action: 'history' - 정산 내역 조회
 * - action: 'summary' - 정산 요약 조회
 *
 * Security:
 * - Authentication required
 * - CSRF protection
 * - Rate limiting
 */

// ============================================================================
// TYPES
// ============================================================================

interface LeaderRecord {
  id: string;
  user_id: string;
  referral_code: string;
  tier: string;
  total_earnings: number;
}

interface EarningRecord {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface PayoutRecord {
  id: string;
  leader_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  earnings_count: number;
  reject_reason: string | null;
  requested_at: string;
  confirmed_at: string | null;
  processing_at: string | null;
  paid_at: string | null;
  rejected_at: string | null;
}

interface PayoutSummary {
  pending_amount: number;
  confirmed_amount: number;
  processing_amount: number;
  paid_total: number;
  payable_amount: number;
  last_payout_date: string | null;
  next_payout_date: string;
  min_payout_amount: number;
  can_request_payout: boolean;
}

// SEC-017: Type-safe RPC wrapper for payout summary
// This avoids unsafe 'any' cast while handling RPC calls not in generated types
interface RpcClient {
  rpc: (
    fnName: string,
    args: Record<string, unknown>
  ) => {
    single: () => Promise<{ data: PayoutSummary | null; error: { message: string } | null }>;
  };
}

function callPayoutSummaryRpc(
  client: ReturnType<typeof createAdminClient>,
  leaderId: string
): Promise<{ data: PayoutSummary | null; error: { message: string } | null }> {
  // Type-safe RPC call - the function exists in DB but not in generated types
  const rpcClient = client as unknown as RpcClient;
  return rpcClient.rpc('get_leader_payout_summary', { p_leader_id: leaderId }).single();
}

// ============================================================================
// SCHEMAS
// ============================================================================

const PayoutActionSchema = z.object({
  action: z.enum(['request', 'cancel', 'history', 'summary']),
  // For request action
  amount: z.number().min(10000).optional(), // Minimum 10,000 won
  bankName: z.string().max(50).optional(),
  accountNumber: z.string().max(50).optional(),
  accountHolder: z.string().max(50).optional(),
  // For cancel action
  payoutId: z.string().uuid().optional(),
  cancelReason: z.string().max(500).optional(),
  // For history action
  limit: z.number().min(1).max(50).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  status: z
    .enum(['pending', 'confirmed', 'processing', 'paid', 'rejected', 'cancelled', 'all'])
    .optional()
    .default('all'),
});

type PayoutAction = z.infer<typeof PayoutActionSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

const MINIMUM_PAYOUT_AMOUNT = 10000; // 10,000 won
const PAYOUT_FEE_RATE = 0; // 0% fee initially

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get next Thursday (payout day)
 */
function getNextPayoutDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);
  nextThursday.setHours(0, 0, 0, 0);
  return nextThursday;
}

/**
 * Mask account number for display
 */
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return '****' + accountNumber.slice(-4);
}

// ============================================================================
// POST: Handle payout actions
// ============================================================================

export const POST = withMiddleware<PayoutAction>(
  async (_request, context, data) => {
    const userId = context.userId;

    if (!userId) {
      return apiError('Authentication required', 401);
    }

    if (!data) {
      return apiError('Request data required', 400);
    }

    const { action } = data;

    if (!isSupabaseConfigured()) {
      // Return demo response
      return getDemoResponse(action, data);
    }

    const supabase = createAdminClient();

    // Get leader profile
    const { data: leader, error: leaderError } = (await supabase
      .from('leaders')
      .select(
        'id, user_id, referral_code, tier, total_referrals, total_checkins, total_earnings, created_at'
      )
      .eq('user_id', userId)
      .single()) as { data: LeaderRecord | null; error: { message: string } | null };

    if (leaderError || !leader) {
      return apiError('Leader profile not found. Please register as a leader first.', 404);
    }

    // ========================================
    // ACTION: Request payout
    // ========================================
    if (action === 'request') {
      return handlePayoutRequest(supabase, leader, data);
    }

    // ========================================
    // ACTION: Cancel payout
    // ========================================
    if (action === 'cancel') {
      return handlePayoutCancel(supabase, leader, data);
    }

    // ========================================
    // ACTION: Get payout history
    // ========================================
    if (action === 'history') {
      return handlePayoutHistory(supabase, leader, data);
    }

    // ========================================
    // ACTION: Get payout summary
    // ========================================
    if (action === 'summary') {
      return handlePayoutSummary(supabase, leader);
    }

    return apiError('Invalid action', 400);
  },
  {
    requireAuth: true,
    csrf: true,
    rateLimit: 'strict',
    bodySchema: PayoutActionSchema,
  }
);

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handlePayoutRequest(
  supabase: ReturnType<typeof createAdminClient>,
  leader: LeaderRecord,
  data: PayoutAction
) {
  // Get confirmed earnings
  const { data: confirmedEarnings, error: earningsError } = (await supabase
    .from('leader_earnings')
    .select('id, amount, created_at')
    .eq('leader_id', leader.id)
    .eq('status', 'confirmed')) as {
    data: EarningRecord[] | null;
    error: { message: string } | null;
  };

  if (earningsError) {
    logger.error('Error fetching earnings:', earningsError);
    return apiError('Failed to fetch earnings', 500);
  }

  const totalConfirmedEarnings = (confirmedEarnings || []).reduce((sum, e) => sum + e.amount, 0);

  // Check for existing pending payouts
  const { data: pendingPayouts } = (await supabase
    .from('leader_payouts')
    .select('amount')
    .eq('leader_id', leader.id)
    .in('status', ['pending', 'confirmed', 'processing'])) as { data: { amount: number }[] | null };

  const pendingAmount = (pendingPayouts || []).reduce((sum, p) => sum + p.amount, 0);
  const availableAmount = totalConfirmedEarnings - pendingAmount;

  // Use requested amount or maximum available
  const requestedAmount = data.amount || availableAmount;

  // Validate amount
  if (requestedAmount < MINIMUM_PAYOUT_AMOUNT) {
    return apiError(
      `Minimum payout amount is ${MINIMUM_PAYOUT_AMOUNT.toLocaleString()}won. Available: ${availableAmount.toLocaleString()}won`,
      400
    );
  }

  if (requestedAmount > availableAmount) {
    return apiError(
      `Requested amount exceeds available balance. Available: ${availableAmount.toLocaleString()}won`,
      400
    );
  }

  // Calculate fee
  const fee = Math.floor(requestedAmount * PAYOUT_FEE_RATE);

  // Get earnings period
  const sortedEarnings = (confirmedEarnings || []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const periodStart = sortedEarnings[0]?.created_at;
  const periodEnd = sortedEarnings[sortedEarnings.length - 1]?.created_at;

  // Create payout request
  // Note: Type assertion needed as Supabase types may not be in sync with actual schema
  const { data: payout, error: payoutError } = (await (
    supabase.from('leader_payouts') as ReturnType<typeof supabase.from>
  )
    .insert({
      leader_id: leader.id,
      amount: requestedAmount,
      fee,
      status: 'pending',
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder: data.accountHolder,
      earnings_count: confirmedEarnings?.length || 0,
      earnings_period_start: periodStart,
      earnings_period_end: periodEnd,
    } as unknown)
    .select()
    .single()) as { data: PayoutRecord | null; error: { message: string } | null };

  if (payoutError || !payout) {
    logger.error('Error creating payout request:', payoutError);
    return apiError('Failed to create payout request', 500);
  }

  const nextPayoutDate = getNextPayoutDate();

  return apiSuccess({
    message: 'Payout request submitted successfully',
    payout: {
      id: payout.id,
      amount: payout.amount,
      fee: payout.fee,
      netAmount: payout.net_amount,
      status: payout.status,
      requestedAt: payout.requested_at,
      estimatedPaymentDate: nextPayoutDate.toISOString(),
    },
  });
}

async function handlePayoutCancel(
  supabase: ReturnType<typeof createAdminClient>,
  leader: LeaderRecord,
  data: PayoutAction
) {
  if (!data.payoutId) {
    return apiError('Payout ID required for cancellation', 400);
  }

  // Check if payout exists and is pending
  const { data: payout, error: fetchError } = (await supabase
    .from('leader_payouts')
    .select('id, leader_id, amount, fee, net_amount, status, requested_at')
    .eq('id', data.payoutId)
    .eq('leader_id', leader.id)
    .single()) as { data: PayoutRecord | null; error: { message: string } | null };

  if (fetchError || !payout) {
    return apiError('Payout request not found', 404);
  }

  if (payout.status !== 'pending') {
    return apiError(`Cannot cancel payout with status: ${payout.status}`, 400);
  }

  // Update payout status
  // Note: Type assertion needed as Supabase types may not be in sync with actual schema
  const { error: updateError } = await (
    supabase.from('leader_payouts') as ReturnType<typeof supabase.from>
  )
    .update({
      status: 'cancelled',
      cancel_reason: data.cancelReason || 'Cancelled by user',
      cancelled_at: new Date().toISOString(),
    } as unknown)
    .eq('id', data.payoutId);

  if (updateError) {
    logger.error('Error cancelling payout:', updateError);
    return apiError('Failed to cancel payout', 500);
  }

  return apiSuccess({
    message: 'Payout request cancelled successfully',
    payoutId: data.payoutId,
  });
}

async function handlePayoutHistory(
  supabase: ReturnType<typeof createAdminClient>,
  leader: LeaderRecord,
  data: PayoutAction
) {
  const limit = data.limit || 10;
  const offset = data.offset || 0;
  const statusFilter = data.status || 'all';

  let query = supabase
    .from('leader_payouts')
    .select('*', { count: 'exact' })
    .eq('leader_id', leader.id)
    .order('requested_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const {
    data: payouts,
    error,
    count,
  } = (await query) as {
    data: PayoutRecord[] | null;
    error: { message: string } | null;
    count: number | null;
  };

  if (error) {
    logger.error('Error fetching payout history:', error);
    return apiError('Failed to fetch payout history', 500);
  }

  const formattedPayouts = (payouts || []).map((p) => ({
    id: p.id,
    amount: p.amount,
    fee: p.fee,
    netAmount: p.net_amount,
    status: p.status,
    bankInfo:
      p.bank_name && p.account_number
        ? `${p.bank_name} ${maskAccountNumber(p.account_number)}`
        : null,
    earningsCount: p.earnings_count,
    rejectReason: p.reject_reason,
    requestedAt: p.requested_at,
    confirmedAt: p.confirmed_at,
    processingAt: p.processing_at,
    paidAt: p.paid_at,
    rejectedAt: p.rejected_at,
  }));

  return apiSuccess({
    payouts: formattedPayouts,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}

async function handlePayoutSummary(
  supabase: ReturnType<typeof createAdminClient>,
  leader: LeaderRecord
) {
  // Try to use the database function with type-safe wrapper
  const { data: summary, error } = await callPayoutSummaryRpc(supabase, leader.id);

  if (error) {
    logger.error('Error fetching payout summary via RPC:', error);
    // Fall back to manual calculation
    return calculatePayoutSummaryManually(supabase, leader);
  }

  if (!summary) {
    return calculatePayoutSummaryManually(supabase, leader);
  }

  return apiSuccess({
    summary: {
      pendingAmount: summary.pending_amount,
      confirmedAmount: summary.confirmed_amount,
      processingAmount: summary.processing_amount,
      paidTotal: summary.paid_total,
      payableAmount: summary.payable_amount,
      lastPayoutDate: summary.last_payout_date,
      nextPayoutDate: summary.next_payout_date,
      minPayoutAmount: summary.min_payout_amount,
      canRequestPayout: summary.can_request_payout,
    },
  });
}

async function calculatePayoutSummaryManually(
  supabase: ReturnType<typeof createAdminClient>,
  leader: LeaderRecord
) {
  // Get confirmed earnings
  const { data: confirmedEarnings } = (await supabase
    .from('leader_earnings')
    .select('amount')
    .eq('leader_id', leader.id)
    .eq('status', 'confirmed')) as { data: { amount: number }[] | null };

  const payableAmount = (confirmedEarnings || []).reduce((sum, e) => sum + e.amount, 0);

  // Get payout totals by status
  const { data: payouts } = (await supabase
    .from('leader_payouts')
    .select('amount, status, paid_at')
    .eq('leader_id', leader.id)) as { data: PayoutRecord[] | null };

  const pendingAmount = (payouts || [])
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmedAmount = (payouts || [])
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  const processingAmount = (payouts || [])
    .filter((p) => p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidTotal = (payouts || [])
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidPayouts = (payouts || [])
    .filter((p) => p.status === 'paid' && p.paid_at)
    .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime());

  const lastPayoutDate = paidPayouts[0]?.paid_at || null;

  const availableForPayout = Math.max(
    payableAmount - pendingAmount - confirmedAmount - processingAmount,
    0
  );

  const nextPayoutDate = getNextPayoutDate();

  return apiSuccess({
    summary: {
      pendingAmount,
      confirmedAmount,
      processingAmount,
      paidTotal,
      payableAmount: availableForPayout,
      lastPayoutDate,
      nextPayoutDate: nextPayoutDate.toISOString().split('T')[0],
      minPayoutAmount: MINIMUM_PAYOUT_AMOUNT,
      canRequestPayout: availableForPayout >= MINIMUM_PAYOUT_AMOUNT,
    },
  });
}

// ============================================================================
// DEMO RESPONSES
// ============================================================================

function getDemoResponse(action: string, data: PayoutAction) {
  const nextPayoutDate = getNextPayoutDate();

  if (action === 'request') {
    const amount = data.amount || 42500;
    return apiSuccess({
      message: 'Payout request submitted successfully (Demo)',
      payout: {
        id: `demo-payout-${Date.now()}`,
        amount,
        fee: 0,
        netAmount: amount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        estimatedPaymentDate: nextPayoutDate.toISOString(),
      },
      isDemo: true,
    });
  }

  if (action === 'cancel') {
    return apiSuccess({
      message: 'Payout request cancelled successfully (Demo)',
      payoutId: data.payoutId || 'demo-payout',
      isDemo: true,
    });
  }

  if (action === 'history') {
    return apiSuccess({
      payouts: [
        {
          id: 'demo-1',
          amount: 42500,
          fee: 0,
          netAmount: 42500,
          status: 'pending',
          bankInfo: null,
          earningsCount: 23,
          rejectReason: null,
          requestedAt: new Date().toISOString(),
          confirmedAt: null,
          processingAt: null,
          paidAt: null,
          rejectedAt: null,
        },
        {
          id: 'demo-2',
          amount: 38000,
          fee: 0,
          netAmount: 38000,
          status: 'paid',
          bankInfo: '카카오뱅크 ****1234',
          earningsCount: 19,
          rejectReason: null,
          requestedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          confirmedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          processingAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          paidAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          rejectedAt: null,
        },
        {
          id: 'demo-3',
          amount: 55000,
          fee: 0,
          netAmount: 55000,
          status: 'paid',
          bankInfo: '토스 ****5678',
          earningsCount: 28,
          rejectReason: null,
          requestedAt: new Date(Date.now() - 28 * 86400000).toISOString(),
          confirmedAt: new Date(Date.now() - 26 * 86400000).toISOString(),
          processingAt: new Date(Date.now() - 24 * 86400000).toISOString(),
          paidAt: new Date(Date.now() - 21 * 86400000).toISOString(),
          rejectedAt: null,
        },
      ],
      pagination: {
        total: 3,
        limit: data.limit || 10,
        offset: data.offset || 0,
        hasMore: false,
      },
      isDemo: true,
    });
  }

  if (action === 'summary') {
    return apiSuccess({
      summary: {
        pendingAmount: 42500,
        confirmedAmount: 0,
        processingAmount: 0,
        paidTotal: 93000,
        payableAmount: 15000,
        lastPayoutDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        nextPayoutDate: nextPayoutDate.toISOString().split('T')[0],
        minPayoutAmount: MINIMUM_PAYOUT_AMOUNT,
        canRequestPayout: true,
      },
      isDemo: true,
    });
  }

  return apiError('Invalid action', 400);
}
