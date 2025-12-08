'use client';

/**
 * Lazy Loading Components
 *
 * Code-splitting for heavy components to reduce initial bundle size.
 * Uses React.lazy() with Suspense boundaries.
 * For Next.js-specific components (like maps), use next/dynamic.
 */

import { lazy, Suspense, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { colors } from '@/lib/design-tokens';

// ============================================================================
// LOADING FALLBACKS
// ============================================================================

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className="animate-spin rounded-full border-2 border-transparent"
      style={{
        width: size,
        height: size,
        borderTopColor: colors.flame[500],
        borderRightColor: colors.flame[300],
      }}
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div
      className="animate-pulse rounded-2xl"
      style={{
        background: colors.space[850],
        height: 200,
      }}
    />
  );
}

export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <LoadingSpinner size={32} />
      <span style={{ color: colors.text.secondary, fontSize: '14px' }}>{text}</span>
    </div>
  );
}

// ============================================================================
// LAZY COMPONENT WRAPPER
// ============================================================================

interface LazyWrapperProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export function LazyWrapper({ fallback = <LoadingOverlay />, children }: LazyWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// ============================================================================
// LAZY LOADED COMPONENTS
// ============================================================================

// Heavy popup components
export const LazyCelebrationModal = lazy(() =>
  import('@/components/popup/CelebrationModal').then((m) => ({ default: m.CelebrationModal }))
);

export const LazyCategoryFilter = lazy(() =>
  import('@/components/popup/CategoryFilter').then((m) => ({ default: m.CategoryFilter }))
);

export const LazyLiveStats = lazy(() =>
  import('@/components/popup/LiveStats').then((m) => ({ default: m.LiveStats }))
);

// Verification modal - heavy component with GPS and animations
export const LazyVerificationModal = lazy(() =>
  import('@/components/verification/VerificationModal').then((m) => ({
    default: m.VerificationModal,
  }))
);

// Toast provider (can be deferred)
export const LazyToastProvider = lazy(() =>
  import('@/components/ui/Toast').then((m) => ({ default: m.ToastProvider }))
);

// Map components (heavy dependency: mapbox-gl)
// Using next/dynamic for better SSR control - maps should only render on client
export const LazyMapboxMap = dynamic(
  () => import('@/components/map/MapboxMap').then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => <LoadingOverlay text="지도 로딩 중..." />,
  }
);

// Legacy React.lazy version (for comparison)
export const LazyMapboxMapLegacy = lazy(() =>
  import('@/components/map/MapboxMap').then((m) => ({ default: m.MapboxMap }))
);

// ============================================================================
// DYNAMIC IMPORTS FOR ON-DEMAND LOADING
// ============================================================================

/**
 * Dynamically import confetti library only when needed
 */
export async function loadConfettiLibrary() {
  const { useConfetti } = await import('@/hooks/useConfetti');
  return useConfetti;
}

/**
 * Dynamically import algorithms for server-side processing
 */
export async function loadRecommendationEngine() {
  return await import('@/lib/algorithms/recommendation');
}

export async function loadLeaderMatching() {
  return await import('@/lib/algorithms/leader-matching');
}

export async function loadPrediction() {
  return await import('@/lib/algorithms/prediction');
}

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Prefetch component on hover/focus for faster loading
 */
export function prefetchComponent(
  componentName: 'celebration' | 'category' | 'stats' | 'verification'
) {
  switch (componentName) {
    case 'celebration':
      import('@/components/popup/CelebrationModal');
      break;
    case 'category':
      import('@/components/popup/CategoryFilter');
      break;
    case 'stats':
      import('@/components/popup/LiveStats');
      break;
    case 'verification':
      import('@/components/verification/VerificationModal');
      break;
  }
}

/**
 * Prefetch all popup-related components
 */
export function prefetchPopupComponents() {
  prefetchComponent('celebration');
  prefetchComponent('category');
  prefetchComponent('stats');
  prefetchComponent('verification');
}
