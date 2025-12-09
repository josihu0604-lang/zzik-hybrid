'use client';

/**
 * Web Vitals Development Monitor
 *
 * Visual display of Web Vitals metrics in development mode
 * Shows real-time performance metrics in bottom-right corner
 *
 * Only renders in development mode
 */

import { useEffect, useState } from 'react';
import { onCLS, onLCP, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  FCP: { good: 1800, needsImprovement: 3000 },
  INP: { good: 200, needsImprovement: 500 },
} as const;

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function formatValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Web Vitals Monitor Component
 *
 * Only visible in development mode
 * Shows real-time metrics in bottom-right corner
 */
export function WebVitalsMonitor() {
  const [metrics, setMetrics] = useState<Map<string, VitalMetric>>(new Map());
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      setIsVisible(false);
      return;
    }

    function updateMetric(metric: Metric) {
      setMetrics((prev) => {
        const newMetrics = new Map(prev);
        newMetrics.set(metric.name, {
          name: metric.name,
          value: metric.value,
          rating: metric.rating || getRating(metric.name, metric.value),
          timestamp: Date.now(),
        });
        return newMetrics;
      });
    }

    // Subscribe to all Web Vitals
    onCLS(updateMetric);
    onLCP(updateMetric);
    onINP(updateMetric); // INP replaces FID
    onTTFB(updateMetric);
    onFCP(updateMetric);
  }, []);

  if (!isVisible) return null;

  const metricsArray = Array.from(metrics.values()).sort((a, b) => {
    const order = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return (
    <div
      className="fixed bottom-24 right-4 z-[999] font-mono text-xs"
      style={{
        pointerEvents: 'auto',
      }}
    >
      {/* Minimize/Maximize Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="mb-2 w-full rounded-lg px-3 py-2 text-left font-semibold transition-colors"
        style={{
          background: 'rgba(18, 19, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FF6B5B',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between">
          <span>Web Vitals</span>
          <span>{isMinimized ? '▼' : '▲'}</span>
        </div>
      </button>

      {!isMinimized && (
        <div
          className="space-y-1 rounded-lg p-3"
          style={{
            background: 'rgba(18, 19, 20, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            minWidth: '200px',
          }}
        >
          {metricsArray.length === 0 ? (
            <div className="text-gray-400">Waiting for metrics...</div>
          ) : (
            metricsArray.map((metric) => {
              const color =
                metric.rating === 'good'
                  ? '#22c55e'
                  : metric.rating === 'needs-improvement'
                    ? '#FFD93D'
                    : '#FF6B5B';

              return (
                <div key={metric.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                    <span className="font-semibold" style={{ color }}>
                      {metric.name}
                    </span>
                  </div>
                  <span className="font-mono" style={{ color }}>
                    {formatValue(metric.name, metric.value)}
                  </span>
                </div>
              );
            })
          )}

          <div className="mt-2 border-t border-gray-700 pt-2 text-[10px] text-gray-500">
            Press to minimize
          </div>
        </div>
      )}
    </div>
  );
}
