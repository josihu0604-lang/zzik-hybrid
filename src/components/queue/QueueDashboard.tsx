/**
 * Restaurant Queue Dashboard Component
 * Admin/staff interface for managing restaurant waitlist
 * 
 * @description Full-featured dashboard for restaurant owners to:
 * - View current queue status
 * - Call next customers
 * - Manage queue entries (seat, no-show, cancel)
 * - View analytics and insights
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Settings,
  ChevronRight,
  UserPlus,
  UserMinus,
  Timer,
  Zap,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, GlassCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRealtimeQueue, QueueTimeEstimator } from '@/lib/realtime-queue';
import type { QueueEntry, RestaurantQueue } from '@/lib/realtime-queue';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface QueueDashboardProps {
  restaurantId: string;
  restaurantName: string;
  locale?: string;
  onCallCustomer?: (entry: QueueEntry) => Promise<void>;
  onSeatCustomer?: (entry: QueueEntry) => Promise<void>;
  onMarkNoShow?: (entry: QueueEntry) => Promise<void>;
  onCancelEntry?: (entry: QueueEntry) => Promise<void>;
  onAddManualEntry?: (data: ManualEntryData) => Promise<void>;
  className?: string;
}

interface ManualEntryData {
  guestName: string;
  phoneNumber: string;
  partySize: number;
  specialRequests?: string;
}

type QueueFilterStatus = 'all' | 'waiting' | 'called' | 'seated' | 'no_show';

// ============================================================================
// Localization
// ============================================================================

const i18n: Record<string, Record<string, string>> = {
  dashboard: {
    en: 'Queue Dashboard',
    ko: '대기열 대시보드',
    ja: '待機リストダッシュボード',
    zh: '排队仪表板',
  },
  currentlyWaiting: {
    en: 'Currently Waiting',
    ko: '현재 대기 중',
    ja: '現在待機中',
    zh: '当前等待',
  },
  avgWaitTime: {
    en: 'Avg. Wait Time',
    ko: '평균 대기시간',
    ja: '平均待機時間',
    zh: '平均等待时间',
  },
  seatedToday: {
    en: 'Seated Today',
    ko: '오늘 입장',
    ja: '本日入場',
    zh: '今日入座',
  },
  noShowRate: {
    en: 'No-Show Rate',
    ko: '노쇼율',
    ja: 'ノーショー率',
    zh: '爽约率',
  },
  callNext: {
    en: 'Call Next',
    ko: '다음 호출',
    ja: '次を呼出',
    zh: '呼叫下一位',
  },
  addGuest: {
    en: 'Add Guest',
    ko: '손님 추가',
    ja: 'ゲスト追加',
    zh: '添加客人',
  },
  search: {
    en: 'Search by name or phone...',
    ko: '이름 또는 전화번호로 검색...',
    ja: '名前または電話番号で検索...',
    zh: '按姓名或电话搜索...',
  },
  queueList: {
    en: 'Queue List',
    ko: '대기 명단',
    ja: '待機リスト',
    zh: '排队列表',
  },
  all: {
    en: 'All',
    ko: '전체',
    ja: '全て',
    zh: '全部',
  },
  waiting: {
    en: 'Waiting',
    ko: '대기',
    ja: '待機中',
    zh: '等待中',
  },
  called: {
    en: 'Called',
    ko: '호출됨',
    ja: '呼出済',
    zh: '已呼叫',
  },
  seated: {
    en: 'Seated',
    ko: '입장완료',
    ja: '入場済',
    zh: '已入座',
  },
  noShow: {
    en: 'No-Show',
    ko: '노쇼',
    ja: 'ノーショー',
    zh: '爽约',
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
  cancel: {
    en: 'Cancel',
    ko: '취소',
    ja: 'キャンセル',
    zh: '取消',
  },
  markNoShow: {
    en: 'No-Show',
    ko: '노쇼',
    ja: 'ノーショー',
    zh: '爽约',
  },
  people: {
    en: 'people',
    ko: '명',
    ja: '名',
    zh: '人',
  },
  joinedAt: {
    en: 'Joined',
    ko: '등록',
    ja: '登録',
    zh: '加入',
  },
  estWait: {
    en: 'Est. Wait',
    ko: '예상 대기',
    ja: '予想待機',
    zh: '预计等待',
  },
  noEntries: {
    en: 'No entries in queue',
    ko: '대기열에 항목이 없습니다',
    ja: '待機リストにエントリがありません',
    zh: '队列中没有条目',
  },
  refreshing: {
    en: 'Refreshing...',
    ko: '새로고침 중...',
    ja: '更新中...',
    zh: '刷新中...',
  },
  liveUpdates: {
    en: 'Live Updates',
    ko: '실시간 업데이트',
    ja: 'リアルタイム更新',
    zh: '实时更新',
  },
  todayStats: {
    en: "Today's Performance",
    ko: '오늘의 성과',
    ja: '本日のパフォーマンス',
    zh: '今日业绩',
  },
};

const t = (key: string, locale: string): string => {
  return i18n[key]?.[locale] || i18n[key]?.['en'] || key;
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

export function QueueDashboard({
  restaurantId,
  restaurantName,
  locale = 'en',
  onCallCustomer,
  onSeatCustomer,
  onMarkNoShow,
  onCancelEntry,
  onAddManualEntry,
  className,
}: QueueDashboardProps) {
  const { queue, connectionStatus, refresh } = useRealtimeQueue(restaurantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<QueueFilterStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter entries based on search and status
  const filteredEntries = useMemo(() => {
    if (!queue?.entries) return [];

    return queue.entries.filter((entry) => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'no_show' && entry.status !== 'expired') return false;
        if (filterStatus !== 'no_show' && entry.status !== filterStatus) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = entry.userName?.toLowerCase().includes(query);
        return matchesName;
      }

      return true;
    });
  }, [queue?.entries, filterStatus, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!queue?.entries) {
      return {
        waiting: 0,
        called: 0,
        seated: 0,
        noShow: 0,
        avgWait: 0,
        trend: 0,
      };
    }

    const waiting = queue.entries.filter((e) => e.status === 'waiting').length;
    const called = queue.entries.filter((e) => e.status === 'called').length;
    const seated = queue.entries.filter((e) => e.status === 'seated').length;
    const noShow = queue.entries.filter((e) => e.status === 'expired').length;
    const avgWait = queue.averageWaitMinutes || 0;

    // Calculate trend (mock - would be calculated from historical data)
    const trend = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 20);

    return { waiting, called, seated, noShow, avgWait, trend };
  }, [queue]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle call next in queue
  const handleCallNext = async () => {
    const nextEntry = queue?.entries.find((e) => e.status === 'waiting');
    if (nextEntry && onCallCustomer) {
      await onCallCustomer(nextEntry);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <DashboardHeader
        restaurantName={restaurantName}
        connectionStatus={connectionStatus}
        locale={locale}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onAddGuest={() => setShowAddModal(true)}
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} locale={locale} />

      {/* Quick Actions */}
      <QuickActions
        hasWaitingCustomers={stats.waiting > 0}
        onCallNext={handleCallNext}
        onAddGuest={() => setShowAddModal(true)}
        locale={locale}
      />

      {/* Queue List */}
      <QueueListSection
        entries={filteredEntries}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        onCallCustomer={onCallCustomer}
        onSeatCustomer={onSeatCustomer}
        onMarkNoShow={onMarkNoShow}
        onCancelEntry={onCancelEntry}
        locale={locale}
      />

      {/* Add Guest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddGuestModal
            onClose={() => setShowAddModal(false)}
            onAdd={async (data) => {
              if (onAddManualEntry) {
                await onAddManualEntry(data);
              }
              setShowAddModal(false);
            }}
            locale={locale}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Dashboard Header
// ============================================================================

function DashboardHeader({
  restaurantName,
  connectionStatus,
  locale,
  onRefresh,
  isRefreshing,
  onAddGuest,
}: {
  restaurantName: string;
  connectionStatus: string;
  locale: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAddGuest: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboard', locale)}</h1>
        <p className="text-gray-400 text-sm mt-1">{restaurantName}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
            connectionStatus === 'connected'
              ? 'bg-green-500/20 text-green-400'
              : connectionStatus === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              connectionStatus === 'connected'
                ? 'bg-green-400 animate-pulse'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-red-400'
            )}
          />
          {t('liveUpdates', locale)}
        </div>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Grid
// ============================================================================

function StatsGrid({
  stats,
  locale,
}: {
  stats: {
    waiting: number;
    called: number;
    seated: number;
    noShow: number;
    avgWait: number;
    trend: number;
  };
  locale: string;
}) {
  const statCards = [
    {
      label: t('currentlyWaiting', locale),
      value: stats.waiting,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: t('avgWaitTime', locale),
      value: QueueTimeEstimator.formatWaitTime(stats.avgWait, locale),
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      trend: stats.trend,
    },
    {
      label: t('seatedToday', locale),
      value: stats.seated,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: t('noShowRate', locale),
      value: stats.seated + stats.noShow > 0 
        ? `${Math.round((stats.noShow / (stats.seated + stats.noShow)) * 100)}%`
        : '0%',
      icon: AlertTriangle,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="glass" padding="md" className="relative overflow-hidden">
            {/* Gradient Accent */}
            <div
              className={cn(
                'absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20',
                `bg-gradient-to-br ${stat.color}`
              )}
            />

            <div className="relative">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5 bg-gradient-to-r bg-clip-text', stat.color)} style={{
                  color: stat.color.includes('purple') ? '#a855f7' :
                         stat.color.includes('blue') ? '#3b82f6' :
                         stat.color.includes('green') ? '#22c55e' :
                         '#f97316'
                }} />
              </div>

              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <span
                    className={cn(
                      'flex items-center text-xs font-medium mb-1',
                      stat.trend > 0 ? 'text-red-400' : 'text-green-400'
                    )}
                  >
                    {stat.trend > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// Quick Actions
// ============================================================================

function QuickActions({
  hasWaitingCustomers,
  onCallNext,
  onAddGuest,
  locale,
}: {
  hasWaitingCustomers: boolean;
  onCallNext: () => void;
  onAddGuest: () => void;
  locale: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onCallNext}
        disabled={!hasWaitingCustomers}
        className="bg-gradient-to-r from-flame-500 to-ember-500 hover:from-flame-600 hover:to-ember-600"
      >
        <PhoneCall className="w-4 h-4 mr-2" />
        {t('callNext', locale)}
      </Button>

      <Button variant="secondary" onClick={onAddGuest}>
        <UserPlus className="w-4 h-4 mr-2" />
        {t('addGuest', locale)}
      </Button>
    </div>
  );
}

