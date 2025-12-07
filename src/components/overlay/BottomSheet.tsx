'use client';

import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { colors, radii, liquidGlass, zIndex } from '@/lib/design-tokens';
import { springConfig, duration } from '@/lib/animations';
import { useHaptic } from '@/hooks/useHaptic';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * BottomSheet - 2026 트렌드 바텀시트 컴포넌트
 *
 * Features:
 * - 드래그로 높이 조절 (스냅 포인트)
 * - 배경 탭으로 닫기
 * - 하드웨어 가속 애니메이션
 * - 햅틱 피드백
 * - Safe area 대응
 */

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 초기 높이 (vh) */
  initialHeight?: number;
  /** 최대 높이 (vh) */
  maxHeight?: number;
  /** 닫힘 임계값 (vh) - 이 높이 이하로 드래그 시 닫힘 */
  closeThreshold?: number;
  /** 핸들 표시 여부 */
  showHandle?: boolean;
  /** 배경 클릭 시 닫기 */
  closeOnBackdropClick?: boolean;
  className?: string;
}

// 스냅 포인트 정의
const SNAP_POINTS = {
  closed: 0,
  peek: 35, // 미리보기
  half: 60, // 기본
  full: 90, // 최대
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  initialHeight = SNAP_POINTS.half,
  maxHeight = SNAP_POINTS.full,
  closeThreshold = 20,
  showHandle = true,
  closeOnBackdropClick = true,
  className = '',
}: BottomSheetProps) {
  const haptic = useHaptic();
  const controls = useAnimation();
  const currentHeightRef = useRef(initialHeight);
  const prefersReducedMotion = useReducedMotion();

  // Focus trap with WCAG 2.1 AA compliance
  // Use containerRef as sheetRef for both focus management and drag control
  const { containerRef: sheetRef } = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    initialFocus: 'first',
    returnFocus: true,
    onEscape: onClose,
    preventScroll: true,
  });

  // 시트 높이를 vh로 설정
  const setSheetHeight = useCallback(
    async (heightVh: number, immediate = false) => {
      currentHeightRef.current = heightVh;
      await controls.start({
        y: `${100 - heightVh}vh`,
        transition:
          immediate || prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: springConfig.smooth.stiffness,
                damping: springConfig.smooth.damping,
              },
      });
    },
    [controls, prefersReducedMotion]
  );

  // 열릴 때 초기 높이로 설정
  useEffect(() => {
    if (isOpen) {
      setSheetHeight(initialHeight);
      haptic.tap();
    }
  }, [isOpen, initialHeight, setSheetHeight, haptic]);

  // 드래그 핸들러
  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const viewportHeight = window.innerHeight;
      const draggedVh = (info.offset.y / viewportHeight) * 100;
      const newHeight = Math.max(0, Math.min(maxHeight, currentHeightRef.current - draggedVh));

      // 실시간 업데이트 (애니메이션 없이)
      controls.set({ y: `${100 - newHeight}vh` });
    },
    [controls, maxHeight]
  );

  // 드래그 종료 시 스냅
  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const viewportHeight = window.innerHeight;
      const draggedVh = (info.offset.y / viewportHeight) * 100;
      const velocity = info.velocity.y;
      const currentHeight = currentHeightRef.current - draggedVh;

      // 빠른 스와이프 감지
      if (velocity > 500) {
        // 빠르게 아래로 - 닫기
        haptic.tap();
        onClose();
        return;
      }

      if (velocity < -500 && currentHeight < maxHeight) {
        // 빠르게 위로 - 최대로
        haptic.tap();
        await setSheetHeight(maxHeight);
        return;
      }

      // 스냅 포인트로 이동
      if (currentHeight < closeThreshold) {
        onClose();
      } else if (currentHeight < SNAP_POINTS.peek + 10) {
        await setSheetHeight(SNAP_POINTS.peek);
        haptic.selection();
      } else if (currentHeight < SNAP_POINTS.half + 10) {
        await setSheetHeight(SNAP_POINTS.half);
        haptic.selection();
      } else {
        await setSheetHeight(maxHeight);
        haptic.selection();
      }
    },
    [onClose, maxHeight, closeThreshold, setSheetHeight, haptic]
  );

  // 배경 클릭 핸들러
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      haptic.tap();
      onClose();
    }
  }, [closeOnBackdropClick, onClose, haptic]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: duration.standard } // 200ms
            }
            className="fixed inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: zIndex.modalBackdrop,
            }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100vh' }}
            animate={controls}
            exit={{ y: '100vh' }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: springConfig.smooth.stiffness,
                    damping: springConfig.smooth.damping,
                  }
            }
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={`fixed left-0 right-0 bottom-0 ${className}`}
            style={{
              height: '100vh',
              zIndex: zIndex.modal,
              touchAction: 'none',
              willChange: prefersReducedMotion ? 'auto' : 'transform',
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Sheet Content Container */}
            <div
              className="h-full flex flex-col rounded-t-3xl overflow-hidden"
              style={{
                ...liquidGlass.standard,
                borderTopLeftRadius: radii['3xl'],
                borderTopRightRadius: radii['3xl'],
                boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Handle */}
              {showHandle && (
                <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                  <div
                    className="w-10 h-1 rounded-full"
                    style={{ background: colors.border.emphasis }}
                  />
                </div>
              )}

              {/* Scrollable Content */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{
                  paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 20px)',
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BottomSheet;
