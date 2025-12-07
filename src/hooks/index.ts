/**
 * ZZIK Hooks - 통합 export
 *
 * K-POP VIP Experience Platform Hooks
 */

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
