/**
 * ZZIK Algorithms Module
 *
 * Core algorithms for the popup crowdfunding platform:
 * - Recommendation: Personalized popup suggestions
 * - Leader Matching: Influencer-campaign matching
 * - Prediction: Funding success prediction
 * - ZZIK Live: Live show host matching & licensing
 */

// Recommendation Engine
export {
  generateRecommendations,
  calculateCollaborativeScore,
  calculateContentScore,
  calculatePopularityScore,
  calculateTrendingScore,
  getDefaultPreferences,
  updatePreferencesFromInteraction,
  type RecommendationScore,
  type UserPreferences,
  type PopupFeatures,
} from './recommendation';

// Leader Matching (Influencer)
export {
  matchLeadersToCampaign,
  findBestLeader,
  calculateAudienceScore,
  calculateEngagementScore,
  calculateCategoryScore,
  calculatePerformanceScore,
  getLeaderTier,
  getTierPricing,
  estimateCampaignCost,
  type Leader,
  type AudienceDemographics,
  type LeaderPerformance,
  type PopupCampaign,
  type LeaderMatchResult,
  type LeaderTier,
} from './leader-matching';

// Prediction Model
export {
  predictSuccess,
  batchPredict,
  getAtRiskPopups,
  type PredictionInput,
  type PredictionResult,
  type PredictionFactor,
} from './prediction';

// ZZIK Live - Show Host System
export {
  // Core matching
  matchHostsToRequest,
  findOptimalShowTime,
  checkAvailability,
  // Scoring
  calculateSalesScore,
  calculateLiveEngagementScore,
  calculateExpertiseScore,
  calculateReliabilityScore,
  // Revenue
  calculateEstimatedRevenue,
  calculateLicensingValue,
  suggestLicensingDeal,
  // Tier system
  getHostTier,
  getTierBenefits,
  // Types
  type ShowHost,
  type ShowHostTier,
  type ShowHostSkills,
  type ShowHostPerformance,
  type HostAvailability,
  type HostPricing,
  type LiveShowRequest,
  type HostMatchResult,
  type EstimatedRevenue,
  type LicensingDeal,
  type PerformanceBonus,
} from './zzik-live';
