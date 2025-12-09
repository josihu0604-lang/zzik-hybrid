'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook - WCAG 2.1 AA Compliance
 *
 * Checks user's motion preference from:
 * 1. framer-motion's built-in hook (prefers-reduced-motion media query)
 * 2. Falls back to manual check for SSR safety
 *
 * Usage:
 * const prefersReduced = useReducedMotion();
 * const animation = prefersReduced ? {} : { opacity: 1, y: 0 };
 *
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const framerPrefersReduced = useFramerReducedMotion();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Check media query directly as fallback
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Return framer's value if available, otherwise our manual check
  return framerPrefersReduced ?? prefersReduced;
}

/**
 * Animation variants that respect reduced motion preference
 */
export const reducedMotionVariants = {
  // Standard fade-in
  fadeIn: (prefersReduced: boolean) =>
    prefersReduced
      ? { opacity: 1 }
      : { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },

  // Slide up animation
  slideUp: (prefersReduced: boolean) =>
    prefersReduced
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },

  // Scale animation
  scale: (prefersReduced: boolean) =>
    prefersReduced
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },

  // No animation - instant appearance
  instant: { opacity: 1 },
};

/**
 * Get animation props based on reduced motion preference
 */
export function getAnimationProps(prefersReduced: boolean) {
  if (prefersReduced) {
    return {
      initial: false,
      animate: undefined,
      exit: undefined,
      transition: { duration: 0 },
    };
  }
  return {};
}

export default useReducedMotion;
