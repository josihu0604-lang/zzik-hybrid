/**
 * ZZIK AI/ML Module
 *
 * Centralized exports for all AI features
 * - Vibe Analysis (Gemini Vision)
 * - Recommendation Engine (Hybrid CF + Content + AI)
 * - Smart Notifications (Timing optimization)
 * - Semantic Search (Natural language)
 */

// Types
export type {
  VibeAnalysis,
  PopupVibeAnalysis,
  RecommendationRequest,
  RecommendationResult,
  UserPreferences,
  NotificationTiming,
  NotificationPersonalization,
  SearchQuery,
  SemanticSearchResult,
  AIServiceStatus,
} from './types';

// Vibe Analyzer
export {
  analyzePopupDescription,
  generatePopupEmbedding,
  analyzePopupsBatch,
  isGeminiAvailable,
  getServiceInfo,
} from './vibe-analyzer';

// Recommendation Engine
export {
  generateAIRecommendations,
  getDefaultPreferences,
  updatePreferencesFromInteraction,
} from './recommendation-engine';

// Smart Notifications
export {
  calculateOptimalTime,
  calculateBatchOptimalTimes,
  generatePersonalizedMessage,
  createNotificationDigest,
  createPopupNotificationSchedule,
  getUserNotificationPreferences,
  type NotificationSchedule,
} from './smart-notifications';

// Semantic Search
export {
  semanticSearch,
  processNaturalLanguageQuery,
  generateSearchSuggestions,
  trackSearchQuery,
  getSearchAnalytics,
  type SearchAnalytics,
} from './semantic-search';

// Service Status Check
export async function getAIServiceStatus(): Promise<import('./types').AIServiceStatus> {
  const serviceInfo = await import('./vibe-analyzer').then((m) => m.getServiceInfo());

  return {
    geminiAvailable: serviceInfo.available,
    embeddingAvailable: serviceInfo.features.embedding,
    demoMode: serviceInfo.demoMode,
    features: {
      vibeAnalysis: serviceInfo.features.textAnalysis,
      recommendations: true, // Always available (has fallback)
      semanticSearch: serviceInfo.features.embedding,
      smartNotifications: true, // Always available (has fallback)
    },
  };
}
