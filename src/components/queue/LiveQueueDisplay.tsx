/**
 * Live Queue Display Component
 * Real-time restaurant queue visualization with animations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, TrendingUp, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeQueue, QueueTimeEstimator } from '@/lib/realtime-queue';
import { useQueueStore } from '@/stores/queue-store';
import { useLocale } from '@/hooks/useLocale';
import type { QueueEntry } from '@/lib/realtime-queue';

interface LiveQueueDisplayProps {
  restaurantId: string;
  restaurantName: string;
  userId?: string;
  showFullQueue?: boolean;
  className?: string;
}

export function LiveQueueDisplay({
  restaurantId,
  restaurantName,
  userId,
  showFullQueue = false,
  className = '',
}: LiveQueueDisplayProps) {
  const { t, locale } = useLocale();
  const { queue, userEntry, connectionStatus, error, refresh } = useRealtimeQueue(
    restaurantId,
    userId
  );

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  // Auto-refresh fallback if SSE fails
  useEffect(() => {
    if (error || !isConnected) {
      const interval = setInterval(refresh, 15000); // Fallback: poll every 15s
      return () => clearInterval(interval);
    }
  }, [error, isConnected, refresh]);

  if (!queue) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('queue.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <ConnectionStatus
        status={connectionStatus}
        error={error}
        onRetry={refresh}
      />

      {/* Queue Stats */}
      <QueueStats queue={queue} locale={locale} />

      {/* User Entry (if in queue) */}
      {userEntry && (
        <UserQueueCard
          entry={userEntry}
          restaurantName={restaurantName}
          locale={locale}
        />
      )}

      {/* Full Queue List */}
      {showFullQueue && (
        <QueueList
          entries={queue.entries.filter(e => e.status === 'waiting')}
          currentUserId={userId}
          locale={locale}
        />
      )}
    </div>
  );
}

/**
 * Connection Status Indicator
 */
function ConnectionStatus({
  status,
  error,
  onRetry,
}: {
  status: 'connected' | 'connecting' | 'disconnected';
  error: Error | null;
  onRetry: () => void;
}) {
  if (status === 'connected') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg"
      >
        <Wifi className="w-4 h-4" />
        <span>Live updates active</span>
      </motion.div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>{error ? 'Connection lost' : 'Disconnected'}</span>
      </div>
      <button
        onClick={onRetry}
        className="text-xs font-medium underline hover:no-underline"
      >
        Retry
      </button>
    </motion.div>
  );
}

/**
 * Queue Statistics
 */
function QueueStats({
  queue,
  locale,
}: {
  queue: any;
  locale: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{queue.totalWaiting}</p>
            <p className="text-xs text-gray-600">
              {locale === 'ko' ? '대기 중' :
               locale === 'ja' ? '待機中' :
               locale === 'zh' ? '等待中' :
               'Waiting'}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {QueueTimeEstimator.formatWaitTime(queue.averageWaitMinutes, locale)}
            </p>
            <p className="text-xs text-gray-600">
              {locale === 'ko' ? '평균 대기' :
               locale === 'ja' ? '平均待機' :
               locale === 'zh' ? '平均等待' :
               'Avg. Wait'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * User Queue Card (for user's own position)
 */
function UserQueueCard({
  entry,
  restaurantName,
  locale,
}: {
  entry: QueueEntry;
  restaurantName: string;
  locale: string;
}) {
  const estimatedTime = QueueTimeEstimator.estimateSeatingTime(entry.estimatedWaitMinutes);
  const [timeLeft, setTimeLeft] = useState(entry.estimatedWaitMinutes);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((estimatedTime.getTime() - now.getTime()) / 60000));
      setTimeLeft(diff);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-white/5">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">{restaurantName}</p>
            <h3 className="text-2xl font-bold">
              {locale === 'ko' ? '대기 번호' :
               locale === 'ja' ? '待機番号' :
               locale === 'zh' ? '等待号码' :
               'Queue Position'}
            </h3>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <span className="text-3xl font-bold">#{entry.position}</span>
          </motion.div>
        </div>

        <div className="space-y-3">
          {/* Estimated wait time */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {locale === 'ko' ? '예상 대기 시간' :
                 locale === 'ja' ? '予想待機時間' :
                 locale === 'zh' ? '预计等待时间' :
                 'Estimated Wait'}
              </span>
            </div>
            <span className="font-bold">
              {QueueTimeEstimator.formatWaitTime(timeLeft, locale)}
            </span>
          </div>

          {/* Party size */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {locale === 'ko' ? '인원' :
                 locale === 'ja' ? '人数' :
                 locale === 'zh' ? '人数' :
                 'Party Size'}
              </span>
            </div>
            <span className="font-bold">{entry.partySize}</span>
          </div>

          {/* Estimated seating time */}
          <div className="text-center pt-2 border-t border-white/20">
            <p className="text-xs opacity-75">
              {locale === 'ko' ? '예상 입장 시간' :
               locale === 'ja' ? '予想入場時間' :
               locale === 'zh' ? '预计入场时间' :
               'Expected Seating'}
            </p>
            <p className="text-lg font-semibold mt-1">
              {estimatedTime.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Queue List (all waiting entries)
 */
function QueueList({
  entries,
  currentUserId,
  locale,
}: {
  entries: QueueEntry[];
  currentUserId?: string;
  locale: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 px-2">
        {locale === 'ko' ? '전체 대기 명단' :
         locale === 'ja' ? '全待機リスト' :
         locale === 'zh' ? '全部等待名单' :
         'Full Queue'}
      </h4>

      <AnimatePresence mode="popLayout">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            layout
            className={`flex items-center justify-between p-4 rounded-xl ${
              entry.userId === currentUserId
                ? 'bg-purple-50 border-2 border-purple-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  entry.userId === currentUserId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                #{entry.position}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {entry.userId === currentUserId ? (
                    <span className="flex items-center gap-1">
                      {locale === 'ko' ? '나' :
                       locale === 'ja' ? '私' :
                       locale === 'zh' ? '我' :
                       'You'}
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </span>
                  ) : (
                    entry.userName || 'Guest'
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.partySize}{' '}
                  {locale === 'ko' ? '명' :
                   locale === 'ja' ? '名' :
                   locale === 'zh' ? '人' :
                   'people'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(entry.joinedAt).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>
            {locale === 'ko' ? '대기 중인 손님이 없습니다' :
             locale === 'ja' ? '待機中のお客様はいません' :
             locale === 'zh' ? '没有等待的客人' :
             'No one in queue'}
          </p>
        </div>
      )}
    </div>
  );
}
