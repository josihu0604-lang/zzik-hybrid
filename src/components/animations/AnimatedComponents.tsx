'use client';

import { type ReactNode, forwardRef } from 'react';
import { m, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInBottom,
  staggerContainer,
  staggerItem,
  modalBackdrop,
  modalContent,
  bottomSheet,
  tapScale,
  hoverScale,
  transitions,
  duration,
} from '@/lib/animations';

/**
 * Animated Components
 *
 * Pre-built animated wrappers for common patterns
 */

// ============================================
// Fade Components
// ============================================

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  direction?: 'none' | 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, direction = 'none', delay = 0, ...props }, ref) => {
    const variants = {
      none: fadeIn,
      up: fadeInUp,
      down: fadeInDown,
      left: fadeInLeft,
      right: fadeInRight,
    }[direction];

    return (
      <m.div
        ref={ref}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        style={{ willChange: 'transform, opacity' }}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

FadeIn.displayName = 'FadeIn';

// ============================================
// Scale Components
// ============================================

interface ScaleInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  delay?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        style={{ willChange: 'transform, opacity' }}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

ScaleIn.displayName = 'ScaleIn';

// ============================================
// Stagger Components
// ============================================

interface StaggerListProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
}

export const StaggerList = forwardRef<HTMLDivElement, StaggerListProps>(
  ({ children, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

// DES-053: Stagger list with viewport detection
interface StaggerListViewportProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  amount?: number | 'some' | 'all';
}

export const StaggerListViewport = forwardRef<HTMLDivElement, StaggerListViewportProps>(
  ({ children, amount = 0.3, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount }}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

StaggerList.displayName = 'StaggerList';
StaggerListViewport.displayName = 'StaggerListViewport';

export const StaggerItem = forwardRef<HTMLDivElement, Omit<HTMLMotionProps<'div'>, 'variants'>>(
  ({ children, ...props }, ref) => {
    return (
      <m.div ref={ref} variants={staggerItem} {...props}>
        {children}
      </m.div>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

// ============================================
// Interactive Components
// ============================================

interface TapScaleProps extends Omit<HTMLMotionProps<'div'>, 'whileTap' | 'whileHover'> {
  children: ReactNode;
  enableHover?: boolean;
}

// DES-059: Touch-friendly TapScale component
export const TapScale = forwardRef<HTMLDivElement, TapScaleProps>(
  ({ children, enableHover = true, ...props }, ref) => {
    // Detect if device supports hover (not a touch-only device)
    const supportsHover =
      typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

    return (
      <m.div
        ref={ref}
        whileTap={tapScale}
        whileHover={enableHover && supportsHover ? hoverScale : undefined}
        style={{ willChange: 'transform' }}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

TapScale.displayName = 'TapScale';

// ============================================
// Modal Components
// ============================================

interface ModalAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function ModalAnimation({ isOpen, onClose, children, className = '' }: ModalAnimationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            style={{ willChange: 'opacity' }}
          />

          {/* Content */}
          <m.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 ${className}`}
            style={{ willChange: 'transform, opacity' }}
          >
            {children}
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Bottom Sheet Component
// ============================================

interface BottomSheetAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function BottomSheetAnimation({
  isOpen,
  onClose,
  children,
  className = '',
}: BottomSheetAnimationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            style={{ willChange: 'opacity' }}
          />

          {/* Sheet */}
          <m.div
            variants={bottomSheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
            style={{ willChange: 'transform' }}
          >
            {children}
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Slide In Component
// ============================================

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  direction?: 'bottom' | 'top';
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, direction = 'bottom', ...props }, ref) => {
    const variants =
      direction === 'bottom'
        ? slideInBottom
        : {
            hidden: { y: '-100%' },
            visible: { y: 0, transition: transitions.smoothSpring },
            exit: { y: '-100%', transition: transitions.standard },
          };

    return (
      <m.div
        ref={ref}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ willChange: 'transform' }}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

SlideIn.displayName = 'SlideIn';

// ============================================
// Presence Container
// ============================================

interface PresenceContainerProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
}

export function PresenceContainer({ children, mode = 'wait' }: PresenceContainerProps) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

// ============================================
// Loading Components
// ============================================

interface SpinnerAnimationProps {
  size?: number;
  color?: string;
  className?: string;
}

export function SpinnerAnimation({
  size = 24,
  color = 'currentColor',
  className = '',
}: SpinnerAnimationProps) {
  return (
    <m.div
      animate={{ rotate: 360 }}
      transition={{ duration: duration.major * 2.5, repeat: Infinity, ease: 'linear' }} // 1s
      className={className}
      style={{ width: size, height: size, willChange: 'transform' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke={`${color}30`} strokeWidth="3" />
        <path d="M12 2C6.48 2 2 6.48 2 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </m.div>
  );
}

// ============================================
// Skeleton Animation
// ============================================

interface SkeletonAnimationProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonAnimation({ className = '', style }: SkeletonAnimationProps) {
  return (
    <m.div
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: duration.major * 3.75, // 1.5s
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] ${className}`}
      style={{ ...style, willChange: 'background-position' }}
    />
  );
}

export default {
  FadeIn,
  ScaleIn,
  StaggerList,
  StaggerListViewport,
  StaggerItem,
  TapScale,
  ModalAnimation,
  BottomSheetAnimation,
  SlideIn,
  PresenceContainer,
  SpinnerAnimation,
  SkeletonAnimation,
};
