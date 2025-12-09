'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * Account Deletion Page Loading Skeleton
 */

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <m.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 60%)',
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
          <div
            className="h-7 w-24 rounded-lg animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          />
        </div>

        {/* Warning Card Skeleton */}
        <div
          className="p-5 rounded-xl animate-pulse"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <div className="flex gap-4">
            <div
              className="w-12 h-12 rounded-xl"
              style={{ background: 'rgba(239, 68, 68, 0.2)' }}
            />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 rounded" style={{ background: 'rgba(239, 68, 68, 0.2)' }} />
              <div
                className="h-4 w-full rounded"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              />
            </div>
          </div>
        </div>

        {/* Content Card Skeleton */}
        <div
          className="p-5 rounded-xl"
          style={{
            background: 'rgba(18, 19, 20, 0.75)',
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                />
                <div
                  className="h-4 flex-1 rounded animate-pulse"
                  style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div
          className="h-14 rounded-xl animate-pulse"
          style={{ background: 'rgba(239, 68, 68, 0.15)' }}
        />
      </div>
    </div>
  );
}
