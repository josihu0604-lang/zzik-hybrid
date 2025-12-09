/**
 * ZZIK Stores - Zustand State Management
 * 
 * Centralized exports for all application stores
 */

// Queue Store
export { useQueueStore, useNotificationStore } from './queue-store';
export type { QueueNotification } from './queue-store';

// Payment Store
export { usePaymentStore, selectAvailableBalance, selectCanPay, selectDefaultPaymentMethod, selectRecentTransactions } from './payment-store';
export type {
  ZPoint,
  PaymentMethod,
  PaymentMethodType,
  Transaction,
  TransactionType,
  TransactionStatus,
  PendingPayment,
} from './payment-store';

// Review Store
export { useReviewStore, selectReviewsByTarget, selectAverageRating, selectRatingDistribution } from './review-store';
export type {
  Review,
  ReviewDraft,
  ReviewReply,
  ReviewUser,
  TargetType,
  SortOption,
} from './review-store';

// Social Store
export { useSocialStore, selectIsFollowing, selectFollowersCount, selectFollowingCount } from './social-store';
export type {
  UserProfile,
  UserSummary,
  Badge as SocialBadge,
  Activity,
  ActivityType,
  FeedItem,
  FeedType,
} from './social-store';

// Gamification Store
export {
  useGamificationStore,
  selectTierProgress,
  selectBadgesByCategory,
  selectTopLeaders,
  selectClaimableAchievements,
} from './gamification-store';
export type {
  Badge,
  BadgeCategory,
  BadgeTier,
  BadgeProgress,
  PointTransaction,
  PointsData,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardPeriod,
  Achievement,
  TransactionType as PointTransactionType,
} from './gamification-store';
