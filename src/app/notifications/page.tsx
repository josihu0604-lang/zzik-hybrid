'use client';

import { useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Bell, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/auth-context';
import { colors, liquidGlass } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 알림 페이지 - 앱스토어 수준 UX
 *
 * Features:
 * - 전체 화면 알림 목록
 * - 읽음 처리
 * - 빈 상태 UI
 */

export default function NotificationsPage() {
  const haptic = useHaptic();
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(
    user?.id ?? null
  );

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      haptic.selection();
      await markAsRead(id);
    },
    [haptic, markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    haptic.tap();
    await markAllAsRead();
  }, [haptic, markAllAsRead]);

  // 알림 타입별 아이콘 색상
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'popup_opened':
        return colors.success;
      case 'popup_reminder':
        return colors.flame[500];
      case 'checkin_success':
        return colors.spark[500];
      default:
        return colors.text.secondary;
    }
  };

  return (
    <div className="min-h-screen bg-space-950">
      {/* 헤더 */}
      <header
        className="sticky top-0 z-50"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          ...liquidGlass.standard,
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500 rounded-lg p-1 -ml-1"
            aria-label="홈으로 돌아가기"
          >
            <ChevronLeft size={24} />
          </Link>

          <h1 className="text-lg font-semibold text-white">알림</h1>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: colors.flame[400],
                }}
                aria-label="모든 알림 읽음 처리"
              >
                <Check size={14} />
                모두 읽음
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 알림 목록 */}
      <div className="px-4 py-4">
        {isLoading ? (
          // 스켈레톤 로딩
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl p-4"
                style={{ background: colors.space[850] }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ background: colors.space[700] }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: colors.space[700] }} />
                    <div className="h-3 rounded w-1/2" style={{ background: colors.space[700] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Bell size={40} style={{ color: colors.text.muted }} />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">알림이 없습니다</h2>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              새로운 팝업 소식이 오면 알려드릴게요
            </p>
          </div>
        ) : (
          // 알림 목록
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <m.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    background: notification.read ? colors.space[850] : 'rgba(255, 107, 91, 0.08)',
                    border: notification.read
                      ? `1px solid ${colors.border.subtle}`
                      : `1px solid rgba(255, 107, 91, 0.2)`,
                  }}
                >
                  <div className="flex gap-3 p-4">
                    {/* 아이콘 */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${getNotificationColor(notification.type)}20`,
                      }}
                    >
                      <Bell size={20} style={{ color: getNotificationColor(notification.type) }} />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          notification.read ? 'text-white/70' : 'text-white'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p
                          className="text-xs mt-1 line-clamp-2"
                          style={{ color: colors.text.secondary }}
                        >
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs mt-2" style={{ color: colors.text.muted }}>
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 rounded-full transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame-500 flex-shrink-0"
                        aria-label="읽음 처리"
                      >
                        <Check size={16} style={{ color: colors.flame[400] }} />
                      </button>
                    )}
                  </div>

                  {/* 읽지 않은 알림 인디케이터 */}
                  {!notification.read && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ background: colors.flame[500] }}
                    />
                  )}
                </m.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
