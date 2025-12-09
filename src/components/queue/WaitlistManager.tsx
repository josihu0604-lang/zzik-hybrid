/**
 * Waitlist Manager Component
 * Staff-focused interface for efficient queue management
 * 
 * @description A streamlined interface for restaurant staff to:
 * - Quickly process customers (call, seat, no-show)
 * - View queue at a glance with priority highlighting
 * - Handle multiple actions efficiently
 * - Track daily performance metrics
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Users,
  Clock,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  GripVertical,
  Bell,
  Volume2,
  VolumeX,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  UserCheck,
  UserX,
  Timer,
  Zap,
  RefreshCw,
  Filter,
  SortAsc,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRealtimeQueue, QueueTimeEstimator } from '@/lib/realtime-queue';
import type { QueueEntry } from '@/lib/realtime-queue';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface WaitlistManagerProps {
  restaurantId: string;
  restaurantName: string;
  locale?: string;
  autoCallEnabled?: boolean;
  autoCallInterval?: number; // seconds
  soundEnabled?: boolean;
  onCallCustomer: (entry: QueueEntry) => Promise<void>;
  onSeatCustomer: (entry: QueueEntry) => Promise<void>;
  onMarkNoShow: (entry: QueueEntry) => Promise<void>;
  onCancelEntry: (entry: QueueEntry) => Promise<void>;
  onReorderQueue?: (entries: QueueEntry[]) => Promise<void>;
  onSendMessage?: (entry: QueueEntry, message: string) => Promise<void>;
  className?: string;
}

type SortOption = 'position' | 'waitTime' | 'partySize';
type ViewMode = 'list' | 'cards';

// ============================================================================
// Localization
// ============================================================================

const i18n: Record<string, Record<string, string>> = {
  waitlistManager: {
    en: 'Waitlist Manager',
    ko: '대기 관리',
    ja: '待機リスト管理',
    zh: '等候管理',
  },
  nextUp: {
    en: 'Next Up',
    ko: '다음 순서',
    ja: '次の順番',
    zh: '下一位',
  },
  callNow: {
    en: 'Call Now',
    ko: '지금 호출',
    ja: '今すぐ呼出',
    zh: '立即呼叫',
  },
  seatNow: {
    en: 'Seat Now',
    ko: '바로 입장',
    ja: '今すぐ入場',
    zh: '立即入座',
  },
  waiting: {
    en: 'Waiting',
    ko: '대기 중',
    ja: '待機中',
    zh: '等待中',
  },
  called: {
    en: 'Called',
    ko: '호출됨',
    ja: '呼出済',
    zh: '已呼叫',
  },
  autoCall: {
    en: 'Auto-Call',
    ko: '자동 호출',
    ja: '自動呼出',
    zh: '自动呼叫',
  },
  sound: {
    en: 'Sound',
    ko: '소리',
    ja: 'サウンド',
    zh: '声音',
  },
  partyOf: {
    en: 'Party of',
    ko: '',
    ja: '',
    zh: '',
  },
  people: {
    en: '',
    ko: '명',
    ja: '名',
    zh: '人',
  },
  waitTime: {
    en: 'Wait',
    ko: '대기',
    ja: '待機',
    zh: '等待',
  },
  call: {
    en: 'Call',
    ko: '호출',
    ja: '呼出',
    zh: '呼叫',
  },
  seat: {
    en: 'Seat',
    ko: '입장',
    ja: '入場',
    zh: '入座',
  },
  noShow: {
    en: 'No-Show',
    ko: '노쇼',
    ja: 'ノーショー',
    zh: '爽约',
  },
  cancel: {
    en: 'Cancel',
    ko: '취소',
    ja: 'キャンセル',
    zh: '取消',
  },
  sendMessage: {
    en: 'Send Message',
    ko: '메시지 전송',
    ja: 'メッセージ送信',
    zh: '发送消息',
  },
  callPhone: {
    en: 'Call Phone',
    ko: '전화하기',
    ja: '電話する',
    zh: '打电话',
  },
  moveUp: {
    en: 'Move Up',
    ko: '앞으로',
    ja: '前へ',
    zh: '上移',
  },
  moveDown: {
    en: 'Move Down',
    ko: '뒤로',
    ja: '後へ',
    zh: '下移',
  },
  sortBy: {
    en: 'Sort by',
    ko: '정렬',
    ja: '並び替え',
    zh: '排序',
  },
  position: {
    en: 'Position',
    ko: '순서',
    ja: '順番',
    zh: '位置',
  },
  partySize: {
    en: 'Party Size',
    ko: '인원수',
    ja: '人数',
    zh: '人数',
  },
  emptyQueue: {
    en: 'No customers waiting',
    ko: '대기 중인 손님이 없습니다',
    ja: '待機中のお客様はいません',
    zh: '没有等待的客人',
  },
  calledCustomers: {
    en: 'Called Customers',
    ko: '호출된 손님',
    ja: '呼出済のお客様',
    zh: '已呼叫的客人',
  },
  quickActions: {
    en: 'Quick Actions',
    ko: '빠른 작업',
    ja: 'クイックアクション',
    zh: '快捷操作',
  },
  callNext: {
    en: 'Call Next',
    ko: '다음 호출',
    ja: '次を呼出',
    zh: '呼叫下一位',
  },
  skipNext: {
    en: 'Skip & Call Next',
    ko: '건너뛰고 호출',
    ja: 'スキップして次へ',
    zh: '跳过并呼叫',
  },
  avgWaitTime: {
    en: 'Avg Wait',
    ko: '평균 대기',
    ja: '平均待機',
    zh: '平均等待',
  },
  totalWaiting: {
    en: 'Total Waiting',
    ko: '총 대기',
    ja: '合計待機',
    zh: '总等待',
  },
};

const t = (key: string, locale: string): string => {
  return i18n[key]?.[locale] || i18n[key]?.['en'] || key;
};

// ============================================================================
// Main Component
// ============================================================================

export function WaitlistManager({
  restaurantId,
  restaurantName,
  locale = 'en',
  autoCallEnabled: initialAutoCall = false,
  autoCallInterval = 60,
  soundEnabled: initialSound = true,
  onCallCustomer,
  onSeatCustomer,
  onMarkNoShow,
  onCancelEntry,
  onReorderQueue,
  onSendMessage,
  className,
}: WaitlistManagerProps) {
  const { queue, connectionStatus, refresh } = useRealtimeQueue(restaurantId);
  const [autoCall, setAutoCall] = useState(initialAutoCall);
  const [soundOn, setSoundOn] = useState(initialSound);
  const [sortBy, setSortBy] = useState<SortOption>('position');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Separate waiting and called entries
  const { waitingEntries, calledEntries } = useMemo(() => {
    if (!queue?.entries) {
      return { waitingEntries: [], calledEntries: [] };
    }

    const waiting = queue.entries
      .filter((e) => e.status === 'waiting')
      .sort((a, b) => {
        switch (sortBy) {
          case 'waitTime':
            return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          case 'partySize':
            return b.partySize - a.partySize;
          default:
            return a.position - b.position;
        }
      });

    const called = queue.entries.filter((e) => e.status === 'called');

    return { waitingEntries: waiting, calledEntries: called };
  }, [queue?.entries, sortBy]);

  // Next customer to call
  const nextCustomer = waitingEntries[0];

  // Auto-call logic
  useEffect(() => {
    if (!autoCall || !nextCustomer || calledEntries.length > 0) return;

    const timer = setInterval(() => {
      if (nextCustomer && calledEntries.length === 0) {
        handleCallCustomer(nextCustomer);
      }
    }, autoCallInterval * 1000);

    return () => clearInterval(timer);
  }, [autoCall, nextCustomer, calledEntries, autoCallInterval]);

  // Action handlers with loading state
  const handleCallCustomer = async (entry: QueueEntry) => {
    setProcessingId(entry.id);
    try {
      await onCallCustomer(entry);
      if (soundOn) playNotificationSound();
    } finally {
      setProcessingId(null);
    }
  };

  const handleSeatCustomer = async (entry: QueueEntry) => {
    setProcessingId(entry.id);
    try {
      await onSeatCustomer(entry);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNoShow = async (entry: QueueEntry) => {
    setProcessingId(entry.id);
    try {
      await onMarkNoShow(entry);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (entry: QueueEntry) => {
    setProcessingId(entry.id);
    try {
      await onCancelEntry(entry);
    } finally {
      setProcessingId(null);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    } catch (error) {
      // Sound not available
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalWaiting: waitingEntries.length,
      totalCalled: calledEntries.length,
      avgWaitTime: queue?.averageWaitMinutes || 0,
    };
  }, [waitingEntries, calledEntries, queue?.averageWaitMinutes]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Controls */}
      <ManagerHeader
        stats={stats}
        autoCall={autoCall}
        soundOn={soundOn}
        sortBy={sortBy}
        onAutoCallToggle={() => setAutoCall(!autoCall)}
        onSoundToggle={() => setSoundOn(!soundOn)}
        onSortChange={setSortBy}
        locale={locale}
      />

      {/* Next Up Card */}
      {nextCustomer && (
        <NextUpCard
          entry={nextCustomer}
          isProcessing={processingId === nextCustomer.id}
          onCall={() => handleCallCustomer(nextCustomer)}
          onSeat={() => handleSeatCustomer(nextCustomer)}
          locale={locale}
        />
      )}

      {/* Called Customers */}
      {calledEntries.length > 0 && (
        <CalledSection
          entries={calledEntries}
          processingId={processingId}
          onSeat={handleSeatCustomer}
          onNoShow={handleNoShow}
          locale={locale}
        />
      )}

      {/* Waiting Queue */}
      <WaitingQueue
        entries={waitingEntries.slice(1)} // Exclude first (shown in NextUp)
        processingId={processingId}
        onCall={handleCallCustomer}
        onSeat={handleSeatCustomer}
        onNoShow={handleNoShow}
        onCancel={handleCancel}
        onReorder={onReorderQueue}
        locale={locale}
      />
    </div>
  );
}