// ============================================================================
// Queue List Section
// ============================================================================

function QueueListSection({
  entries,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onCallCustomer,
  onSeatCustomer,
  onMarkNoShow,
  onCancelEntry,
  locale,
}: {
  entries: QueueEntry[];
  searchQuery: string;
  filterStatus: QueueFilterStatus;
  onSearchChange: (value: string) => void;
  onFilterChange: (status: QueueFilterStatus) => void;
  onCallCustomer?: (entry: QueueEntry) => Promise<void>;
  onSeatCustomer?: (entry: QueueEntry) => Promise<void>;
  onMarkNoShow?: (entry: QueueEntry) => Promise<void>;
  onCancelEntry?: (entry: QueueEntry) => Promise<void>;
  locale: string;
}) {
  const filters: { value: QueueFilterStatus; label: string }[] = [
    { value: 'all', label: t('all', locale) },
    { value: 'waiting', label: t('waiting', locale) },
    { value: 'called', label: t('called', locale) },
    { value: 'seated', label: t('seated', locale) },
    { value: 'no_show', label: t('noShow', locale) },
  ];

  return (
    <Card variant="glass" padding="none">
      {/* Header with Search & Filters */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('search', locale)}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-space-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-flame-500/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  filterStatus === filter.value
                    ? 'bg-flame-500 text-white'
                    : 'bg-space-800 text-gray-400 hover:text-white hover:bg-space-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="divide-y divide-white/5">
        <AnimatePresence mode="popLayout">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <QueueEntryRow
                key={entry.id}
                entry={entry}
                index={index}
                onCall={onCallCustomer}
                onSeat={onSeatCustomer}
                onNoShow={onMarkNoShow}
                onCancel={onCancelEntry}
                locale={locale}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-gray-500"
            >
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('noEntries', locale)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ============================================================================
// Queue Entry Row
// ============================================================================

function QueueEntryRow({
  entry,
  index,
  onCall,
  onSeat,
  onNoShow,
  onCancel,
  locale,
}: {
  entry: QueueEntry;
  index: number;
  onCall?: (entry: QueueEntry) => Promise<void>;
  onSeat?: (entry: QueueEntry) => Promise<void>;
  onNoShow?: (entry: QueueEntry) => Promise<void>;
  onCancel?: (entry: QueueEntry) => Promise<void>;
  locale: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleAction = async (action: ((e: QueueEntry) => Promise<void>) | undefined) => {
    if (!action) return;
    setIsLoading(true);
    try {
      await action(entry);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    called: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    seated: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Position Badge */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-flame-500 to-ember-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          #{entry.position}
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white truncate">{entry.userName || 'Guest'}</p>
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded-full border',
                statusColors[entry.status]
              )}
            >
              {t(entry.status === 'expired' ? 'noShow' : entry.status, locale)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {entry.partySize} {t('people', locale)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(entry.joinedAt).toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {entry.status === 'waiting' && (
              <span className="flex items-center gap-1 text-flame-400">
                <Timer className="w-3.5 h-3.5" />
                {QueueTimeEstimator.formatWaitTime(entry.estimatedWaitMinutes, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {entry.status === 'waiting' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction(onCall)}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              <PhoneCall className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction(onSeat)}
              disabled={isLoading}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowActions(!showActions)}
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-space-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
                  >
                    <button
                      onClick={() => {
                        handleAction(onNoShow);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {t('markNoShow', locale)}
                    </button>
                    <button
                      onClick={() => {
                        handleAction(onCancel);
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
        )}

        {entry.status === 'called' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleAction(onSeat)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('seat', locale)}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction(onNoShow)}
              disabled={isLoading}
              className="text-orange-400 hover:text-orange-300"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Add Guest Modal
// ============================================================================

function AddGuestModal({
  onClose,
  onAdd,
  locale,
}: {
  onClose: () => void;
  onAdd: (data: ManualEntryData) => Promise<void>;
  locale: string;
}) {
  const [formData, setFormData] = useState<ManualEntryData>({
    guestName: '',
    phoneNumber: '',
    partySize: 2,
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-space-850 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{t('addGuest', locale)}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {locale === 'ko' ? '이름' : locale === 'ja' ? '名前' : 'Name'}
            </label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData((prev) => ({ ...prev, guestName: e.target.value }))}
              className="w-full px-4 py-2 bg-space-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-flame-500/50"
              placeholder="John Doe"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {locale === 'ko' ? '전화번호' : locale === 'ja' ? '電話番号' : 'Phone Number'}
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-4 py-2 bg-space-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-flame-500/50"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {locale === 'ko' ? '인원' : locale === 'ja' ? '人数' : 'Party Size'}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, partySize: Math.max(1, prev.partySize - 1) }))
                }
                className="w-10 h-10 rounded-lg bg-space-800 text-white hover:bg-space-700 flex items-center justify-center"
              >
                <UserMinus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-12 text-center">
                {formData.partySize}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, partySize: Math.min(20, prev.partySize + 1) }))
                }
                className="w-10 h-10 rounded-lg bg-space-800 text-white hover:bg-space-700 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {locale === 'ko' ? '특별 요청' : locale === 'ja' ? '特別なリクエスト' : 'Special Requests'}
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, specialRequests: e.target.value }))
              }
              className="w-full px-4 py-2 bg-space-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-flame-500/50 resize-none h-20"
              placeholder={locale === 'ko' ? '예: 휠체어 접근, 유아용 의자 등' : 'e.g., wheelchair access, high chair needed'}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t('cancel', locale)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-flame-500 to-ember-500"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('addGuest', locale)}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default QueueDashboard;
