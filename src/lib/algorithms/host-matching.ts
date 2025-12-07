/**
 * Show Host Matching Module
 *
 * Matches hosts to live show requests based on performance and availability.
 */

import type { ShowHost, LiveShowRequest, HostMatchResult, ScheduleInfo } from './types';
import {
  calculateSalesScore,
  calculateLiveEngagementScore,
  calculateExpertiseScore,
  calculateReliabilityScore,
  calculateMatchScore,
} from './host-scoring';
import { calculateEstimatedRevenue } from './revenue-calculation';

// ============================================================================
// AVAILABILITY CHECKS
// ============================================================================

/**
 * Check host availability for the request
 */
export function checkAvailability(
  host: ShowHost,
  schedule: ScheduleInfo
): 'available' | 'limited' | 'busy' {
  const { availability } = host;
  const requestDate = new Date(schedule.date);
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][
    requestDate.getDay()
  ] as (typeof availability.preferredDays)[number];

  // Check blocked dates
  if (availability.blockedDates.includes(schedule.date)) {
    return 'busy';
  }

  // Check if at capacity
  if (availability.currentBookings >= availability.maxShowsPerWeek) {
    return 'busy';
  }

  // Check preferred day and time
  const preferredDay = availability.preferredDays.includes(dayOfWeek);
  const startHour = parseInt(schedule.startTime.split(':')[0], 10);
  const preferredTime = availability.preferredHours.includes(startHour);

  if (preferredDay && preferredTime) {
    return 'available';
  }

  return 'limited';
}

// ============================================================================
// MATCHING
// ============================================================================

/**
 * Match show hosts to a live show request
 */
export function matchHostsToRequest(
  request: LiveShowRequest,
  hosts: ShowHost[],
  limit: number = 5
): HostMatchResult[] {
  const results: HostMatchResult[] = [];
  const isComplexCategory = ['fashion', 'beauty', 'tech'].includes(request.category);

  for (const host of hosts) {
    // Check availability first
    const availability = checkAvailability(host, request.schedule);
    if (availability === 'busy') continue;

    // Check budget fit
    const estimatedRevenue = calculateEstimatedRevenue(host, request);
    if (estimatedRevenue.hostTotal > request.budget.hostBudgetMax * 1.2) {
      continue; // Skip if too expensive
    }

    // Calculate scores
    const sales = calculateSalesScore(host);
    const engagement = calculateLiveEngagementScore(host);
    const expertise = calculateExpertiseScore(host, request.category, isComplexCategory);
    const reliability = calculateReliabilityScore(host);

    const score = calculateMatchScore(sales, engagement, expertise, reliability);

    results.push({
      hostId: host.id,
      hostName: host.nickname,
      matchScore: score,
      breakdown: { sales, engagement, expertise, reliability },
      estimatedSales: estimatedRevenue.grossSales,
      estimatedRevenue,
      reasons: generateHostReasons(host, request, { sales, engagement, expertise, reliability }),
      availability,
    });
  }

  // Sort by score, then by availability
  results.sort((a, b) => {
    if (a.availability !== b.availability) {
      return a.availability === 'available' ? -1 : 1;
    }
    return b.matchScore - a.matchScore;
  });

  return results.slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateHostReasons(
  host: ShowHost,
  request: LiveShowRequest,
  scores: { sales: number; engagement: number; expertise: number; reliability: number }
): string[] {
  const reasons: string[] = [];

  if (scores.sales >= 0.7) {
    reasons.push(`평균 판매 ${formatCurrency(host.performance.avgSalesPerShow)}`);
  }

  if (scores.engagement >= 0.7) {
    reasons.push(`평균 ${formatNumber(host.performance.avgViewers)} 시청자`);
  }

  if (host.categories.includes(request.category)) {
    reasons.push(`${request.category} 전문 쇼호스트`);
  }

  if (host.performance.avgRating >= 4.5) {
    reasons.push(`${host.performance.avgRating.toFixed(1)}점 평점`);
  }

  if (host.tier === 'star' || host.tier === 'legend') {
    reasons.push(`${host.tier.toUpperCase()} 등급`);
  }

  if (host.performance.recentTrend === 'up') {
    reasons.push('상승세');
  }

  return reasons.length > 0 ? reasons : ['매칭 쇼호스트'];
}

function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}만`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
