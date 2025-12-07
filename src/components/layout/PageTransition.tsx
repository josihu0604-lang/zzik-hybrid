'use client';

import { ReactNode, useMemo } from 'react';
import { m, AnimatePresence, type Variants } from '@/lib/motion';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easing } from '@/lib/animations';

/**
 * PageTransition - 앱 느낌 페이지 전환
 *
 * 웹사이트 vs 앱의 가장 큰 차이:
 * - 웹: 페이지 이동 시 흰 화면 깜빡임
 * - 앱: 슬라이드/페이드로 자연스럽게 전환
 *
 * 최적화:
 * - useReducedMotion 적용
 * - variants 메모이제이션
 * - design-tokens의 duration, easing 사용
 * - GPU 가속 (transform, opacity)
 */

interface PageTransitionProps {
  children: ReactNode;
}

// 전환 애니메이션 variants - 컴포넌트 외부로 이동하여 재생성 방지
const variants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.major, // 400ms
      ease: easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: duration.standard, // 200ms
      ease: easing.exit,
    },
  },
};

// 모션 감소 variants
const reducedVariants: Variants = {
  initial: {
    opacity: 1,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
  exit: {
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const activeVariants = useMemo(
    () => (prefersReducedMotion ? reducedVariants : variants),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        variants={activeVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

/**
 * SlideTransition - 슬라이드 전환 (상세 페이지용)
 */
// iOS 스타일 easing
const iosEasing = [0.32, 0.72, 0, 1] as [number, number, number, number];

const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: '100%',
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.major * 0.875, // 350ms (400 * 0.875)
      ease: iosEasing,
    },
  },
  exit: {
    opacity: 0,
    x: '-30%',
    transition: {
      duration: duration.major * 0.75, // 300ms (400 * 0.75)
      ease: iosEasing,
    },
  },
};

const slideReducedVariants: Variants = {
  initial: {
    opacity: 1,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
  exit: {
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
};

export function SlideTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const activeVariants = useMemo(
    () => (prefersReducedMotion ? slideReducedVariants : slideVariants),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        variants={activeVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{
          minHeight: '100vh',
          willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

export default PageTransition;
