/**
 * ZZIK Accessibility Hooks
 *
 * A11Y-001: 모션 감소 설정 전역 적용
 * A11Y-002: 고대비 모드 감지
 * A11Y-003: 포커스 관리
 */

'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState, useMemo } from 'react';
import type { Transition, Variants, TargetAndTransition } from 'framer-motion';

// ============================================================================
// useReducedMotion - 모션 감소 설정 전역 훅
// ============================================================================

/**
 * 사용자의 모션 감소 설정을 감지하고 적용합니다.
 *
 * 사용 예:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * // 조건부 애니메이션
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
 * />
 * ```
 */
export function useReducedMotion(): boolean {
  const framerPrefersReducedMotion = useFramerReducedMotion();
  return framerPrefersReducedMotion ?? false;
}

// ============================================================================
// useSafeAnimation - 안전한 애니메이션 래퍼
// ============================================================================

interface SafeAnimationConfig {
  /** 기본 애니메이션 (모션 허용 시) */
  animate: TargetAndTransition;
  /** 모션 감소 시 대체 애니메이션 (기본: 없음) */
  reduced?: TargetAndTransition;
  /** 초기 상태 */
  initial?: TargetAndTransition;
  /** 호버 시 */
  whileHover?: TargetAndTransition;
  /** 탭 시 */
  whileTap?: TargetAndTransition;
  /** 트랜지션 설정 */
  transition?: Transition;
}

interface SafeAnimationResult {
  animate: TargetAndTransition;
  initial?: TargetAndTransition;
  whileHover?: TargetAndTransition;
  whileTap?: TargetAndTransition;
  transition?: Transition;
}

/**
 * 모션 감소 설정을 자동으로 적용하는 애니메이션 훅
 *
 * 사용 예:
 * ```tsx
 * const animation = useSafeAnimation({
 *   animate: { opacity: 1, y: 0 },
 *   initial: { opacity: 0, y: 20 },
 *   whileHover: { scale: 1.02 },
 * });
 *
 * <motion.div {...animation} />
 * ```
 */
export function useSafeAnimation(config: SafeAnimationConfig): SafeAnimationResult {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => {
    if (prefersReducedMotion) {
      return {
        animate: config.reduced ?? { opacity: 1 },
        initial: { opacity: 1 },
        whileHover: undefined,
        whileTap: undefined,
        transition: { duration: 0 },
      };
    }

    return {
      animate: config.animate,
      initial: config.initial,
      whileHover: config.whileHover,
      whileTap: config.whileTap,
      transition: config.transition,
    };
  }, [
    prefersReducedMotion,
    config.animate,
    config.reduced,
    config.initial,
    config.whileHover,
    config.whileTap,
    config.transition,
  ]);
}

// ============================================================================
// useSafeVariants - Variants 래퍼
// ============================================================================

/**
 * 모션 감소 시 Variants를 안전하게 변환
 *
 * 사용 예:
 * ```tsx
 * const cardVariants = {
 *   hidden: { opacity: 0, y: 20 },
 *   visible: { opacity: 1, y: 0 },
 * };
 *
 * const safeVariants = useSafeVariants(cardVariants);
 * <motion.div variants={safeVariants} />
 * ```
 */
export function useSafeVariants(variants: Variants): Variants {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => {
    if (prefersReducedMotion) {
      const reducedVariants: Variants = {};
      for (const key in variants) {
        const variant = variants[key];
        if (typeof variant === 'object' && variant !== null) {
          // 위치/크기 변환 제거, opacity만 유지
          const variantObj = variant as Record<string, unknown>;
          const opacityValue = typeof variantObj.opacity === 'number' ? variantObj.opacity : 1;
          reducedVariants[key] = {
            opacity: opacityValue,
          };
        } else {
          reducedVariants[key] = variant;
        }
      }
      return reducedVariants;
    }
    return variants;
  }, [prefersReducedMotion, variants]);
}

// ============================================================================
// useHighContrast - 고대비 모드 감지
// ============================================================================

/**
 * 사용자의 고대비 모드 설정을 감지합니다.
 */
export function useHighContrast(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // 고대비 모드 감지
    const mediaQuery = window.matchMedia('(forced-colors: active)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

// ============================================================================
// useFocusVisible - 포커스 관리
// ============================================================================

/**
 * 키보드 포커스 상태를 관리합니다.
 * 마우스 클릭 시에는 포커스 링을 숨기고, 키보드 탐색 시에만 표시합니다.
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocusVisible(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return {
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseDown: handleMouseDown,
    },
  };
}

// ============================================================================
// useAnnounce - 스크린 리더 공지
// ============================================================================

/**
 * 스크린 리더에 메시지를 공지합니다.
 *
 * 사용 예:
 * ```tsx
 * const announce = useAnnounce();
 *
 * const handleSubmit = () => {
 *   announce('폼이 제출되었습니다.');
 * };
 * ```
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // aria-live region 생성 또는 재사용
    let announcer = document.getElementById('zzik-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'zzik-announcer';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('class', 'sr-only');
      document.body.appendChild(announcer);
    } else {
      announcer.setAttribute('aria-live', priority);
    }

    // 메시지 설정 (변경 감지를 위해 빈 문자열로 먼저 설정)
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer!.textContent = message;
    });

    // 5초 후 정리
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 5000);
  }, []);

  return announce;
}

// ============================================================================
// 애니메이션 프리셋 (모션 감소 고려)
// ============================================================================

/**
 * 모션 감소 설정을 고려한 애니메이션 프리셋
 */
export const safeAnimationPresets = {
  /** 페이드 인 */
  fadeIn: (prefersReducedMotion: boolean): TargetAndTransition =>
    prefersReducedMotion ? { opacity: 1 } : { opacity: 1 },

  /** 슬라이드 업 */
  slideUp: (prefersReducedMotion: boolean): TargetAndTransition =>
    prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },

  /** 스케일 인 */
  scaleIn: (prefersReducedMotion: boolean): TargetAndTransition =>
    prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },

  /** 호버 스케일 */
  hoverScale: (prefersReducedMotion: boolean): TargetAndTransition | undefined =>
    prefersReducedMotion ? undefined : { scale: 1.02 },

  /** 탭 스케일 */
  tapScale: (prefersReducedMotion: boolean): TargetAndTransition | undefined =>
    prefersReducedMotion ? undefined : { scale: 0.98 },
} as const;

/**
 * 스프링 트랜지션 (모션 감소 시 즉시 적용)
 */
export function getSafeTransition(
  prefersReducedMotion: boolean,
  transition?: Transition
): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return (
    transition ?? {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  );
}
