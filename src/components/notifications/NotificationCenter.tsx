/**
 * Notification Center Component
 *
 * Displays notification bell icon with unread badge
 * Dropdown shows recent notifications with type-specific icons
 * ZZIK Design System 2.0: Linear + iOS 26 Liquid Glass
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  MapPin,
  PartyPopper,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { colors } from '@/lib/design-tokens';

interface NotificationCenterProps {
  userId: string | null;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  const iconMap: Record<NotificationType, typeof Bell> = {
    participation_confirmed: Check,
    popup_opened: PartyPopper,
    checkin_verified: MapPin,
    leader_earning: DollarSign,
    tier_upgrade: TrendingUp,
    goal_progress: TrendingUp,
    deadline_reminder: Clock,
    new_popup: Sparkles,
    payout_requested: Wallet,
    payout_confirmed: CheckCircle,
    payout_processing: Loader2,
    payout_completed: CheckCircle,
    payout_rejected: AlertCircle,
  };

  return iconMap[type] || Bell;
}

/**
 * Get color for notification type
 */
function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    participation_confirmed: colors.success, // Green
    popup_opened: colors.flame[500], // Flame
    checkin_verified: colors.info, // Blue
    leader_earning: colors.spark[400], // Spark Yellow
    tier_upgrade: '#a855f7', // Purple
    goal_progress: colors.flame[500], // Flame
    deadline_reminder: colors.warning, // Amber
    new_popup: '#8b5cf6', // Violet
    payout_requested: colors.spark[400], // Spark Yellow
    payout_confirmed: colors.success, // Green
    payout_processing: colors.info, // Blue
    payout_completed: colors.success, // Green
    payout_rejected: '#ef4444', // Red
  };

  return colorMap[type] || '#a8a8a8';
}

/**
 * Format notification time
 */
function formatNotificationTime(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ko,
    });
  } catch {
    return timestamp;
  }
}

/**
 * Notification item component
 */
function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative"
    >
      <button
        onClick={() => onRead(notification.id)}
        className="w-full p-4 flex gap-3 hover:bg-white/[0.03] transition-colors text-left"
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-semibold ${notification.read ? 'text-white/60' : 'text-white'}`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-flame-500" />
            )}
          </div>

          <p
            className={`text-sm ${notification.read ? 'text-white/40' : 'text-white/70'} line-clamp-2`}
          >
            {notification.message}
          </p>

          <p className="text-xs text-white/40 mt-2">
            {formatNotificationTime(notification.created_at)}
          </p>
        </div>
      </button>

      {/* Divider */}
      <div className="h-px bg-white/5" />
    </m.div>
  );
}

/**
 * Main notification center component
 */
export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead } =
    useNotifications(userId);

  // Close dropdown when clicking outside
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!userId) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
        aria-label="알림"
      >
        <Bell className="w-5 h-5 text-white/70" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-micro font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
              boxShadow: '0 2px 8px rgba(255, 107, 91, 0.4)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </m.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] origin-top-right z-50"
          >
            {/* Liquid Glass Card */}
            <div
              className="overflow-hidden rounded-2xl border border-white/10"
              style={{
                background: 'rgba(18, 19, 20, 0.95)',
                backdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">알림</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-flame-500 hover:text-flame-400 font-medium transition-colors"
                      >
                        모두 읽음
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                      aria-label="닫기"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[480px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-flame-500 rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-white/60 mb-2">알림을 불러올 수 없습니다</p>
                    <p className="text-xs text-white/40">{error.message}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/15 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/60">알림이 없습니다</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markAsRead}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // TODO: Navigate to full notifications page
                    }}
                    className="w-full py-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    모든 알림 보기
                  </button>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