// ============================================================================
// Header Controls
// ============================================================================

function ManagerHeader({
  stats,
  autoCall,
  soundOn,
  sortBy,
  onAutoCallToggle,
  onSoundToggle,
  onSortChange,
  locale,
}: {
  stats: { totalWaiting: number; totalCalled: number; avgWaitTime: number };
  autoCall: boolean;
  soundOn: boolean;
  sortBy: SortOption;
  onAutoCallToggle: () => void;
  onSoundToggle: () => void;
  onSortChange: (sort: SortOption) => void;
  locale: string;
}) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-space-800 rounded-lg">
          <Users className="w-4 h-4 text-flame-400" />
          <span className="text-white font-semibold">{stats.totalWaiting}</span>
          <span className="text-gray-500 text-sm">{t('waiting', locale)}</span>
        </div>

        {stats.totalCalled > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg">
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-semibold">{stats.totalCalled}</span>
            <span className="text-blue-400/70 text-sm">{t('called', locale)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 bg-space-800 rounded-lg">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-white font-semibold">
            {QueueTimeEstimator.formatWaitTime(stats.avgWaitTime, locale)}
          </span>
          <span className="text-gray-500 text-sm">{t('avgWaitTime', locale)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Auto-Call Toggle */}
        <button
          onClick={onAutoCallToggle}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            autoCall
              ? 'bg-green-500/20 text-green-400'
              : 'bg-space-800 text-gray-400 hover:text-white'
          )}
        >
          {autoCall ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {t('autoCall', locale)}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onSoundToggle}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            soundOn
              ? 'bg-space-800 text-white'
              : 'bg-space-800 text-gray-500'
          )}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-3 py-1.5 bg-space-800 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            <SortAsc className="w-4 h-4" />
            {t('sortBy', locale)}
          </button>

          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-1 w-36 bg-space-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
              >
                {(['position', 'waitTime', 'partySize'] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSortChange(option);
                      setShowSort(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm transition-colors',
                      sortBy === option
                        ? 'bg-flame-500/20 text-flame-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {t(option, locale)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Next Up Card
// ============================================================================

function NextUpCard({
  entry,
  isProcessing,
  onCall,
  onSeat,
  locale,
}: {
  entry: QueueEntry;
  isProcessing: boolean;
  onCall: () => void;
  onSeat: () => void;
  locale: string;
}) {
  const waitTimeMinutes = Math.floor(
    (Date.now() - new Date(entry.joinedAt).getTime()) / 60000
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card
        variant="glass"
        className="p-0 bg-gradient-to-r from-flame-500/20 to-ember-500/20 border-flame-500/30"
      >
        {/* Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-flame-500 to-ember-500" />

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-flame-400" />
              <span className="font-semibold text-flame-400">{t('nextUp', locale)}</span>
            </div>
            <span className="text-gray-500 text-sm">#{entry.position}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Customer Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                {entry.userName || 'Guest'}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {locale === 'en' ? `Party of ${entry.partySize}` : `${entry.partySize}${t('people', locale)}`}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {waitTimeMinutes}min {t('waitTime', locale)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onCall}
                disabled={isProcessing}
                className="bg-gradient-to-r from-flame-500 to-ember-500 hover:from-flame-600 hover:to-ember-600"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4 mr-2" />
                    {t('callNow', locale)}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={onSeat}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('seatNow', locale)}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Called Section
// ============================================================================

function CalledSection({
  entries,
  processingId,
  onSeat,
  onNoShow,
  locale,
}: {
  entries: QueueEntry[];
  processingId: string | null;
  onSeat: (entry: QueueEntry) => void;
  onNoShow: (entry: QueueEntry) => void;
  locale: string;
}) {
  return (
    <Card variant="glass" padding="none">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">{t('calledCustomers', locale)}</h3>
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
            {entries.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map((entry) => (
          <CalledEntryRow
            key={entry.id}
            entry={entry}
            isProcessing={processingId === entry.id}
            onSeat={() => onSeat(entry)}
            onNoShow={() => onNoShow(entry)}
            locale={locale}
          />
        ))}
      </div>
    </Card>
  );
}

function CalledEntryRow({
  entry,
  isProcessing,
  onSeat,
  onNoShow,
  locale,
}: {
  entry: QueueEntry;
  isProcessing: boolean;
  onSeat: () => void;
  onNoShow: () => void;
  locale: string;
}) {
  const calledMinutesAgo = entry.notified
    ? Math.floor((Date.now() - new Date(entry.joinedAt).getTime()) / 60000)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 flex items-center gap-4 bg-blue-500/5"
    >
      {/* Status Icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-blue-400" />
      </motion.div>

      {/* Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-white">{entry.userName || 'Guest'}</h4>
        <p className="text-sm text-gray-400">
          {locale === 'en' ? `Party of ${entry.partySize}` : `${entry.partySize}${t('people', locale)}`}
          {calledMinutesAgo > 0 && ` • Called ${calledMinutesAgo}min ago`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onSeat}
          disabled={isProcessing}
          className="bg-green-500 hover:bg-green-600"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-1" />
              {t('seat', locale)}
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onNoShow}
          disabled={isProcessing}
          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
        >
          <UserX className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Waiting Queue
// ============================================================================

function WaitingQueue({
  entries,
  processingId,
  onCall,
  onSeat,
  onNoShow,
  onCancel,
  onReorder,
  locale,
}: {
  entries: QueueEntry[];
  processingId: string | null;
  onCall: (entry: QueueEntry) => void;
  onSeat: (entry: QueueEntry) => void;
  onNoShow: (entry: QueueEntry) => void;
  onCancel: (entry: QueueEntry) => void;
  onReorder?: (entries: QueueEntry[]) => Promise<void>;
  locale: string;
}) {
  if (entries.length === 0) {
    return (
      <Card variant="glass" className="text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-500">{t('emptyQueue', locale)}</p>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="none">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-white">{t('waiting', locale)}</h3>
      </div>

      <div className="divide-y divide-white/5">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <WaitingEntryRow
              key={entry.id}
              entry={entry}
              index={index}
              isProcessing={processingId === entry.id}
              onCall={() => onCall(entry)}
              onSeat={() => onSeat(entry)}
              onNoShow={() => onNoShow(entry)}
              onCancel={() => onCancel(entry)}
              locale={locale}
            />
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}

function WaitingEntryRow({
  entry,
  index,
  isProcessing,
  onCall,
  onSeat,
  onNoShow,
  onCancel,
  locale,
}: {
  entry: QueueEntry;
  index: number;
  isProcessing: boolean;
  onCall: () => void;
  onSeat: () => void;
  onNoShow: () => void;
  onCancel: () => void;
  locale: string;
}) {
  const [showActions, setShowActions] = useState(false);
  const waitTimeMinutes = Math.floor(
    (Date.now() - new Date(entry.joinedAt).getTime()) / 60000
  );

  // Highlight long waits
  const isLongWait = waitTimeMinutes > 30;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group',
        isLongWait && 'bg-orange-500/5'
      )}
    >
      {/* Drag Handle */}
      <div className="w-8 text-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4 text-gray-500 mx-auto" />
      </div>

      {/* Position */}
      <div className="w-10 h-10 rounded-full bg-space-700 flex items-center justify-center font-bold text-white">
        #{entry.position}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white truncate">
            {entry.userName || 'Guest'}
          </h4>
          {isLongWait && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
              {waitTimeMinutes}min
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {entry.partySize}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(entry.joinedAt).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCall}
          disabled={isProcessing}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <PhoneCall className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSeat}
          disabled={isProcessing}
          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>

        {/* More Actions */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-white"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-40 bg-space-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
              >
                <button
                  onClick={() => {
                    onNoShow();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {t('noShow', locale)}
                </button>
                <button
                  onClick={() => {
                    onCancel();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {t('cancel', locale)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default WaitlistManager;
