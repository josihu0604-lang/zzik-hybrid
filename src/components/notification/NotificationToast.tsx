'use client';

import { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  PartyPopper,
  Clock,
  MapPin,
  Gift,
  Bell,
  X,
  type LucideIcon,
} from 'lucide-react';
import { colors, zIndex } from '@/lib/design-tokens';
import type { NotificationType, NotificationPriority } from '@/hooks/useNotification';

/**
 * NotificationToast - 실시간 토스트 알림
 */

interface NotificationToastProps {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  /** DES-155: 성공 토스트 duration - 적절한 시간 (3초) */
  duration?: number;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 닫기 핸들러 */
  onClose: () => void;
}

// 타입별 아이콘
const ICONS: Record<NotificationType, LucideIcon> = {
  participation: Users,
  milestone: TrendingUp,
  confirmed: PartyPopper,
  deadline: Clock,
  checkin: MapPin,
  referral: Gift,
  system: Bell,
};

// 타입별 색상
const COLORS: Record<NotificationType, string> = {
  participation: colors.flame[500],
  milestone: colors.spark[500],
  confirmed: colors.success,
  deadline: colors.warning,
  checkin: colors.flame[500],
  referral: colors.spark[500],
  system: colors.info,
};

// 우선순위별 배경
const PRIORITY_BG: Record<NotificationPriority, string> = {
  critical: `${colors.error}26`,
  high: `${colors.flame[500]}1a`,
  normal: `${colors.space[850]}f2`,
  low: `${colors.space[850]}e6`,
};

export function NotificationToast({
  type,
  priority,
  title,
  message,
  // DES-155: 성공/일반 토스트는 3초, 에러는 5초
  duration = type === 'confirmed' || type === 'checkin' ? 3000 : 5000,
  onClick,
  onClose,
}: NotificationToastProps) {
  const Icon = ICONS[type];
  const color = COLORS[type];
  const bg = PRIORITY_BG[priority];

  // PERF-004: 자동 닫힘 타이머 - 50ms 인터벌 대신 단일 setTimeout 사용
  // Progress 애니메이션은 Framer Motion이 처리하므로 state 업데이트 불필요
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (duration === 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <m.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      onClick={onClick}
      className="relative w-full max-w-sm rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: bg,
        backdropFilter: 'blur(24px)',
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px ${color}20`,
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Progress Bar - PERF-004: Framer Motion 자체 애니메이션으로 처리 (state 업데이트 없음) */}
      {duration > 0 && (
        <m.div
          className="absolute bottom-0 left-0 h-0.5"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{
            background: color,
            transformOrigin: 'left',
            width: '100%',
            willChange: 'transform',
          }}
        />
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon size={18} style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold line-clamp-1">{title}</p>
          <p className="text-linear-text-secondary text-xs mt-0.5 line-clamp-2">{message}</p>
        </div>

        {/* Close Button - A11Y-012: 최소 44x44px 터치 영역 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="닫기"
        >
          <X size={16} className="text-linear-text-tertiary" />
        </button>
      </div>
    </m.div>
  );
}

/**
 * NotificationToastContainer - 토스트 컨테이너
 */

interface ToastData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  duration?: number;
  onClick?: () => void;
}

interface NotificationToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function NotificationToastContainer({ toasts, onRemove }: NotificationToastContainerProps) {
  return (
    // DES-156: 에러 토스트 position 조정 - 상단 중앙으로 변경
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4"
      style={{ zIndex: zIndex.notification }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <NotificationToast {...toast} onClose={() => onRemove(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default NotificationToast;
