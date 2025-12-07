/**
 * ZZIK Live - Show Host Algorithm
 *
 * Live commerce system for popup events:
 * - Show Host (쇼호스트) matching and scoring → host-scoring.ts, host-matching.ts
 * - Licensing revenue calculation → revenue-calculation.ts
 * - Real-time sales performance tracking
 * - Optimal scheduling for live shows
 *
 * Revenue Model:
 * - Brand pays ZZIK: Licensing fee (고정 + 성과)
 * - ZZIK pays Host: Base fee + Sales commission
 * - Formula: Host Score = Sales(35%) + Engagement(25%) + Expertise(20%) + Reliability(20%)
 */

// ============================================================================
// RE-EXPORTS FROM MODULES
// ============================================================================

export type {
  ShowHost,
  ShowHostTier,
  ShowHostSkills,
  ShowHostPerformance,
  HostAvailability,
  HostPricing,
  LiveShowRequest,
  ProductInfo,
  BudgetInfo,
  ScheduleInfo,
  VenueInfo,
  HostMatchResult,
  EstimatedRevenue,
  LicensingDeal,
  PerformanceBonus,
  ExclusivityTerms,
} from './types';

export {
  calculateSalesScore,
  calculateLiveEngagementScore,
  calculateExpertiseScore,
  calculateReliabilityScore,
  calculateMatchScore,
  SCORING_WEIGHTS,
} from './host-scoring';

export { matchHostsToRequest, checkAvailability } from './host-matching';

export {
  calculateEstimatedRevenue,
  calculateLicensingValue,
  suggestLicensingDeal,
} from './revenue-calculation';

// ============================================================================
// OPTIMAL SCHEDULING
// ============================================================================

import type { ShowHost } from './types';

/**
 * Find optimal show time for a host
 */
export function findOptimalShowTime(
  host: ShowHost,
  constraints: {
    dateRange: [string, string];
    duration: number;
    preferPeakHours?: boolean;
  }
): { date: string; startTime: string; score: number }[] {
  const slots: { date: string; startTime: string; score: number }[] = [];
  const startDate = new Date(constraints.dateRange[0]);
  const endDate = new Date(constraints.dateRange[1]);

  // Peak hours for live commerce (Korean market)
  const peakHours = [12, 13, 19, 20, 21, 22];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][
      currentDate.getDay()
    ] as (typeof host.availability.preferredDays)[number];

    // Skip blocked dates
    if (host.availability.blockedDates.includes(dateStr)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check preferred day
    const isPreferredDay = host.availability.preferredDays.includes(dayOfWeek);

    for (const hour of host.availability.preferredHours) {
      let score = 0.5; // Base score

      if (isPreferredDay) score += 0.2;
      if (host.availability.preferredHours.includes(hour)) score += 0.2;
      if (constraints.preferPeakHours && peakHours.includes(hour)) score += 0.1;

      slots.push({
        date: dateStr,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        score,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by score
  slots.sort((a, b) => b.score - a.score);

  return slots.slice(0, 10);
}

// ============================================================================
// SHOW HOST TIER SYSTEM
// ============================================================================

import type { ShowHostPerformance, ShowHostTier } from './types';

export function getHostTier(performance: ShowHostPerformance): ShowHostTier {
  const score = calculateTierScore(performance);

  if (score >= 90) return 'legend';
  if (score >= 75) return 'star';
  if (score >= 55) return 'pro';
  if (score >= 35) return 'rising';
  return 'rookie';
}

function calculateTierScore(perf: ShowHostPerformance): number {
  // Weighted average of key metrics
  const experienceScore = Math.min(25, perf.totalShows / 4); // Max 25 points (100 shows)
  const salesScore = Math.min(25, perf.avgSalesPerShow / 400000); // Max 25 points (10M avg)
  const ratingScore = Math.min(25, perf.avgRating * 5); // Max 25 points (5.0 rating)
  const conversionScore = Math.min(25, perf.conversionRate * 500); // Max 25 points (5% conversion)

  return experienceScore + salesScore + ratingScore + conversionScore;
}

export function getTierBenefits(tier: ShowHostTier): {
  feeMultiplier: number;
  priorityMatching: boolean;
  badgeColor: string;
  perks: string[];
} {
  const benefits: Record<ShowHostTier, ReturnType<typeof getTierBenefits>> = {
    rookie: {
      feeMultiplier: 1.0,
      priorityMatching: false,
      badgeColor: '#9CA3AF', // Gray
      perks: ['기본 매칭', '교육 자료 접근'],
    },
    rising: {
      feeMultiplier: 1.15,
      priorityMatching: false,
      badgeColor: '#60A5FA', // Blue
      perks: ['우선 교육', '커뮤니티 접근'],
    },
    pro: {
      feeMultiplier: 1.35,
      priorityMatching: true,
      badgeColor: '#A78BFA', // Purple
      perks: ['우선 매칭', '프리미엄 교육', '전용 매니저'],
    },
    star: {
      feeMultiplier: 1.6,
      priorityMatching: true,
      badgeColor: '#FBBF24', // Yellow
      perks: ['VIP 매칭', '브랜드 직거래', '수익 공유 보너스'],
    },
    legend: {
      feeMultiplier: 2.0,
      priorityMatching: true,
      badgeColor: '#FF6B5B', // Flame Coral
      perks: ['독점 딜', '자체 브랜딩', '최고 수익 배분', 'ZZIK 파트너'],
    },
  };

  return benefits[tier];
}
