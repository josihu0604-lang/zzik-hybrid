/**
 * Performance Analytics
 *
 * Track Web Vitals and page load performance
 */

import { trackTiming, trackEvent } from './ga4';

/**
 * Track Web Vitals
 */
export function trackWebVital(
  metric: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP',
  value: number,
  id: string
): void {
  trackTiming('Web Vitals', metric, value);

  // Also send as event for better reporting
  trackEvent({
    action: metric.toLowerCase(),
    category: 'web_vitals',
    value: Math.round(value),
    params: {
      metric_id: id,
      metric_value: value,
      metric_delta: value,
    },
  });
}

/**
 * Track page load performance
 */
export function trackPageLoadPerformance(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (navigation) {
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domInteractive: navigation.domInteractive - navigation.responseEnd,
      domComplete: navigation.domComplete - navigation.responseEnd,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        trackTiming('Page Load', name, value);
      }
    });
  }
}

/**
 * Track resource timing
 */
export function trackResourceTiming(resourceName: string): void {
  if (typeof window === 'undefined' || !window.performance) return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const resource = resources.find((r) => r.name.includes(resourceName));

  if (resource) {
    trackTiming('Resource', resourceName, resource.duration);
  }
}

/**
 * Track custom timing
 */
export function trackCustomTiming(name: string, startMark: string, endMark?: string): void {
  if (typeof window === 'undefined' || !window.performance) return;

  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    }
    const measures = performance.getEntriesByName(name, 'measure');
    const measure = measures[measures.length - 1];
    if (measure) {
      trackTiming('Custom', name, measure.duration);
    }
  } catch {
    // Marks may not exist
  }
}

/**
 * Start performance mark
 */
export function startMark(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${name}_start`);
  }
}

/**
 * End performance mark and track
 */
export function endMark(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(`${name}_end`);
    trackCustomTiming(name, `${name}_start`, `${name}_end`);
  }
}

// ============================================================================
// API TIMING TRACKING
// ============================================================================

interface ApiTimingData {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: number;
}

// Store for API timing data (last 100 entries)
const apiTimingStore: ApiTimingData[] = [];
const MAX_STORE_SIZE = 100;

/**
 * Track API response time
 *
 * @example
 * const startTime = performance.now();
 * const response = await fetch('/api/popups');
 * trackApiTiming('/api/popups', 'GET', startTime, response.status);
 */
export function trackApiTiming(
  endpoint: string,
  method: string,
  startTime: number,
  status: number
): void {
  if (typeof window === 'undefined' || !window.performance) return;

  const duration = performance.now() - startTime;
  const success = status >= 200 && status < 400;

  // Store timing data
  const timingData: ApiTimingData = {
    endpoint,
    method,
    duration,
    status,
    success,
    timestamp: Date.now(),
  };

  apiTimingStore.push(timingData);
  if (apiTimingStore.length > MAX_STORE_SIZE) {
    apiTimingStore.shift();
  }

  // Track to GA4
  trackTiming('API', `${method} ${endpoint}`, duration);

  trackEvent({
    action: 'api_timing',
    category: 'performance',
    value: Math.round(duration),
    params: {
      endpoint,
      method,
      status,
      success,
      duration_ms: Math.round(duration),
    },
  });

  // Log slow APIs in development
  if (process.env.NODE_ENV === 'development' && duration > 1000) {
    console.warn(`[Slow API] ${method} ${endpoint}: ${Math.round(duration)}ms`);
  }
}

/**
 * Get API timing statistics
 */
export function getApiTimingStats(): {
  totalRequests: number;
  averageDuration: number;
  slowestEndpoint: string | null;
  failureRate: number;
  recentTimings: ApiTimingData[];
} {
  if (apiTimingStore.length === 0) {
    return {
      totalRequests: 0,
      averageDuration: 0,
      slowestEndpoint: null,
      failureRate: 0,
      recentTimings: [],
    };
  }

  const totalRequests = apiTimingStore.length;
  const totalDuration = apiTimingStore.reduce((sum, t) => sum + t.duration, 0);
  const averageDuration = totalDuration / totalRequests;
  const failures = apiTimingStore.filter((t) => !t.success).length;
  const failureRate = (failures / totalRequests) * 100;

  const slowest = apiTimingStore.reduce((max, t) => (t.duration > max.duration ? t : max));

  return {
    totalRequests,
    averageDuration: Math.round(averageDuration),
    slowestEndpoint: `${slowest.method} ${slowest.endpoint}`,
    failureRate: Math.round(failureRate * 10) / 10,
    recentTimings: apiTimingStore.slice(-10),
  };
}

/**
 * Create a fetch wrapper that automatically tracks API timing
 *
 * @example
 * const trackedFetch = createTrackedFetch();
 * const response = await trackedFetch('/api/popups');
 */
export function createTrackedFetch() {
  return async function trackedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    try {
      const response = await fetch(input, init);
      trackApiTiming(url, method, startTime, response.status);
      return response;
    } catch (error) {
      trackApiTiming(url, method, startTime, 0); // 0 = network error
      throw error;
    }
  };
}
