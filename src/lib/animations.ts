/**
 * Animation Presets Library
 *
 * Framer Motion variants and presets for ZZIK Design System
 * Philosophy: "Linear 절제 + iOS 26 Liquid Glass + 참여의 열기"
 */

import { type Variants, type Transition, type TargetAndTransition } from 'framer-motion';

// ============================================
// Duration System (DES-035)
// ============================================

/**
 * Standardized Duration Scale
 *
 * Purpose: Consistent animation timing across the application
 *
 * Categories:
 * - micro (100ms): Icon changes, color shifts, immediate feedback
 * - standard (200ms): Most UI transitions, button interactions
 * - major (400ms): Page transitions, modal appearances
 *
 * Usage: Use these constants instead of arbitrary millisecond values
 */
export const duration = {
  micro: 0.1, // 100ms - Quick, immediate feedback
  tap: 0.15, // 150ms - Tap interactions (DES-046)
  tabSwitch: 0.15, // 150ms - DES-122: 탭 전환 애니메이션 속도 개선
  standard: 0.2, // 200ms - Standard UI transitions
  major: 0.4, // 400ms - Larger, more noticeable animations
  progress: 0.5, // 500ms - Progress animations (DES-047)
} as const;

/**
 * Timer intervals (DES-048)
 */
export const intervals = {
  countdown: 1000, // 1초 - 카운트다운 업데이트
  animation: 16, // ~60fps - 애니메이션 프레임
  poll: 5000, // 5초 - 폴링
} as const;

/**
 * Effect durations (DES-049)
 */
export const effectDurations = {
  confetti: 4000, // 4초 - Confetti 효과
  toast: 3000, // 3초 - Toast 알림
  celebration: 5000, // 5초 - 축하 효과
} as const;

// ============================================
// Easing Functions (DES-034)
// ============================================

/**
 * Standardized Easing Functions
 *
 * Unified from 6 different easing patterns to 2:
 * - smooth: Cubic bezier for smooth, polished transitions
 * - spring: Physics-based for natural, bouncy interactions
 */
export const easing = {
  /** Smooth cubic-bezier for polished transitions (enter) */
  smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],

  /** Alternative smooth easing (ease-out, for exit) */
  smoothOut: [0.4, 0, 0.2, 1] as [number, number, number, number],

  /** Enter easing - smooth entry */
  enter: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],

  /** Exit easing - quick fade out */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
} as const;

export const springConfig = {
  /** Standard spring - Natural bouncy feel */
  standard: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
  },

  /** Smooth spring - Less bouncy, more controlled */
  smooth: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },

  /** Gentle spring - Subtle animations */
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
  },
} as const;

// ============================================
// Transitions (Using standardized durations)
// ============================================

export const transitions = {
  /** Micro transitions - Quick feedback (100ms) */
  micro: {
    duration: duration.micro,
    ease: easing.smooth,
  } as Transition,

  /** Standard transitions - Default UI (200ms) */
  standard: {
    duration: duration.standard,
    ease: easing.smooth,
  } as Transition,

  /** Major transitions - Page/Modal (400ms) */
  major: {
    duration: duration.major,
    ease: easing.smoothOut,
  } as Transition,

  /** Spring - Natural physics-based */
  spring: springConfig.standard,

  /** Smooth spring - Controlled bounce */
  smoothSpring: springConfig.smooth,

  /** Gentle spring - Subtle animations */
  gentleSpring: springConfig.gentle,
};

// ============================================
// Entry/Exit Variants
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.12, // 120ms for quick exit
      ease: easing.exit,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smoothSpring,
  },
  exit: { opacity: 0, y: 10, transition: transitions.micro },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smoothSpring,
  },
  exit: { opacity: 0, y: -10, transition: transitions.micro },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smoothSpring,
  },
  exit: { opacity: 0, x: -10, transition: transitions.micro },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smoothSpring,
  },
  exit: { opacity: 0, x: 10, transition: transitions.micro },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.12, // 120ms for quick exit
      ease: easing.exit,
    },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
    },
  },
  exit: { opacity: 0, scale: 0.9, transition: transitions.micro },
};

export const slideInBottom: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: transitions.smoothSpring,
  },
  exit: { y: '100%', transition: transitions.standard },
};

export const slideInTop: Variants = {
  hidden: { y: '-100%' },
  visible: {
    y: 0,
    transition: transitions.smoothSpring,
  },
  exit: { y: '-100%', transition: transitions.standard },
};

// ============================================
// List/Stagger Variants
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/** Stagger container with viewport detection (DES-053) */
export const staggerContainerViewport: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smoothSpring,
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
};

// ============================================
// Interactive Variants
// ============================================

