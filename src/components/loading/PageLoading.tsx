'use client';

import { m } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * PageLoading - 페이지 로딩 컴포넌트
 *
 * 전체 페이지 로딩 시 표시되는 스켈레톤 UI
 */

interface PageLoadingProps {
  /** 페이지 타입 */
  variant?: 'default' | 'detail' | 'list' | 'form' | 'minimal';
  /** 헤더 포함 여부 */
  showHeader?: boolean;
}

export function PageLoading({ variant = 'default', showHeader = true }: PageLoadingProps) {
  return (
    <div className="min-h-screen" style={{ background: colors.space[950] }}>
      {/* Header Skeleton */}
      {showHeader && (
        <div
          className="sticky top-0 z-30 px-4 py-4"
          style={{
            background: 'rgba(8, 9, 10, 0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-4">
            <SkeletonBox className="w-10 h-10 rounded-xl" />
            <SkeletonBox className="w-32 h-6 rounded-lg" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {variant === 'default' && <DefaultSkeleton />}
        {variant === 'detail' && <DetailSkeleton />}
        {variant === 'list' && <ListSkeleton />}
        {variant === 'form' && <FormSkeleton />}
        {variant === 'minimal' && <MinimalSkeleton />}
      </div>
    </div>
  );
}

function SkeletonBox({ className }: { className?: string }) {
  return (
    <m.div
      className={`skeleton-shimmer ${className}`}
      style={{
        background: `linear-gradient(90deg, ${colors.space[800]} 0%, ${colors.space[700]} 50%, ${colors.space[800]} 100%)`,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

function DefaultSkeleton() {
  return (
    <>
      {/* Hero section */}
      <SkeletonBox className="w-full h-40 rounded-2xl" />

      {/* Cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="w-full h-28 rounded-xl" />
        ))}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      {/* Image */}
      <SkeletonBox className="w-full h-56 rounded-2xl" />

      {/* Title area */}
      <div className="space-y-2 mt-4">
        <SkeletonBox className="w-24 h-5 rounded-full" />
        <SkeletonBox className="w-full h-8 rounded-lg" />
        <SkeletonBox className="w-2/3 h-5 rounded-lg" />
      </div>

      {/* Progress */}
      <div className="mt-6 space-y-3">
        <SkeletonBox className="w-full h-3 rounded-full" />
        <div className="flex justify-between">
          <SkeletonBox className="w-16 h-4 rounded-lg" />
          <SkeletonBox className="w-20 h-4 rounded-lg" />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* CTA Button */}
      <SkeletonBox className="w-full h-14 rounded-xl mt-6" />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl flex gap-4"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <SkeletonBox className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="w-24 h-4 rounded-full" />
            <SkeletonBox className="w-full h-5 rounded-lg" />
            <SkeletonBox className="w-2/3 h-4 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form fields */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox className="w-20 h-4 rounded-lg" />
          <SkeletonBox className="w-full h-12 rounded-xl" />
        </div>
      ))}

      {/* Submit button */}
      <SkeletonBox className="w-full h-14 rounded-xl mt-8" />
    </div>
  );
}

function MinimalSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <m.div
        className="w-16 h-16 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]}20 0%, ${colors.flame[500]}40 100%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <m.p
        className="mt-4 text-sm"
        style={{ color: colors.text.tertiary }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        로딩 중...
      </m.p>
    </div>
  );
}

export default PageLoading;
