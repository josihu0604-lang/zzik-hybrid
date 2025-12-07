/**
 * AI/ML Types for ZZIK Platform
 *
 * Centralized type definitions for all AI features
 */

// ============================================================================
// Vibe Analysis
// ============================================================================

export interface VibeAnalysis {
  vibe: string;
  location_type: string;
  mood: string;
  visual_tags: string[];
  confidence: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'unknown';
  korea_specific_elements?: string[];
}

export interface PopupVibeAnalysis extends VibeAnalysis {
  categories: string[];
  target_demographics: string[];
  appeal_keywords: string[];
}

// ============================================================================
// Recommendation System
// ============================================================================

export interface RecommendationRequest {
  userId: string;
  limit?: number;
  strategy?: 'hybrid' | 'collaborative' | 'content' | 'popular' | 'trending';
  excludeIds?: string[];
  demoMode?: boolean;
}

export interface RecommendationResult {
  popupId: string;
  score: number;
  strategy: string;
  reasons: string[];
  breakdown: {
    collaborative: number;
    content: number;
    popularity: number;
    trending: number;
    aiBoost?: number;
  };
  metadata?: {
    vibeMatch?: number;
    categoryMatch?: number;
    locationMatch?: boolean;
  };
}

// ============================================================================
// User Preferences
// ============================================================================

export interface UserPreferences {
  categories: Record<string, number>; // category -> weight (0-1)
  vibes: number[]; // 768-dimensional embedding
  participationHistory: string[];
  avgParticipationTime: number; // hour of day (0-23)
  preferredLocations: string[];
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  lastUpdated?: string;
}

// ============================================================================
// Smart Notifications
// ============================================================================

export interface NotificationTiming {
  userId: string;
  popupId: string;
  suggestedTime: string; // ISO timestamp
  confidence: number;
  reason: string;
  type: 'deadline_approaching' | 'goal_nearly_reached' | 'similar_popup' | 'new_popup';
}

export interface NotificationPersonalization {
  message: string;
  title: string;
  emoji?: string;
  urgency: 'low' | 'medium' | 'high';
  customData?: Record<string, unknown>;
}

// ============================================================================
// Search Enhancement
// ============================================================================

export interface SearchQuery {
  query: string;
  userId?: string;
  limit?: number;
  filters?: {
    categories?: string[];
    locations?: string[];
    status?: string[];
    minProgress?: number;
  };
}

export interface SearchResult {
  popupId: string;
  relevanceScore: number;
  matchType: 'exact' | 'semantic' | 'category' | 'location' | 'vibe';
  highlights?: {
    title?: string;
    description?: string;
    category?: string;
  };
}

export interface SemanticSearchResult extends SearchResult {
  embeddingSimilarity: number;
  keywordMatches: string[];
}

// ============================================================================
// AI Service Status
// ============================================================================

export interface AIServiceStatus {
  geminiAvailable: boolean;
  embeddingAvailable: boolean;
  demoMode: boolean;
  features: {
    vibeAnalysis: boolean;
    recommendations: boolean;
    semanticSearch: boolean;
    smartNotifications: boolean;
  };
  metrics?: {
    requestCount: number;
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

// ============================================================================
// Demo Mode
// ============================================================================

export interface DemoDataOptions {
  count?: number;
  seed?: number;
  includeVibes?: boolean;
  includeRecommendations?: boolean;
}
