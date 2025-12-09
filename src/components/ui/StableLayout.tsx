/**
 * Stable Layout Components
 * Prevents Cumulative Layout Shift (CLS) by reserving space
 */

import React, { ReactNode } from 'react';

/**
 * Aspect Ratio Box - Reserves space for content
 */
export function AspectRatioBox({
  ratio = '16/9',
  children,
  className = '',
}: {
  ratio?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

/**
 * Skeleton Loader - Maintains layout during loading
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rectangular',
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  
  const variantClass = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  }[variant];

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

/**
 * Card Skeleton - For loading cards
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <Skeleton height="200px" />
      <Skeleton height="24px" width="70%" />
      <Skeleton height="16px" width="50%" />
      <div className="space-y-2">
        <Skeleton height="12px" />
        <Skeleton height="12px" width="90%" />
      </div>
    </div>
  );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4">
          <Skeleton variant="circular" width={60} height={60} />
          <div className="flex-1 space-y-2">
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Reserved Space - Prevents layout shift for dynamic content
 */
export function ReservedSpace({
  minHeight,
  children,
  className = '',
}: {
  minHeight: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Placeholder Container - Shows placeholder until content loads
 */
export function PlaceholderContainer({
  isLoaded,
  placeholder,
  children,
  minHeight,
}: {
  isLoaded: boolean;
  placeholder: ReactNode;
  children: ReactNode;
  minHeight?: string | number;
}) {
  return (
    <div
      style={{
        minHeight: minHeight
          ? typeof minHeight === 'number'
            ? `${minHeight}px`
            : minHeight
          : undefined,
      }}
    >
      {isLoaded ? children : placeholder}
    </div>
  );
}

/**
 * Sticky Header with reserved space
 */
export function StickyHeader({
  children,
  height = 64,
  className = '',
}: {
  children: ReactNode;
  height?: number;
  className?: string;
}) {
  return (
    <>
      {/* Reserved space to prevent layout shift */}
      <div style={{ height: `${height}px` }} />
      
      {/* Actual sticky header */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </>
  );
}

/**
 * Grid with stable layout
 */
export function StableGrid({
  children,
  columns = 3,
  gap = 4,
  className = '',
  minItemHeight,
}: {
  children: ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
  minItemHeight?: number;
}) {
  return (
    <div
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: minItemHeight ? `minmax(${minItemHeight}px, auto)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Lazy Load Container - Reserves space while lazy loading
 */
export function LazyLoadContainer({
  height,
  children,
  className = '',
}: {
  height: string | number;
  children: ReactNode;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {isVisible ? children : <Skeleton height={height} />}
    </div>
  );
}

/**
 * Fixed Dimensions Container - Prevents shifts from content changes
 */
export function FixedDimensions({
  width,
  height,
  children,
  className = '',
}: {
  width: string | number;
  height: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Font Preloader - Prevents layout shift from font loading
 */
export function FontPreloader({ fonts }: { fonts: string[] }) {
  return (
    <div className="hidden" aria-hidden="true">
      {fonts.map((font, index) => (
        <span
          key={index}
          style={{ fontFamily: font }}
        >
          {/* Invisible text to trigger font load */}
          ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
        </span>
      ))}
    </div>
  );
}
