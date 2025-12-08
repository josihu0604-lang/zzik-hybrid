'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { useNotification } from '@/hooks/useNotification';
import { colors, typography } from '@/lib/design-tokens';

/**
 * NotificationBell - 헤더용 알림 벨 버튼
 */

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotification();

  const handleNotificationClick = (notification: { link?: string; popupId?: string }) => {
    if (notification.link) {
      window.location.href = notification.link;
    } else if (notification.popupId) {
      window.location.href = `/popup/${notification.popupId}`;
    }
    setIsPanelOpen(false);
  };

  return (
    <>
      {/* Bell Button */}
      <m.button
        onClick={() => setIsPanelOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${className}`}
        style={{
          background: unreadCount > 0 ? colors.temperature.cold.bg : 'transparent',
        }}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 새 알림)` : ''}`}
      >
        <Bell
          size={20}
          className={unreadCount > 0 ? '' : 'text-linear-text-secondary'}
          style={{ color: unreadCount > 0 ? colors.flame[500] : undefined }}
        />

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <m.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full font-bold flex items-center justify-center"
              style={{
                background: colors.flame[500],
                color: 'white',
                fontSize: typography.fontSize.xs.size,
                lineHeight: typography.fontSize.xs.lineHeight,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </m.span>
          )}
        </AnimatePresence>

        {/* DES-208: 알림 뱃지 펄스 통합 (2개 → 1개) */}
        {unreadCount > 0 && (
          <m.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${colors.flame[500]}` }}
            animate={{
              scale: [1, 1.5],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            aria-hidden="true"
            role="presentation"
          />
        )}
      </m.button>

      {/* Panel */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onClearAll={clearAll}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
}

export default NotificationBell;
