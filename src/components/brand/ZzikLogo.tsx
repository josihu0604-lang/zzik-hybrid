'use client';

import { m } from '@/lib/motion';
import { colors, brand } from '@/lib/design-tokens';

/**
 * ZZIK Logo 2026 - Premium Brand Identity
 *
 * Design Philosophy:
 * - Superellipse (Squircle) = Modern Apple-inspired seal
 * - Geometric Z = Custom letterform, not font
 * - Strike Line = "찍다" action (stamping motion)
 * - Negative Space = Professional, memorable
 * - Monochrome-first = Works in any context
 *
 * 2026 Trends Applied:
 * - Single-weight strokes
 * - Subtle depth (micro-shadows)
 * - Motion-ready design
 * - Variable weight adaptation
 */

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark' | 'wordmark' | 'mono';
  animated?: boolean;
  className?: string;
}

export function ZzikLogo({
  size = 48,
  variant = 'mark',
  animated = true,
  className = '',
}: LogoProps) {
  if (variant === 'wordmark') {
    return <ZzikWordmark size={size} className={className} />;
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <ZzikLogoMark size={size} animated={animated} />
        <ZzikWordmark size={size * 0.55} />
      </div>
    );
  }

  if (variant === 'mono') {
    return <ZzikLogoMono size={size} className={className} />;
  }

  return <ZzikLogoMark size={size} animated={animated} className={className} />;
}

/**
 * Primary Logo Mark - The Seal
 * Superellipse + Geometric Z + Strike
 */
function ZzikLogoMark({
  size,
  animated,
  className = '',
}: {
  size: number;
  animated: boolean;
  className?: string;
}) {
  const id = `zzik-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <m.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      initial={animated ? { scale: 0.95, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <defs>
        {/* Premium Gradient - Ember to Flame */}
        <linearGradient id={`${id}-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.ember[500]} />
          <stop offset="45%" stopColor={colors.flame[500]} />
          <stop offset="100%" stopColor={colors.flame[400]} />
        </linearGradient>

        {/* Subtle Shadow - 2026 Micro-depth */}
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={colors.ember[500]}
            floodOpacity="0.35"
          />
        </filter>

        {/* Glass Highlight */}
        <linearGradient id={`${id}-glass`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Superellipse Clip */}
        <clipPath id={`${id}-clip`}>
          <path d="M32 4 C52 4 60 12 60 32 C60 52 52 60 32 60 C12 60 4 52 4 32 C4 12 12 4 32 4 Z" />
        </clipPath>
      </defs>

      {/* Base Shape - Superellipse (Squircle) */}
      <path
        d="M32 4 C52 4 60 12 60 32 C60 52 52 60 32 60 C12 60 4 52 4 32 C4 12 12 4 32 4 Z"
        fill={`url(#${id}-grad)`}
        filter={`url(#${id}-shadow)`}
      />

      {/* Glass Overlay - Top highlight */}
      <path
        d="M32 4 C52 4 60 12 60 32 C60 52 52 60 32 60 C12 60 4 52 4 32 C4 12 12 4 32 4 Z"
        fill={`url(#${id}-glass)`}
        clipPath={`url(#${id}-clip)`}
      />

      {/* Geometric Z - Custom Letterform */}
      <g filter="url(#${id}-text-shadow)">
        {/* Z Top Bar */}
        <m.rect
          x="18"
          y="18"
          width="28"
          height="5"
          rx="2.5"
          fill="white"
          initial={animated ? { scaleX: 0 } : false}
          animate={animated ? { scaleX: 1 } : false}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{ transformOrigin: 'left center' }}
        />

        {/* Z Diagonal - The Strike */}
        <m.rect
          x="28"
          y="14"
          width="5"
          height="38"
          rx="2.5"
          fill="white"
          style={{ transformOrigin: 'center center' }}
          transform="rotate(32, 32, 32)"
          initial={animated ? { scaleY: 0, opacity: 0 } : false}
          animate={animated ? { scaleY: 1, opacity: 1 } : false}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        />

        {/* Z Bottom Bar */}
        <m.rect
          x="18"
          y="41"
          width="28"
          height="5"
          rx="2.5"
          fill="white"
          initial={animated ? { scaleX: 0 } : false}
          animate={animated ? { scaleX: 1 } : false}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{ transformOrigin: 'right center' }}
        />
      </g>

      {/* Spark Accent - Top Right */}
      <m.circle
        cx="50"
        cy="14"
        r="3"
        fill={colors.spark[500]}
        initial={animated ? { scale: 0 } : false}
        animate={
          animated
            ? {
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.9],
              }
            : false
        }
        transition={{ delay: 0.5, duration: 0.4 }}
      />

      {/* Inner Edge Glow */}
      <path
        d="M32 6 C50 6 58 14 58 32 C58 50 50 58 32 58 C14 58 6 50 6 32 C6 14 14 6 32 6 Z"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
    </m.svg>
  );
}

/**
 * Monochrome Version - For dark backgrounds or single-color use
 */
function ZzikLogoMono({ size, className = '' }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Superellipse Outline */}
      <path
        d="M32 4 C52 4 60 12 60 32 C60 52 52 60 32 60 C12 60 4 52 4 32 C4 12 12 4 32 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Geometric Z */}
      <rect x="18" y="18" width="28" height="5" rx="2.5" fill="currentColor" />
      <rect
        x="28"
        y="14"
        width="5"
        height="38"
        rx="2.5"
        fill="currentColor"
        transform="rotate(32, 32, 32)"
      />
      <rect x="18" y="41" width="28" height="5" rx="2.5" fill="currentColor" />

      {/* Spark Dot */}
      <circle cx="50" cy="14" r="3" fill="currentColor" />
    </svg>
  );
}

