/**
 * ZZIK Leader Popup Pipeline - Calculations
 *
 * Settlement and metrics calculations
 */

import type { LeaderPopupPipeline, SettlementData, PipelineMetrics, PipelineStage } from './types';

// ============================================================================
// SETTLEMENT CALCULATION
// ============================================================================

/**
 * Calculate settlement for a completed pipeline
 */
export function calculateSettlement(
  pipeline: LeaderPopupPipeline,
  salesData: {
    grossSales: number;
    refunds: number;
    leaderAttributedSales: number;
  }
): SettlementData {
  const terms = pipeline.contract?.contract.terms;
  if (!terms) {
    throw new Error('Contract terms not found');
  }

  const netSales = salesData.grossSales - salesData.refunds;
  const directSales = netSales - salesData.leaderAttributedSales;

  // Platform fee (15%)
  const PLATFORM_FEE_RATE = 0.15;
  const platformFee = Math.round(netSales * PLATFORM_FEE_RATE);

  // Payment processing fee (3%)
  const PAYMENT_FEE_RATE = 0.03;
  const paymentProcessingFee = Math.round(salesData.grossSales * PAYMENT_FEE_RATE);

  // Leader fees
  const leaderBaseFee = terms.baseFee;
  const leaderCommission = Math.round(salesData.leaderAttributedSales * terms.commissionRate);

  // Performance bonus
  let leaderBonus = 0;
  if (terms.performanceBonus && netSales > terms.performanceBonus.threshold) {
    leaderBonus = terms.performanceBonus.bonusAmount;
  }

  const leaderTotal = leaderBaseFee + leaderCommission + leaderBonus;

  // Brand net revenue
  const brandNetRevenue = netSales - platformFee - paymentProcessingFee - leaderTotal;

  return {
    status: 'pending_approval',
    calculatedAt: new Date().toISOString(),
    salesSummary: {
      grossSales: salesData.grossSales,
      refunds: salesData.refunds,
      netSales,
      leaderAttributedSales: salesData.leaderAttributedSales,
      directSales,
    },
    feeBreakdown: {
      platformFee,
      paymentProcessingFee,
      brandNetRevenue,
      leaderBaseFee,
      leaderCommission,
      leaderBonus,
      leaderTotal,
    },
    payouts: [
      {
        id: `payout-leader-${pipeline.id}`,
        recipient: 'leader',
        amount: leaderTotal,
        currency: 'KRW',
        scheduledDate: getPayoutDate(pipeline, 'leader'),
        status: 'scheduled',
        method: 'bank_transfer',
      },
      {
        id: `payout-brand-${pipeline.id}`,
        recipient: 'brand',
        amount: brandNetRevenue,
        currency: 'KRW',
        scheduledDate: getPayoutDate(pipeline, 'brand'),
        status: 'scheduled',
        method: 'bank_transfer',
      },
    ],
  };
}

/**
 * Get payout date based on recipient
 */
function getPayoutDate(pipeline: LeaderPopupPipeline, recipient: 'leader' | 'brand'): string {
  const executionEnd = pipeline.execution?.completedAt;
  const baseDate = executionEnd ? new Date(executionEnd) : new Date();

  // Leaders get paid faster (T+7), brands get paid T+14
  const daysToAdd = recipient === 'leader' ? 7 : 14;
  baseDate.setDate(baseDate.getDate() + daysToAdd);

  return baseDate.toISOString().split('T')[0];
}

// ============================================================================
// FEE CALCULATION HELPERS
// ============================================================================

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(netSales: number, rate = 0.15): number {
  return Math.round(netSales * rate);
}

/**
 * Calculate payment processing fee
 */
export function calculatePaymentFee(grossSales: number, rate = 0.03): number {
  return Math.round(grossSales * rate);
}

/**
 * Calculate leader commission
 */
export function calculateLeaderCommission(attributedSales: number, commissionRate: number): number {
  return Math.round(attributedSales * commissionRate);
}

/**
 * Check if performance bonus is earned
 */
