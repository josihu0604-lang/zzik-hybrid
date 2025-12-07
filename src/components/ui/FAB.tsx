'use client';

import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTouchTargetStyle } from '@/lib/mobile-ux';
import { colors, radii, shadows } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * DES-113: FAB (Floating Action Button)
 *
 * Features:
 * - 56px 최소 터치 영역 (comfortable)
 * - Safe area 고려
 * - 햅틱 피드백
 * - Scroll-based hide/show
 */

interface FABProps {
  /** 아이콘 또는 컴포넌트 */
  icon: ReactNode;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 라벨 (선택적) */
  label?: string;
  /** 표시 여부 */
  show?: boolean;
  /** 위치 */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** 배경색 */
  backgroundColor?: string;
  /** 하단 오프셋 (px) */
  bottomOffset?: number;
  /** 확장형 여부 */
  extended?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 접근성 레이블 (필수) */
  'aria-label'?: string;
}

export function FAB({
  icon,
  onClick,
  label,
  show = true,
  position = 'bottom-right',
  backgroundColor = colors.flame[500],
  bottomOffset = 88, // BottomNav(80px) + 여유(8px)
  extended = false,
  loading = false,
  'aria-label': ariaLabel,
}: FABProps) {
  const haptic = useHaptic();

  const getPositionStyle = () => {
    const base = {
      bottom: `max(${bottomOffset}px, calc(env(safe-area-inset-bottom) + ${bottomOffset}px))`,
    };

    switch (position) {
      case 'bottom-left':
        return { ...base, left: '20px' };
      case 'bottom-center':
        return { ...base, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
      default:
        return { ...base, right: '20px' };
    }
  };

  const handleClick = () => {
    haptic.tap();
    onClick();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={loading}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          className="fixed z-50 flex items-center justify-center gap-2 font-semibold text-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            ...getPositionStyle(),
            ...(extended ? {} : getTouchTargetStyle('comfortable')),
            ...(extended ? { padding: '16px 24px', minHeight: '56px' } : {}),
            background: backgroundColor,
            borderRadius: extended ? radii['2xl'] : '50%',
            boxShadow: `${shadows.glow.primary}, 0 8px 24px rgba(0, 0, 0, 0.3)`,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
          aria-label={ariaLabel || label || '빠른 액션 버튼'}
          aria-busy={loading}
        >
          {/* Loading state */}
          {loading ? (
            <motion.div
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              {/* Icon */}
              <span className="inline-flex items-center justify-center">{icon}</span>

              {/* Extended label */}
              {extended && label && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </>
          )}

          {/* Glass highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              borderRadius: extended ? `${radii['2xl']} ${radii['2xl']} 0 0` : '50% 50% 0 0',
            }}
            aria-hidden="true"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * FAB Menu (다중 액션)
 */
interface FABMenuItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface FABMenuProps {
  /** 메인 아이콘 */
  icon: ReactNode;
  /** 메뉴 아이템들 */
  items: FABMenuItem[];
  /** 표시 여부 */
  show?: boolean;
  /** 위치 */
  position?: 'bottom-right' | 'bottom-left';
}

export function FABMenu({ icon, items, show = true, position = 'bottom-right' }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptic = useHaptic();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    haptic.selection();
  };

  const handleItemClick = (item: FABMenuItem) => {
    item.onClick();
    setIsOpen(false);
    haptic.tap();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
            style={{ backdropFilter: 'blur(4px)' }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen &&
          items.map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item)}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="fixed z-50 flex items-center gap-3 font-medium text-white shadow-xl"
              style={{
                ...getTouchTargetStyle('min'),
                [position === 'bottom-right' ? 'right' : 'left']: '20px',
                bottom: `${168 + index * 72}px`, // 88 (base) + 80 (FAB) + 72*index
                background: 'rgba(18, 19, 20, 0.95)',
                backdropFilter: 'blur(24px) saturate(180%)',
                borderRadius: radii.xl,
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              aria-label={item.label}
            >
              <span className="inline-flex items-center justify-center">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </motion.button>
          ))}
      </AnimatePresence>

      {/* Main FAB */}
      <FAB
        icon={
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {icon}
          </motion.div>
        }
        onClick={handleToggle}
        show={show}
        position={position}
        label={isOpen ? '닫기' : undefined}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      />
    </>
  );
}

export default FAB;
