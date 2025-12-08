'use client';

import { ReactNode, useRef } from 'react';
import { m, useInView, useScroll, useTransform } from 'framer-motion';

/**
 * ScrollAnimations - 스크롤 애니메이션 컴포넌트
 *
 * Nielsen's Heuristics #1: Visibility of System Status
 * - 스크롤에 따른 부드러운 애니메이션으로 콘텐츠 등장 표현
 * - 사용자의 스크롤 위치에 따른 시각적 피드백
 *
 * Performance: GPU 가속 사용, 리페인트 최소화
 */

// ============================================================================
// FadeInOnScroll - 스크롤 시 페이드인
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export interface FadeInOnScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 지연 시간 (초) */
  delay?: number;
  /** 애니메이션 지속 시간 (초) */
  duration?: number;
  /** Y축 이동 거리 */
  yOffset?: number;
  /** 뷰포트 진입 비율 (0-1) */
  threshold?: number;
  /** 한 번만 애니메이션 */
  once?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 30,
  threshold = 0.1,
  once = true,
  className = '',
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </m.div>
  );
}

// ============================================================================
// SlideInOnScroll - 스크롤 시 슬라이드인
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using FadeInOnScroll or ScrollProgress instead.
 * This component may be removed in a future version.
 */
interface SlideInOnScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 슬라이드 방향 */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** 지연 시간 (초) */
  delay?: number;
  /** 애니메이션 지속 시간 (초) */
  duration?: number;
  /** 이동 거리 */
  distance?: number;
  /** 한 번만 애니메이션 */
  once?: boolean;
  /** 클래스명 */
  className?: string;
}

export function SlideInOnScroll({
  children,
  direction = 'left',
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
  className = '',
}: SlideInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0 };
      case 'right':
        return { x: distance, y: 0 };
      case 'up':
        return { x: 0, y: distance };
      case 'down':
        return { x: 0, y: -distance };
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = getInitialPosition();

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, ...initial }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initial }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </m.div>
  );
}

// ============================================================================
// ScaleOnScroll - 스크롤 시 스케일
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using FadeInOnScroll or ScrollProgress instead.
 * This component may be removed in a future version.
 */
interface ScaleOnScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 시작 스케일 */
  startScale?: number;
  /** 종료 스케일 */
  endScale?: number;
  /** 지연 시간 (초) */
  delay?: number;
  /** 한 번만 애니메이션 */
  once?: boolean;
  /** 클래스명 */
  className?: string;
}

export function ScaleOnScroll({
  children,
  startScale = 0.9,
  endScale = 1,
  delay = 0,
  once = true,
  className = '',
}: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, scale: startScale }}
      animate={isInView ? { opacity: 1, scale: endScale } : { opacity: 0, scale: startScale }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </m.div>
  );
}

// ============================================================================
// StaggeredList - 순차 애니메이션 리스트
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using FadeInOnScroll with multiple children instead.
 * This component may be removed in a future version.
 */
interface StaggeredListProps {
  /** 자식 요소 배열 */
  children: ReactNode[];
  /** 각 아이템 간 지연 시간 */
  staggerDelay?: number;
  /** 시작 지연 시간 */
  initialDelay?: number;
  /** 애니메이션 지속 시간 */
  duration?: number;
  /** 한 번만 애니메이션 */
  once?: boolean;
  /** 컨테이너 클래스명 */
  className?: string;
  /** 아이템 클래스명 */
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  duration = 0.4,
  once = true,
  className = '',
  itemClassName = '',
}: StaggeredListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <m.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children.map((child, index) => (
        <m.div key={index} variants={item} className={itemClassName}>
          {child}
        </m.div>
      ))}
    </m.div>
  );
}

// ============================================================================
// ParallaxScroll - 패럴랙스 스크롤
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using FadeInOnScroll or ScrollProgress instead.
 * This component may be removed in a future version.
 */
interface ParallaxScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 패럴랙스 속도 (0-1, 1이 가장 빠름) */
  speed?: number;
  /** 방향 */
  direction?: 'up' | 'down';
  /** 클래스명 */
  className?: string;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed * multiplier]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <m.div style={{ y }}>{children}</m.div>
    </div>
  );
}

// ============================================================================
// ScrollProgress - 스크롤 진행률 표시
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
interface ScrollProgressProps {
  /** 색상 */
  color?: string;
  /** 높이 */
  height?: number;
  /** 위치 */
  position?: 'top' | 'bottom';
  /** 클래스명 */
  className?: string;
}

/**
 * @deprecated This component is currently unused in the project.
 * Consider removing in a future version or document where it should be used.
 */
export function ScrollProgress({
  color = '#FF6B5B',
  height = 3,
  position = 'top',
  className = '',
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <m.div
      className={`fixed left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{
        height,
        background: color,
        scaleX: scrollYProgress,
        transformOrigin: 'left',
        zIndex: 50,
      }}
    />
  );
}

// ============================================================================
// RevealOnScroll - 마스크 리빌 애니메이션
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using FadeInOnScroll or SlideInOnScroll instead.
 * This component may be removed in a future version.
 */
interface RevealOnScrollProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 방향 */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** 지연 시간 */
  delay?: number;
  /** 한 번만 애니메이션 */
  once?: boolean;
  /** 클래스명 */
  className?: string;
}

export function RevealOnScroll({
  children,
  direction = 'up',
  delay = 0,
  once = true,
  className = '',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const getClipPath = () => {
    switch (direction) {
      case 'left':
        return {
          initial: 'inset(0 100% 0 0)',
          animate: 'inset(0 0 0 0)',
        };
      case 'right':
        return {
          initial: 'inset(0 0 0 100%)',
          animate: 'inset(0 0 0 0)',
        };
      case 'up':
        return {
          initial: 'inset(100% 0 0 0)',
          animate: 'inset(0 0 0 0)',
        };
      case 'down':
        return {
          initial: 'inset(0 0 100% 0)',
          animate: 'inset(0 0 0 0)',
        };
      default:
        return {
          initial: 'inset(0 0 100% 0)',
          animate: 'inset(0 0 0 0)',
        };
    }
  };

  const clipPath = getClipPath();

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <m.div
        initial={{ clipPath: clipPath.initial }}
        animate={isInView ? { clipPath: clipPath.animate } : { clipPath: clipPath.initial }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </m.div>
    </div>
  );
}

export default FadeInOnScroll;
