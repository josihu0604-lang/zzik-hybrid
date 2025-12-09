'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * Search Page Loading Skeleton
 */

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <m.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar Skeleton */}
        <div className="flex gap-3">
          <div
            className="flex-1 h-12 rounded-xl animate-pulse"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${colors.border.default}`,
            }}
          />
          <div
            className="w-12 h-12 rounded-xl animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          />
        </div>

        {/* Trending Section Skeleton */}
        <div className="space-y-3">
          <div
            className="h-5 w-24 rounded animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.08)' }}
          />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 w-20 rounded-full animate-pulse"
                style={{ background: 'rgba(255, 107, 91, 0.1)' }}
              />
            ))}
          </div>
        </div>

        {/* Results Skeleton */}
        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl animate-pulse"
              style={{
                background: 'rgba(18, 19, 20, 0.75)',
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <div className="flex gap-2 mb-3">
                <div
                  className="h-5 w-16 rounded-full"
                  style={{ background: 'rgba(255, 107, 91, 0.15)' }}
                />
                <div
                  className="h-5 w-12 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                />
              </div>
              <div
                className="h-4 w-20 rounded mb-1"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              />
              <div
                className="h-5 w-48 rounded mb-3"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              />
              <div
                className="h-2 w-full rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
