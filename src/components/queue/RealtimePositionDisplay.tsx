/**
 * Real-time Position Display Component
 * Live-updating queue position visualization with animations
 * 
 * @description An engaging visual display that shows:
 * - Animated position updates
 * - Progress indicator
 * - Time-based countdown
 * - Visual feedback on position changes
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Users,
  Sparkles,
  PartyPopper,
  Timer,
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useRealtimeQueue, QueueTimeEstimator } from '@/lib/realtime-queue';
import type { QueueEntry } from '@/lib/realtime-queue';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface RealtimePositionDisplayProps {
  restaurantId: string;
  userId: string;
  restaurantName?: string;
  onPositionChange?: (oldPosition: number, newPosition: number) => void;
  onQueueComplete?: () => void;
  locale?: string;
  variant?: 'full' | 'compact' | 'mini' | 'floating';
  showQueue?: boolean;
  className?: string;
}

// ============================================================================
// Localization
// ============================================================================

const i18n: Record<string, Record<string, string>> = {
  yourPosition: {
    en: 'Your Position',
    ko: '현재 순번',
    ja: 'あなたの順番',
    zh: '您的位置',
  },
  estimatedWait: {
    en: 'Estimated Wait',
    ko: '예상 대기',
    ja: '予想待機',
    zh: '预计等待',
  },
  inQueue: {
    en: 'in queue',
    ko: '대기 중',
    ja: '待機中',
    zh: '排队中',
  },
  youreNext: {
    en: "You're Next!",
    ko: '다음 차례입니다!',
    ja: '次はあなたです！',
    zh: '下一位是您！',
  },
  almostThere: {
    en: 'Almost There!',
    ko: '거의 다 됐어요!',
    ja: 'もう少し！',
    zh: '快到了！',
  },
  movingUp: {
    en: 'Moving Up',
    ko: '앞으로 이동 중',
    ja: '前進中',
    zh: '前进中',
  },
  pleaseWait: {
    en: 'Please Wait',
    ko: '잠시만 기다려주세요',
    ja: 'お待ちください',
    zh: '请稍候',
  },
  connecting: {
    en: 'Connecting...',
    ko: '연결 중...',
    ja: '接続中...',
    zh: '连接中...',
  },
  connected: {
    en: 'Live',
    ko: '실시간',
    ja: 'ライブ',
    zh: '实时',
  },
  disconnected: {
    en: 'Offline',
    ko: '오프라인',
    ja: 'オフライン',
    zh: '离线',
  },
  positionUp: {
    en: 'position(s) up',
    ko: '칸 앞으로',
    ja: 'つ前進',
    zh: '位置上升',
  },
  queueAhead: {
    en: 'ahead of you',
    ko: '앞에 있음',
    ja: 'あなたの前に',
    zh: '在您前面',
  },
  people: {
    en: 'people',
    ko: '명',
    ja: '人',
    zh: '人',
  },
  expectedAt: {
    en: 'Expected at',
    ko: '예상 시간',
    ja: '予想時間',
    zh: '预计时间',
  },
  partySize: {
    en: 'Party',
    ko: '인원',
    ja: '人数',
    zh: '人数',
  },
};

const t = (key: string, locale: string): string => {
  return i18n[key]?.[locale] || i18n[key]?.['en'] || key;
};

// ============================================================================
// Main Component
// ============================================================================

export function RealtimePositionDisplay({
  restaurantId,
  userId,
  restaurantName,
  onPositionChange,
  onQueueComplete,
  locale = 'en',
  variant = 'full',
  showQueue = false,
  className,
}: RealtimePositionDisplayProps) {
  const { queue, userEntry, connectionStatus, refresh } = useRealtimeQueue(restaurantId, userId);
  const [previousPosition, setPreviousPosition] = useState<number | null>(null);
  const [showPositionChange, setShowPositionChange] = useState(false);
  const [positionDelta, setPositionDelta] = useState(0);

  // Track position changes
  useEffect(() => {
    if (!userEntry) return;

    if (previousPosition !== null && previousPosition !== userEntry.position) {
      const delta = previousPosition - userEntry.position;
      setPositionDelta(delta);
      setShowPositionChange(true);
      onPositionChange?.(previousPosition, userEntry.position);

      // Auto-hide position change indicator
      const timer = setTimeout(() => {
        setShowPositionChange(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    setPreviousPosition(userEntry.position);
  }, [userEntry?.position, previousPosition, onPositionChange]);

  // Check if queue is complete (position 1 and called)
  useEffect(() => {
    if (userEntry?.status === 'called') {
      onQueueComplete?.();
    }
  }, [userEntry?.status, onQueueComplete]);

  // Handle no entry state
  if (!userEntry) {
    return null;
  }

  // Select variant
  switch (variant) {
    case 'mini':
      return (
        <MiniDisplay
          entry={userEntry}
          connectionStatus={connectionStatus}
          positionDelta={positionDelta}
          showPositionChange={showPositionChange}
          locale={locale}
          className={className}
        />
      );
    case 'compact':
      return (
        <CompactDisplay
          entry={userEntry}
          totalInQueue={queue?.totalWaiting || 0}
          connectionStatus={connectionStatus}
          positionDelta={positionDelta}
          showPositionChange={showPositionChange}
          locale={locale}
          className={className}
        />
      );
    case 'floating':
      return (
        <FloatingDisplay
          entry={userEntry}
          restaurantName={restaurantName}
          connectionStatus={connectionStatus}
          positionDelta={positionDelta}
          showPositionChange={showPositionChange}
          locale={locale}
          className={className}
        />
      );
    default:
      return (
        <FullDisplay
          entry={userEntry}
          queue={queue}
          restaurantName={restaurantName}
          connectionStatus={connectionStatus}
          positionDelta={positionDelta}
          showPositionChange={showPositionChange}
          showQueue={showQueue}
          onRefresh={refresh}
          locale={locale}
          className={className}
        />
      );
  }
}

// ============================================================================
// Full Display Variant
// ============================================================================

function FullDisplay({
  entry,
  queue,
  restaurantName,
  connectionStatus,
  positionDelta,
  showPositionChange,
  showQueue,
  onRefresh,
  locale,
  className,
}: {
  entry: QueueEntry;
  queue: any;
  restaurantName?: string;
  connectionStatus: string;
  positionDelta: number;
  showPositionChange: boolean;
  showQueue: boolean;
  onRefresh: () => void;
  locale: string;
  className?: string;
}) {
  const totalWaiting = queue?.totalWaiting || 0;
  const estimatedTime = QueueTimeEstimator.estimateSeatingTime(entry.estimatedWaitMinutes);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Connection Status */}
      <ConnectionBadge status={connectionStatus} onRefresh={onRefresh} locale={locale} />

      {/* Main Position Card */}
      <Card variant="glass" className="relative overflow-hidden p-6">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-flame-500/30 to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="relative">
          {/* Restaurant Name */}
          {restaurantName && (
            <p className="text-gray-400 text-sm mb-2">{restaurantName}</p>
          )}

          {/* Position Display */}
          <AnimatedPosition
            position={entry.position}
            totalInQueue={totalWaiting}
            locale={locale}
          />

          {/* Position Change Indicator */}
          <AnimatePresence>
            {showPositionChange && positionDelta !== 0 && (
              <PositionChangeIndicator delta={positionDelta} locale={locale} />
            )}
          </AnimatePresence>

          {/* Status Message */}
          <StatusMessage position={entry.position} locale={locale} />

          {/* Time Info */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <InfoCard
              label={t('estimatedWait', locale)}
              value={QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
              icon={<Timer className="w-4 h-4" />}
            />
            <InfoCard
              label={t('expectedAt', locale)}
              value={estimatedTime.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              icon={<Clock className="w-4 h-4" />}
            />
            <InfoCard
              label={t('partySize', locale)}
              value={`${entry.partySize} ${t('people', locale)}`}
              icon={<Users className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      <ProgressBar
        position={entry.position}
        totalInQueue={totalWaiting}
        locale={locale}
      />

      {/* Queue List (optional) */}
      {showQueue && queue?.entries && (
        <QueuePreview
          entries={queue.entries.filter((e: QueueEntry) => e.status === 'waiting').slice(0, 5)}
          currentUserId={entry.userId}
          locale={locale}
        />
      )}
    </div>
  );
}

// ============================================================================
// Animated Position
// ============================================================================

function AnimatedPosition({
  position,
  totalInQueue,
  locale,
}: {
  position: number;
  totalInQueue: number;
  locale: string;
}) {
  const animatedValue = useSpring(position, { stiffness: 100, damping: 15 });
  const displayValue = useTransform(animatedValue, (v) => Math.round(v));

  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-sm mb-2">{t('yourPosition', locale)}</p>

      <div className="relative inline-block">
        {/* Glow Effect */}
        <motion.div
          animate={{
            scale: position === 1 ? [1, 1.2, 1] : 1,
            opacity: position === 1 ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-gradient-to-r from-flame-500 to-ember-500 rounded-full blur-2xl"
        />

        {/* Position Circle */}
        <motion.div
          key={position}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-36 h-36 rounded-full bg-gradient-to-br from-flame-500 to-ember-600 flex items-center justify-center shadow-2xl"
        >
          <div className="w-32 h-32 rounded-full bg-space-900 flex items-center justify-center">
            <motion.span
              key={position}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-bold text-white"
            >
              #{position}
            </motion.span>
          </div>
        </motion.div>

        {/* Celebration for position 1 */}
        {position === 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-spark-400 rounded-full flex items-center justify-center"
          >
            <PartyPopper className="w-5 h-5 text-space-900" />
          </motion.div>
        )}
      </div>

      <p className="text-gray-500 text-sm mt-4">
        {totalInQueue} {t('people', locale)} {t('inQueue', locale)}
      </p>
    </div>
  );
}

// ============================================================================
// Position Change Indicator
// ============================================================================

function PositionChangeIndicator({
  delta,
  locale,
}: {
  delta: number;
  locale: string;
}) {
  const isImproving = delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex justify-center"
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full',
          isImproving
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        )}
      >
        {isImproving ? (
          <>
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">
              +{Math.abs(delta)} {t('positionUp', locale)}
            </span>
          </>
        ) : (
          <>
            <TrendingDown className="w-5 h-5" />
            <span className="font-semibold">
              -{Math.abs(delta)} positions
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Status Message
// ============================================================================

function StatusMessage({
  position,
  locale,
}: {
  position: number;
  locale: string;
}) {
  const getMessage = () => {
    if (position === 1) {
      return {
        text: t('youreNext', locale),
        color: 'text-green-400',
        icon: Sparkles,
        bg: 'bg-green-500/10',
      };
    }
    if (position <= 3) {
      return {
        text: t('almostThere', locale),
        color: 'text-blue-400',
        icon: TrendingUp,
        bg: 'bg-blue-500/10',
      };
    }
    if (position <= 5) {
      return {
        text: t('movingUp', locale),
        color: 'text-purple-400',
        icon: ChevronUp,
        bg: 'bg-purple-500/10',
      };
    }
    return {
      text: t('pleaseWait', locale),
      color: 'text-gray-400',
      icon: Clock,
      bg: 'bg-gray-500/10',
    };
  };

  const { text, color, icon: Icon, bg } = getMessage();

  return (
    <motion.div
      key={position}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div className={cn('flex items-center gap-2 px-4 py-2 rounded-full', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
        <span className={cn('font-medium', color)}>{text}</span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Info Card
// ============================================================================

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center p-3 bg-space-800/50 rounded-xl">
      <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}

// ============================================================================
// Progress Bar
// ============================================================================

function ProgressBar({
  position,
  totalInQueue,
  locale,
}: {
  position: number;
  totalInQueue: number;
  locale: string;
}) {
  const progress = useMemo(() => {
    if (totalInQueue === 0) return 100;
    return Math.max(0, Math.min(100, ((totalInQueue - position + 1) / totalInQueue) * 100));
  }, [position, totalInQueue]);

  const animatedProgress = useSpring(progress, { stiffness: 50, damping: 20 });

  return (
    <Card variant="glass" padding="sm" className="overflow-hidden">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-400">Progress</span>
        <motion.span className="font-semibold text-flame-400">
          {Math.round(progress)}%
        </motion.span>
      </div>

      <div className="relative h-3 bg-space-800 rounded-full overflow-hidden">
        {/* Animated Shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Progress Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-flame-500 to-ember-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Markers */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>#{position}</span>
        <span>#{1}</span>
      </div>
    </Card>
  );
}

// ============================================================================
// Connection Badge
// ============================================================================

function ConnectionBadge({
  status,
  onRefresh,
  locale,
}: {
  status: string;
  onRefresh: () => void;
  locale: string;
}) {
  const config = {
    connected: {
      icon: Wifi,
      text: t('connected', locale),
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    connecting: {
      icon: RefreshCw,
      text: t('connecting', locale),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    disconnected: {
      icon: WifiOff,
      text: t('disconnected', locale),
      color: 'text-red-400',
      bg: 'bg-red-500/20',
    },
  };

  const { icon: Icon, text, color, bg } = config[status as keyof typeof config] || config.disconnected;

  return (
    <div className="flex items-center justify-between">
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm', bg)}>
        <Icon className={cn('w-4 h-4', color, status === 'connecting' && 'animate-spin')} />
        <span className={color}>{text}</span>
      </div>

      {status === 'disconnected' && (
        <button
          onClick={onRefresh}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Queue Preview
// ============================================================================

function QueuePreview({
  entries,
  currentUserId,
  locale,
}: {
  entries: QueueEntry[];
  currentUserId: string;
  locale: string;
}) {
  return (
    <Card variant="glass" padding="sm">
      <p className="text-gray-400 text-sm mb-3">{t('queueAhead', locale)}</p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg',
              entry.userId === currentUserId
                ? 'bg-flame-500/20 border border-flame-500/30'
                : 'bg-space-800'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-space-700 flex items-center justify-center text-sm font-bold text-white">
              #{entry.position}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">
                {entry.userId === currentUserId ? 'You' : entry.userName || 'Guest'}
              </p>
            </div>
            <span className="text-gray-500 text-xs">
              {entry.partySize} {t('people', locale)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Compact Display Variant
// ============================================================================

function CompactDisplay({
  entry,
  totalInQueue,
  connectionStatus,
  positionDelta,
  showPositionChange,
  locale,
  className,
}: {
  entry: QueueEntry;
  totalInQueue: number;
  connectionStatus: string;
  positionDelta: number;
  showPositionChange: boolean;
  locale: string;
  className?: string;
}) {
  return (
    <Card variant="glass" className={cn('p-4', className)}>
      <div className="flex items-center gap-4">
        {/* Position */}
        <motion.div
          key={entry.position}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flame-500 to-ember-600 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-white">#{entry.position}</span>
        </motion.div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{t('yourPosition', locale)}</span>
            <AnimatePresence>
              {showPositionChange && positionDelta > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-400 text-sm flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" />+{positionDelta}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {totalInQueue} {t('inQueue', locale)}
            </span>
          </div>
        </div>

        {/* Connection */}
        <div className={cn(
          'w-2 h-2 rounded-full',
          connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
        )} />
      </div>
    </Card>
  );
}

// ============================================================================
// Mini Display Variant
// ============================================================================

function MiniDisplay({
  entry,
  connectionStatus,
  positionDelta,
  showPositionChange,
  locale,
  className,
}: {
  entry: QueueEntry;
  connectionStatus: string;
  positionDelta: number;
  showPositionChange: boolean;
  locale: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        key={entry.position}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-flame-500 to-ember-500 flex items-center justify-center"
      >
        <span className="text-sm font-bold text-white">#{entry.position}</span>
      </motion.div>
      <div>
        <p className="text-white text-sm font-medium">
          {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
        </p>
        <AnimatePresence>
          {showPositionChange && positionDelta > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-400 text-xs flex items-center gap-1"
            >
              <ChevronUp className="w-3 h-3" />+{positionDelta}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// Floating Display Variant
// ============================================================================

function FloatingDisplay({
  entry,
  restaurantName,
  connectionStatus,
  positionDelta,
  showPositionChange,
  locale,
  className,
}: {
  entry: QueueEntry;
  restaurantName?: string;
  connectionStatus: string;
  positionDelta: number;
  showPositionChange: boolean;
  locale: string;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={cn(
        'fixed bottom-20 right-4 z-40',
        className
      )}
    >
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'bg-space-850 border border-white/10 rounded-2xl shadow-2xl cursor-pointer overflow-hidden',
          isExpanded ? 'w-72' : 'w-auto'
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Position Badge */}
            <motion.div
              key={entry.position}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-flame-500 to-ember-600 flex items-center justify-center flex-shrink-0"
            >
              <span className="text-xl font-bold text-white">#{entry.position}</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-white font-semibold whitespace-nowrap">
                    {restaurantName || t('yourPosition', locale)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
                    <Users className="w-3.5 h-3.5 ml-2" />
                    {entry.partySize}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connection Indicator */}
            <div
              className={cn(
                'w-2 h-2 rounded-full absolute top-2 right-2',
                connectionStatus === 'connected'
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-gray-500'
              )}
            />
          </div>

          {/* Position Change */}
          <AnimatePresence>
            {showPositionChange && positionDelta > 0 && isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-3 py-1.5 rounded-lg"
              >
                <TrendingUp className="w-4 h-4" />
                +{positionDelta} {t('positionUp', locale)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RealtimePositionDisplay;
