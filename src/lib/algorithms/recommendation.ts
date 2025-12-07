/**
 * ZZIK Recommendation Engine
 *
 * Hybrid recommendation system combining:
 * - Collaborative Filtering (CF): User-based similarity
 * - Content-Based (CB): Category and vibe matching
 * - Popularity: Trending popups
 * - Time Decay: Recent activity boost
 *
 * Formula: Score = CF(40%) + Vibe(30%) + Popular(20%) + Trending(10%)
 */

import { cosineSimilarity } from '@/lib/math';

// Types used for future full integration
// import type { Popup, User } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface RecommendationScore {
  popupId: string;
  score: number;
  breakdown: {
    collaborative: number;
    content: number;
    popularity: number;
    trending: number;
  };
  reasons: string[];
}

export interface UserPreferences {
  categories: Record<string, number>; // category -> weight (0-1)
  vibes: number[]; // 768-dimensional vector
  participationHistory: string[]; // popup IDs
  avgParticipationTime: number; // hour of day (0-23)
  preferredLocations: string[];
}

export interface PopupFeatures {
  id: string;
  category: string;
  vibeVector?: number[];
  participantCount: number;
  goalParticipants: number;
  momentum: number; // daily new participants
  daysLeft: number;
  location: string;
  leaderId?: string;
}

// ============================================================================
// WEIGHTS
// ============================================================================

const WEIGHTS = {
  collaborative: 0.4,
  content: 0.3,
  popularity: 0.2,
  trending: 0.1,
} as const;

// Category similarity matrix (simplified)
const CATEGORY_SIMILARITY: Record<string, Record<string, number>> = {
  fashion: { fashion: 1.0, beauty: 0.6, lifestyle: 0.4 },
  beauty: { beauty: 1.0, fashion: 0.6, lifestyle: 0.5 },
  kpop: { kpop: 1.0, culture: 0.5, lifestyle: 0.3 },
  food: { food: 1.0, cafe: 0.7, lifestyle: 0.4 },
  cafe: { cafe: 1.0, food: 0.7, lifestyle: 0.5 },
  lifestyle: { lifestyle: 1.0, culture: 0.4, food: 0.3 },
  culture: { culture: 1.0, kpop: 0.5, lifestyle: 0.4 },
  tech: { tech: 1.0, lifestyle: 0.3 },
};

// ============================================================================
// CORE ALGORITHMS
// ============================================================================

/**
 * Calculate collaborative filtering score
 * Based on users with similar participation patterns
 *
 * @description
 * Implements User-Based Collaborative Filtering (UBCF) algorithm.
 * Scores a popup based on how many similar users have participated in it.
 *
 * Algorithm:
 * 1. Find users with similar participation history (similarUsers)
 * 2. Count how many of them participated in this popup
 * 3. Return ratio: matches / total_similar_users
 *
 * @example
 * // If 8 out of 10 similar users participated in this popup
 * calculateCollaborativeScore(popup, similarUsers, participations)
 * // Returns: 0.8
 *
 * @param popup - The popup to score
 * @param similarUsers - List of user IDs with similar preferences
 * @param userParticipations - Map of userId -> Set of popup IDs they participated in
 * @returns Score between 0 and 1 (1 = all similar users participated)
 *
 * @see https://en.wikipedia.org/wiki/Collaborative_filtering
 */
export function calculateCollaborativeScore(
  popup: PopupFeatures,
  similarUsers: string[],
  userParticipations: Map<string, Set<string>>
): number {
  if (similarUsers.length === 0) return 0;

  let matches = 0;
  for (const userId of similarUsers) {
    const participations = userParticipations.get(userId);
    if (participations?.has(popup.id)) {
      matches++;
    }
  }

  return matches / similarUsers.length;
}

/**
 * Calculate content-based similarity score
 * Uses category similarity and vibe vectors
 *
 * @description
 * Implements Content-Based Filtering using three factors:
 * 1. Category Similarity (50% weight) - Uses predefined similarity matrix
 * 2. Vibe Similarity (30% weight) - Cosine similarity of embedding vectors
 * 3. Location Match (20% weight) - Binary match of preferred locations
 *
 * Algorithm:
 * 1. Calculate weighted category similarity using user's category preferences
 * 2. Calculate cosine similarity between user's vibe vector and popup's vibe vector
 * 3. Check if popup location matches any of user's preferred locations
 * 4. Combine all three factors with their respective weights
 *
 * @example
 * // User likes fashion (weight 0.8), popup is fashion category
 * // User's vibe vector is similar to popup's vibe (0.7 cosine similarity)
 * // Popup is in Seoul (user's preferred location)
 * calculateContentScore(popup, userPrefs)
 * // Returns: 1.0 * 0.5 + 0.7 * 0.3 + 0.2 * 0.2 = 0.75
 *
 * @param popup - The popup to score
 * @param userPrefs - User's preferences including categories, vibes, and locations
 * @returns Score between 0 and 1 (higher = more similar to user's preferences)
 *
 * @see CATEGORY_SIMILARITY matrix for category relationships
 * @see cosineSimilarity for vector similarity calculation
 */
