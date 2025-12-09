'use client';

import { m } from 'framer-motion';
import { SkeletonMainPage } from '@/components/ui/Skeleton';

/**
 * Global Loading UI - ZZIK
 *
 * Displays skeleton screens while pages are loading.
 * Provides better UX than blank screens or generic spinners.
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-space-950">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <m.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.15) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Main Page Skeleton */}
      <SkeletonMainPage />
    </div>
  );
}
