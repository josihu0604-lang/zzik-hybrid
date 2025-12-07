'use client';

import { motion } from 'framer-motion';
import { SkeletonLivePage } from '@/components/ui/Skeleton';

/**
 * Live Page Loading UI
 *
 * 펀딩 중인 팝업 목록 로딩 스켈레톤
 */

export default function LiveLoading() {
  return (
    <div className="min-h-screen bg-space-950">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 91, 0.12) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(204, 74, 58, 0.1) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Live Page Skeleton */}
      <SkeletonLivePage />
    </div>
  );
}
