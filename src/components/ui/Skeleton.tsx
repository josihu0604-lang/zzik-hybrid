'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'shimmer-skeleton',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-white/[0.06]',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-space-850/75 border border-white/8 rounded-2xl p-5',
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton variant="rounded" className="w-full h-40 mb-4" />
      
      {/* Title */}
      <Skeleton variant="text" className="w-3/4 h-5 mb-3" />
      
      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-5/6 h-3" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
        <Skeleton variant="text" className="w-20 h-4" />
        <Skeleton variant="rounded" className="w-24 h-8" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ 
  count = 5,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-4 bg-space-850/50 rounded-xl border border-white/8"
        >
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3 h-4" />
            <Skeleton variant="text" className="w-2/3 h-3" />
          </div>
          <Skeleton variant="rounded" className="w-16 h-6" />
        </div>
      ))}
    </div>
  );
}

// Main Page Skeleton
export function SkeletonMainPage() {
  return (
    <div className="min-h-screen bg-space-950 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rounded" className="w-24 h-8" />
        <div className="flex gap-2">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </div>
      </div>

      {/* Hero section */}
      <Skeleton variant="rounded" className="w-full h-48" />

      {/* Categories */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" className="w-20 h-10 flex-shrink-0" />
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Live Page Skeleton
export function SkeletonLivePage() {
  return (
    <div className="min-h-screen bg-space-950 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-32 h-8" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>

      {/* Live cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-space-850/75 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={56} height={56} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-3/4 h-5" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
              <Skeleton variant="rounded" className="w-16 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Map Page Skeleton
export function SkeletonMapPage() {
  return (
    <div className="min-h-screen bg-space-950 relative">
      {/* Map area */}
      <Skeleton className="absolute inset-0" animation="pulse" />
      
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4">
        <Skeleton variant="rounded" className="w-full h-12" />
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-space-850/95 rounded-t-3xl p-4 space-y-3">
        <Skeleton variant="rounded" className="w-12 h-1 mx-auto" />
        <ListSkeleton count={2} />
      </div>
    </div>
  );
}

// Me Page Skeleton
export function SkeletonMePage() {
  return (
    <div className="min-h-screen bg-space-950 p-4 space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-32 h-6" />
          <Skeleton variant="text" className="w-48 h-4" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-space-850/75 border border-white/8 rounded-xl p-4 text-center space-y-2">
            <Skeleton variant="text" className="w-16 h-8 mx-auto" />
            <Skeleton variant="text" className="w-20 h-3 mx-auto" />
          </div>
        ))}
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" className="w-full h-14" />
        ))}
      </div>
    </div>
  );
}

// Additional Skeleton Components for backward compatibility

// Text Skeleton
export function SkeletonText({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} 
        />
      ))}
    </div>
  );
}

// Circle Skeleton
export function SkeletonCircle({ 
  size = 48,
  className 
}: { 
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton 
      variant="circular" 
      width={size} 
      height={size} 
      className={className} 
    />
  );
}

// Card Skeleton (alias for CardSkeleton)
export function SkeletonCard({ className }: { className?: string }) {
  return <CardSkeleton className={className} />;
}

// List Item Skeleton
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'flex items-center gap-4 p-4 bg-space-850/50 rounded-xl border border-white/8',
        className
      )}
    >
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-2/3 h-3" />
      </div>
      <Skeleton variant="rounded" className="w-16 h-6" />
    </div>
  );
}

// Notification Skeleton
export function NotificationSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-start gap-3 p-4 bg-space-850/50 rounded-xl border border-white/8"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4 h-4" />
            <Skeleton variant="text" className="w-full h-3" />
            <Skeleton variant="text" className="w-20 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid Skeleton
export function SkeletonGrid({ 
  count = 6,
  columns = 2,
  className 
}: { 
  count?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton Wrapper
export function SkeletonWrapper({ 
  isLoading,
  children,
  skeleton,
  className 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  className?: string;
}) {
  if (isLoading) {
    return <div className={className}>{skeleton}</div>;
  }
  return <>{children}</>;
}

// Popup Card Skeleton Alt (detailed version)
export function PopupCardSkeletonAlt({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        'bg-space-850/75 border border-white/8 rounded-2xl p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="text" className="w-36 h-5" />
          </div>
        </div>
        <Skeleton variant="rounded" className="w-16 h-6" />
      </div>
      
      {/* Progress */}
      <Skeleton variant="rounded" className="w-full h-3 mb-4" />
      
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton variant="text" className="w-16 h-4" />
          <Skeleton variant="text" className="w-20 h-4" />
        </div>
        <Skeleton variant="rounded" className="w-24 h-8" />
      </div>
    </div>
  );
}

// Progress Bar Skeleton
export function ProgressBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-12 h-3" />
      </div>
      <Skeleton variant="rounded" className="w-full h-3" />
    </div>
  );
}

// Live Stats Skeleton
export function LiveStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" className="w-12 h-4" />
      </div>
    </div>
  );
}

// Page Skeleton
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('min-h-screen bg-space-950 p-4 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="rounded" className="w-32 h-8" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      
      {/* Content */}
      <Skeleton variant="rounded" className="w-full h-48" />
      
      {/* List */}
      <ListSkeleton count={3} />
    </div>
  );
}

// Text Skeleton (alias)
export function TextSkeleton({ 
  width = '100%',
  className 
}: { 
  width?: string | number;
  className?: string;
}) {
  return (
    <Skeleton 
      variant="text" 
      width={width} 
      className={cn('h-4', className)} 
    />
  );
}
