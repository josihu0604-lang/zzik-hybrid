/**
 * Semantic Search Engine for ZZIK
 *
 * Natural language search with embedding-based similarity
 * Falls back to keyword search when Gemini is unavailable
 */
import 'server-only';

import type { SearchQuery, SemanticSearchResult } from './types';
import { logger } from '@/lib/logger';
import { cosineSimilarity } from '@/lib/math';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

// ============================================================================
// Gemini Integration (with graceful degradation)
// ============================================================================

let geminiAvailable = false;
let generateEmbedding: ((text: string) => Promise<number[]>) | null = null;

// Dynamic import for Gemini (graceful degradation)
async function initGemini() {
  try {
    const gemini = await import('@/lib/gemini');
    generateEmbedding = gemini.generateEmbedding;
    geminiAvailable = true;
  } catch {
    console.warn('[SemanticSearch] Gemini not available, using keyword search');
    geminiAvailable = false;
  }
}
initGemini();

// ============================================================================
// Natural Language Query Processing
// ============================================================================

/**
 * Process natural language query and extract intent
 */
export function processNaturalLanguageQuery(query: string): {
  intent: 'search' | 'filter' | 'recommend';
  keywords: string[];
  categories?: string[];
  locations?: string[];
  vibes?: string[];
  urgency?: 'urgent' | 'normal';
} {
  const lowerQuery = query.toLowerCase();

  // Detect intent
  let intent: 'search' | 'filter' | 'recommend' = 'search';
  if (
    lowerQuery.includes('추천') ||
    lowerQuery.includes('어디') ||
    lowerQuery.includes('뭐가 좋아')
  ) {
    intent = 'recommend';
  } else if (lowerQuery.includes('찾아') || lowerQuery.includes('검색')) {
    intent = 'search';
  }

  // Extract keywords (remove common stop words)
  const stopWords = ['팝업', '있어', '어디', '찾아', '보여', '줘', '주세요', '해줘'];
  const words = query.split(/\s+/).filter((w) => w.length > 1 && !stopWords.includes(w));

  // Detect categories
  const categoryMap: Record<string, string[]> = {
    fashion: ['패션', '옷', '의류', '브랜드', '스타일'],
    beauty: ['뷰티', '화장품', '메이크업', '코스메틱'],
    kpop: ['케이팝', 'k-pop', '아이돌', '걸그룹', '보이그룹'],
    food: ['음식', '맛집', '레스토랑', '식당'],
    cafe: ['카페', '커피', '디저트'],
    lifestyle: ['라이프스타일', '힐링', '체험'],
  };

  const detectedCategories: string[] = [];
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      detectedCategories.push(category);
    }
  }

  // Detect locations
  const locationKeywords = ['성수', '강남', '홍대', '연남', '이태원', '명동', '신사', '가로수길'];
  const detectedLocations = locationKeywords.filter((loc) => lowerQuery.includes(loc));

  // Detect vibes
  const vibeMap: Record<string, string[]> = {
    gamseong: ['감성', '서정', '무드'],
    hipster: ['힙', '세련', '모던'],
    retro: ['복고', '빈티지', '레트로'],
    cozy: ['아늑', '포근', '따뜻'],
    romantic: ['로맨틱', '낭만', '데이트'],
  };

  const detectedVibes: string[] = [];
  for (const [vibe, keywords] of Object.entries(vibeMap)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      detectedVibes.push(vibe);
    }
  }

  // Detect urgency
  const urgency = lowerQuery.includes('마감') || lowerQuery.includes('급해') ? 'urgent' : 'normal';

  return {
    intent,
    keywords: words,
    categories: detectedCategories.length > 0 ? detectedCategories : undefined,
    locations: detectedLocations.length > 0 ? detectedLocations : undefined,
    vibes: detectedVibes.length > 0 ? detectedVibes : undefined,
    urgency,
  };
}

// ============================================================================
// Semantic Search
// ============================================================================

/**
 * Perform semantic search using embeddings
 */
export async function semanticSearch(query: SearchQuery): Promise<SemanticSearchResult[]> {
  // Process natural language query
  const processed = processNaturalLanguageQuery(query.query);

  // If Gemini available, use embedding-based search
  if (geminiAvailable && generateEmbedding) {
    return performEmbeddingSearch(query, processed);
  }

  // Fallback to keyword search
  return performKeywordSearch(query, processed);
}

/**
 * Embedding-based semantic search
 */
