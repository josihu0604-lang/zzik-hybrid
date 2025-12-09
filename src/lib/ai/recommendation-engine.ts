/**
 * AI-Enhanced Recommendation Engine
 *
 * Combines traditional algorithms with AI-based insights
 * Supports demo mode for development without Gemini API
 */
import 'server-only';

import type { RecommendationRequest, RecommendationResult, UserPreferences } from './types';
import {
  calculateCollaborativeScore,
  calculateContentScore,
  calculatePopularityScore,
  calculateTrendingScore,
  getDefaultPreferences,
  updatePreferencesFromInteraction,
  type PopupFeatures,
} from '@/lib/algorithms/recommendation';
import { cosineSimilarity } from '@/lib/math';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

// ============================================================================
// AI-Enhanced Scoring
// ============================================================================

/**
 * Calculate AI boost based on semantic similarity
 * Uses embedding vectors for deeper matching
 */
async function calculateAIBoost(popup: PopupFeatures, userPrefs: UserPreferences): Promise<number> {
  // If no embeddings available, return 0
  if (!popup.vibeVector?.length || !userPrefs.vibes?.length) {
    return 0;
  }

  // Cosine similarity
  const similarity = cosineSimilarity(popup.vibeVector, userPrefs.vibes);

  // Convert similarity (-1 to 1) to boost (0 to 1)
  return (similarity + 1) / 2;
}

/**
 * Generate personalized recommendations with AI enhancement
 */
export async function generateAIRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResult[]> {
  const { userId, limit = 10, strategy = 'hybrid', excludeIds = [], demoMode = false } = request;

  // Fetch user preferences and popups from database
  const userPrefs = await fetchUserPreferences(userId, demoMode);
  const popups = await fetchAvailablePopups(excludeIds, demoMode);

  if (popups.length === 0) {
    return [];
  }

  // Strategy-specific recommendations
  switch (strategy) {
    case 'collaborative':
      return generateCollaborativeRecommendations(popups, userPrefs, userId, limit, demoMode);

    case 'content':
      return generateContentRecommendations(popups, userPrefs, limit);

    case 'popular':
      return generatePopularRecommendations(popups, limit);

    case 'trending':
      return generateTrendingRecommendations(popups, limit);

    case 'hybrid':
    default:
      return generateHybridRecommendations(popups, userPrefs, userId, limit, demoMode);
  }
}

// ============================================================================
// Strategy Implementations
// ============================================================================

