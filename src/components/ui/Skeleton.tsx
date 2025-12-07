'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { colors, glass, radii, spacing } from '@/lib/design-tokens';

/**
 * ZZIK Skeleton Components v4 - 통합 버전
 *
 * 전체 앱에서 사용하는 통합 로딩 스켈레톤 컴포넌트
 * - 펄스 애니메이션 적용
 * - 다크모드 대응 (bg-linear-elevated)
 * - ZZIK 디자인 시스템 색상 사용
 *
 * Merged from:
 * - src/components/ui/Skeleton.tsx (full-page skeletons)
 * - src/components/popup/Skeleton.tsx (design token based)
 * - src/components/loading/Skeleton.tsx (base components)
 */

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const RADIUS_MAP = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

// ============================================================================
// BASE SKELETON COMPONENTS (CSS-based animation)
// ============================================================================

interface SkeletonBaseProps {
  className?: string;
  style?: React.CSSProperties;
}

// DES-160: 카드 skeleton shimmer 일관성 개선
function SkeletonBase({ className = '', style = {} }: SkeletonBaseProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        background:
          'linear-gradient(90deg, rgba(18, 19, 20, 0.8) 0%, rgba(26, 28, 31, 1) 50%, rgba(18, 19, 20, 0.8) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite',
        borderRadius: '8px',
        ...style,
      }}
    />
  );
}

// Design token based skeleton base
function SkeletonBaseToken({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        background: `linear-gradient(90deg, ${colors.space[800]} 0%, ${colors.space[700]} 50%, ${colors.space[800]} 100%)`,
        backgroundSize: '200% 100%',
        borderRadius: radii.md,
        ...style,
      }}
    />
  );
}

// ============================================================================
// GENERIC SKELETON (from loading/Skeleton.tsx)
// ============================================================================

interface SkeletonProps {
  className?: string;
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Animation variant */
  variant?: 'pulse' | 'shimmer';
}

/**
 * Generic Skeleton component with configurable dimensions
 */
export function Skeleton({
  className = '',
  width,
  height,
  radius = 'md',
  variant = 'shimmer',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: RADIUS_MAP[radius],
  };

  return <div className={`skeleton-${variant} ${className}`} style={style} aria-hidden="true" />;
}

/**
 * Skeleton Circle - Circular placeholder (avatars, icons)
 */
interface SkeletonCircleProps {
  size?: number;
  className?: string;
}

export function SkeletonCircle({ size = 40, className = '' }: SkeletonCircleProps) {
  return <Skeleton width={size} height={size} radius="full" className={className} />;
}

// ============================================================================
// TEXT SKELETON
// ============================================================================

interface SkeletonTextProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonText({
  width = '100%',
  height = '16px',
  className = '',
  style = {},
}: SkeletonTextProps) {
  return (
    <SkeletonBase
      className={className}
      style={{
        width,
        height,
        borderRadius: '8px',
        ...style,
      }}
    />
  );
}

// ============================================================================
// AVATAR SKELETON
// ============================================================================

interface SkeletonAvatarProps {
  size?: number;
  className?: string;
}

export function SkeletonAvatar({ size = 40, className = '' }: SkeletonAvatarProps) {
  return (
    <SkeletonBase
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        flexShrink: 0,
      }}
    />
  );
}

// ============================================================================
// CARD SKELETON
// ============================================================================

export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: '24px',
        padding: '20px',
        background: 'rgba(18, 19, 20, 0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size={40} />
          <div className="flex flex-col gap-1.5">
            <SkeletonText height="16px" width="96px" />
            <SkeletonText height="12px" width="64px" />
          </div>
        </div>
        <SkeletonText height="24px" width="64px" style={{ borderRadius: '9999px' }} />
      </div>

      {/* Title */}
      <SkeletonText height="24px" width="75%" style={{ marginBottom: '16px' }} />

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <SkeletonBase style={{ height: '8px', borderRadius: '9999px', marginBottom: '8px' }} />
        <div className="flex justify-between">
          <SkeletonText height="12px" width="80px" />
          <SkeletonText height="12px" width="48px" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <SkeletonText height="16px" width="48px" />
        <SkeletonText height="40px" width="96px" style={{ borderRadius: '20px' }} />
      </div>
    </div>
  );
}

