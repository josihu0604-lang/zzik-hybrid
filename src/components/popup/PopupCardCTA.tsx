'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import { Check, ChevronRight, Flame } from 'lucide-react';
import { colors, radii, spacing, typography } from '@/lib/design-tokens';

interface PopupCardCTAProps {
  popupId: string;
  isParticipated: boolean;
  isDone: boolean;
  onParticipate: (popupId: string) => void;
  /** 풀 너비 버튼 (App Store 스타일) */
  fullWidth?: boolean;
}

function PopupCardCTAComponent({
  popupId,
  isParticipated,
  isDone,
  onParticipate,
  fullWidth = false,
}: PopupCardCTAProps) {
  const isDisabled = isParticipated || isDone;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDisabled) {
      onParticipate(popupId);
    }
  };

  return (
    <m.button
      onClick={handleClick}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      className={`flex items-center justify-center transition-all ${fullWidth ? 'w-full' : ''}`}
      style={{
        // DES-201: Button.tsx md 사이즈와 통일 (14px 24px)
        padding: fullWidth ? `${spacing[4]} ${spacing[6]}` : `${spacing[3.5]} ${spacing[6]}`,
        minHeight: fullWidth ? '52px' : '48px', // DES-132: 표준 버튼 높이
        gap: spacing[2],
        borderRadius: fullWidth ? radii.xl : radii.lg,
        background: isParticipated
          ? colors.temperature.done.bg
          : isDone
            ? 'transparent'
            : `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[400]} 100%)`,
        border: isParticipated
          ? `1px solid ${colors.temperature.done.border}`
          : isDone
            ? `1px solid ${colors.border.default}`
            : 'none',
        color: isParticipated
          ? colors.temperature.done.text
          : isDone
            ? colors.text.tertiary
            : '#fff',
        // DES-217: typography 토큰 사용
        fontSize: typography.fontSize.base.size,
        fontWeight: typography.fontWeight.semibold,
        cursor: isDisabled ? 'default' : 'pointer',
        boxShadow: !isDisabled
          ? '0 4px 12px rgba(255, 107, 91, 0.3), inset 0 1px 0 0 rgba(255,255,255,0.2)'
          : 'none',
      }}
      aria-label={
        isParticipated ? '참여 완료됨' : isDone ? '펀딩 완료, 자세히 보기' : '팝업 펀딩에 참여하기'
      }
      aria-pressed={isParticipated}
      aria-disabled={isDisabled}
    >
      {isParticipated ? (
        <>
          <Check size={16} aria-hidden="true" />
          <span>참여완료</span>
        </>
      ) : isDone ? (
        <>
          <span>자세히 보기</span>
          <ChevronRight size={16} aria-hidden="true" />
        </>
      ) : (
        <>
          <Flame size={16} aria-hidden="true" />
          <span>참여하기</span>
        </>
      )}
    </m.button>
  );
}

// Memoize to prevent unnecessary re-renders
export const PopupCardCTA = memo(PopupCardCTAComponent);
export default PopupCardCTA;