async function generateHybridRecommendations(
  popups: PopupFeatures[],
  userPrefs: UserPreferences,
  userId: string,
  limit: number,
  demoMode: boolean
): Promise<RecommendationResult[]> {
  const similarUsers = await findSimilarUsers(userId, demoMode);
  const participations = await fetchParticipations(demoMode);

  const results: RecommendationResult[] = [];

  for (const popup of popups) {
    // Skip already participated
    if (userPrefs.participationHistory.includes(popup.id)) continue;

    const collaborative = calculateCollaborativeScore(popup, similarUsers, participations);
    const content = calculateContentScore(popup, userPrefs);
    const popularity = calculatePopularityScore(popup);
    const trending = calculateTrendingScore(popup);
    const aiBoost = await calculateAIBoost(popup, userPrefs);

    // Weighted score with AI boost
    const baseScore =
      collaborative * 0.35 + content * 0.25 + popularity * 0.2 + trending * 0.1 + aiBoost * 0.1;

    const reasons = generateReasons({
      collaborative,
      content,
      popularity,
      trending,
      aiBoost,
      popup,
    });

    results.push({
      popupId: popup.id,
      score: baseScore,
      strategy: 'hybrid',
      reasons,
      breakdown: {
        collaborative,
        content,
        popularity,
        trending,
        aiBoost,
      },
      metadata: {
        vibeMatch: aiBoost,
        categoryMatch: content,
      },
    });
  }

  // Sort and return top N
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function generateCollaborativeRecommendations(
  popups: PopupFeatures[],
  userPrefs: UserPreferences,
  userId: string,
  limit: number,
  demoMode: boolean
): Promise<RecommendationResult[]> {
  const similarUsers = await findSimilarUsers(userId, demoMode);
  const participations = await fetchParticipations(demoMode);

  const results: RecommendationResult[] = [];

  for (const popup of popups) {
    if (userPrefs.participationHistory.includes(popup.id)) continue;

    const score = calculateCollaborativeScore(popup, similarUsers, participations);

    results.push({
      popupId: popup.id,
      score,
      strategy: 'collaborative',
      reasons: ['비슷한 취향의 유저들이 참여했어요'],
      breakdown: {
        collaborative: score,
        content: 0,
        popularity: 0,
        trending: 0,
      },
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function generateContentRecommendations(
  popups: PopupFeatures[],
  userPrefs: UserPreferences,
  limit: number
): Promise<RecommendationResult[]> {
  const results: RecommendationResult[] = [];

  for (const popup of popups) {
    if (userPrefs.participationHistory.includes(popup.id)) continue;

    const score = calculateContentScore(popup, userPrefs);
    const aiBoost = await calculateAIBoost(popup, userPrefs);
    const finalScore = score * 0.7 + aiBoost * 0.3;

    results.push({
      popupId: popup.id,
      score: finalScore,
      strategy: 'content',
      reasons: [`${popup.category} 카테고리에 관심이 있으시네요!`],
      breakdown: {
        collaborative: 0,
        content: score,
        popularity: 0,
        trending: 0,
        aiBoost,
      },
      metadata: {
        vibeMatch: aiBoost,
        categoryMatch: score,
      },
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function generatePopularRecommendations(
  popups: PopupFeatures[],
  limit: number
): Promise<RecommendationResult[]> {
  const results = popups.map((popup) => {
    const score = calculatePopularityScore(popup);
    const progressPercent = Math.round((popup.participantCount / popup.goalParticipants) * 100);

    return {
      popupId: popup.id,
      score,
      strategy: 'popular',
      reasons: [
        `${progressPercent}% 달성!`,
        popup.daysLeft <= 3 ? `마감 ${popup.daysLeft}일 전` : '',
      ],
      breakdown: {
        collaborative: 0,
        content: 0,
        popularity: score,
        trending: 0,
      },
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

async function generateTrendingRecommendations(
  popups: PopupFeatures[],
  limit: number
): Promise<RecommendationResult[]> {
  const results = popups.map((popup) => {
    const score = calculateTrendingScore(popup);

    return {
      popupId: popup.id,
      score,
      strategy: 'trending',
      reasons: ['지금 뜨는 중!', `하루 ${popup.momentum}명 참여`],
      breakdown: {
        collaborative: 0,
        content: 0,
        popularity: 0,
        trending: score,
      },
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ============================================================================
// Helper Functions
// ============================================================================

// cosineSimilarity imported from @/lib/math

function generateReasons(scores: {
  collaborative: number;
  content: number;
  popularity: number;
  trending: number;
  aiBoost: number;
  popup: PopupFeatures;
}): string[] {
  const reasons: string[] = [];

  if (scores.aiBoost > 0.7) {
    reasons.push('당신의 취향과 완벽하게 맞아요!');
  } else if (scores.aiBoost > 0.5) {
    reasons.push('당신이 좋아할 만한 분위기');
  }

  if (scores.content > 0.5) {
    reasons.push(`${scores.popup.category} 카테고리 추천`);
  }

  if (scores.popularity > 0.7) {
    const percent = Math.round(
      (scores.popup.participantCount / scores.popup.goalParticipants) * 100
    );
    reasons.push(`${percent}% 달성!`);
  }

  if (scores.popup.daysLeft <= 3) {
    reasons.push(`마감 ${scores.popup.daysLeft}일 전`);
  }

  if (scores.trending > 0.6) {
    reasons.push('지금 뜨는 중!');
  }

  if (scores.collaborative > 0.5) {
    reasons.push('비슷한 취향의 유저들이 참여');
  }

  return reasons.length > 0 ? reasons : ['추천 팝업'];
}

// ============================================================================
// Data Fetching (with Demo Mode)
// ============================================================================

async function fetchUserPreferences(userId: string, demoMode: boolean): Promise<UserPreferences> {
  if (demoMode) {
    return getDefaultPreferences({ age: 25, location: '성수' });
  }

  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn('[RecommendationEngine] Supabase not configured, using default preferences');
    return getDefaultPreferences();
  }

  try {
    const supabase = createAdminClient();

    // Fetch user data including preferences vector and participation history
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('preferences_vector')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Fetch user's participation history
    const { data: participations, error: participationsError } = await supabase
      .from('popup_participations')
      .select('popup_id')
      .eq('user_id', userId);

    if (participationsError) throw participationsError;

    const participationHistory = participations?.map((p) => p.popup_id) || [];

    // Fetch user's category preferences based on past participations
    const { data: popups, error: popupsError } = await supabase
      .from('popups')
      .select('category')
      .in('id', participationHistory.length > 0 ? participationHistory : ['none']);

    if (popupsError && popupsError.code !== 'PGRST116') throw popupsError;

    // Calculate category weights from participation history
    const categoryWeights: Record<string, number> = {};
    if (popups && popups.length > 0) {
      popups.forEach((popup) => {
        categoryWeights[popup.category] = (categoryWeights[popup.category] || 0) + 1;
      });
      // Normalize to 0-1 range
      const maxCount = Math.max(...Object.values(categoryWeights));
      Object.keys(categoryWeights).forEach((cat) => {
        categoryWeights[cat] = categoryWeights[cat] / maxCount;
      });
    }

    return {
      categories: categoryWeights,
      vibes: userData?.preferences_vector || [],
      participationHistory,
      avgParticipationTime: 19, // Default, could be calculated from participation timestamps
      preferredLocations: [], // Could be enhanced with location tracking
    };
  } catch (error) {
    console.error('[RecommendationEngine] Failed to fetch user preferences:', error);
    return getDefaultPreferences();
  }
}

async function fetchAvailablePopups(
  excludeIds: string[],
  demoMode: boolean
): Promise<PopupFeatures[]> {
  if (demoMode) {
    return generateDemoPopups(20, excludeIds);
  }

  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn('[RecommendationEngine] Supabase not configured, using demo popups');
    return generateDemoPopups(20, excludeIds);
  }

  try {
    const supabase = createAdminClient();

    // Fetch active popups (funding or confirmed status)
    const { data: popups, error } = await supabase
      .from('popups')
      .select('*')
      .in('status', ['funding', 'confirmed'])
      .not('id', 'in', `(${excludeIds.length > 0 ? excludeIds.join(',') : 'none'})`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!popups || popups.length === 0) {
      return [];
    }

    // Transform database popups to PopupFeatures format
    return popups.map((popup) => {
      const now = new Date();
      const deadline = new Date(popup.deadline_at);
      const daysLeft = Math.max(
        0,
        Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Calculate momentum (participants per day)
      const createdAt = new Date(popup.created_at);
      const daysActive = Math.max(
        1,
        Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      );
      const momentum = Math.round(popup.current_participants / daysActive);

      return {
        id: popup.id,
        category: popup.category,
        participantCount: popup.current_participants,
        goalParticipants: popup.goal_participants,
        momentum,
        daysLeft,
        location: popup.location,
        vibeVector: [], // Could be populated from a separate embeddings table
      };
    });
  } catch (error) {
    console.error('[RecommendationEngine] Failed to fetch available popups:', error);
    return generateDemoPopups(20, excludeIds);
  }
}

async function findSimilarUsers(userId: string, demoMode: boolean): Promise<string[]> {
  if (demoMode) {
    return ['demo-user-1', 'demo-user-2', 'demo-user-3'];
  }

  // Find similar users based on participation overlap
  if (!isSupabaseConfigured()) {
    console.warn('[RecommendationEngine] Supabase not configured, using empty similar users');
    return [];
  }

  try {
    const supabase = createAdminClient();

    // Get current user's participations
    const { data: userParticipations, error: userError } = await supabase
      .from('popup_participations')
      .select('popup_id')
      .eq('user_id', userId);

    if (userError) throw userError;

    if (!userParticipations || userParticipations.length === 0) {
      return [];
    }

    const userPopupIds = userParticipations.map((p) => p.popup_id);

    // Find other users who participated in the same popups
    const { data: similarParticipations, error: similarError } = await supabase
      .from('popup_participations')
      .select('user_id, popup_id')
      .in('popup_id', userPopupIds)
      .neq('user_id', userId);

    if (similarError) throw similarError;

    if (!similarParticipations || similarParticipations.length === 0) {
      return [];
    }

    // Calculate similarity scores based on overlap
    const userSimilarity: Record<string, number> = {};
    similarParticipations.forEach((participation) => {
      userSimilarity[participation.user_id] = (userSimilarity[participation.user_id] || 0) + 1;
    });

    // Sort by similarity and return top 10 similar users
    const similarUsers = Object.entries(userSimilarity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId]) => userId);

    return similarUsers;
  } catch (error) {
    console.error('[RecommendationEngine] Failed to find similar users:', error);
    return [];
  }
}

async function fetchParticipations(demoMode: boolean): Promise<Map<string, Set<string>>> {
  if (demoMode) {
    const map = new Map<string, Set<string>>();
    map.set('demo-user-1', new Set(['popup-1', 'popup-2']));
    map.set('demo-user-2', new Set(['popup-2', 'popup-3']));
    return map;
  }

  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn('[RecommendationEngine] Supabase not configured, using empty participations');
    return new Map();
  }

  try {
    const supabase = createAdminClient();

    // Fetch all popup participations
    const { data: participations, error } = await supabase
      .from('popup_participations')
      .select('user_id, popup_id');

    if (error) throw error;

    if (!participations || participations.length === 0) {
      return new Map();
    }

    // Build map of user_id -> Set of popup_ids
    const participationMap = new Map<string, Set<string>>();
    participations.forEach((participation) => {
      if (!participationMap.has(participation.user_id)) {
        participationMap.set(participation.user_id, new Set());
      }
      participationMap.get(participation.user_id)!.add(participation.popup_id);
    });

    return participationMap;
  } catch (error) {
    console.error('[RecommendationEngine] Failed to fetch participations:', error);
    return new Map();
  }
}

// ============================================================================
// Demo Data Generators
// ============================================================================

function generateDemoPopups(count: number, excludeIds: string[]): PopupFeatures[] {
  const categories = ['fashion', 'beauty', 'kpop', 'food', 'cafe', 'lifestyle'];
  const locations = ['성수', '강남', '홍대', '연남', '이태원', '명동'];
  const popups: PopupFeatures[] = [];

  for (let i = 1; i <= count; i++) {
    const id = `popup-${i}`;
    if (excludeIds.includes(id)) continue;

    const goalParticipants = 50 + Math.floor(Math.random() * 150);
    const currentParticipants = Math.floor(goalParticipants * (0.3 + Math.random() * 0.6));

    popups.push({
      id,
      category: categories[Math.floor(Math.random() * categories.length)],
      participantCount: currentParticipants,
      goalParticipants,
      momentum: Math.floor(Math.random() * 30) + 5,
      daysLeft: Math.floor(Math.random() * 28) + 2,
      location: locations[Math.floor(Math.random() * locations.length)],
      vibeVector: generateRandomVector(768),
    });
  }

  return popups;
}

function generateRandomVector(dimension: number): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimension; i++) {
    vector.push(Math.random() * 2 - 1);
  }
  // Normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / norm);
}

// ============================================================================
// Exports
// ============================================================================

export { getDefaultPreferences, updatePreferencesFromInteraction };
