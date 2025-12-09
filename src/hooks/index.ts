/**
 * ZZIK Hooks - 통합 export
 *
 * 전체 35+ 커스텀 훅 export
 */

// ============================================
// Payment Hooks
// ============================================
export { usePayment, useWallet, useTransactions, usePaymentMethods } from './usePayment';
export type {
  UsePaymentOptions,
  UsePaymentReturn,
  UseWalletReturn,
  UseTransactionsOptions,
  UseTransactionsReturn,
  UsePaymentMethodsReturn,
} from './usePayment';

// ============================================
// Review Hooks
// ============================================
export { useReviews, useReviewForm, useReviewInteractions, useUserReviews } from './useReview';
export type {
  UseReviewsOptions,
  UseReviewsReturn,
  UseReviewFormOptions,
  UseReviewFormReturn,
  UseReviewInteractionsOptions,
  UseReviewInteractionsReturn,
  UseUserReviewsReturn,
} from './useReview';

// ============================================
// Social Hooks
// ============================================
export { useProfile, useFollow, useFollowers, useFeed, useUserSearch } from './useSocial';
export type {
  UseProfileOptions,
  UseProfileReturn,
  UseFollowOptions,
  UseFollowReturn,
  UseFollowersOptions,
  UseFollowersReturn,
  UseFeedOptions,
  UseFeedReturn,
  UseUserSearchReturn,
} from './useSocial';

// ============================================
// Gamification Hooks
// ============================================
export {
  usePoints,
  useBadges,
  useLeaderboard,
  useAchievements,
  useGamificationNotifications,
  usePointsAnimation,
} from './useGamification';
export type {
  UsePointsOptions,
  UsePointsReturn,
  UseBadgesOptions,
  UseBadgesReturn,
  UseLeaderboardOptions,
  UseLeaderboardReturn,
  UseAchievementsOptions,
  UseAchievementsReturn,
  UseGamificationNotificationsReturn,
  UsePointsAnimationReturn,
} from './useGamification';

// ============================================
// Real-time hooks
// ============================================
export { useRealtimeParticipants } from './useRealtimeParticipants';
export { useRealtimeParticipation } from './useRealtimeParticipation';

// Share & Social
export { useShare } from './useShare';
export type { ShareData, ShareResult, UseShareReturn } from './useShare';

// Bookmark
export { useBookmark, usePopupBookmark } from './useBookmark';
export type { BookmarkItem, UseBookmarkReturn } from './useBookmark';

// Search & Filter
export { useSearch, CATEGORY_LABELS, STATUS_LABELS, SORT_LABELS } from './useSearch';
export type {
  PopupCategory,
  PopupStatus,
  SortOption,
  SearchFilters,
  PopupItem,
  UseSearchReturn,
} from './useSearch';

// Notification
export { useNotification, NOTIFICATION_CONFIG } from './useNotification';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  UseNotificationReturn,
} from './useNotification';
export { usePushNotification } from './usePushNotification';

// Analytics
export { useAnalytics, usePageView, AnalyticsEvents } from './useAnalytics';
export type { AnalyticsEvent, EventCategory, UseAnalyticsReturn } from './useAnalytics';

// UI & Interactions
export { useVirtualList, useInfiniteScroll, useLazyLoad } from './useVirtualList';
export {
  useVirtualScroll,
  useScrollRestoration,
  useMeasureElement,
  useInfiniteScroll as useInfiniteScrollV2,
} from './useVirtualScroll';
export type {
  UseVirtualScrollOptions,
  UseVirtualScrollReturn,
  UseInfiniteScrollOptions,
} from './useVirtualScroll';
export { useConfetti } from './useConfetti';
export { useSticky } from './useSticky';
export { useHaptic } from './useHaptic';
export { useCountdown } from './useCountdown';
export { useTemperatureStyles } from './useTemperatureStyles';
export { useFocusTrap, createFocusTrapRef } from './useFocusTrap';
export type { FocusTrapOptions, FocusTrapReturn } from './useFocusTrap';
export { useBackButton, useModalBackButton, usePreventBackButton } from './useBackButton';
export type { BackButtonHandler } from './useBackButton';

// Forms & Data
export { useForm, useField } from './useForm';
export { useApi, useMutation, useApiPost, useApiPut, useApiDelete } from './useApi';

// Geolocation
export { useGeolocation } from './useGeolocation';

// Offline & Network
export { useOnlineStatus, useOfflineSync, useOfflineData } from './useOffline';

// Security
export { useCsrf } from './useCsrf';

// Participation
export { useParticipation } from './useParticipation';

// Popup Detail
export { usePopupDetail } from './usePopupDetail';
export type { PopupDetailData, CategoryColor } from './usePopupDetail';
export {
  CATEGORY_COLORS,
  DEFAULT_COLOR,
  getCategoryColor,
  getBrandInitials,
} from './usePopupDetail';

// Referral System
export { useReferral } from './useReferral';
export type { ReferralData, UseReferralOptions, UseReferralReturn } from './useReferral';

// Leader Dashboard
export { useLeaderDashboard, EARNINGS_RATES } from './useLeaderDashboard';
export type {
  Campaign,
  LeaderDashboardData,
  EarningsBreakdown,
  PerformanceMetrics,
  UseLeaderDashboardReturn,
} from './useLeaderDashboard';
