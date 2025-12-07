'use client';

import { m } from '@/lib/motion';
import { SkeletonMapPage } from '@/components/ui/Skeleton';

/**
 * Map Page Loading UI
 *
 * 오픈 확정 팝업 지도 로딩 스켈레톤
 */

export default function MapLoading() {
  return (
    <div className="min-h-screen bg-space-950">
      {/* Animated gradient background - subtle pulsing */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-15">
        <m.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Map Page Skeleton */}
      <SkeletonMapPage />
    </div>
  );
}
