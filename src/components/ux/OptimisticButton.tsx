'use client';

import { useState, useCallback, ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Heart, Bookmark, Share2, ThumbsUp } from 'lucide-react';
import { colors, radii, spacing, typography } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';
import { useToast } from '@/components/ui/Toast';

/**
 * OptimisticButton - 낙관적 업데이트 버튼
 *
 * Nielsen's Heuristics #1: Visibility of System Status
 * - 즉각적인 시각적 피드백으로 응답성 향상
 *
 * Optimistic UI Pattern:
 * - 클릭 즉시 상태 변경
 * - 백그라운드에서 API 호출
 * - 실패 시 롤백 + 에러 메시지
 */

export interface OptimisticButtonProps {
  /** 현재 활성 상태 */
  isActive: boolean;
  /** 액션 핸들러 (Promise 반환) */
  onAction: (newState: boolean) => Promise<boolean>;
  /** 버튼 유형 */
  variant?: 'like' | 'bookmark' | 'share' | 'upvote' | 'custom';
  /** 카운트 표시 */
  count?: number;
  /** 커스텀 활성 아이콘 */
  activeIcon?: ReactNode;
  /** 커스텀 비활성 아이콘 */
  inactiveIcon?: ReactNode;
  /** 활성 색상 */
  activeColor?: string;
  /** 비활성 색상 */
  inactiveColor?: string;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 */
  disabled?: boolean;
  /** 레이블 (활성) */
  activeLabel?: string;
  /** 레이블 (비활성) */
  inactiveLabel?: string;
  /** 레이블 표시 */
  showLabel?: boolean;
  /** 실패 시 메시지 */
  errorMessage?: string;
  /** 클래스명 */
  className?: string;
}

// 변형별 아이콘 설정
const VARIANT_CONFIG = {
  like: {
    activeIcon: <Heart fill="currentColor" />,
    inactiveIcon: <Heart />,
    activeColor: colors.flame[500],
    activeLabel: '좋아요 취소',
    inactiveLabel: '좋아요',
  },
  bookmark: {
    activeIcon: <Bookmark fill="currentColor" />,
    inactiveIcon: <Bookmark />,
    activeColor: colors.spark[500],
    activeLabel: '저장 취소',
    inactiveLabel: '저장',
  },
  share: {
    activeIcon: <Share2 />,
    inactiveIcon: <Share2 />,
    activeColor: colors.success,
    activeLabel: '공유됨',
    inactiveLabel: '공유',
  },
  upvote: {
    activeIcon: <ThumbsUp fill="currentColor" />,
    inactiveIcon: <ThumbsUp />,
    activeColor: colors.info,
    activeLabel: '추천 취소',
    inactiveLabel: '추천',
  },
  custom: {
    activeIcon: <Check />,
    inactiveIcon: <Check />,
    activeColor: colors.flame[500],
    activeLabel: '활성화됨',
    inactiveLabel: '비활성화됨',
  },
};

// 크기별 설정 (WCAG 44px 최소 터치 타겟)
const SIZE_CONFIG = {
  sm: { iconSize: 16, padding: spacing[3], fontSize: typography.fontSize.xs.size, minSize: 44 },
  md: { iconSize: 20, padding: spacing[3], fontSize: typography.fontSize.sm.size, minSize: 44 },
  lg: { iconSize: 24, padding: spacing[4], fontSize: typography.fontSize.base.size, minSize: 48 },
};

