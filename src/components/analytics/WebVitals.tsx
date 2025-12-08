'use client';

/**
 * Web Vitals Reporter
 *
 * Automatically measures and reports Core Web Vitals:
 * - CLS (Cumulative Layout Shift)
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 *
 * Integrates with Analytics system for tracking
 */

import { useEffect } from 'react';
import { onCLS, onLCP, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';
import { trackWebVital } from '@/lib/analytics';

/**
 * Web Vitals thresholds for performance classification
 * Based on Google's Core Web Vitals criteria
 */
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  FCP: { good: 1800, needsImprovement: 3000 },
  INP: { good: 200, needsImprovement: 500 },
} as const;

/**
 * Get performance rating based on metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vital metric to analytics
 */
function reportWebVital(metric: Metric) {
  const { name, value, id, rating } = metric;

  // Track in analytics system
  trackWebVital(name as 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP', value, id);

  // Development logging handled by trackWebVital
  if (process.env.NODE_ENV === 'development') {
    const computedRating = getRating(name, value);
    const _devInfo = {
      value: Math.round(value),
      rating: rating || computedRating,
      id,
      threshold: THRESHOLDS[name as keyof typeof THRESHOLDS],
    };
    // Dev logging suppressed - use DevTools for Web Vitals
    void _devInfo;
  }
}

/**
 * Web Vitals Reporter Component
 *
 * Must be rendered once in the app (typically in root layout)
 * Automatically tracks all Core Web Vitals
 */
export function WebVitals() {
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      // Core Web Vitals
      onCLS(reportWebVital); // Cumulative Layout Shift
      onLCP(reportWebVital); // Largest Contentful Paint
      onINP(reportWebVital); // Interaction to Next Paint (replaces FID)

      // Additional metrics
      onTTFB(reportWebVital); // Time to First Byte
      onFCP(reportWebVital); // First Contentful Paint

      // Web Vitals monitoring initialized
    } catch (error) {
      console.error('[Web Vitals] Failed to initialize:', error);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
