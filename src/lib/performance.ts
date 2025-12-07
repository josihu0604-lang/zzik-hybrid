/**
 * Performance Utilities
 *
 * Tools for measuring and optimizing performance
 */

import { isDevelopment } from '@/config/app.config';
// import { logger } from '@/lib/logger';

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window === 'undefined') return 0;

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for Safari and older browsers
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(handle: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch resource for future navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Preconnect to origin
 */
export function preconnect(origin: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Web Vitals Reporter
 * Reports Core Web Vitals metrics
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}

export type WebVitalsReporter = (metric: WebVitalsMetric) => void;

/**
 * Initialize Web Vitals reporting
 *
 * To enable Web Vitals reporting:
 * 1. Install: pnpm add web-vitals
 * 2. Import and call:
 *    import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
 *    onCLS(onReport); onFCP(onReport); etc.
 *
 * @param onReport - Callback to handle metrics
 */
export function initWebVitals(onReport: WebVitalsReporter): void {
  if (typeof window === 'undefined') return;

  // Log that Web Vitals tracking is available but needs to be configured
  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.log(
      '[Performance] Web Vitals reporting ready. Install web-vitals package for metrics.'
    );
  }

  // Store the reporter for manual use
  (window as unknown as Record<string, WebVitalsReporter>).__webVitalsReporter = onReport;
}

/**
 * Report a Web Vital metric manually
 */
export function reportWebVital(
  name: WebVitalsMetric['name'],
  value: number,
  rating: WebVitalsMetric['rating'] = 'good'
): void {
  const reporter = (window as unknown as Record<string, WebVitalsReporter | undefined>)
    .__webVitalsReporter;
  if (reporter) {
    reporter({
      name,
      value,
      rating,
      id: `${name}-${Date.now()}`,
    });
  }
}

/**
 * Memory usage checker
 */
export function getMemoryUsage(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} | null {
  if (typeof window === 'undefined') return null;

  const memory = (
    performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
  ).memory;

  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

/**
 * Frame rate monitor
 */
export function monitorFrameRate(
  callback: (fps: number) => void,
  sampleSize: number = 60
): () => void {
  if (typeof window === 'undefined') return () => {};

  let frameCount = 0;
  let lastTime = performance.now();
  let animationId: number;

  const measure = (currentTime: number) => {
    frameCount++;

    if (frameCount >= sampleSize) {
      const elapsed = currentTime - lastTime;
      const fps = Math.round((frameCount * 1000) / elapsed);
      callback(fps);

      frameCount = 0;
      lastTime = currentTime;
    }

    animationId = requestAnimationFrame(measure);
  };

  animationId = requestAnimationFrame(measure);

  return () => cancelAnimationFrame(animationId);
}

/**
 * Component render tracker (development only)
 */
export function trackRender(componentName: string): void {
  if (!isDevelopment) return;
  if (typeof window === 'undefined') return;

  const key = `render_${componentName}`;
  const globalWindow = window as unknown as Record<string, number>;
  const count = globalWindow[key] || 0;
  globalWindow[key] = count + 1;

  // eslint-disable-next-line no-console
  console.log(`[Render] ${componentName} rendered ${count + 1} times`);
}
