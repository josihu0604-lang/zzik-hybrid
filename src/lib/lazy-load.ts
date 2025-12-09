/**
 * Lazy Loading Utilities
 * Code splitting and dynamic imports for bundle optimization
 */

import dynamic from 'next/dynamic';
import React, { ComponentType, LazyExoticComponent } from 'react';

/**
 * Lazy load a component with loading state
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: React.ComponentType<any>;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading,
    ssr: options?.ssr !== false,
  });
}

/**
 * Lazy load with custom error boundary
 */
export function lazyLoadWithError<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const Component = lazyLoad(importFunc, { ssr: false });

  return function LazyComponentWithError(props: React.ComponentProps<T>) {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const retry = () => {
      setError(null);
      setRetryCount(prev => prev + 1);
    };

    if (error && ErrorComponent) {
      return <ErrorComponent error={error} retry={retry} />;
    }

    return (
      <React.Suspense
        fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-48" />}
      >
        <Component {...props} key={retryCount} />
      </React.Suspense>
    );
  };
}

/**
 * Preload a component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc().catch(error => {
    console.error('Failed to preload component:', error);
  });
}

/**
 * Lazy load on interaction (click, hover, etc.)
 */
export function lazyLoadOnInteraction<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  trigger: 'click' | 'hover' | 'visible' = 'visible'
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadComponent = React.useCallback(async () => {
    if (Component || isLoading) return;

    setIsLoading(true);
    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (error) {
      console.error('Failed to load component:', error);
    } finally {
      setIsLoading(false);
    }
  }, [Component, isLoading]);

  return {
    Component,
    isLoading,
    loadComponent,
    trigger,
  };
}

/**
 * Lazy load multiple components in parallel
 */
export async function lazyLoadBatch<T extends Record<string, ComponentType<any>>>(
  imports: { [K in keyof T]: () => Promise<{ default: T[K] }> }
): Promise<T> {
  const entries = Object.entries(imports) as [keyof T, () => Promise<{ default: T[keyof T] }>][];
  
  const results = await Promise.all(
    entries.map(async ([key, importFunc]) => {
      const module = await importFunc();
      return [key, module.default] as const;
    })
  );

  return Object.fromEntries(results) as T;
}

/**
 * Route-based code splitting
 */
export const lazyRoutes = {
  /**
   * Home/Dashboard pages
   */
  home: {
    TouristHomeScreen: lazyLoad(() => import('@/components/home/TouristHomeScreen')),
  },

  /**
   * Queue pages
   */
  queue: {
    LiveQueueDisplay: lazyLoad(() => import('@/components/queue/LiveQueueDisplay')),
    QueuePositionTracker: lazyLoad(() => import('@/components/queue/QueuePositionTracker')),
  },

  /**
   * Recommendations pages
   */
  recommendations: {
    AIRecommendations: lazyLoad(() => import('@/components/recommendations/AIRecommendations')),
  },

  /**
   * Auth pages
   */
  auth: {
    SocialLoginButtons: lazyLoad(() => import('@/components/auth/SocialLoginButtons'), { ssr: false }),
  },
};

/**
 * Lazy load heavy libraries
 */
export const lazyLibraries = {
  // Animations
  FramerMotion: () => import('framer-motion'),
  
  // Charts (if needed)
  // Chart: () => import('chart.js'),
  
  // Date utilities
  // DateFns: () => import('date-fns'),
};

/**
 * Prefetch strategy
 */
export class PrefetchManager {
  private prefetched = new Set<string>();

  /**
   * Prefetch a component
   */
  prefetch(key: string, importFunc: () => Promise<any>): void {
    if (this.prefetched.has(key)) return;

    // Prefetch on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadAndCache(key, importFunc);
      });
    } else {
      setTimeout(() => {
        this.loadAndCache(key, importFunc);
      }, 1);
    }
  }

  /**
   * Prefetch on link hover
   */
  prefetchOnHover(element: HTMLElement, importFunc: () => Promise<any>): void {
    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        importFunc();
      }, 200); // Wait 200ms before prefetching
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }

  private async loadAndCache(key: string, importFunc: () => Promise<any>): Promise<void> {
    try {
      await importFunc();
      this.prefetched.add(key);
    } catch (error) {
      console.error(`Failed to prefetch ${key}:`, error);
    }
  }
}

export const prefetchManager = new PrefetchManager();

/**
 * React hook for lazy loading
 */
export function useLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    preload?: boolean;
  }
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (options?.preload) {
      loadComponent();
    }
  }, [options?.preload]);

  const loadComponent = React.useCallback(async () => {
    if (Component || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [Component, isLoading]);

  return {
    Component,
    isLoading,
    error,
    loadComponent,
  };
}
