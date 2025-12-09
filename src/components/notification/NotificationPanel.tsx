'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/hooks/useNotification';
import { colors } from '@/lib/design-tokens';

// DES-115: 성능을 위한 최대 표시 항목 수
const MAX_VISIBLE_NOTIFICATIONS = 50;

/**
 * NotificationPanel - 알림 목록 패널
 */

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  onNotificationClick,
}: NotificationPanelProps) {
  // DES-115: 최대 항목 제한으로 성능 최적화
  const visibleNotifications = useMemo(
    () => notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS),
    [notifications]
  );
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap on Tab
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [isOpen, onClose]
  );

  // Set up focus trap and initial focus
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isOpen) {
      // Save the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button when panel opens
      closeButtonRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus when panel closes
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          />

          {/* Panel */}
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-panel-title"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[50]"
            style={{
              background: 'rgba(8, 9, 10, 0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 pt-safe border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-white" aria-hidden="true" />
                <h2 id="notification-panel-title" className="text-white font-bold text-lg">
                  알림
                </h2>
                {unreadCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(255, 107, 91, 0.2)',
                      color: '#FF6B5B',
                    }}
                  >
                    {unreadCount}개 새 알림
                  </span>
                )}
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500"
                aria-label="알림 패널 닫기"
              >
                <X size={20} className="text-white/60" aria-hidden="true" />
              </button>
            </div>

            {/* Actions */}
            {visibleNotifications.length > 0 && (
              <div
                className="flex items-center gap-2 p-3 border-b"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500"
                    style={{ color: colors.success }}
                    aria-label="모든 알림 읽음 처리"
                  >
                    <Check size={14} aria-hidden="true" />
                    모두 읽음
                  </button>
                )}
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500"
                  style={{ color: colors.error }}
                  aria-label="모든 알림 삭제"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  전체 삭제
                </button>
              </div>
            )}

            {/* Notification List */}
            <div
              className="overflow-y-auto p-3 space-y-2"
              style={{
                maxHeight: 'calc(100dvh - 140px)', // DES-144: dvh 단위 사용
                WebkitOverflowScrolling: 'touch', // DES-115: iOS smooth scrolling
                overscrollBehavior: 'contain', // Pull-to-refresh 방지
              }}
            >
              {visibleNotifications.length > 0 ? (
                <>
                  <AnimatePresence mode="popLayout">
                    {visibleNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={() => onMarkAsRead(notification.id)}
                        onRemove={() => onRemove(notification.id)}
                        onClick={() => onNotificationClick?.(notification)}
                      />
                    ))}
                  </AnimatePresence>
                  {/* 최대 항목 초과 경고 */}
                  {notifications.length > MAX_VISIBLE_NOTIFICATIONS && (
                    <div
                      className="mt-3 p-3 rounded-lg text-center text-xs text-linear-text-tertiary"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {notifications.length - MAX_VISIBLE_NOTIFICATIONS}개 이상의 알림이 숨겨져
                      있습니다. 오래된 알림을 삭제해주세요.
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  role="status"
                  aria-label="알림 없음"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    aria-hidden="true"
                  >
                    <Bell size={32} className="text-linear-text-tertiary" />
                  </div>
                  <p className="text-white/70 text-sm">알림이 없습니다</p>
                  <p className="text-white/50 text-xs mt-1">새로운 소식이 있으면 알려드릴게요</p>
                </div>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationPanel;
