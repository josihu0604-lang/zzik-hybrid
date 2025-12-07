'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * Bookmarks Page Loading Skeleton
 */

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div
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
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            />
            <div className="space-y-1">
              <div
                className="h-6 w-28 rounded-lg animate-pulse"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              />
              <div
                className="h-3 w-12 rounded animate-pulse"
                style={{ background: 'rgba(255, 255, 255, 0.04)' }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-24 rounded-full animate-pulse"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            />
          ))}
        </div>

        {/* Bookmark Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl animate-pulse"
              style={{
                background: 'rgba(18, 19, 20, 0.75)',
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
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
                    className="h-5 w-48 rounded"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  />
                </div>
                <div
                  className="w-9 h-9 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                />
              </div>
              <div
                className="h-2 w-full rounded-full mb-3"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              />
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div
                    className="h-4 w-16 rounded"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                  <div
                    className="h-4 w-14 rounded"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                </div>
                <div
                  className="h-4 w-20 rounded"
                  style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