// ============================================================================
// MAP SKELETON
// ============================================================================

export function SkeletonMap({ height = '50vh' }: { height?: string }) {
  return (
    <div className="relative bg-space-800 overflow-hidden" style={{ height }}>
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'linear-gradient(135deg, #1a1c1f 0%, #222426 50%, #1a1c1f 100%)',
        }}
      />

      {/* Map markers placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="w-16 h-16 rounded-full"
            style={{
              background: 'rgba(255, 107, 91, 0.2)',
              border: '2px solid rgba(255, 107, 91, 0.4)',
            }}
          />
          <SkeletonText width="120px" height="14px" />
          <SkeletonText width="80px" height="12px" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROFILE SKELETON
// ============================================================================

export function SkeletonProfile() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <SkeletonBase style={{ width: '64px', height: '64px', borderRadius: '9999px' }} />
        <div className="flex-1">
          <SkeletonText height="20px" width="120px" style={{ marginBottom: '8px' }} />
          <SkeletonText height="14px" width="80px" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="text-center p-3 rounded-xl"
            style={{ background: colors.space[800] }}
          >
            <SkeletonText height="28px" width="40px" style={{ margin: '0 auto 4px' }} />
            <SkeletonText height="12px" width="32px" style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LIST ITEM SKELETON
// ============================================================================

export function SkeletonListItem() {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <SkeletonText height="12px" width="80px" style={{ marginBottom: '6px' }} />
          <SkeletonText height="16px" width="60%" />
        </div>
        <SkeletonText height="24px" width="64px" style={{ borderRadius: '9999px' }} />
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <SkeletonBase style={{ height: '8px', borderRadius: '9999px' }} />
      </div>
    </div>
  );
}

// ============================================================================
// HEADER SKELETON
// ============================================================================

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5">
        <SkeletonBase style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
        <SkeletonText height="20px" width="80px" />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonText height="32px" width="64px" style={{ borderRadius: '20px' }} />
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY FILTER SKELETON
// ============================================================================

export function SkeletonCategoryFilter() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-5 scrollbar-hide">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonBase
          key={i}
          style={{
            width: '80px',
            height: '44px',
            borderRadius: '9999px',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// STATS BAR SKELETON
// ============================================================================

export function SkeletonStatsBar() {
  return (
    <div
      className="flex items-center justify-center gap-6 py-4"
      style={{
        background: 'rgba(18, 19, 20, 0.6)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="flex items-center gap-2">
        <SkeletonBase style={{ height: '8px', width: '8px', borderRadius: '9999px' }} />
        <SkeletonText height="12px" width="32px" />
      </div>
      <div className="flex items-center gap-5">
        <SkeletonText height="16px" width="80px" />
        <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.08)' }} />
        <SkeletonText height="16px" width="64px" />
        <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.08)' }} />
        <SkeletonText height="16px" width="56px" />
      </div>
    </div>
  );
}

// ============================================================================
// FULL PAGE SKELETONS
// ============================================================================

// Main Page Skeleton (Funding Page)
export function SkeletonMainPage() {
  return (
    <div
      className="min-h-screen bg-space-950"
      role="status"
      aria-busy="true"
      aria-label="페이지 로딩 중"
    >
      {/* Header */}
      <SkeletonHeader />

      {/* Hero Section */}
      <div className="text-center py-6 px-5">
        <SkeletonText height="48px" width="200px" style={{ margin: '0 auto 12px' }} />
        <SkeletonText height="16px" width="140px" style={{ margin: '0 auto' }} />
      </div>

      {/* Stats Bar */}
      <SkeletonStatsBar />

      {/* Cards */}
      <div className="px-5 py-6 flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Live Page Skeleton
