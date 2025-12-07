'use client';

import { motion } from 'framer-motion';
import { SkeletonMePage } from '@/components/ui/Skeleton';

/**
 * Me Page Loading UI
 *
 * 마이페이지 로딩 스켈레톤
 */

export default function MeLoading() {
  return (
    <div className="min-h-screen bg-space-950">
      {/* Animated gradient background - gentle warmth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 217, 61, 0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.06) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Me Page Skeleton */}
      <SkeletonMePage />
    </div>
  );
}
