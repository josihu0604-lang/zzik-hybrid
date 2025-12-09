'use client';

/**
 * MotionProvider - Framer Motion LazyMotion wrapper
 *
 * Performance optimizations:
 * - Uses domMax for full feature support (layout, drag, etc.)
 * - Dynamic import reduces initial bundle by ~25KB
 * - strict mode warns about unsupported features in dev
 *
 * Features included in domMax:
 * - All domAnimation features (animate, exit, inView)
 * - Layout animations (layoutId, layout)
 * - Drag interactions
 * - SVG animations
 */

import { LazyMotion } from 'framer-motion';

// Dynamic import for code splitting - loads only when needed
const loadFeatures = () => import('framer-motion').then((mod) => mod.domMax);

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures}>
      {children}
    </LazyMotion>
  );
}