export function SkeletonLivePage() {
  return (
    <div
      className="min-h-screen bg-space-950 pt-safe pb-safe"
      role="status"
      aria-busy="true"
      aria-label="라이브 페이지 로딩 중"
    >
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'rgba(8, 9, 10, 0.9)' }}>
        <div className="max-w-lg mx-auto">
          <SkeletonHeader />
          <SkeletonCategoryFilter />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-24 pt-4">
        <div className="max-w-lg mx-auto">
          {/* Sort bar */}
          <div className="flex items-center justify-between py-4">
            <SkeletonText height="14px" width="80px" />
            <SkeletonText height="20px" width="100px" />
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}

// Map Page Skeleton
export function SkeletonMapPage() {
  return (
    <div
      className="min-h-screen bg-space-950 pt-safe pb-safe"
      role="status"
      aria-busy="true"
      aria-label="지도 페이지 로딩 중"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 px-5 py-4" style={{ background: 'rgba(8, 9, 10, 0.9)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <SkeletonText height="24px" width="120px" />
          <SkeletonText height="14px" width="60px" />
        </div>
      </div>

      {/* Map */}
      <SkeletonMap height="50vh" />

      {/* Popup List */}
      <div className="px-5 py-6">
        <div className="max-w-lg mx-auto">
          <SkeletonText height="20px" width="100px" style={{ marginBottom: '16px' }} />
          <div className="space-y-3">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        </div>
      </div>
    </div>
  );
}

