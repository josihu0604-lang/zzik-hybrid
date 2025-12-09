/**
 * Show Host Scoring Module
 *
 * Calculates host performance scores for matching algorithm.
 */

import type { ShowHost, ShowHostTier } from './types';

// ============================================================================
// WEIGHTS
// ============================================================================

export const SCORING_WEIGHTS = {
  sales: 0.35, // 판매 성과
  engagement: 0.25, // 시청자 참여도
  expertise: 0.2, // 카테고리 전문성
  reliability: 0.2, // 신뢰도
} as const;

export const TIER_MULTIPLIERS: Record<ShowHostTier, number> = {
  rookie: 0.7,
  rising: 0.9,
  pro: 1.0,
  star: 1.2,
  legend: 1.5,
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate sales performance score
 */
export function calculateSalesScore(host: ShowHost): number {
  const perf = host.performance;

  // Conversion rate score (5%+ is excellent for live commerce)
  const conversionScore = Math.min(1, perf.conversionRate / 0.05);

  // Average sales per show (10M KRW is good)
  const salesVolumeScore = Math.min(1, perf.avgSalesPerShow / 10000000);

  // Recent trend bonus
  const trendMultiplier =
    perf.recentTrend === 'up' ? 1.1 : perf.recentTrend === 'down' ? 0.85 : 1.0;

  return (conversionScore * 0.5 + salesVolumeScore * 0.5) * trendMultiplier;
}

/**
 * Calculate engagement score
 */
export function calculateLiveEngagementScore(host: ShowHost): number {
  const perf = host.performance;
  const skills = host.skills;

  // Average viewers (10K viewers is excellent)
  const viewerScore = Math.min(1, Math.log10(perf.avgViewers + 1) / 4);

  // Watch time (30min+ is excellent)
  const watchTimeScore = Math.min(1, perf.avgWatchTime / 30);

  // Return viewer rate (50%+ is excellent)
  const loyaltyScore = Math.min(1, perf.returnViewerRate / 0.5);

  // Skill-based interaction score
  const interactionScore = skills.audienceInteraction / 100;

  return viewerScore * 0.25 + watchTimeScore * 0.25 + loyaltyScore * 0.25 + interactionScore * 0.25;
}

/**
 * Calculate expertise score for category
 */
export function calculateExpertiseScore(
  host: ShowHost,
  category: string,
  isComplexCategory: boolean = false
): number {
  // Category match
  const categoryMatch = host.categories.includes(category);
  const categoryScore = categoryMatch ? 1.0 : 0.4;

  // Skills assessment
  const avgSkills =
    (host.skills.presentation +
      host.skills.productKnowledge +
      host.skills.salesClosing +
      host.skills.crisisManagement) /
    4 /
    100;

  // Product expertise (fashion/beauty requires more knowledge)
  const productComplexity = isComplexCategory ? 0.8 : 0.6;
  const productScore =
    (host.skills.productKnowledge / 100) * productComplexity + (1 - productComplexity);

  return categoryScore * 0.4 + avgSkills * 0.3 + productScore * 0.3;
}

/**
 * Calculate reliability score
 */
export function calculateReliabilityScore(host: ShowHost): number {
  const perf = host.performance;

  // Show completion (low cancel rate)
  const completionScore = 1 - Math.min(1, perf.cancelRate * 10);

  // Rating score
  const ratingScore = perf.avgRating / 5;

  // Experience score (100+ shows = veteran)
  const experienceScore = Math.min(1, perf.totalShows / 100);

  // Tier trust multiplier
  const tierTrust = TIER_MULTIPLIERS[host.tier] / 1.5; // Normalize to 0-1

  return completionScore * 0.35 + ratingScore * 0.35 + experienceScore * 0.2 + tierTrust * 0.1;
}

/**
 * Calculate composite match score
 */
export function calculateMatchScore(
  salesScore: number,
  engagementScore: number,
  expertiseScore: number,
  reliabilityScore: number
): number {
  return (
    salesScore * SCORING_WEIGHTS.sales +
    engagementScore * SCORING_WEIGHTS.engagement +
    expertiseScore * SCORING_WEIGHTS.expertise +
    reliabilityScore * SCORING_WEIGHTS.reliability
  );
}
