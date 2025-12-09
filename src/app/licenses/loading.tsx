'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * Licenses Page Loading Skeleton
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

      <div className="p-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-10 h-10 rounded-xl animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          />
          <div className="space-y-1">
            <div
              className="h-6 w-40 rounded-lg animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            />
            <div
              className="h-3 w-28 rounded animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((stat) => (
            <div
              key={stat}
              className="flex-shrink-0 px-3 py-2 rounded-lg w-20 h-14 animate-pulse"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${colors.border.subtle}`,
              }}
            />
          ))}
        </div>

        {/* Search Skeleton */}
        <div
          className="h-12 rounded-xl animate-pulse"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${colors.border.default}`,
          }}
        />

        {/* License List Skeleton */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(18, 19, 20, 0.75)',
            border: `1px solid ${colors.border.default}`,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
            >
              <div
                className="w-10 h-10 rounded-xl animate-pulse"
                style={{ background: 'rgba(255, 107, 91, 0.1)' }}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-32 rounded animate-pulse"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  />
                  <div
                    className="h-4 w-12 rounded-full animate-pulse"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                </div>
                <div
                  className="h-3 w-16 rounded animate-pulse"
                  style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