export function calculateContentScore(popup: PopupFeatures, userPrefs: UserPreferences): number {
  // Category similarity
  const categoryScore = Object.entries(userPrefs.categories).reduce((score, [category, weight]) => {
    const similarity = CATEGORY_SIMILARITY[category]?.[popup.category] || 0;
    return score + similarity * weight;
  }, 0);

  // Normalize category score
  const totalCategoryWeight = Object.values(userPrefs.categories).reduce((a, b) => a + b, 0);
  const normalizedCategoryScore = totalCategoryWeight > 0 ? categoryScore / totalCategoryWeight : 0;

  // Vibe similarity (cosine similarity)
  let vibeScore = 0;
  if (userPrefs.vibes?.length && popup.vibeVector?.length) {
    vibeScore = cosineSimilarity(userPrefs.vibes, popup.vibeVector);
  }

  // Location match
  const locationScore = userPrefs.preferredLocations.some((loc) =>
    popup.location.toLowerCase().includes(loc.toLowerCase())
  )
    ? 1.0
    : 0;

  return normalizedCategoryScore * 0.5 + vibeScore * 0.3 + locationScore * 0.2;
}

/**
 * Calculate popularity score
 * Based on participation rate and goal progress
 *
 * @description
 * Scores popups based on their progress toward the funding goal.
 * Adds urgency boost for popups close to their deadline.
 *
 * Algorithm:
 * 1. Calculate progress rate: participants / goal
 * 2. Add urgency boost: +0.2 if <= 3 days left
 * 3. Cap at 1.0 maximum
 *
 * This creates FOMO (Fear of Missing Out) effect for nearly-complete or
 * deadline-approaching popups.
 *
 * @example
 * // Popup with 85/100 participants and 2 days left
 * calculatePopularityScore(popup)
 * // Returns: min(1, 0.85 + 0.2) = 1.0
 *
 * @param popup - The popup to score
 * @returns Score between 0 and 1 (1 = nearly complete or urgent)
 */
export function calculatePopularityScore(popup: PopupFeatures): number {
  const progressRate = popup.participantCount / Math.max(popup.goalParticipants, 1);
  const urgencyBoost = popup.daysLeft <= 3 ? 0.2 : 0;

  return Math.min(1, progressRate + urgencyBoost);
}

/**
 * Calculate trending score
 * Based on recent momentum (daily new participants)
 *
 * @description
 * Scores popups based on their recent growth velocity and recency.
 * Combines momentum (daily new participants) with time decay for newer popups.
 *
 * Algorithm:
 * 1. Normalize momentum: scale daily participants against benchmark (50 = hot)
 * 2. Calculate time decay: exp(-age_in_days / 10) - exponential decay
 * 3. Combine: momentum (70%) + newness (30%)
 *
 * Time decay formula: e^(-t/τ) where τ = 10 days
 * - New popup (0 days): decay = 1.0
 * - 7-day old popup: decay ≈ 0.5
 * - 20-day old popup: decay ≈ 0.14
 *
 * @example
 * // Popup with 40 daily new participants, 5 days old (25 days left)
 * calculateTrendingScore(popup)
 * // Returns: 0.8 * 0.7 + 0.61 * 0.3 = 0.743
 *
 * @param popup - The popup to score
 * @returns Score between 0 and 1 (1 = very hot and new)
 */
export function calculateTrendingScore(popup: PopupFeatures): number {
  // Normalize momentum: assume 50 daily participants is "hot"
  const normalizedMomentum = Math.min(1, popup.momentum / 50);

  // Add time decay: newer popups get a boost
  const ageInDays = 30 - popup.daysLeft; // Assuming 30-day campaigns
  const timeDecay = Math.exp(-ageInDays / 10);

  return normalizedMomentum * 0.7 + timeDecay * 0.3;
}

/**
 * Generate recommendations for a user
 *
 * @description
 * Main recommendation engine that combines all scoring algorithms.
 * Implements hybrid recommendation system with weighted scoring.
 *
 * Algorithm:
 * 1. For each popup not yet participated:
 *    a. Calculate collaborative filtering score (40% weight)
 *    b. Calculate content-based score (30% weight)
 *    c. Calculate popularity score (20% weight)
 *    d. Calculate trending score (10% weight)
 * 2. Combine scores using weighted sum
 * 3. Generate human-readable reasons for each recommendation
 * 4. Sort by final score descending
 * 5. Return top N recommendations
 *
 * Final Score Formula:
 * score = CF(40%) + CB(30%) + Pop(20%) + Trend(10%)
 *
 * Where:
 * - CF = Collaborative Filtering (similar users' behavior)
 * - CB = Content-Based (category, vibe, location match)
 * - Pop = Popularity (progress rate + urgency)
 * - Trend = Trending (momentum + recency)
 *
 * @example
 * const recommendations = generateRecommendations(
 *   allPopups,
 *   userPreferences,
 *   similarUserIds,
 *   participationMap,
 *   10 // Return top 10
 * );
 *
 * @param popups - List of all available popups
 * @param userPrefs - User's preferences and history
 * @param similarUsers - IDs of users with similar preferences
 * @param userParticipations - Map of user participations for CF
 * @param limit - Maximum number of recommendations to return
 * @returns Sorted array of recommendations with scores and reasons
 */
