'use client';

import { m } from '@/lib/motion';
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
import { colors, opacity } from '@/lib/design-tokens';
import type { Notification, NotificationType } from '@/hooks/useNotification';

/**
 * NotificationItem - 개별 알림 아이템
 */

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
  onClick?: () => void;
}

// 타입별 아이콘 컴포넌트
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

export function NotificationItem({
  notification,
  onRead,
  onRemove,
  onClick,
}: NotificationItemProps) {
  const Icon = ICONS[notification.type];
  const color = COLORS[notification.type];

  // 시간 포맷
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    onClick?.();
  };

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
      onClick={handleClick}
      className={`relative flex gap-3 p-4 rounded-xl cursor-pointer transition-colors ${
        notification.read ? 'opacity-60' : ''
      }`}
      style={{
        background: notification.read ? `rgba(255, 255, 255, ${opacity[5]})` : colors.border.subtle,
        border: notification.read
          ? `1px solid ${colors.border.subtle}`
          : `1px solid ${color}${Math.round(opacity[15] * 255)
              .toString(16)
              .padStart(2, '0')}`,
      }}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div
          className="absolute top-4 left-0 w-1 h-8 rounded-r-full"
          style={{ background: color }}
        />
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color}${Math.round(opacity[15] * 255)
            .toString(16)
            .padStart(2, '0')}`,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white text-sm font-medium line-clamp-1">{notification.title}</p>
          <span className="text-linear-text-tertiary text-xs whitespace-nowrap">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-linear-text-secondary text-xs mt-1 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1 rounded-full opacity-0 hover:opacity-100 hover:bg-white/10 transition-all"
        aria-label="알림 삭제"
      >
        <X size={12} className="text-linear-text-tertiary" />
      </button>
    </m.div>
  );
}

export default NotificationItem;
