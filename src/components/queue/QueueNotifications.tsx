/**
 * Queue Notification System
 * Push notifications and in-app alerts for queue updates
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Check,
  X,
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
  Party,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/queue-store';
import type { QueueNotification } from '@/stores/queue-store';
import type { QueueEntry } from '@/lib/realtime-queue';

interface QueueNotificationsProps {
  entry?: QueueEntry;
  restaurantName: string;
  locale?: string;
}

export function QueueNotifications({
  entry,
  restaurantName,
  locale = 'en',
}: QueueNotificationsProps) {
  const { notifications, addNotification, markAsRead, unreadCount } = useNotificationStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [lastPosition, setLastPosition] = useState<number | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Monitor position changes and send notifications
  useEffect(() => {
    if (!entry) return;

    // Position improved significantly (moved up 3+ spots)
    if (lastPosition !== null && lastPosition - entry.position >= 3) {
      addNotification({
        type: 'position_update',
        title: getLocalizedText('positionImproved', locale),
        message: getLocalizedText('positionImprovedMsg', locale, {
          position: entry.position,
          moved: lastPosition - entry.position,
        }),
        restaurantId: entry.restaurantId,
        restaurantName,
      });
    }

    // Almost ready (top 3)
    if (entry.position <= 3 && (lastPosition === null || lastPosition > 3)) {
      addNotification({
        type: 'almost_ready',
        title: getLocalizedText('almostReady', locale),
        message: getLocalizedText('almostReadyMsg', locale, { position: entry.position }),
        restaurantId: entry.restaurantId,
        restaurantName,
      });
    }

    // Your turn (position 1)
    if (entry.position === 1 && (lastPosition === null || lastPosition > 1)) {
      addNotification({
        type: 'ready',
        title: getLocalizedText('yourTurn', locale),
        message: getLocalizedText('yourTurnMsg', locale),
        restaurantId: entry.restaurantId,
        restaurantName,
      });

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    setLastPosition(entry.position);
  }, [entry, lastPosition, addNotification, restaurantName, locale]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Permission Request */}
      {permission === 'default' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                {getLocalizedText('enableNotifications', locale)}
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                {getLocalizedText('enableNotificationsMsg', locale)}
              </p>
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {getLocalizedText('enable', locale)}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notification Status */}
      {permission === 'denied' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <BellOff className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-orange-700">
                {getLocalizedText('notificationsBlocked', locale)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* In-app Notifications */}
      <NotificationList
        notifications={notifications.slice(0, 5)}
        onMarkAsRead={markAsRead}
        locale={locale}
      />
    </div>
  );
}

/**
 * Notification List Component
 */