export function generateRecommendations(
  popups: PopupFeatures[],
  userPrefs: UserPreferences,
  similarUsers: string[] = [],
  userParticipations: Map<string, Set<string>> = new Map(),
  limit: number = 10
): RecommendationScore[] {
  const scores: RecommendationScore[] = [];

  for (const popup of popups) {
    // Skip already participated
    if (userPrefs.participationHistory.includes(popup.id)) {
      continue;
    }

    const collaborative = calculateCollaborativeScore(popup, similarUsers, userParticipations);
    const content = calculateContentScore(popup, userPrefs);
    const popularity = calculatePopularityScore(popup);
    const trending = calculateTrendingScore(popup);

    const score =
      collaborative * WEIGHTS.collaborative +
      content * WEIGHTS.content +
      popularity * WEIGHTS.popularity +
      trending * WEIGHTS.trending;

    const reasons = generateReasons(popup, {
      collaborative,
      content,
      popularity,
      trending,
    });

    scores.push({
      popupId: popup.id,
      score,
      breakdown: { collaborative, content, popularity, trending },
      reasons,
    });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// cosineSimilarity imported from @/lib/math

function generateReasons(
  popup: PopupFeatures,
  scores: { collaborative: number; content: number; popularity: number; trending: number }
): string[] {
  const reasons: string[] = [];

  if (scores.content > 0.5) {
    reasons.push(`${popup.category} 카테고리에 관심이 있으시네요!`);
  }

  if (scores.popularity > 0.7) {
    reasons.push(`${Math.round((popup.participantCount / popup.goalParticipants) * 100)}% 달성!`);
  }

  if (popup.daysLeft <= 3) {
    reasons.push(`마감 ${popup.daysLeft}일 전!`);
  }

  if (scores.trending > 0.6) {
    reasons.push('지금 뜨는 중!');
  }

  if (scores.collaborative > 0.5) {
    reasons.push('비슷한 취향의 유저들이 참여했어요');
  }

  return reasons.length > 0 ? reasons : ['추천 팝업'];
}

// ============================================================================
// COLD START HANDLING
// ============================================================================

/**
 * Generate default preferences for new users
 */
export function getDefaultPreferences(demographics?: {
  age?: number;
  gender?: string;
  location?: string;
}): UserPreferences {
  // Default category weights based on demographics
  const baseCategories: Record<string, number> = {
    fashion: 0.3,
    beauty: 0.25,
    kpop: 0.2,
    food: 0.15,
    cafe: 0.1,
  };

  // Adjust based on demographics if available
  if (demographics?.age && demographics.age < 25) {
    baseCategories.kpop = 0.35;
    baseCategories.fashion = 0.35;
  }

  return {
    categories: baseCategories,
    vibes: [],
    participationHistory: [],
    avgParticipationTime: 12, // Default: noon
    preferredLocations: demographics?.location ? [demographics.location] : ['성수', '강남', '홍대'],
  };
}

/**
 * Update preferences based on user interaction
 */
export function updatePreferencesFromInteraction(
  prefs: UserPreferences,
  interaction: {
    popupId: string;
    category: string;
    vibeVector?: number[];
    location: string;
    interactionType: 'view' | 'participate' | 'complete';
  }
): UserPreferences {
  const weightMultiplier = {
    view: 0.1,
    participate: 0.5,
    complete: 1.0,
  }[interaction.interactionType];

  // Update category weight with exponential moving average
  const currentWeight = prefs.categories[interaction.category] || 0;
  const newWeight = currentWeight * 0.8 + weightMultiplier * 0.2;
  prefs.categories[interaction.category] = Math.min(1, newWeight);

  // Update vibe vector (simple averaging)
  if (interaction.vibeVector?.length && prefs.vibes.length === 0) {
    prefs.vibes = [...interaction.vibeVector];
  } else if (
    interaction.vibeVector?.length &&
    prefs.vibes.length === interaction.vibeVector.length
  ) {
    prefs.vibes = prefs.vibes.map((v, i) => v * 0.7 + interaction.vibeVector![i] * 0.3);
  }

  // Track participation
  if (interaction.interactionType === 'participate') {
    prefs.participationHistory.push(interaction.popupId);
    // Keep last 100 participations
    if (prefs.participationHistory.length > 100) {
      prefs.participationHistory = prefs.participationHistory.slice(-100);
    }
  }

  // Update location preferences
  if (!prefs.preferredLocations.includes(interaction.location)) {
    prefs.preferredLocations.push(interaction.location);
    if (prefs.preferredLocations.length > 10) {
      prefs.preferredLocations = prefs.preferredLocations.slice(-10);
    }
  }

  return prefs;
}
