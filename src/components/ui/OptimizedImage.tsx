'use client';

import { useState, useCallback, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { m, AnimatePresence } from '@/lib/motion';

/**
 * OptimizedImage - Enhanced Next.js Image wrapper (DES-097~104)
 *
 * Improvements:
 * - DES-097: 기본 aspect ratio 지원
 * - DES-098: CLS 방지 dimensions 자동 계산
 * - DES-099: 테마별 blur placeholder
 * - DES-100: 다크/라이트 스켈레톤 테마
 * - DES-101: priority prop 활용
 * - DES-102: 다양한 에러 아이콘 (이미지/비디오/아바타)
 * - DES-103: 자동 재시도 로직
 * - DES-104: loading="lazy" 최적화
 *
 * Features:
 * - Theme-aware skeleton and placeholder
 * - Automatic retry on error
 * - CLS prevention with aspect ratio
 * - Type-safe error fallback variants
 * - Priority image loading for LCP
 */

// ============================================================================
// TYPES
// ============================================================================

export type ErrorFallbackType = 'image' | 'avatar' | 'video' | 'thumbnail';
export type SkeletonTheme = 'dark' | 'light';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  /** Show skeleton while loading */
  showSkeleton?: boolean;
  /** Custom error fallback */
  errorFallback?: React.ReactNode;
  /** Error fallback type (DES-102) */
  errorFallbackType?: ErrorFallbackType;
  /** Aspect ratio (DES-097) - e.g., '16/9', '1/1', '4/3' */
  aspectRatio?: string;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Skeleton theme (DES-100) */
  skeletonTheme?: SkeletonTheme;
  /** Enable retry on error (DES-103) */
  enableRetry?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

// ============================================================================
// CONSTANTS
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

// DES-097: 기본 aspect ratios
export const ASPECT_RATIOS = {
  square: '1/1',
  video: '16/9',
  portrait: '3/4',
  landscape: '4/3',
  ultrawide: '21/9',
} as const;

// DES-099: 테마별 blur placeholder
export const BLUR_PLACEHOLDERS = {
  dark: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDABESBBMhMQUiQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRMf/aAAwDAQACEQMRAD8Awtpbm1xnj8qKR0FvZdxWBNwf1iilsLLWxAPH/9k=',
  light:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDABESBAUTITFBYXH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EABoRAAICAwAAAAAAAAAAAAAAAAECAAMEESH/2gAMAwEAAhEDEQBR',
} as const;

// DES-100: 스켈레톤 테마 색상
const SKELETON_THEMES = {
  dark: {
    base: '#121314',
    shimmer: '#1a1c1f',
  },
  light: {
    base: '#e5e7eb',
    shimmer: '#f3f4f6',
  },
} as const;

// DES-102: 다양한 에러 아이콘
function ErrorIcon({ type, className }: { type: ErrorFallbackType; className?: string }) {
  const iconPaths = {
    image:
      'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    avatar: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    video:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    thumbnail:
      'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z',
  };

  return (
    <svg
      className={className || 'w-8 h-8 text-white/20'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPaths[type]} />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  showSkeleton = true,
  errorFallback,
  errorFallbackType = 'image',
  aspectRatio,
  radius = 'md',
  skeletonTheme = 'dark',
  enableRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
  className = '',
  style,
  sizes,
  priority = false, // DES-101: priority prop
  loading, // DES-104: loading optimization
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  // DES-103: 자동 재시도 로직
  useEffect(() => {
    if (hasError && enableRetry && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setHasError(false);
        setIsLoading(true);
        setRetryCount((prev) => prev + 1);
        // Force re-render by updating src
        setCurrentSrc(typeof src === 'string' ? `${src}?retry=${retryCount}` : src);
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [hasError, enableRetry, retryCount, maxRetries, retryDelay, src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setRetryCount(0); // Reset on successful load
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (!enableRetry || retryCount >= maxRetries - 1) {
      setHasError(true);
    }
  }, [enableRetry, retryCount, maxRetries]);

  const borderRadius = RADIUS_MAP[radius];
  const skeletonColors = SKELETON_THEMES[skeletonTheme];

  // Auto-detect sizes if not provided
  const autoSizes = sizes || (fill ? IMAGE_SIZES.card : undefined);

  // DES-099: 테마별 blur placeholder
  const blurDataURL = priority ? undefined : BLUR_PLACEHOLDERS[skeletonTheme];

  // Error fallback
  if (hasError) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    const errorMessages = {
      image: '이미지를 불러올 수 없습니다',
      avatar: '프로필 이미지를 불러올 수 없습니다',
      video: '비디오를 불러올 수 없습니다',
      thumbnail: '썸네일을 불러올 수 없습니다',
    };

    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-white/5 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          aspectRatio,
          borderRadius,
          ...style,
        }}
        role="img"
        aria-label={`${errorMessages[errorFallbackType]} - ${alt}`}
      >
        <ErrorIcon type={errorFallbackType} />
        <span
          className="sr-only"
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          {errorMessages[errorFallbackType]}
        </span>
        {enableRetry && retryCount > 0 && (
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              textAlign: 'center',
            }}
            aria-live="polite"
          >
            재시도 중... ({retryCount}/{maxRetries})
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        aspectRatio, // DES-098: CLS 방지
        borderRadius,
        ...style,
      }}
    >
      {/* Loading Skeleton (DES-100: 테마 지원) */}
      <AnimatePresence>
        {isLoading && showSkeleton && (
          <m.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${skeletonColors.base} 0%, ${skeletonColors.shimmer} 50%, ${skeletonColors.base} 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius,
            }}
          />
        )}
      </AnimatePresence>

      {/* Image */}
      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={autoSizes}
        priority={priority} // DES-101: LCP 최적화
        loading={loading || (priority ? 'eager' : 'lazy')} // DES-104: 최적화
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          borderRadius,
          objectFit: 'cover',
          transition: 'opacity 0.3s ease',
          opacity: isLoading ? 0 : 1,
        }}
        {...props}
      />
    </div>
  );
}

/**
 * Responsive image sizes for common use cases
 */
export const IMAGE_SIZES = {
  /** Full width on mobile, max 640px */
  card: '(max-width: 640px) 100vw, 640px',
  /** Half width on tablet+, full on mobile */
  grid2: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Third width on desktop, half on tablet, full on mobile */
  grid3: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Thumbnail */
  thumbnail: '(max-width: 640px) 25vw, 128px',
  /** Hero/banner */
  hero: '100vw',
  /** Avatar */
  avatar: '48px',
};

/**
 * BlurPlaceholder - Base64 blur data URL generator
 * For use with static images
 */
export const BLUR_PLACEHOLDER = {
  /** Dark placeholder */
  dark: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDABESBBMhMQUiQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRMf/aAAwDAQACEQMRAD8Awtpbm1xnj8qKR0FvZdxWBNwf1iilsLLWxAPH/9k=',
  /** Light placeholder */
  light:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDABESBAUTITFBYXH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EABoRAAICAwAAAAAAAAAAAAAAAAECAAMEESH/2gAMAwEAAhEDEEBR',
};

export default OptimizedImage;