/**
 * Wordmark - ZZIK Typography
 * 2026: Variable weight, tight tracking
 */
function ZzikWordmark({ size, className = '' }: { size: number; className?: string }) {
  const id = `wm-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`flex flex-col ${className}`}>
      <svg width={size * 2.8} height={size} viewBox="0 0 140 50" fill="none">
        <defs>
          <linearGradient id={`${id}-text`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.ember[500]} />
            <stop offset="50%" stopColor={colors.flame[500]} />
            <stop offset="100%" stopColor={colors.flame[400]} />
          </linearGradient>
        </defs>

        {/* ZZIK - Custom Geometric */}
        <text
          x="0"
          y="38"
          fill={`url(#${id}-text)`}
          fontSize="42"
          fontWeight="800"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          letterSpacing="-0.04em"
        >
          ZZIK
        </text>
      </svg>

      {/* Tagline - Fixed 10px micro size for consistency */}
      <span
        style={{
          fontSize: '10px',
          lineHeight: '14px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: colors.text.tertiary,
          marginTop: 4,
          textTransform: 'uppercase',
        }}
      >
        {brand.tagline}
      </span>
    </div>
  );
}

/**
 * Favicon / App Icon - Simplified for small sizes
 */
export function ZzikFavicon({ size = 32 }: { size?: number }) {
  const id = `fav-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.ember[500]} />
          <stop offset="100%" stopColor={colors.flame[500]} />
        </linearGradient>
      </defs>

      {/* Squircle */}
      <path
        d="M16 2 C26 2 30 6 30 16 C30 26 26 30 16 30 C6 30 2 26 2 16 C2 6 6 2 16 2 Z"
        fill={`url(#${id}-bg)`}
      />

      {/* Simple Z */}
      <path
        d="M9 10 L23 10 L23 12.5 L14 20 L23 20 L23 23 L9 23 L9 20.5 L18 12.5 L9 12.5 Z"
        fill="white"
      />

      {/* Spark */}
      <circle cx="25" cy="7" r="2" fill={colors.spark[500]} />
    </svg>
  );
}

/**
 * Stamp Effect - Participation Action Feedback
 * 2026: Minimal, geometric, satisfying
 */
export function StampEffect({
  size = 80,
  isActive = false,
  className = '',
}: {
  size?: number;
  isActive?: boolean;
  className?: string;
}) {
  const id = `stamp-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <m.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={
        isActive
          ? {
              scale: [1, 0.92, 1.05, 1],
              rotate: [0, -3, 2, 0],
            }
          : undefined
      }
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id={`${id}-ring`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.ember[500]} />
            <stop offset="100%" stopColor={colors.flame[400]} />
          </linearGradient>
        </defs>

        {/* Outer Ring - Squircle */}
        <m.path
          d="M40 4 C64 4 76 16 76 40 C76 64 64 76 40 76 C16 76 4 64 4 40 C4 16 16 4 40 4 Z"
          fill="none"
          stroke={`url(#${id}-ring)`}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isActive ? 1 : 0.7 }}
          transition={{ duration: 0.5 }}
        />

        {/* Inner Dashed Ring */}
        <path
          d="M40 14 C58 14 66 22 66 40 C66 58 58 66 40 66 C22 66 14 58 14 40 C14 22 22 14 40 14 Z"
          fill="none"
          stroke={colors.flame[500]}
          strokeWidth="1.5"
          strokeDasharray="8 4"
          opacity={isActive ? 0.8 : 0.3}
        />

        {/* Center Fill */}
        <m.path
          d="M40 24 C52 24 56 28 56 40 C56 52 52 56 40 56 C28 56 24 52 24 40 C24 28 28 24 40 24 Z"
          fill={isActive ? colors.flame[500] : 'transparent'}
          stroke={colors.flame[500]}
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0.5 }}
          transition={{ duration: 0.25 }}
        />

        {/* Check Mark */}
        {isActive && (
          <m.path
            d="M30 40 L37 47 L50 34"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, delay: 0.15 }}
          />
        )}
      </svg>

      {/* Ripple Effects */}
      {isActive && (
        <>
          <m.div
            className="absolute inset-0"
            style={{
              borderRadius: '30%',
              border: `2px solid ${colors.flame[500]}`,
            }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <m.div
            className="absolute inset-0"
            style={{
              borderRadius: '30%',
              border: `2px solid ${colors.flame[500]}`,
            }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          />
        </>
      )}
    </m.div>
  );
}

/**
 * Animated Logo - For loading states and celebrations
 */
export function ZzikLogoAnimated({
  size = 64,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const id = `anim-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <m.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      animate={{
        rotate: [0, 0, 0],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.ember[500]} />
          <stop offset="50%" stopColor={colors.flame[500]} />
          <stop offset="100%" stopColor={colors.flame[400]} />
        </linearGradient>
      </defs>

      {/* Squircle */}
      <path
        d="M32 4 C52 4 60 12 60 32 C60 52 52 60 32 60 C12 60 4 52 4 32 C4 12 12 4 32 4 Z"
        fill={`url(#${id}-grad)`}
      />

      {/* Z */}
      <rect x="18" y="18" width="28" height="5" rx="2.5" fill="white" />
      <rect
        x="28"
        y="14"
        width="5"
        height="38"
        rx="2.5"
        fill="white"
        transform="rotate(32, 32, 32)"
      />
      <rect x="18" y="41" width="28" height="5" rx="2.5" fill="white" />

      {/* Animated Spark */}
      <m.circle
        cx="50"
        cy="14"
        r="3"
        fill={colors.spark[500]}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </m.svg>
  );
}

export default ZzikLogo;