export const tapScale: TargetAndTransition = {
  scale: 0.97,
  transition: { duration: duration.tap }, // DES-046: 150ms
};

// DES-059: Touch-friendly hover (no persistent hover on touch devices)
export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: transitions.spring,
};

// Helper to detect touch device
export const isTouchDevice =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export const hoverLift: TargetAndTransition = {
  y: -4,
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
  transition: transitions.standard,
};

// DES-058: 일관된 버튼 interaction scale
export const buttonInteraction: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 }, // DES-058: 일관된 tap scale (0.97)
};

/** Toggle switch animation - Spring effect for smooth transitions */
export const toggleSwitch: Variants = {
  off: {
    x: 0,
    transition: springConfig.smooth,
  },
  on: {
    x: 20, // Adjust based on toggle width
    transition: springConfig.smooth,
  },
};

// ============================================
// ZZIK-specific Animations
// ============================================

/** Progress bar fill animation */
export const progressFill: Variants = {
  empty: { scaleX: 0 },
  filled: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

/** Flame pulse animation (마감 임박) */
export const flamePulse: Variants = {
  idle: {
    boxShadow: '0 0 0 0 rgba(255, 107, 91, 0)',
  },
  pulse: {
    boxShadow: ['0 0 0 0 rgba(255, 107, 91, 0.4)', '0 0 0 12px rgba(255, 107, 91, 0)'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

/** Participation counter animation */
export const counterAnimation: Variants = {
  initial: { scale: 1 },
  bump: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
};

/** Confetti burst (오픈 확정) */
export const confettiBurst: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1.2, 1, 0.8],
    transition: {
      duration: 1,
      times: [0, 0.3, 0.7, 1],
    },
  },
};

/** Stamp animation (찍음) - DES-062: Enhanced */
export const stampAnimation: Variants = {
  hidden: { scale: 2, opacity: 0, rotate: -45 },
  visible: {
    scale: [2, 0.95, 1.05, 1],
    opacity: [0, 1, 1, 1],
    rotate: [-45, 5, -5, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.4, 0.7, 1],
      type: 'spring',
      stiffness: 300,
      damping: 18,
    },
  },
};

/** Badge unlock animation (DES-061: Enhanced) */
export const badgeUnlock: Variants = {
  locked: { scale: 0.8, opacity: 0.5, filter: 'grayscale(100%)' },
  unlocked: {
    scale: [0.8, 1.5, 1],
    opacity: 1,
    filter: 'grayscale(0%)',
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1],
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

/** Notification bell shake */
export const bellShake: Variants = {
  idle: { rotate: 0 },
  shake: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
    },
  },
};

/** Card flip animation */
export const cardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: transitions.standard,
  },
  back: {
    rotateY: 180,
    transition: transitions.standard,
  },
};

// ============================================
// Page Transitions
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  enter: {
    opacity: 1,
    x: 0,
    transition: transitions.smoothSpring,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.micro,
  },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smoothSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: transitions.micro,
  },
};

export const bottomSheet: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ============================================
// Loading Animations
// ============================================

export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// Utility Functions
// ============================================

/**
 * Create stagger delay for list items (DES-050)
 * @param index - Item index
 * @param baseDelay - Base delay in seconds (default: 0.05)
 */
export function staggerDelay(index: number, baseDelay: number = 0.05): Transition {
  return {
    delay: index * baseDelay,
    ...transitions.smoothSpring,
  };
}

/**
 * Calculate stagger delay based on index (DES-050)
 * @param index - Item index
 * @param baseDelay - Base delay in milliseconds (default: 50ms)
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * Create custom spring
 */
export function customSpring(stiffness: number, damping: number): Transition {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
}

/**
 * Create custom ease
 */
export function customEase(
  duration: number,
  ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1]
): Transition {
  return { duration, ease };
}

// Default export with all animations
export default {
  // Core system
  duration,
  easing,
  springConfig,
  transitions,

  // Entry/Exit animations
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  slideInBottom,
  slideInTop,

  // List animations
  staggerContainer,
  staggerItem,
  staggerItemScale,

  // Interactions
  tapScale,
  hoverScale,
  hoverLift,
  buttonInteraction,
  toggleSwitch,

  // ZZIK-specific
  progressFill,
  flamePulse,
  counterAnimation,
  confettiBurst,
  stampAnimation,
  badgeUnlock,
  bellShake,
  cardFlip,

  // Page/Modal
  pageTransition,
  modalBackdrop,
  modalContent,
  bottomSheet,

  // Loading
  spinner,
  pulse,
  shimmer,

  // Utilities
  staggerDelay,
  getStaggerDelay,
  customSpring,
  customEase,
  isTouchDevice,
};
