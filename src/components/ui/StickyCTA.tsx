'use client';

import { type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { getSafeAreaInsets, getTouchTargetStyle } from '@/lib/mobile-ux';
import { colors, radii, shadows, zIndex } from '@/lib/design-tokens';

/**
 * DES-110: Primary CTA 상단 고정 컴포넌트
 *
 * 스크롤 시 상단에 고정되는 주요 CTA 버튼
 * - Safe area 고려
 * - 스크롤 시 fade-in 애니메이션
 * - 48px 최소 터치 영역
 */

interface StickyCTAProps {
  /** CTA 텍스트 또는 컴포넌트 */
  children: ReactNode;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 표시 여부 */
  show?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 배경색 커스터마이징 */
  backgroundColor?: string;
  /** 스크롤 임계값 (px) - 이 값 이상 스크롤 시 표시 */
  scrollThreshold?: number;
}

export function StickyCTA({
  children,
  onClick,
  show = true,
  loading = false,
  disabled = false,
  backgroundColor = colors.flame[500],
  scrollThreshold = 200,
}: StickyCTAProps) {
  const { scrollY } = useScroll();

  // 스크롤에 따라 opacity 변경
  const opacity = useTransform(scrollY, [0, scrollThreshold, scrollThreshold + 100], [0, 0, 1]);

  // 스크롤에 따라 translateY 변경
  const translateY = useTransform(
    scrollY,
    [0, scrollThreshold, scrollThreshold + 100],
    [-60, -60, 0]
  );

  if (!show) return null;

  return (
    <m.div
      className="fixed top-0 left-0 right-0"
      style={{
        opacity,
        translateY,
        zIndex: zIndex.modal,
        ...getSafeAreaInsets(),
      }}
      initial={{ opacity: 0, y: -60 }}
    >
      <div
        className="px-5 py-4"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <m.button
          type="button"
          onClick={disabled || loading ? undefined : onClick}
          disabled={disabled || loading}
          whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
          className="w-full font-semibold text-white relative overflow-hidden"
          style={{
            ...getTouchTargetStyle('min'),
            background: disabled ? colors.space[700] : backgroundColor,
            borderRadius: radii.xl,
            boxShadow: disabled ? 'none' : shadows.glow.primary,
            opacity: disabled ? 0.5 : 1,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
          }}
          aria-label={typeof children === 'string' ? children : '주요 액션'}
          aria-busy={loading}
          aria-disabled={disabled || loading}
        >
          {/* Glass highlight */}
          {!disabled && (
            <div
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                borderRadius: `${radii.xl} ${radii.xl} 0 0`,
              }}
              aria-hidden="true"
            />
          )}

          {/* Loading spinner */}
          {loading && (
            <m.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <m.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </m.div>
          )}

          {/* Content */}
          <span
            className="relative z-10"
            style={{
              opacity: loading ? 0 : 1,
            }}
          >
            {children}
          </span>
        </m.button>
      </div>
    </m.div>
  );
}

/**
 * DES-120: Submit 버튼 Sticky (폼 하단 고정)
 */
interface StickyFormSubmitProps {
  /** 버튼 텍스트 */
  children: ReactNode;
  /** Submit 핸들러 */
  onSubmit?: () => void;
  /** Form ID (form과 연결) */
  form?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 유효성 검사 상태 */
  isValid?: boolean;
}

export function StickyFormSubmit({
  children,
  onSubmit,
  form,
  loading = false,
  disabled = false,
  isValid = true,
}: StickyFormSubmitProps) {
  const isDisabled = disabled || !isValid || loading;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 py-4"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <m.button
        type="submit"
        form={form}
        onClick={onSubmit}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        className="w-full font-bold text-white relative overflow-hidden"
        style={{
          ...getTouchTargetStyle('comfortable'),
          background: isDisabled
            ? colors.space[700]
            : `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
          borderRadius: radii.xl,
          boxShadow: isDisabled ? 'none' : shadows.glow.primary,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={typeof children === 'string' ? children : '제출하기'}
        aria-busy={loading}
        aria-disabled={isDisabled}
      >
        {/* Glass highlight */}
        {!isDisabled && (
          <div
            className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
              borderRadius: `${radii.xl} ${radii.xl} 0 0`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <m.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Content */}
        <span
          className="relative z-10"
          style={{
            opacity: loading ? 0 : 1,
          }}
        >
          {children}
        </span>
      </m.button>
    </div>
  );
}

export default StickyCTA;
