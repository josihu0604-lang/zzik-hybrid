'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * Help Page Loading Skeleton
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
          <div
            className="h-7 w-24 rounded-lg animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
          />
        </div>

        {/* Quick Contact Skeleton */}
        <div
          className="p-4 rounded-xl animate-pulse"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 107, 91, 0.1) 0%, rgba(255, 217, 61, 0.05) 100%)',
            border: '1px solid rgba(255, 107, 91, 0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl"
                style={{ background: 'rgba(255, 107, 91, 0.2)' }}
              />
              <div className="space-y-1">
                <div
                  className="h-4 w-24 rounded"
                  style={{ background: 'rgba(255, 107, 91, 0.2)' }}
                />
                <div
                  className="h-3 w-20 rounded"
                  style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                />
              </div>
            </div>
            <div
              className="h-9 w-20 rounded-lg"
              style={{ background: 'rgba(255, 107, 91, 0.3)' }}
            />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div
          className="flex gap-2 p-1 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.04)' }}
        >
          <div
            className="flex-1 h-11 rounded-lg animate-pulse"
            style={{ background: 'rgba(255, 107, 91, 0.2)' }}
          />
          <div
            className="flex-1 h-11 rounded-lg animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((cat) => (
            <div
              key={cat}
              className="flex-shrink-0 h-9 w-16 rounded-full animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            />
          ))}
        </div>

        {/* FAQ List Skeleton */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(18, 19, 20, 0.75)',
            border: `1px solid ${colors.border.default}`,
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 p-4"
              style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
            >
              <div
                className="w-5 h-5 rounded-full mt-0.5 animate-pulse"
                style={{ background: 'rgba(255, 107, 91, 0.2)' }}
              />
              <div
                className="h-5 flex-1 rounded animate-pulse"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
