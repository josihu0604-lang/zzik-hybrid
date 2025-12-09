/**
 * Optimized Motion Exports
 *
 * Use these exports instead of importing directly from 'framer-motion'
 * for better tree-shaking and bundle optimization.
 *
 * Usage:
 * ```tsx
 * import { m, AnimatePresence } from '@/lib/motion';
 *
 * // Use m instead of motion for LazyMotion compatibility
 * <m.div animate={{ opacity: 1 }} />
 * ```
 *
 * Benefits:
 * - Centralized import point
 * - Better tree-shaking with m component
 * - Consistent animation patterns
 */

// Re-export commonly used framer-motion components
export {
  // Core components
  m, // Use instead of motion for LazyMotion compatibility
  motion, // Full motion component (larger bundle)
  AnimatePresence,

  // Hooks
  useAnimate,
  useAnimation,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,

  // Types
  type Variants,
  type Transition,
  type TargetAndTransition,
  type MotionProps,
} from 'framer-motion';

// Re-export animation presets
export {
  duration,
  easing,
  springConfig,
  transitions,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  slideInBottom,
  staggerContainer,
  staggerItem,
  tapScale,
  hoverScale,
  buttonInteraction,
  bottomSheet,
  modalBackdrop,
  modalContent,
} from './animations';
