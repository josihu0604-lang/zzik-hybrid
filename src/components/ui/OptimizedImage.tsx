/**
 * Optimized Image Component
 * Improves LCP by implementing best practices for image loading
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  onLoad,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate blur data URL if not provided
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      {/* Blur placeholder with fade-in */}
      {!isLoaded && placeholder === 'blur' && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{
            backgroundImage: `url(${defaultBlurDataURL})`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Actual image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill={!width && !height}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          sizes={
            sizes ||
            '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        />
      </motion.div>
    </div>
  );
}

/**
 * Generate a simple blur data URL
 */
function generateBlurDataURL(): string {
  // Simple 1x1 gray pixel in base64
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
}

/**
 * Responsive Image with automatic sizes
 */
export function ResponsiveImage({
  src,
  alt,
  priority = false,
  className = '',
  aspectRatio = '16/9',
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={priority}
      className={className}
      aspectRatio={aspectRatio}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
      quality={80}
      placeholder="blur"
    />
  );
}

/**
 * Hero Image (for above-the-fold content)
 */
export function HeroImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true} // Always priority for hero images
      className={className}
      aspectRatio="16/9"
      sizes="100vw"
      quality={90} // Higher quality for hero
      placeholder="blur"
    />
  );
}

/**
 * Thumbnail Image (for galleries, lists, etc.)
 */
export function ThumbnailImage({
  src,
  alt,
  size = 200,
  className = '',
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      objectFit="cover"
      quality={70} // Lower quality for thumbnails
      sizes={`${size}px`}
      placeholder="blur"
    />
  );
}

/**
 * Avatar Image
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className = '',
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        objectFit="cover"
        quality={70}
        sizes={`${size}px`}
        placeholder="blur"
      />
    </div>
  );
}