export function checkPerformanceBonus(
  netSales: number,
  threshold: number,
  bonusAmount: number
): number {
  return netSales > threshold ? bonusAmount : 0;
}

// ============================================================================
// PIPELINE METRICS
// ============================================================================

/**
 * Calculate pipeline metrics
 */
export function calculatePipelineMetrics(pipelines: LeaderPopupPipeline[]): PipelineMetrics {
  const stages: PipelineStage[] = [
    'proposal',
    'matching',
    'negotiation',
    'contract',
    'funding',
    'execution',
    'settlement',
    'completed',
  ];

  // Count pipelines at each stage
  const stageCounts = stages.reduce(
    (acc, stage) => {
      acc[stage] = pipelines.filter((p) => p.stage === stage).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  // Calculate conversion rates
  const stageConversionRates = stages.reduce(
    (acc, stage, index) => {
      if (index === 0) {
        acc[stage] = 1;
      } else {
        const prevCount = stages.slice(0, index).reduce((sum, s) => sum + stageCounts[s], 0);
        const currentCount = stages.slice(index).reduce((sum, s) => sum + stageCounts[s], 0);
        acc[stage] = prevCount > 0 ? currentCount / prevCount : 0;
      }
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  // Calculate total revenue from completed pipelines
  const completedPipelines = pipelines.filter((p) => p.stage === 'completed');
  const totalRevenue = completedPipelines.reduce((sum, p) => {
    return sum + (p.settlement?.salesSummary.netSales || 0);
  }, 0);

  return {
    stageConversionRates,
    avgTimePerStage: {} as Record<PipelineStage, number>, // Would need timestamps to calculate
    totalPipelines: pipelines.length,
    activePipelines: pipelines.filter((p) => p.stage !== 'completed' && p.stage !== 'cancelled')
      .length,
    completedPipelines: completedPipelines.length,
    totalRevenue,
    avgRevenuePerPipeline:
      completedPipelines.length > 0 ? totalRevenue / completedPipelines.length : 0,
  };
}

/**
 * Calculate stage duration in hours
 */
export function calculateStageDuration(
  pipeline: LeaderPopupPipeline,
  stage: PipelineStage
): number | null {
  const events = pipeline.timeline.filter((e) => e.stage === stage);
  if (events.length < 2) return null;

  const startEvent = events[0];
  const endEvent = events.find((e) => e.eventType === 'stage_transition');
  if (!endEvent) return null;

  const start = new Date(startEvent.timestamp).getTime();
  const end = new Date(endEvent.timestamp).getTime();
  return (end - start) / (1000 * 60 * 60); // hours
}

/**
 * Calculate funding progress rate
 */
export function calculateFundingProgress(
  currentParticipants: number,
  targetParticipants: number
): number {
  if (targetParticipants <= 0) return 0;
  return Math.min(100, (currentParticipants / targetParticipants) * 100);
}

/**
 * Project funding completion date
 */
export function projectFundingCompletion(
  currentParticipants: number,
  targetParticipants: number,
  dailyGrowthRate: number
): Date | null {
  if (currentParticipants >= targetParticipants) return new Date();
  if (dailyGrowthRate <= 0) return null;

  const remaining = targetParticipants - currentParticipants;
  const daysToComplete = Math.ceil(remaining / dailyGrowthRate);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysToComplete);
  return completionDate;
}

/**
 * Calculate leader impact metrics
 */
export function calculateLeaderImpact(
  referrals: number,
  totalParticipants: number,
  contentViews: number,
  conversions: number
): {
  referralRate: number;
  conversionRate: number;
  impactScore: number;
} {
  const referralRate = totalParticipants > 0 ? (referrals / totalParticipants) * 100 : 0;
  const conversionRate = contentViews > 0 ? (conversions / contentViews) * 100 : 0;

  // Impact score is weighted combination
  const impactScore = referralRate * 0.6 + conversionRate * 0.4;

  return {
    referralRate,
    conversionRate,
    impactScore,
  };
}
