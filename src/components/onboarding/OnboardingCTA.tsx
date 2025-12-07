'use client';

import { m } from '@/lib/motion';
import { ChevronRight, Flame, Sparkles } from 'lucide-react';
import { colors, gradients, shadows } from '@/lib/design-tokens';

/**
 * OnboardingCTA - 온보딩 최종 CTA 버튼
 *
 * Features:
 * - 브랜드 컬러 그라디언트
 * - 펄스 글로우 애니메이션
 * - 불꽃 파티클 효과
 * - 터치 피드백
 */

interface OnboardingCTAProps {
  /** 버튼 텍스트 */
  text?: string;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 보조 텍스트 */
  subtext?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  /** 변형 (primary: 메인 CTA, secondary: 건너뛰기) */
  variant?: 'primary' | 'secondary';
}

export function OnboardingCTA({
  text = '시작하기',
  onClick,
  subtext,
  loading = false,
  disabled = false,
  variant = 'primary',
}: OnboardingCTAProps) {
  if (variant === 'secondary') {
    return (
      <m.button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full py-4 px-6 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          color: colors.text.secondary,
          border: `1px solid ${colors.border.subtle}`,
        }}
        whileHover={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: colors.text.primary,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {text}
      </m.button>
    );
  }

  return (
    <div className="relative w-full">
      {/* 배경 글로우 애니메이션 */}
      <m.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: gradients.flame,
          filter: 'blur(24px)',
          opacity: 0.5,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 메인 버튼 */}
      <m.button
        onClick={onClick}
        disabled={disabled || loading}
        className="relative w-full py-4 px-6 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 overflow-hidden"
        style={{
          background: gradients.flame,
          boxShadow: `0 8px 32px ${colors.flame[500]}50, ${shadows.glow.primary}`,
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 내부 하이라이트 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
            borderRadius: 'inherit',
          }}
        />

        {/* 스파클 효과 */}
        <m.div
          className="absolute top-2 right-4"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles size={16} className="text-white/60" />
        </m.div>

        {/* 버튼 컨텐츠 */}
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <Flame size={22} className="text-white" />
            <span>{text}</span>
            <m.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <ChevronRight size={22} className="text-white/80" />
            </m.div>
          </>
        )}

        {/* 플로팅 파티클 */}
        {!loading && (
          <>
            {[...Array(3)].map((_, i) => (
              <m.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40"
                style={{
                  left: `${20 + i * 30}%`,
                  bottom: '100%',
                }}
                animate={{
                  y: [0, -20, -40],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </m.button>

      {/* 보조 텍스트 */}
      {subtext && (
        <m.p
          className="text-center mt-4 text-sm"
          style={{ color: colors.text.tertiary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtext}
        </m.p>
      )}
    </div>
  );
}

/**
 * OnboardingSkipButton - 건너뛰기 버튼
 */
interface OnboardingSkipButtonProps {
  onClick: () => void;
  text?: string;
}

export function OnboardingSkipButton({ onClick, text = '건너뛰기' }: OnboardingSkipButtonProps) {
  return (
    <m.button
      onClick={onClick}
      className="px-4 py-3 min-h-[44px] rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        color: colors.text.secondary,
      }}
      whileHover={{
        background: 'rgba(255, 255, 255, 0.12)',
        color: colors.text.primary,
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      aria-label="온보딩 건너뛰기"
    >
      <span>{text}</span>
    </m.button>
  );
}

/**
 * OnboardingNextButton - 다음 버튼 (FAB 스타일)
 */
interface OnboardingNextButtonProps {
  onClick: () => void;
  progress?: number; // 0-1 진행률 (타이머)
}

export function OnboardingNextButton({ onClick, progress = 0 }: OnboardingNextButtonProps) {
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <m.button
      onClick={onClick}
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      aria-label="다음"
    >
      {/* 원형 프로그레스 배경 */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* 진행률 원 */}
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.flame[500]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </svg>

      {/* 버튼 내부 */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: gradients.flame,
          boxShadow: `0 4px 20px ${colors.flame[500]}60`,
        }}
      >
        <ChevronRight size={24} className="text-white" />
      </div>
    </m.button>
  );
}

export default OnboardingCTA;