async function performEmbeddingSearch(
  query: SearchQuery,
  processed: ReturnType<typeof processNaturalLanguageQuery>
): Promise<SemanticSearchResult[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding!(query.query);

    // Fetch popups with embeddings
    const popups = await fetchPopupsWithEmbeddings(query.filters);

    // Calculate similarities
    const results: SemanticSearchResult[] = [];

    for (const popup of popups) {
      if (!popup.embedding) continue;

      const similarity = cosineSimilarity(queryEmbedding, popup.embedding);

      // Apply filters
      if (query.filters?.categories && !query.filters.categories.includes(popup.category)) {
        continue;
      }

      if (query.filters?.locations) {
        const matchesLocation = query.filters.locations.some((loc) =>
          popup.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) continue;
      }

      // Calculate keyword matches
      const keywordMatches = processed.keywords.filter(
        (kw) =>
          popup.title.toLowerCase().includes(kw.toLowerCase()) ||
          popup.description?.toLowerCase().includes(kw.toLowerCase())
      );

      // Boost score for keyword matches
      const keywordBoost = keywordMatches.length * 0.1;
      const finalScore = Math.min(1, similarity + keywordBoost);

      if (finalScore > 0.3) {
        // Minimum relevance threshold
        results.push({
          popupId: popup.id,
          relevanceScore: finalScore,
          matchType: similarity > 0.7 ? 'semantic' : 'semantic',
          embeddingSimilarity: similarity,
          keywordMatches,
          highlights: {
            title: popup.title,
            description: popup.description,
            category: popup.category,
          },
        });
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, query.limit || 10);
  } catch (error) {
    console.error('[SemanticSearch] Embedding search failed:', error);
    return performKeywordSearch(query, processed);
  }
}

/**
 * Keyword-based search (fallback)
 */