// Me Page Skeleton
export function SkeletonMePage() {
  return (
    <div
      className="min-h-screen bg-space-950 pt-safe pb-safe"
      role="status"
      aria-busy="true"
      aria-label="마이페이지 로딩 중"
    >
      {/* Header */}
      <div className="px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <SkeletonText height="24px" width="60px" />
          <SkeletonText height="14px" width="40px" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Profile Card */}
          <div style={{ marginBottom: '24px' }}>
            <SkeletonProfile />
          </div>

          {/* Leader CTA */}
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SkeletonText height="18px" width="120px" style={{ marginBottom: '8px' }} />
                <SkeletonText height="14px" width="180px" />
              </div>
              <SkeletonBase style={{ width: '80px', height: '36px', borderRadius: '12px' }} />
            </div>
          </div>

          {/* Participations Header */}
          <div className="flex items-center justify-between mb-4">
            <SkeletonText height="20px" width="80px" />
            <SkeletonText height="14px" width="40px" />
          </div>

          {/* Participations List */}
          <div className="space-y-3">
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DESIGN TOKEN BASED SKELETONS (from popup/Skeleton.tsx)
// ============================================================================

/**
 * Text Skeleton with design tokens
 */
export function TextSkeleton({
  width = '100%',
  height = '16px',
}: {
  width?: string;
  height?: string;
}) {
  return <SkeletonBaseToken style={{ width, height, borderRadius: radii.md }} />;
}

/**
 * Progress bar skeleton - 8px height (4px grid)
 */
export function ProgressBarSkeleton() {
  return (
    <div className="w-full">
      <SkeletonBaseToken style={{ height: '8px', borderRadius: radii.full }} />
      <div className="flex justify-between" style={{ marginTop: spacing[2] }}>
        <SkeletonBaseToken style={{ height: '12px', width: '80px', borderRadius: radii.sm }} />
        <SkeletonBaseToken style={{ height: '12px', width: '48px', borderRadius: radii.sm }} />
      </div>
    </div>
  );
}

/**
 * Popup card skeleton with design tokens (Alternative version)
 */
export function PopupCardSkeletonAlt() {
  return (
    <div
      style={{
        borderRadius: radii['2xl'],
        padding: spacing[5],
        background: glass.medium.background,
        border: `1px solid ${glass.medium.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: spacing[4] }}>
        <div className="flex items-center" style={{ gap: spacing[3] }}>
          <SkeletonBaseToken style={{ width: '40px', height: '40px', borderRadius: radii.lg }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1.5] }}>
            <SkeletonBaseToken style={{ height: '16px', width: '96px', borderRadius: radii.sm }} />
            <SkeletonBaseToken style={{ height: '12px', width: '64px', borderRadius: radii.sm }} />
          </div>
        </div>
        <SkeletonBaseToken style={{ height: '24px', width: '64px', borderRadius: radii.full }} />
      </div>

      {/* Title */}
      <SkeletonBaseToken
        style={{ height: '24px', width: '75%', marginBottom: spacing[4], borderRadius: radii.sm }}
      />

      {/* Progress */}
      <div style={{ marginBottom: spacing[4] }}>
        <ProgressBarSkeleton />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <SkeletonBaseToken style={{ height: '16px', width: '48px', borderRadius: radii.sm }} />
        <SkeletonBaseToken style={{ height: '40px', width: '96px', borderRadius: radii.xl }} />
      </div>
    </div>
  );
}

/**
 * Live stats skeleton - 8px dots (4px grid)
 */
export function LiveStatsSkeleton() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: spacing[6], padding: `${spacing[4]} 0` }}
    >
      <div className="flex items-center" style={{ gap: spacing[2] }}>
        <SkeletonBaseToken style={{ height: '8px', width: '8px', borderRadius: radii.full }} />
        <SkeletonBaseToken style={{ height: '12px', width: '32px', borderRadius: radii.sm }} />
      </div>
      <div className="flex items-center" style={{ gap: spacing[5] }}>
        <SkeletonBaseToken style={{ height: '16px', width: '80px', borderRadius: radii.sm }} />
        <div style={{ width: '1px', height: '16px', background: colors.border.subtle }} />
        <SkeletonBaseToken style={{ height: '16px', width: '64px', borderRadius: radii.sm }} />
        <div style={{ width: '1px', height: '16px', background: colors.border.subtle }} />
        <SkeletonBaseToken style={{ height: '16px', width: '56px', borderRadius: radii.sm }} />
      </div>
    </div>
  );
}

/**
 * Full page loading skeleton with design tokens
 */
export function PageSkeleton() {
  return (
    <div
      style={{ padding: `${spacing[4]} ${spacing[5]}` }}
      role="status"
      aria-busy="true"
      aria-label="콘텐츠 로딩 중"
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: spacing[6] }}>
        <SkeletonBaseToken style={{ height: '32px', width: '96px', borderRadius: radii.sm }} />
        <SkeletonBaseToken style={{ height: '32px', width: '64px', borderRadius: radii.xl }} />
      </div>

      {/* Hero */}
      <div className="text-center" style={{ padding: `${spacing[4]} 0`, marginBottom: spacing[6] }}>
        <SkeletonBaseToken
          style={{
            height: '48px',
            width: '192px',
            margin: '0 auto',
            marginBottom: spacing[3],
            borderRadius: radii.md,
          }}
        />
        <SkeletonBaseToken
          style={{ height: '16px', width: '128px', margin: '0 auto', borderRadius: radii.sm }}
        />
      </div>

      {/* Stats bar */}
      <div style={{ marginBottom: spacing[6] }}>
        <LiveStatsSkeleton />
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        <PopupCardSkeletonAlt />
        <PopupCardSkeletonAlt />
        <PopupCardSkeletonAlt />
      </div>
    </div>
  );
}

// ============================================================================
// LOADING/SKELETON COMPONENTS (from loading/Skeleton.tsx)
// ============================================================================

/**
 * NotificationSkeleton - Notification item placeholder
 */
export function NotificationSkeleton() {
  return (
    <div
      className="flex gap-3 p-4 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
      aria-hidden="true"
    >
      <SkeletonCircle size={40} />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton width="50%" height={14} radius="sm" />
          <Skeleton width={40} height={12} radius="sm" />
        </div>
        <Skeleton width="90%" height={12} radius="sm" />
      </div>
    </div>
  );
}

/**
 * SkeletonGrid - Grid of skeleton cards
 */
interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2;
  CardComponent?: React.ComponentType;
}

export function SkeletonGrid({
  count = 4,
  columns = 1,
  CardComponent = SkeletonCard,
}: SkeletonGridProps) {
  return (
    <div
      className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
      aria-busy="true"
      aria-label="Loading content..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Wrapper - Conditionally show skeleton or content
 */
interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export function SkeletonWrapper({ isLoading, skeleton, children }: SkeletonWrapperProps) {
  return isLoading ? <>{skeleton}</> : <>{children}</>;
}

// Default export for compatibility
export default Skeleton;
