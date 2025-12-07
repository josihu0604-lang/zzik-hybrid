'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * ShimmerSkeleton - 2026 트렌드 스켈레톤 로딩
 *
 * Features:
 * - 좌→우 빛 흐름 효과 (Shimmer)
 * - Staggered 등장 애니메이션
 * - Bento Grid 레이아웃 대응
 */

interface ShimmerSkeletonProps {
  /** 카드 크기 */
  size?: 'hero' | 'featured' | 'standard' | 'compact';
  className?: string;
}

// Shimmer animation keyframes (CSS로 정의)
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export function ShimmerSkeleton({ size = 'standard', className = '' }: ShimmerSkeletonProps) {
  const isHero = size === 'hero';
  const isCompact = size === 'compact';

  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={{
          background: colors.space[850],
          border: `1px solid ${colors.border.subtle}`,
          aspectRatio: isHero ? '16/9' : isCompact ? '1/1' : '4/5',
        }}
      >
        {/* Shimmer Effect Overlay */}
        <div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.04) 50%,
              transparent 100%
            )`,
            animation: 'shimmer 1.5s infinite',
          }}
        />

        {/* Content Skeleton */}
        <div className="absolute inset-0 p-3 flex flex-col justify-end">
          {/* Top Badge Skeleton */}
          <div className="absolute top-3 left-3">
            <div
              className="rounded-full"
              style={{
                width: isHero ? 70 : 50,
                height: 24,
                background: 'rgba(255,255,255,0.06)',
              }}
            />
          </div>

          {/* Brand Name */}
          {!isCompact && (
            <div
              className="rounded mb-2"
              style={{
                width: '30%',
                height: 14,
                background: 'rgba(255,255,255,0.06)',
              }}
            />
          )}

          {/* Title Lines */}
          <div
            className="rounded mb-1"
            style={{
              width: '90%',
              height: isHero ? 24 : 16,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            className="rounded mb-3"
            style={{
              width: '60%',
              height: isHero ? 24 : 16,
              background: 'rgba(255,255,255,0.06)',
            }}
          />

          {/* Progress Bar */}
          <div
            className="rounded-full mb-3"
            style={{
              width: '100%',
              height: 4,
              background: 'rgba(255,255,255,0.06)',
            }}
          />

          {/* Stats + Button Row */}
          <div className="flex items-center justify-between">
            <div
              className="rounded"
              style={{
                width: 60,
                height: 16,
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            {!isCompact && (
              <div
                className="rounded-full"
                style={{
                  width: 60,
                  height: 28,
                  background: 'rgba(255,255,255,0.08)',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * BentoGridSkeleton - Bento Grid 전체 스켈레톤
 */
interface BentoGridSkeletonProps {
  count?: number;
  className?: string;
}

export function BentoGridSkeleton({ count = 5, className = '' }: BentoGridSkeletonProps) {
  // 첫 번째 = hero, 2-3번째 = featured, 나머지 = standard
  const items = Array.from({ length: count }, (_, i) => {
    if (i === 0) return 'hero';
    if (i <= 2) return 'featured';
    return 'standard';
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className={`grid grid-cols-2 gap-3 ${className}`}
      style={{ gridAutoRows: 'min-content' }}
    >
      {items.map((size, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          style={{
            gridColumn: size === 'hero' ? '1 / -1' : 'span 1',
          }}
        >
          <ShimmerSkeleton size={size as 'hero' | 'featured' | 'standard'} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ShimmerSkeleton;