function NotificationList({
  notifications,
  onMarkAsRead,
  locale,
}: {
  notifications: QueueNotification[];
  onMarkAsRead: (id: string) => void;
  locale: string;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 px-2">
        {getLocalizedText('recentUpdates', locale)}
      </h4>

      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            locale={locale}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Notification Card
 */
function NotificationCard({
  notification,
  onMarkAsRead,
  locale,
}: {
  notification: QueueNotification;
  onMarkAsRead: (id: string) => void;
  locale: string;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'position_update':
        return <TrendingUp className="w-5 h-5" />;
      case 'almost_ready':
        return <Clock className="w-5 h-5" />;
      case 'ready':
        return <Party className="w-5 h-5" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'position_update':
        return 'from-blue-500 to-cyan-500';
      case 'almost_ready':
        return 'from-purple-500 to-pink-500';
      case 'ready':
        return 'from-green-500 to-emerald-500';
      case 'cancelled':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`relative overflow-hidden rounded-xl shadow-md ${
        notification.read ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getColor()}`} />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor()} flex items-center justify-center text-white flex-shrink-0`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 mb-0.5">
              {notification.title}
            </h5>
            <p className="text-sm text-gray-600 mb-1">
              {notification.message}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{notification.restaurantName}</span>
              <span>•</span>
              <span>{formatTimestamp(notification.timestamp, locale)}</span>
            </div>
          </div>

          {/* Actions */}
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Mark as read"
            >
              <Check className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full"
        />
      )}
    </motion.div>
  );
}

/**
 * Floating notification badge
 */
export function QueueNotificationBadge() {
  const { unreadCount } = useNotificationStore();

  if (unreadCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </motion.div>
  );
}

/**
 * Notification toast popup
 */
export function QueueNotificationToast({
  notification,
  onClose,
}: {
  notification: QueueNotification;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-4 right-4 z-50 max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600">
              {notification.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 origin-left"
      />
    </motion.div>
  );
}

/**
 * Localized text helper
 */
function getLocalizedText(key: string, locale: string, params?: any): string {
  const texts: Record<string, Record<string, string>> = {
    positionImproved: {
      en: 'Position Improved!',
      ko: '순서가 올라갔어요!',
      ja: '順番が上がりました！',
      zh: '位置提升了！',
    },
    positionImprovedMsg: {
      en: `You moved up to #${params?.position} (${params?.moved} spots forward)`,
      ko: `${params?.position}번으로 ${params?.moved}칸 앞으로 이동했어요`,
      ja: `${params?.position}番に${params?.moved}つ前進しました`,
      zh: `您移动到了第${params?.position}位（前进${params?.moved}位）`,
    },
    almostReady: {
      en: 'Almost There!',
      ko: '거의 다 됐어요!',
      ja: 'もうすぐです！',
      zh: '快到了！',
    },
    almostReadyMsg: {
      en: `You're #${params?.position}. Please get ready!`,
      ko: `${params?.position}번째입니다. 준비해주세요!`,
      ja: `${params?.position}番目です。準備してください！`,
      zh: `您是第${params?.position}位。请准备！`,
    },
    yourTurn: {
      en: "It's Your Turn!",
      ko: '입장하실 차례예요!',
      ja: 'あなたの番です！',
      zh: '轮到你了！',
    },
    yourTurnMsg: {
      en: 'Please proceed to the restaurant entrance.',
      ko: '식당 입구로 가주세요.',
      ja: 'レストランの入口へお進みください。',
      zh: '请前往餐厅入口。',
    },
    enableNotifications: {
      en: 'Enable Notifications',
      ko: '알림 활성화',
      ja: '通知を有効にする',
      zh: '启用通知',
    },
    enableNotificationsMsg: {
      en: 'Get notified when your turn is approaching',
      ko: '차례가 가까워지면 알림을 받으세요',
      ja: '順番が近づいたら通知を受け取る',
      zh: '当您的轮到您时会收到通知',
    },
    enable: {
      en: 'Enable',
      ko: '활성화',
      ja: '有効化',
      zh: '启用',
    },
    notificationsBlocked: {
      en: 'Notifications are blocked. Please enable them in your browser settings.',
      ko: '알림이 차단되었습니다. 브라우저 설정에서 활성화해주세요.',
      ja: '通知がブロックされています。ブラウザ設定で有効にしてください。',
      zh: '通知被阻止。请在浏览器设置中启用。',
    },
    recentUpdates: {
      en: 'Recent Updates',
      ko: '최근 업데이트',
      ja: '最近の更新',
      zh: '最近更新',
    },
  };

  return texts[key]?.[locale] || texts[key]?.['en'] || key;
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp: Date, locale: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) {
    return locale === 'ko' ? '방금 전' :
           locale === 'ja' ? 'たった今' :
           locale === 'zh' ? '刚刚' :
           'Just now';
  }

  if (minutes < 60) {
    return locale === 'ko' ? `${minutes}분 전` :
           locale === 'ja' ? `${minutes}分前` :
           locale === 'zh' ? `${minutes}分钟前` :
           `${minutes}m ago`;
  }

  if (hours < 24) {
    return locale === 'ko' ? `${hours}시간 전` :
           locale === 'ja' ? `${hours}時間前` :
           locale === 'zh' ? `${hours}小时前` :
           `${hours}h ago`;
  }

  return new Date(timestamp).toLocaleDateString(locale);
}