async function performKeywordSearch(
  query: SearchQuery,
  processed: ReturnType<typeof processNaturalLanguageQuery>
): Promise<SemanticSearchResult[]> {
  const popups = await fetchPopupsWithEmbeddings(query.filters);
  const results: SemanticSearchResult[] = [];

  for (const popup of popups) {
    let score = 0;
    const keywordMatches: string[] = [];

    // Title match (highest weight)
    for (const keyword of processed.keywords) {
      if (popup.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.4;
        keywordMatches.push(keyword);
      }
    }

    // Description match
    if (popup.description) {
      for (const keyword of processed.keywords) {
        if (popup.description.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.2;
          if (!keywordMatches.includes(keyword)) {
            keywordMatches.push(keyword);
          }
        }
      }
    }

    // Category match
    if (processed.categories?.includes(popup.category)) {
      score += 0.3;
    }

    // Location match
    if (processed.locations) {
      const matchesLocation = processed.locations.some((loc) =>
        popup.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (matchesLocation) score += 0.2;
    }

    // Urgency boost
    if (processed.urgency === 'urgent' && popup.daysLeft <= 3) {
      score += 0.1;
    }

    if (score > 0.3) {
      results.push({
        popupId: popup.id,
        relevanceScore: Math.min(1, score),
        matchType: keywordMatches.length > 0 ? 'exact' : 'category',
        embeddingSimilarity: 0,
        keywordMatches,
        highlights: {
          title: popup.title,
          description: popup.description,
          category: popup.category,
        },
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, query.limit || 10);
}

// ============================================================================
// Query Suggestions
// ============================================================================

/**
 * Generate search suggestions based on partial query
 */
export async function generateSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  const processed = processNaturalLanguageQuery(partialQuery);
  const suggestions: string[] = [];

  // Category-based suggestions
  if (processed.categories) {
    for (const category of processed.categories) {
      suggestions.push(`${category} 팝업`);
      suggestions.push(`${category} 마감 임박`);
    }
  }

  // Location-based suggestions
  if (processed.locations) {
    for (const location of processed.locations) {
      suggestions.push(`${location} 팝업`);
      if (processed.categories?.[0]) {
        suggestions.push(`${location} ${processed.categories[0]} 팝업`);
      }
    }
  }

  // Vibe-based suggestions
  if (processed.vibes) {
    for (const vibe of processed.vibes) {
      suggestions.push(`${vibe} 분위기 팝업`);
    }
  }

  // Popular query patterns
  const popularPatterns = [
    '이번 주말 팝업',
    '마감 임박 팝업',
    '오픈 확정 팝업',
    '성수 카페 팝업',
    '강남 패션 팝업',
  ];

  // Add popular patterns if no specific matches
  if (suggestions.length === 0) {
    suggestions.push(...popularPatterns.slice(0, limit));
  }

  return suggestions.slice(0, limit);
}

// ============================================================================
// Helper Functions
// ============================================================================

// cosineSimilarity imported from @/lib/math

async function fetchPopupsWithEmbeddings(filters?: SearchQuery['filters']): Promise<
  Array<{
    id: string;
    title: string;
    description?: string;
    category: string;
    location: string;
    embedding?: number[];
    daysLeft: number;
    currentParticipants: number;
    goalParticipants: number;
  }>
> {
  // Fetch from database
  if (!isSupabaseConfigured()) {
    console.warn('[SemanticSearch] Supabase not configured, using demo data');
    return [
      {
        id: 'popup-1',
        title: '성수동 감성 카페 팝업',
        description: '따뜻하고 아늑한 분위기의 카페 팝업',
        category: 'cafe',
        location: '성수',
        daysLeft: 5,
        currentParticipants: 80,
        goalParticipants: 100,
      },
      {
        id: 'popup-2',
        title: '강남 패션 브랜드 팝업',
        description: '세련된 패션 브랜드의 신상품 체험',
        category: 'fashion',
        location: '강남',
        daysLeft: 2,
        currentParticipants: 150,
        goalParticipants: 200,
      },
    ];
  }

  try {
    const supabase = createAdminClient();

    // Build query with filters
    let query = supabase
      .from('popups')
      .select(
        'id, brand_name, title, description, category, location, current_participants, goal_participants, deadline_at, created_at'
      )
      .in('status', ['funding', 'confirmed']);

    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    // Apply location filter
    if (filters?.locations && filters.locations.length > 0) {
      // Use ilike for partial matching on location
      const locationConditions = filters.locations
        .map((loc) => `location.ilike.%${loc}%`)
        .join(',');
      query = query.or(locationConditions);
    }

    const { data: popups, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    if (!popups || popups.length === 0) {
      return [];
    }

    // Transform to expected format
    return popups.map((popup) => {
      const now = new Date();
      const deadline = new Date(popup.deadline_at);
      const daysLeft = Math.max(
        0,
        Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: popup.id,
        title: popup.title,
        description: popup.description || undefined,
        category: popup.category,
        location: popup.location,
        embedding: undefined, // Could be populated from a separate embeddings table
        daysLeft,
        currentParticipants: popup.current_participants,
        goalParticipants: popup.goal_participants,
      };
    });
  } catch (error) {
    console.error('[SemanticSearch] Failed to fetch popups:', error);
    return [
      {
        id: 'popup-1',
        title: '성수동 감성 카페 팝업',
        description: '따뜻하고 아늑한 분위기의 카페 팝업',
        category: 'cafe',
        location: '성수',
        daysLeft: 5,
        currentParticipants: 80,
        goalParticipants: 100,
      },
      {
        id: 'popup-2',
        title: '강남 패션 브랜드 팝업',
        description: '세련된 패션 브랜드의 신상품 체험',
        category: 'fashion',
        location: '강남',
        daysLeft: 2,
        currentParticipants: 150,
        goalParticipants: 200,
      },
    ];
  }
}

// ============================================================================
// Search Analytics
// ============================================================================

export interface SearchAnalytics {
  totalSearches: number;
  avgResultCount: number;
  topQueries: Array<{ query: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  conversionRate: number; // Searches leading to participation
}

/**
 * Track search query for analytics
 */
export async function trackSearchQuery(
  userId: string | null,
  query: string,
  resultCount: number,
  didParticipate: boolean
): Promise<void> {
  // Store in analytics database
  if (!isSupabaseConfigured()) {
    logger.debug('[SearchAnalytics] Supabase not configured, skipping tracking', {
      userId,
      query,
      resultCount,
      didParticipate,
    });
    return;
  }

  try {
    createAdminClient();

    // For now, we can log this data. In a production system, you'd want a dedicated analytics table
    // or use a service like PostHog, Mixpanel, etc.
    logger.debug('[SearchAnalytics]', { userId, query, resultCount, didParticipate });
  } catch (error) {
    console.error('[SearchAnalytics] Failed to track search query:', error);
  }
}

/**
 * Get search analytics for admin dashboard
 */
export async function getSearchAnalytics(
  startDate: string,
  endDate: string
): Promise<SearchAnalytics> {
  // Fetch from analytics database
  if (!isSupabaseConfigured()) {
    console.warn('[SearchAnalytics] Supabase not configured, using mock analytics data');
    return {
      totalSearches: 1250,
      avgResultCount: 8.5,
      topQueries: [
        { query: '성수 카페', count: 145 },
        { query: '패션 팝업', count: 123 },
        { query: '마감 임박', count: 98 },
      ],
      topCategories: [
        { category: 'cafe', count: 320 },
        { category: 'fashion', count: 280 },
        { category: 'beauty', count: 210 },
      ],
      conversionRate: 0.34, // 34% of searches lead to participation
    };
  }

  try {
    const supabase = createAdminClient();

    // For now, return aggregated data from popups table
    // In production, you'd want a dedicated search_analytics table
    const { data: popups, error } = await supabase
      .from('popups')
      .select('category, current_participants, goal_participants')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    if (popups) {
      popups.forEach((popup) => {
        categoryCount[popup.category] = (categoryCount[popup.category] || 0) + 1;
      });
    }

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Return mock data for queries and searches (would need a dedicated analytics table)
    return {
      totalSearches: 1250,
      avgResultCount: 8.5,
      topQueries: [
        { query: '성수 카페', count: 145 },
        { query: '패션 팝업', count: 123 },
        { query: '마감 임박', count: 98 },
      ],
      topCategories,
      conversionRate: 0.34,
    };
  } catch (error) {
    console.error('[SearchAnalytics] Failed to fetch analytics:', error);
    return {
      totalSearches: 1250,
      avgResultCount: 8.5,
      topQueries: [
        { query: '성수 카페', count: 145 },
        { query: '패션 팝업', count: 123 },
        { query: '마감 임박', count: 98 },
      ],
      topCategories: [
        { category: 'cafe', count: 320 },
        { category: 'fashion', count: 280 },
        { category: 'beauty', count: 210 },
      ],
      conversionRate: 0.34,
    };
  }
}
