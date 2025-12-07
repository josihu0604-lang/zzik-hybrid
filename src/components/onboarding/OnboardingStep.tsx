'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { colors, gradients } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * OnboardingStep - 감성적인 개별 온보딩 스텝 컴포넌트
 *
 * Features:
 * - 풀스크린 레이아웃
 * - 불꽃 테마 애니메이션
 * - 브랜드 메시지 강조
 * - 스와이프 제스처 지원
 */

interface OnboardingStepProps {
  /** 스텝 인덱스 (0-based) */
  index: number;
  /** 메인 헤드라인 */
  headline: string;
  /** 서브 텍스트 */
  subtext: string;
  /** 강조 텍스트 (옵션) */
  emphasis?: string;
  /** 아이콘/일러스트레이션 */
  icon: ReactNode;
  /** 배경 타입 */
  backgroundType?: 'flame' | 'spark' | 'success';
  /** 추가 컨텐츠 (CTA 등) */
  children?: ReactNode;
  /** 활성화 상태 */
  isActive: boolean;
  /** 슬라이드 방향 (1: 다음, -1: 이전) */
  direction?: number;
}

// 배경 파티클 애니메이션
function FlameParticles({
  type,
  prefersReducedMotion,
}: {
  type: 'flame' | 'spark' | 'success';
  prefersReducedMotion: boolean;
}) {
  const particleColor =
    type === 'flame' ? colors.flame[500] : type === 'spark' ? colors.spark[500] : colors.success;

  // Skip animation for reduced motion preference
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 떠다니는 불꽃 파티클 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: particleColor,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 글로우 오브 (큰 원) */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          left: '50%',
          top: '30%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${particleColor}20 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// 슬라이드 전환 애니메이션 variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.9,
  }),
};

export function OnboardingStep({
  headline,
  subtext,
  emphasis,
  icon,
  backgroundType = 'flame',
  children,
  isActive,
  direction = 1,
}: OnboardingStepProps) {
  const prefersReducedMotion = useReducedMotion();

  // 배경 그라디언트 선택
  const bgGradient =
    backgroundType === 'flame'
      ? gradients.flameFade
      : backgroundType === 'spark'
        ? gradients.sparkFade
        : gradients.successFade;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate={isActive ? 'center' : 'exit'}
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      style={{
        background: bgGradient,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      {/* 배경 파티클 */}
      <FlameParticles type={backgroundType} prefersReducedMotion={prefersReducedMotion} />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-32">
        {/* 아이콘/일러스트 영역 */}
        <motion.div
          className="mb-10"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={isActive ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {icon}
        </motion.div>

        {/* 텍스트 영역 */}
        <motion.div
          className="text-center max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 헤드라인 - 줄바꿈 지원 */}
          <h2 className="text-white text-[28px] font-black leading-tight mb-4 whitespace-pre-line">
            {headline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < headline.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h2>

          {/* 강조 텍스트 (있을 경우) */}
          {emphasis && (
            <motion.p
              className="text-lg font-bold mb-3"
              style={{ color: colors.flame[500] }}
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {emphasis}
            </motion.p>
          )}

          {/* 서브텍스트 */}
          <p
            className="text-base leading-relaxed whitespace-pre-line"
            style={{ color: colors.text.secondary }}
          >
            {subtext}
          </p>
        </motion.div>

        {/* 추가 컨텐츠 (CTA 등) */}
        {children && (
          <motion.div
            className="mt-10 w-full max-w-sm"
            initial={{ y: 30, opacity: 0 }}
            animate={isActive ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default OnboardingStep;
