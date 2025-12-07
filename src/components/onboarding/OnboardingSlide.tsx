'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * OnboardingSlide - 온보딩 슬라이드 컴포넌트
 */

interface OnboardingSlideProps {
  /** 헤드라인 */
  headline: string;
  /** 서브텍스트 */
  subtext: string;
  /** 애니메이션 아이콘/일러스트 */
  icon: ReactNode;
  /** 배경 그라데이션 색상 */
  bgGradient?: string;
  /** 추가 컨텐츠 (마지막 슬라이드용) */
  children?: ReactNode;
  /** 슬라이드 인덱스 */
  index: number;
  /** 현재 활성 슬라이드 */
  isActive: boolean;
  /** 헤딩 레벨 (접근성을 위한 헤딩 계층) */
  headingLevel?: 1 | 2 | 3;
}

export function OnboardingSlide({
  headline,
  subtext,
  icon,
  bgGradient = 'linear-gradient(180deg, rgba(255, 107, 91, 0.1) 0%, rgba(8, 9, 10, 1) 100%)',
  children,
  isActive,
  headingLevel = 2,
}: OnboardingSlideProps) {
  // Dynamic heading element based on headingLevel prop
  const HeadingTag = `h${headingLevel}` as const;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-8
                 landscape:flex-row landscape:gap-8 landscape:py-4"
      initial={{ opacity: 0, x: 100 }}
      animate={{
        opacity: isActive ? 1 : 0,
        x: isActive ? 0 : -100,
        scale: isActive ? 1 : 0.9,
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        background: bgGradient,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      {/* Icon/Illustration Area */}
      <motion.div
        className="mb-12 landscape:mb-0 landscape:flex-shrink-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? 1 : 0.8,
          opacity: isActive ? 1 : 0,
        }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {icon}
      </motion.div>

      {/* Text Content - DES-122: 랜드스케이프 모드 대응 */}
      <motion.div
        className="text-center max-w-sm landscape:text-left landscape:max-w-md"
        initial={{ y: 30, opacity: 0 }}
        animate={{
          y: isActive ? 0 : 30,
          opacity: isActive ? 1 : 0,
        }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <HeadingTag className="text-white text-2xl font-black mb-4 leading-tight landscape:text-xl">
          {headline}
        </HeadingTag>
        <p className="text-linear-text-secondary text-base leading-relaxed landscape:text-sm">
          {subtext}
        </p>
      </motion.div>

      {/* Additional Content (for last slide) */}
      {children && (
        <motion.div
          className="mt-8 w-full max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{
            y: isActive ? 0 : 30,
            opacity: isActive ? 1 : 0,
          }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

export default OnboardingSlide;
