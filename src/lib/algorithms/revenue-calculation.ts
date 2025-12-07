/**
 * Revenue Calculation Module
 *
 * Calculates estimated revenue and licensing deals for live shows.
 */

import type { ShowHost, LiveShowRequest, EstimatedRevenue, LicensingDeal } from './types';
import { TIER_MULTIPLIERS } from './host-scoring';

const PLATFORM_FEE_RATE = 0.15; // ZZIK 플랫폼 수수료

// ============================================================================
// REVENUE ESTIMATION
// ============================================================================

/**
 * Calculate estimated revenue for a show
 */
export function calculateEstimatedRevenue(
  host: ShowHost,
  request: LiveShowRequest
): EstimatedRevenue {
  // Estimate gross sales based on host performance and products
  const totalProductValue = request.products.reduce(
    (sum, p) => sum + p.price * Math.min(p.inventory, 100),
    0
  );
  const estimatedConversion = host.performance.conversionRate;
  const tierMultiplier = TIER_MULTIPLIERS[host.tier];

  const grossSales = Math.round(totalProductValue * estimatedConversion * tierMultiplier * 0.7);

  // Calculate fees
  const hostFee = host.pricing.baseFee;
  const hostCommission = Math.round(grossSales * host.pricing.commissionRate);
  const platformFee = Math.round(grossSales * PLATFORM_FEE_RATE);

  return {
    grossSales,
    hostFee,
    hostCommission,
    platformFee,
    brandNet: grossSales - hostFee - hostCommission - platformFee,
    hostTotal: hostFee + hostCommission,
  };
}

// ============================================================================
// LICENSING DEALS
// ============================================================================

/**
 * Calculate licensing deal value
 */
export function calculateLicensingValue(
  deal: LicensingDeal,
  actualPerformance: {
    totalSales: number;
    avgViewers: number;
    showsCompleted: number;
  }
): {
  baseFee: number;
  performanceBonus: number;
  viewerBonus: number;
  totalValue: number;
  platformRevenue: number;
} {
  const baseFee = deal.baseLicenseFee * actualPerformance.showsCompleted;

  // Performance bonus
  let performanceBonus = 0;
  if (actualPerformance.totalSales > deal.performanceBonus.salesThreshold) {
    const excessSales = actualPerformance.totalSales - deal.performanceBonus.salesThreshold;
    performanceBonus = excessSales * deal.performanceBonus.bonusRate;
  }

  // Viewer bonus
  let viewerBonus = 0;
  if (deal.performanceBonus.viewerBonus) {
    viewerBonus =
      Math.floor(actualPerformance.avgViewers / 1000) *
      deal.performanceBonus.viewerBonus *
      actualPerformance.showsCompleted;
  }

  const totalValue = baseFee + performanceBonus + viewerBonus;

  return {
    baseFee,
    performanceBonus,
    viewerBonus,
    totalValue,
    platformRevenue: totalValue * PLATFORM_FEE_RATE,
  };
}

/**
 * Suggest licensing deal structure
 */
export function suggestLicensingDeal(host: ShowHost, request: LiveShowRequest): LicensingDeal {
  const tierMultiplier = TIER_MULTIPLIERS[host.tier];

  // Base license fee based on tier and category
  const baseLicenseFee = Math.round(host.pricing.baseFee * tierMultiplier * 1.5);

  // Performance threshold based on host history
  const salesThreshold = Math.round(
    ((host.performance.avgSalesPerShow * request.budget.expectedSales) /
      host.performance.avgSalesPerShow) *
      0.8
  );

  // Determine deal type based on priority
  const dealType: LicensingDeal['dealType'] =
    request.priority === 'exclusive'
      ? 'exclusive'
      : request.priority === 'premium'
        ? 'series'
        : 'one-time';

  return {
    brandId: request.popupId,
    hostId: host.id,
    dealType,
    baseLicenseFee,
    performanceBonus: {
      salesThreshold: isNaN(salesThreshold) ? host.performance.avgSalesPerShow : salesThreshold,
      bonusRate: 0.05, // 5% bonus on excess sales
      viewerBonus: request.priority === 'premium' ? 50000 : undefined, // 5만원 per 1K viewers
    },
    duration: {
      startDate: request.schedule.date,
      endDate: request.schedule.date,
      showCount: 1,
    },
    exclusivity:
      dealType === 'exclusive'
        ? {
            categoryExclusive: true,
            competitorRestriction: [],
            radius: 5,
          }
        : undefined,
  };
}
