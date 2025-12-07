'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark } from 'lucide-react';
import { usePopupBookmark } from '@/hooks/useBookmark';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration } from '@/lib/animations';
import { colors, typography } from '@/lib/design-tokens';

/**
 * BookmarkButton - 북마크 토글 버튼
 *
 * Features:
 * - 하트/북마크 아이콘 선택 가능
 * - 토글 애니메이션
 * - 피드백 효과
 */

interface BookmarkButtonProps {
  popupId: string;
  /** 아이콘 타입 */
  variant?: 'heart' | 'bookmark';
  /** 버튼 사이즈 */
  size?: 'sm' | 'md' | 'lg';
  /** 배경 표시 */
  showBackground?: boolean;
  /** 추가 클래스 */
  className?: string;
  /** 토글 콜백 */
  onToggle?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({
  popupId,
  variant = 'heart',
  size = 'md',
  showBackground = true,
  className = '',
  onToggle,
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = usePopupBookmark(popupId);
  const [showBurst, setShowBurst] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // 사이즈별 스타일 (WCAG 44px 최소 터치 타겟)
  const sizeConfig = {
    sm: { padding: 'p-2.5', iconSize: 16, minSize: 'min-w-[44px] min-h-[44px]' },
    md: { padding: 'p-3', iconSize: 18, minSize: 'min-w-[44px] min-h-[44px]' },
    lg: { padding: 'p-3.5', iconSize: 24, minSize: 'min-w-[48px] min-h-[48px]' },
  };

  const config = sizeConfig[size];

  // 아이콘 선택
  const Icon = variant === 'heart' ? Heart : Bookmark;

  // 토글 핸들러
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newState = toggle();
      onToggle?.(newState);

      // 북마크 추가 시 버스트 효과
      if (newState && !prefersReducedMotion) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 600);
      }
    },
    [toggle, onToggle, prefersReducedMotion]
  );

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
      className={`relative ${config.padding} ${config.minSize} flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-flame-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-900 ${className}`}
      style={{
        background: showBackground
          ? isBookmarked
            ? colors.temperature.warm.bg
            : colors.border.subtle
          : 'transparent',
      }}
      aria-label={isBookmarked ? '북마크 해제하기' : '북마크 추가하기'}
      aria-pressed={isBookmarked}
      aria-describedby={`bookmark-status-${popupId}`}
    >
      <span id={`bookmark-status-${popupId}`} className="sr-only">
        {isBookmarked
          ? '이 팝업은 이미 북마크에 추가되어 있습니다'
          : '이 팝업을 북마크에 추가할 수 있습니다'}
      </span>
      {/* Icon */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { scale: 1 }
            : {
                scale: isBookmarked ? [1, 1.3, 1] : 1,
              }
        }
        transition={{ duration: duration.standard * 1.5 }} // 300ms
      >
        <Icon
          size={config.iconSize}
          fill={isBookmarked ? colors.flame[500] : 'none'}
          stroke={isBookmarked ? colors.flame[500] : 'currentColor'}
          className={isBookmarked ? '' : 'text-linear-text-secondary hover:text-white'}
          strokeWidth={2}
        />
      </motion.div>

      {/* Burst Effect */}
      <AnimatePresence>
        {showBurst && (
          <>
            {/* Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? colors.flame[500] : colors.spark[400],
                  top: '50%',
                  left: '50%',
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos((i * Math.PI) / 3) * 20,
                  y: Math.sin((i * Math.PI) / 3) * 20,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.progress }} // 500ms
              />
            ))}

            {/* Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${colors.flame[500]}`,
              }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.major }} // 400ms
            />
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * BookmarkCount - 북마크 카운트 배지
 */
export function BookmarkCount({ count, className = '' }: { count: number; className?: string }) {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full font-bold flex items-center justify-center ${className}`}
      style={{
        background: colors.flame[500],
        color: 'white',
        fontSize: typography.fontSize.xs.size,
        lineHeight: typography.fontSize.xs.lineHeight,
      }}
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  );
}

export default BookmarkButton;