export function OptimisticButton({
  isActive,
  onAction,
  variant = 'like',
  count,
  activeIcon,
  inactiveIcon,
  activeColor,
  inactiveColor = colors.text.tertiary,
  size = 'md',
  disabled = false,
  activeLabel,
  inactiveLabel,
  showLabel = false,
  errorMessage = '처리에 실패했어요. 다시 시도해주세요.',
  className = '',
}: OptimisticButtonProps) {
  const [optimisticState, setOptimisticState] = useState(isActive);
  const [optimisticCount, setOptimisticCount] = useState(count);
  const [isLoading, setIsLoading] = useState(false);
  const haptic = useHaptic();
  const { error: showError } = useToast();

  const config = VARIANT_CONFIG[variant];
  const sizeConfig = SIZE_CONFIG[size];

  const displayActiveIcon = activeIcon || config.activeIcon;
  const displayInactiveIcon = inactiveIcon || config.inactiveIcon;
  const displayActiveColor = activeColor || config.activeColor;
  const displayActiveLabel = activeLabel || config.activeLabel;
  const displayInactiveLabel = inactiveLabel || config.inactiveLabel;

  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;

    const newState = !optimisticState;
    const prevState = optimisticState;
    const prevCount = optimisticCount;

    // Optimistic update
    setOptimisticState(newState);
    if (count !== undefined) {
      setOptimisticCount(newState ? (prevCount ?? 0) + 1 : Math.max(0, (prevCount ?? 0) - 1));
    }
    haptic.tap();

    setIsLoading(true);

    try {
      const success = await onAction(newState);

      if (!success) {
        // Rollback on failure
        setOptimisticState(prevState);
        setOptimisticCount(prevCount);
        haptic.error();
        showError(errorMessage);
      } else {
        if (newState) {
          haptic.success();
        }
      }
    } catch {
      // Rollback on error
      setOptimisticState(prevState);
      setOptimisticCount(prevCount);
      haptic.error();
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    disabled,
    isLoading,
    optimisticState,
    optimisticCount,
    count,
    onAction,
    haptic,
    showError,
    errorMessage,
  ]);

  // Sync with external state changes
  // useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  //   setOptimisticState(isActive);
  //   setOptimisticCount(count);
  // }, [isActive, count]);

  return (
    <m.button
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-1.5 transition-colors disabled:opacity-50 ${className}`}
      style={{
        padding: sizeConfig.padding,
        borderRadius: radii.lg,
        color: optimisticState ? displayActiveColor : inactiveColor,
        minWidth: sizeConfig.minSize,
        minHeight: sizeConfig.minSize,
      }}
      aria-label={optimisticState ? displayActiveLabel : displayInactiveLabel}
      aria-pressed={optimisticState}
    >
      {/* Icon with animation */}
      <AnimatePresence mode="wait">
        <m.div
          key={optimisticState ? 'active' : 'inactive'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            width: sizeConfig.iconSize,
            height: sizeConfig.iconSize,
          }}
          className="flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 size={sizeConfig.iconSize} className="animate-spin" />
          ) : optimisticState ? (
            displayActiveIcon
          ) : (
            displayInactiveIcon
          )}
        </m.div>
      </AnimatePresence>

      {/* Count */}
      {optimisticCount !== undefined && (
        <AnimatePresence mode="wait">
          <m.span
            key={optimisticCount}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ fontSize: sizeConfig.fontSize }}
            className="font-medium"
          >
            {optimisticCount}
          </m.span>
        </AnimatePresence>
      )}

      {/* Label */}
      {showLabel && (
        <span style={{ fontSize: sizeConfig.fontSize }} className="font-medium">
          {optimisticState ? displayActiveLabel : displayInactiveLabel}
        </span>
      )}

      {/* Success pulse animation */}
      {optimisticState && !isLoading && (
        <m.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 rounded-full"
          style={{ background: displayActiveColor }}
        />
      )}
    </m.button>
  );
}

// ============================================================================
// LikeButton - 좋아요 버튼 래퍼
// ============================================================================

interface LikeButtonProps {
  isLiked: boolean;
  count?: number;
  onLike: (isLiked: boolean) => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LikeButton({
  isLiked,
  count,
  onLike,
  size = 'md',
  showCount = true,
  disabled = false,
  className = '',
}: LikeButtonProps) {
  return (
    <OptimisticButton
      isActive={isLiked}
      onAction={onLike}
      variant="like"
      count={showCount ? count : undefined}
      size={size}
      disabled={disabled}
      className={className}
    />
  );
}

// ============================================================================
// BookmarkButton - 북마크 버튼 래퍼
// ============================================================================

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onBookmark: (isBookmarked: boolean) => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export function BookmarkButton({
  isBookmarked,
  onBookmark,
  size = 'md',
  showLabel = false,
  disabled = false,
  className = '',
}: BookmarkButtonProps) {
  return (
    <OptimisticButton
      isActive={isBookmarked}
      onAction={onBookmark}
      variant="bookmark"
      size={size}
      showLabel={showLabel}
      disabled={disabled}
      className={className}
    />
  );
}

export default OptimisticButton;
