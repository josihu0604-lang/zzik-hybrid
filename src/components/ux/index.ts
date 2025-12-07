/**
 * ZZIK UX Components - Central Export
 *
 * UX 사용성 개선을 위한 컴포넌트 모음
 * Nielsen's 10 Usability Heuristics 기반
 *
 * Usage:
 * import { EmptyState, ErrorState, NetworkStatus } from '@/components/ux'
 */

// ============================================================================
// Empty States (빈 상태) - Nielsen #10: Help and Documentation
// ============================================================================
export {
  EmptyState,
  // SearchEmptyState,           // @deprecated - unused, use EmptyState with variant="search"
  // ParticipationEmptyState,    // @deprecated - unused, use EmptyState with variant="funding"
  type EmptyStateProps,
  type EmptyStateVariant,
} from './EmptyState';

// ============================================================================
// Error States (에러 상태) - Nielsen #9: Help users recognize, diagnose, and recover from errors
// ============================================================================
export {
  ErrorState,
  // NetworkErrorState,          // @deprecated - unused, use ErrorState with variant="network"
  // ServerErrorState,            // @deprecated - unused, use ErrorState with variant="server"
  // TimeoutErrorState,           // @deprecated - unused, use ErrorState with variant="timeout"
  type ErrorStateProps,
} from './ErrorState';

// ============================================================================
// Network Status (오프라인 상태) - Nielsen #1: Visibility of System Status
// ============================================================================
export { NetworkStatus, useNetworkStatus, OfflineBanner } from './NetworkStatus';

// ============================================================================
// Pull to Refresh (당겨서 새로고침) - Nielsen #3: User Control and Freedom
// ============================================================================
export { PullToRefresh, InfiniteScroll, type PullToRefreshProps } from './PullToRefresh';

// ============================================================================
// Optimistic Updates (낙관적 업데이트) - Nielsen #1: Visibility of System Status
// ============================================================================
export {
  OptimisticButton,
  LikeButton,
  BookmarkButton,
  type OptimisticButtonProps,
} from './OptimisticButton';

// ============================================================================
// Micro Interactions (마이크로 인터랙션) - Nielsen #1: Visibility of System Status
// ============================================================================
export {
  AnimatedButton,
  SuccessAnimation,
  FailureAnimation,
  RippleEffect,
  PressEffect,
  type AnimatedButtonProps,
} from './MicroInteractions';

// ============================================================================
// Scroll Animations (스크롤 애니메이션) - Nielsen #1: Visibility of System Status
// ============================================================================
export {
  FadeInOnScroll,
  // SlideInOnScroll,             // @deprecated - unused, use FadeInOnScroll instead
  // ScaleOnScroll,               // @deprecated - unused, use FadeInOnScroll instead
  // StaggeredList,               // @deprecated - unused, use FadeInOnScroll with children
  // ParallaxScroll,              // @deprecated - unused
  ScrollProgress,
  // RevealOnScroll,              // @deprecated - unused, use FadeInOnScroll instead
  type FadeInOnScrollProps,
} from './ScrollAnimations';

// ============================================================================
// Touch Interactions (반응형 터치) - Apple HIG: Touch Target Size
// ============================================================================
export {
  TouchTarget,
  // SwipeAction,                 // @deprecated - unused
  // LongPressMenu,               // @deprecated - unused, use TouchTarget instead
  // DoubleTapLike,               // @deprecated - unused, use LikeButton from OptimisticButton
  type TouchTargetProps,
} from './TouchInteraction';

// ============================================================================
// Async Boundary (로딩 상태) - Nielsen #1: Visibility of System Status
// ============================================================================
export {
  AsyncBoundary,
  Suspenseful,
  withAsyncBoundary,
  DataBoundary,
  LoadingOverlay,
  type AsyncBoundaryProps,
} from './AsyncBoundary';

// ============================================================================
// Virtual List (가상화 리스트) - Performance Optimization
// ============================================================================
export {
  VirtualList,
  VirtualGrid,
  LoadingIndicator,
  EmptyState as VirtualListEmptyState,
  type VirtualListProps,
  type VirtualGridProps,
} from './VirtualList';
