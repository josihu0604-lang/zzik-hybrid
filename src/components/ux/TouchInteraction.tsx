'use client';

import { ReactNode, useRef, useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Share } from 'lucide-react';
import { colors, radii } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * TouchInteraction - 터치 인터랙션 컴포넌트
 *
 * Apple HIG: Touch Target Size
 * - 최소 44x44px 터치 영역 보장
 * - 스와이프, 롱프레스 등 터치 제스처 지원
 *
 * Nielsen's Heuristics #7: Flexibility and efficiency of use
 * - 파워 유저를 위한 스와이프 액션
 */

// ============================================================================
// TouchTarget - 충분한 터치 영역
// ============================================================================

export interface TouchTargetProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 최소 크기 (px) */
  minSize?: number;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
  /** 접근성 레이블 */
  ariaLabel?: string;
}

export function TouchTarget({
  children,
  minSize = 44,
  onClick,
  disabled = false,
  className = '',
  ariaLabel,
}: TouchTargetProps) {
  const haptic = useHaptic();

  const handleClick = () => {
    if (disabled) return;
    haptic.tap();
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        minWidth: minSize,
        minHeight: minSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

// ============================================================================
// SwipeAction - 스와이프 액션
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using simpler touch interactions or mobile-native patterns instead.
 * This component may be removed in a future version.
 */
type SwipeActionType = 'delete' | 'edit' | 'share' | 'custom';

interface SwipeActionConfig {
  type: SwipeActionType;
  label: string;
  icon?: ReactNode;
  color: string;
  onAction: () => void;
}

interface SwipeActionProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 왼쪽 스와이프 액션 */
  leftActions?: SwipeActionConfig[];
  /** 오른쪽 스와이프 액션 */
  rightActions?: SwipeActionConfig[];
  /** 스와이프 임계값 */
  threshold?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
}

const DEFAULT_ACTION_ICONS: Record<Exclude<SwipeActionType, 'custom'>, ReactNode> = {
  delete: <Trash2 size={20} />,
  edit: <Edit size={20} />,
  share: <Share size={20} />,
};

const DEFAULT_ACTION_COLORS: Record<Exclude<SwipeActionType, 'custom'>, string> = {
  delete: colors.error,
  edit: colors.info,
  share: colors.success,
};

export function SwipeAction({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  className = '',
}: SwipeActionProps) {
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const haptic = useHaptic();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // 액션 너비 계산
  const leftActionsWidth = leftActions.length * 70;
  const rightActionsWidth = rightActions.length * 70;

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const dragDistance = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(dragDistance) > threshold || Math.abs(velocity) > 500) {
        if (dragDistance > 0 && leftActions.length > 0) {
          setIsOpen('left');
          haptic.tap();
        } else if (dragDistance < 0 && rightActions.length > 0) {
          setIsOpen('right');
          haptic.tap();
        } else {
          setIsOpen(null);
        }
      } else {
        setIsOpen(null);
      }
    },
    [threshold, leftActions.length, rightActions.length, haptic]
  );

  const getXConstraint = () => {
    if (isOpen === 'left') return leftActionsWidth;
    if (isOpen === 'right') return -rightActionsWidth;
    return 0;
  };

  const renderAction = (action: SwipeActionConfig, _side: 'left' | 'right') => {
    const icon =
      action.type !== 'custom' ? action.icon || DEFAULT_ACTION_ICONS[action.type] : action.icon;
    const bgColor = action.type !== 'custom' ? DEFAULT_ACTION_COLORS[action.type] : action.color;

    return (
      <motion.button
        key={action.label}
        onClick={() => {
          action.onAction();
          haptic.success();
          setIsOpen(null);
        }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center w-[70px] h-full"
        style={{
          background: bgColor,
          color: 'white',
        }}
        aria-label={action.label}
      >
        {icon}
        <span className="text-xs mt-1 font-medium">{action.label}</span>
      </motion.button>
    );
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={constraintsRef} className={`relative overflow-hidden ${className}`}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: leftActionsWidth }}>
          {leftActions.map((action) => renderAction(action, 'left'))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: rightActionsWidth }}>
          {rightActions.map((action) => renderAction(action, 'right'))}
        </div>
      )}

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: rightActions.length > 0 ? -rightActionsWidth : 0,
          right: leftActions.length > 0 ? leftActionsWidth : 0,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: getXConstraint() }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ x, touchAction: 'pan-y' }}
        className="relative bg-space-950"
      >
        {children}
      </motion.div>

      {/* Tap to close overlay */}
      {isOpen && (
        <div className="absolute inset-0 z-10" onClick={() => setIsOpen(null)} aria-hidden="true" />
      )}
    </div>
  );
}

// ============================================================================
// LongPressMenu - 롱프레스 메뉴
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using TouchTarget or standard context menus instead.
 * This component may be removed in a future version.
 */
interface LongPressMenuProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 메뉴 아이템 */
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }>;
  /** 롱프레스 시간 (ms) */
  pressDelay?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
}

export function LongPressMenu({
  children,
  items,
  pressDelay = 500,
  disabled = false,
  className = '',
}: LongPressMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const haptic = useHaptic();

  const handlePressStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (disabled) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      timerRef.current = setTimeout(() => {
        haptic.tap();
        setMenuPosition({ x: clientX, y: clientY });
        setIsOpen(true);
      }, pressDelay);
    },
    [disabled, pressDelay, haptic]
  );

  const handlePressEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleItemClick = useCallback(
    (item: (typeof items)[0]) => {
      haptic.success();
      item.onClick();
      setIsOpen(false);
    },
    [haptic]
  );

  return (
    <>
      <div
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        className={className}
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 min-w-[180px] overflow-hidden"
              style={{
                left: menuPosition.x,
                top: menuPosition.y,
                transform: 'translate(-50%, 8px)',
                background: colors.space[850],
                border: `1px solid ${colors.border.default}`,
                borderRadius: radii.xl,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {items.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  whileHover={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{
                    color: item.destructive ? colors.error : colors.text.primary,
                    borderBottom:
                      index < items.length - 1 ? `1px solid ${colors.border.subtle}` : 'none',
                  }}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// DoubleTapLike - 더블탭 좋아요
// ============================================================================

/**
 * @deprecated This component is currently unused in the project.
 * Consider using LikeButton from OptimisticButton instead.
 * This component may be removed in a future version.
 */
interface DoubleTapLikeProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 좋아요 상태 */
  isLiked: boolean;
  /** 좋아요 토글 */
  onLike: () => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
}

export function DoubleTapLike({
  children,
  isLiked,
  onLike,
  disabled = false,
  className = '',
}: DoubleTapLikeProps) {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);
  const haptic = useHaptic();

  const handleTap = useCallback(() => {
    if (disabled) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        onLike();
        haptic.success();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
      }
    }

    lastTapRef.current = now;
  }, [disabled, isLiked, onLike, haptic]);

  return (
    <div className={`relative ${className}`} onClick={handleTap}>
      {children}

      {/* Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill={colors.flame[500]} stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TouchTarget;
