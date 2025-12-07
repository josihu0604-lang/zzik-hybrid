'use client';

import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

/**
 * PageLoader - Full page loading spinner
 */

interface PageLoaderProps {
  /** Loading message */
  message?: string;
  /** Show logo */
  showLogo?: boolean;
  /** Background opacity */
  opacity?: 'transparent' | 'light' | 'medium' | 'full';
}

const OPACITY_MAP = {
  transparent: 'bg-transparent',
  light: 'bg-space-950/50',
  medium: 'bg-space-950/80',
  full: 'bg-space-950',
};

export function PageLoader({
  message = '로딩 중...',
  showLogo = true,
  opacity = 'full',
}: PageLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-[40] flex flex-col items-center justify-center ${OPACITY_MAP[opacity]}`}
      style={{ backdropFilter: opacity !== 'transparent' ? 'blur(8px)' : undefined }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Logo */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[600]} 100%)`,
              boxShadow: `0 8px 32px ${colors.flame[500]}40`,
            }}
          >
            <span className="text-2xl font-black text-white">Z</span>
          </div>
        </motion.div>
      )}

      {/* Spinner */}
      <motion.div
        className="relative w-12 h-12 mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid ${colors.flame[500]}20`,
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `3px solid transparent`,
            borderTopColor: colors.flame[500],
          }}
        />
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-linear-text-secondary text-sm"
      >
        {message}
      </motion.p>

      {/* Accessibility - Screen reader text */}
      <span className="sr-only">페이지를 불러오는 중입니다. 잠시만 기다려주세요.</span>
    </div>
  );
}

/**
 * InlineLoader - Small inline loading indicator
 */
interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function InlineLoader({ size = 'md', className = '' }: InlineLoaderProps) {
  const dimension = SIZE_MAP[size];

  return (
    <motion.div
      className={`inline-flex ${className}`}
      style={{ width: dimension, height: dimension }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke={`${colors.flame[500]}30`} strokeWidth="3" />
        <path
          d="M12 2C6.48 2 2 6.48 2 12"
          stroke={colors.flame[500]}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/**
 * ButtonLoader - Loading state for buttons
 */
interface ButtonLoaderProps {
  text?: string;
}

export function ButtonLoader({ text = '처리 중...' }: ButtonLoaderProps) {
  return (
    <span className="flex items-center gap-2">
      <InlineLoader size="sm" />
      <span>{text}</span>
    </span>
  );
}

/**
 * ContentLoader - Loading state for content areas
 */
interface ContentLoaderProps {
  message?: string;
  className?: string;
}

export function ContentLoader({ message = '불러오는 중...', className = '' }: ContentLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <InlineLoader size="lg" className="mb-4" />
      <p className="text-linear-text-secondary text-sm">{message}</p>
    </div>
  );
}

export default PageLoader;
