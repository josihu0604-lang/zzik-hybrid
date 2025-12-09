/**
 * Web Vitals Performance Monitoring
 * Track and optimize Core Web Vitals (LCP, FID/INP, CLS)
 */

export interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface WebVitalsReport {
  metrics: WebVitalsMetric[];
  timestamp: Date;
  url: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
}

/**
 * Web Vitals thresholds (from Google)
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },  // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },     // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },    // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 },   // Time to First Byte (ms)
  FCP: { good: 1800, poor: 3000 },   // First Contentful Paint (ms)
  INP: { good: 200, poor: 500 },     // Interaction to Next Paint (ms)
};

/**
 * Get rating for a metric value
 */
function getRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name];
  if (!thresholds) return 'good';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Detect device type
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get connection type
 */
function getConnectionType(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType;
}

/**
 * Monitor Web Vitals using the web-vitals library
 */
export class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private callbacks: ((metric: WebVitalsMetric) => void)[] = [];

  /**
   * Start monitoring web vitals
   */
  async startMonitoring(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Dynamically import web-vitals to avoid SSR issues
      const { onLCP, onFID, onCLS, onTTFB, onFCP, onINP } = await import('web-vitals');

      // Monitor each metric
      onLCP(this.handleMetric.bind(this));
      onFID(this.handleMetric.bind(this));
      onCLS(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onINP(this.handleMetric.bind(this));

      console.log('[WebVitals] Monitoring started');
    } catch (error) {
      console.error('[WebVitals] Failed to start monitoring:', error);
    }
  }

  /**
   * Handle metric update
   */
  private handleMetric(metric: any): void {
    const webVitalMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    };

    // Store metric
    this.metrics.set(metric.name, webVitalMetric);

    // Notify callbacks
    this.callbacks.forEach(callback => callback(webVitalMetric));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WebVitals] ${metric.name}:`, {
        value: metric.value.toFixed(2),
        rating: webVitalMetric.rating,
      });
    }

    // Send to analytics (optional)
    this.sendToAnalytics(webVitalMetric);
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (metric: WebVitalsMetric) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get full report
   */
  getReport(): WebVitalsReport {
    return {
      metrics: this.getMetrics(),
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      deviceType: getDeviceType(),
      connectionType: getConnectionType(),
    };
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: WebVitalsMetric): void {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint (optional)
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          url: window.location.href,
          deviceType: getDeviceType(),
          connectionType: getConnectionType(),
        }),
      }).catch(error => {
        console.error('[WebVitals] Failed to send analytics:', error);
      });
    }
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    metrics.forEach(metric => {
      const weight = this.getMetricWeight(metric.name);
      let score = 0;

      // Calculate score based on rating
      if (metric.rating === 'good') score = 100;
      else if (metric.rating === 'needs-improvement') score = 50;
      else score = 0;

      totalScore += score * weight;
      count += weight;
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
  }

  /**
   * Get metric weight for score calculation
   */
  private getMetricWeight(name: WebVitalsMetric['name']): number {
    // Weights based on Google Lighthouse
    const weights: Record<string, number> = {
      LCP: 0.25,  // 25%
      FID: 0.10,  // 10%
      INP: 0.10,  // 10%
      CLS: 0.15,  // 15%
      TTFB: 0.10, // 10%
      FCP: 0.10,  // 10%
    };
    return weights[name] || 0.05;
  }
}

/**
 * Singleton instance
 */
export const webVitalsMonitor = new WebVitalsMonitor();

/**
 * React hook for web vitals monitoring
 */
export function useWebVitals() {
  if (typeof window === 'undefined') {
    return {
      metrics: [],
      score: 0,
      report: null,
    };
  }

  const [metrics, setMetrics] = React.useState<WebVitalsMetric[]>([]);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    webVitalsMonitor.startMonitoring();

    const unsubscribe = webVitalsMonitor.subscribe((metric) => {
      setMetrics(webVitalsMonitor.getMetrics());
      setScore(webVitalsMonitor.getPerformanceScore());
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    score,
    report: webVitalsMonitor.getReport(),
  };
}

// Import React for the hook
import React from 'react';
