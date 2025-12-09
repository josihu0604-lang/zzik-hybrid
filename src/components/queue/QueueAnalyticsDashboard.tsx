/**
 * Queue Analytics Dashboard Component
 * Admin interface for queue performance analytics and insights
 * 
 * @description A comprehensive analytics dashboard showing:
 * - Real-time queue metrics
 * - Historical performance charts
 * - Peak hours analysis
 * - Customer flow metrics
 * - Staff efficiency indicators
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Activity,
  ChevronRight,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface QueueAnalyticsDashboardProps {
  restaurantId: string;
  restaurantName: string;
  analytics: QueueAnalyticsData;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  locale?: string;
  className?: string;
}

interface QueueAnalyticsData {
  // Summary Metrics
  totalCustomersToday: number;
  totalCustomersWeek: number;
  averageWaitTime: number; // minutes
  averageWaitTimeChange: number; // percentage change
  peakHour: string;
  peakHourCustomers: number;
  noShowRate: number;
  noShowRateChange: number;
  
  // Hourly Distribution
  hourlyDistribution: HourlyData[];
  
  // Daily Trends
  dailyTrends: DailyData[];
  
  // Customer Segments
  partyDistribution: PartySizeData[];
  
  // Status Breakdown
  statusBreakdown: StatusData[];
  
  // Performance Goals
  goals: QueueGoals;
}

interface HourlyData {
  hour: string;
  customers: number;
  avgWait: number;
}

interface DailyData {
  date: string;
  customers: number;
  avgWait: number;
  noShowRate: number;
}

interface PartySizeData {
  size: string;
  count: number;
  percentage: number;
}

interface StatusData {
  status: 'seated' | 'no_show' | 'cancelled';
  count: number;
  percentage: number;
}

interface QueueGoals {
  targetAvgWait: number;
  targetNoShowRate: number;
  targetCustomersPerDay: number;
}

interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'custom';
}

// ============================================================================
// Localization
// ============================================================================

const i18n: Record<string, Record<string, string>> = {
  analytics: {
    en: 'Queue Analytics',
    ko: '대기열 분석',
    ja: '待機リスト分析',
    zh: '排队分析',
  },
  overview: {
    en: 'Overview',
    ko: '개요',
    ja: '概要',
    zh: '概览',
  },
  totalCustomers: {
    en: 'Total Customers',
    ko: '총 고객 수',
    ja: '総顧客数',
    zh: '总客户数',
  },
  avgWaitTime: {
    en: 'Avg. Wait Time',
    ko: '평균 대기 시간',
    ja: '平均待機時間',
    zh: '平均等待时间',
  },
  peakHour: {
    en: 'Peak Hour',
    ko: '피크 시간',
    ja: 'ピーク時間',
    zh: '高峰时段',
  },
  noShowRate: {
    en: 'No-Show Rate',
    ko: '노쇼율',
    ja: 'ノーショー率',
    zh: '爽约率',
  },
  hourlyTraffic: {
    en: 'Hourly Traffic',
    ko: '시간별 트래픽',
    ja: '時間別トラフィック',
    zh: '每小时流量',
  },
  dailyTrends: {
    en: 'Daily Trends',
    ko: '일별 트렌드',
    ja: '日別トレンド',
    zh: '每日趋势',
  },
  partySize: {
    en: 'Party Size Distribution',
    ko: '인원별 분포',
    ja: '人数分布',
    zh: '人数分布',
  },
  statusBreakdown: {
    en: 'Status Breakdown',
    ko: '상태별 현황',
    ja: 'ステータス内訳',
    zh: '状态细分',
  },
  goals: {
    en: 'Performance Goals',
    ko: '성과 목표',
    ja: 'パフォーマンス目標',
    zh: '绩效目标',
  },
  today: {
    en: 'Today',
    ko: '오늘',
    ja: '今日',
    zh: '今天',
  },
  thisWeek: {
    en: 'This Week',
    ko: '이번 주',
    ja: '今週',
    zh: '本周',
  },
  thisMonth: {
    en: 'This Month',
    ko: '이번 달',
    ja: '今月',
    zh: '本月',
  },
  customers: {
    en: 'customers',
    ko: '고객',
    ja: '顧客',
    zh: '客户',
  },
  minutes: {
    en: 'min',
    ko: '분',
    ja: '分',
    zh: '分钟',
  },
  seated: {
    en: 'Seated',
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
  cancelled: {
    en: 'Cancelled',
    ko: '취소',
    ja: 'キャンセル',
    zh: '取消',
  },
  export: {
    en: 'Export',
    ko: '내보내기',
    ja: 'エクスポート',
    zh: '导出',
  },
  refresh: {
    en: 'Refresh',
    ko: '새로고침',
    ja: '更新',
    zh: '刷新',
  },
  vsTarget: {
    en: 'vs target',
    ko: '목표 대비',
    ja: '目標対比',
    zh: '与目标相比',
  },
  onTrack: {
    en: 'On Track',
    ko: '정상',
    ja: '順調',
    zh: '正常',
  },
  needsAttention: {
    en: 'Needs Attention',
    ko: '주의 필요',
    ja: '要注意',
    zh: '需要关注',
  },
  people: {
    en: 'people',
    ko: '명',
    ja: '名',
    zh: '人',
  },
};

const t = (key: string, locale: string): string => {
  return i18n[key]?.[locale] || i18n[key]?.['en'] || key;
};

// ============================================================================
// Main Component
// ============================================================================

export function QueueAnalyticsDashboard({
  restaurantId,
  restaurantName,
  analytics,
  dateRange,
  onDateRangeChange,
  onExport,
  onRefresh,
  isLoading = false,
  locale = 'en',
  className,
}: QueueAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <DashboardHeader
        restaurantName={restaurantName}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onExport={onExport}
        onRefresh={onRefresh}
        isLoading={isLoading}
        locale={locale}
      />

      {/* Summary Cards */}
      <SummaryCards analytics={analytics} locale={locale} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HourlyTrafficChart data={analytics.hourlyDistribution} locale={locale} />
        <StatusBreakdownChart data={analytics.statusBreakdown} locale={locale} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyTrendsChart data={analytics.dailyTrends} locale={locale} />
        </div>
        <PartySizeChart data={analytics.partyDistribution} locale={locale} />
      </div>

      {/* Performance Goals */}
      <PerformanceGoals
        analytics={analytics}
        goals={analytics.goals}
        locale={locale}
      />
    </div>
  );
}

// ============================================================================
// Dashboard Header
// ============================================================================

function DashboardHeader({
  restaurantName,
  selectedPeriod,
  onPeriodChange,
  onExport,
  onRefresh,
  isLoading,
  locale,
}: {
  restaurantName: string;
  selectedPeriod: 'today' | 'week' | 'month';
  onPeriodChange: (period: 'today' | 'week' | 'month') => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  locale: string;
}) {
  const periods = [
    { value: 'today', label: t('today', locale) },
    { value: 'week', label: t('thisWeek', locale) },
    { value: 'month', label: t('thisMonth', locale) },
  ] as const;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('analytics', locale)}</h1>
        <p className="text-gray-400 text-sm mt-1">{restaurantName}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Period Selector */}
        <div className="flex bg-space-800 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                selectedPeriod === period.value
                  ? 'bg-flame-500 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
          )}
          {onExport && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              {t('export', locale)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Summary Cards
// ============================================================================

function SummaryCards({
  analytics,
  locale,
}: {
  analytics: QueueAnalyticsData;
  locale: string;
}) {
  const cards = [
    {
      label: t('totalCustomers', locale),
      value: analytics.totalCustomersToday.toString(),
      subtext: `${analytics.totalCustomersWeek} ${t('thisWeek', locale).toLowerCase()}`,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: t('avgWaitTime', locale),
      value: `${analytics.averageWaitTime} ${t('minutes', locale)}`,
      change: analytics.averageWaitTimeChange,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      inverseChange: true, // Lower is better
    },
    {
      label: t('peakHour', locale),
      value: analytics.peakHour,
      subtext: `${analytics.peakHourCustomers} ${t('customers', locale)}`,
      icon: Zap,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: t('noShowRate', locale),
      value: `${analytics.noShowRate}%`,
      change: analytics.noShowRateChange,
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10',
      inverseChange: true, // Lower is better
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="glass" padding="md" className="relative overflow-hidden">
            {/* Gradient Accent */}
            <div
              className={cn(
                'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20',
                `bg-gradient-to-br ${card.color}`
              )}
            />

            <div className="relative">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bgColor)}>
                <card.icon className="w-5 h-5" style={{
                  color: card.color.includes('purple') ? '#a855f7' :
                         card.color.includes('blue') ? '#3b82f6' :
                         card.color.includes('orange') ? '#f97316' :
                         '#ef4444'
                }} />
              </div>

              <p className="text-gray-400 text-xs mb-1">{card.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-white">{card.value}</p>
                {card.change !== undefined && (
                  <ChangeIndicator
                    change={card.change}
                    inverse={card.inverseChange}
                  />
                )}
              </div>
              {card.subtext && (
                <p className="text-gray-500 text-xs mt-1">{card.subtext}</p>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ChangeIndicator({
  change,
  inverse = false,
}: {
  change: number;
  inverse?: boolean;
}) {
  const isPositive = inverse ? change < 0 : change > 0;
  const Icon = change > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        'flex items-center text-xs font-medium mb-1',
        isPositive ? 'text-green-400' : 'text-red-400'
      )}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(change)}%
    </span>
  );
}

// ============================================================================
// Hourly Traffic Chart
// ============================================================================

function HourlyTrafficChart({
  data,
  locale,
}: {
  data: HourlyData[];
  locale: string;
}) {
  const maxCustomers = Math.max(...data.map((d) => d.customers));

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">{t('hourlyTraffic', locale)}</h3>
        <BarChart3 className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.customers / maxCustomers) * 100;
          const isPeak = item.customers === maxCustomers;

          return (
            <motion.div
              key={item.hour}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4"
            >
              <span className="w-12 text-sm text-gray-400">{item.hour}</span>
              <div className="flex-1 h-6 bg-space-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={cn(
                    'h-full rounded-full',
                    isPeak
                      ? 'bg-gradient-to-r from-flame-500 to-ember-500'
                      : 'bg-gradient-to-r from-blue-500/70 to-cyan-500/70'
                  )}
                />
              </div>
              <div className="w-20 text-right">
                <span className="text-white font-medium">{item.customers}</span>
                <span className="text-gray-500 text-xs ml-1">
                  ({item.avgWait}m)
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Status Breakdown Chart
// ============================================================================

function StatusBreakdownChart({
  data,
  locale,
}: {
  data: StatusData[];
  locale: string;
}) {
  const statusConfig = {
    seated: {
      label: t('seated', locale),
      color: 'bg-green-500',
      textColor: 'text-green-400',
    },
    no_show: {
      label: t('noShow', locale),
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
    },
    cancelled: {
      label: t('cancelled', locale),
      color: 'bg-red-500',
      textColor: 'text-red-400',
    },
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">{t('statusBreakdown', locale)}</h3>
        <PieChart className="w-5 h-5 text-gray-500" />
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.reduce(
              (acc, item, index) => {
                const config = statusConfig[item.status];
                const dashArray = (item.percentage / 100) * 251.2;
                const dashOffset = 251.2 - acc.offset;

                acc.elements.push(
                  <circle
                    key={item.status}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="12"
                    className={config.color}
                    strokeDasharray={`${dashArray} 251.2`}
                    strokeDashoffset={-acc.offset}
                    strokeLinecap="round"
                  />
                );

                acc.offset += dashArray;
                return acc;
              },
              { elements: [] as React.ReactNode[], offset: 0 }
            ).elements}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-xs text-gray-400">{t('customers', locale)}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item) => {
          const config = statusConfig[item.status];
          return (
            <div key={item.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', config.color)} />
                <span className="text-gray-400 text-sm">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{item.count}</span>
                <span className={cn('text-xs', config.textColor)}>
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Daily Trends Chart
// ============================================================================

function DailyTrendsChart({
  data,
  locale,
}: {
  data: DailyData[];
  locale: string;
}) {
  const maxCustomers = Math.max(...data.map((d) => d.customers));
  const maxWait = Math.max(...data.map((d) => d.avgWait));

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">{t('dailyTrends', locale)}</h3>
        <Activity className="w-5 h-5 text-gray-500" />
      </div>

      {/* Chart */}
      <div className="relative h-48">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="w-full h-px bg-white/5"
            />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
          {data.map((item, index) => {
            const customerHeight = (item.customers / maxCustomers) * 100;
            const waitHeight = (item.avgWait / maxWait) * 80;

            return (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 flex flex-col items-center gap-1 origin-bottom"
              >
                {/* Customer Bar */}
                <div
                  className="w-full bg-gradient-to-t from-flame-500 to-ember-500 rounded-t-sm"
                  style={{ height: `${customerHeight}%` }}
                />
                {/* Date Label */}
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(item.date).toLocaleDateString(locale, { weekday: 'short' })}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-flame-500 to-ember-500" />
          <span className="text-gray-400 text-sm">{t('customers', locale)}</span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Party Size Chart
// ============================================================================

function PartySizeChart({
  data,
  locale,
}: {
  data: PartySizeData[];
  locale: string;
}) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">{t('partySize', locale)}</h3>
        <Users className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.size}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">
                {item.size} {t('people', locale)}
              </span>
              <span className="text-white font-medium">{item.count}</span>
            </div>
            <div className="h-2 bg-space-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Performance Goals
// ============================================================================

function PerformanceGoals({
  analytics,
  goals,
  locale,
}: {
  analytics: QueueAnalyticsData;
  goals: QueueGoals;
  locale: string;
}) {
  const goalItems = [
    {
      label: t('avgWaitTime', locale),
      current: analytics.averageWaitTime,
      target: goals.targetAvgWait,
      unit: t('minutes', locale),
      inverse: true, // Lower is better
    },
    {
      label: t('noShowRate', locale),
      current: analytics.noShowRate,
      target: goals.targetNoShowRate,
      unit: '%',
      inverse: true, // Lower is better
    },
    {
      label: t('totalCustomers', locale),
      current: analytics.totalCustomersToday,
      target: goals.targetCustomersPerDay,
      unit: '',
      inverse: false, // Higher is better
    },
  ];

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">{t('goals', locale)}</h3>
        <Target className="w-5 h-5 text-gray-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goalItems.map((item, index) => {
          const progress = item.inverse
            ? (item.target / Math.max(item.current, 1)) * 100
            : (item.current / Math.max(item.target, 1)) * 100;
          const isOnTrack = item.inverse
            ? item.current <= item.target
            : item.current >= item.target;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl',
                isOnTrack ? 'bg-green-500/10' : 'bg-orange-500/10'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{item.label}</span>
                {isOnTrack ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-white">
                  {item.current}{item.unit}
                </span>
                <span className="text-gray-500 text-sm">
                  / {item.target}{item.unit} {t('vsTarget', locale)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-space-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className={cn(
                    'h-full rounded-full',
                    isOnTrack ? 'bg-green-500' : 'bg-orange-500'
                  )}
                />
              </div>

              <p className={cn(
                'text-xs mt-2',
                isOnTrack ? 'text-green-400' : 'text-orange-400'
              )}>
                {isOnTrack ? t('onTrack', locale) : t('needsAttention', locale)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// Mock Data Generator (for demo purposes)
// ============================================================================

export function generateMockAnalyticsData(): QueueAnalyticsData {
  return {
    totalCustomersToday: 87,
    totalCustomersWeek: 542,
    averageWaitTime: 18,
    averageWaitTimeChange: -12,
    peakHour: '12:00 PM',
    peakHourCustomers: 23,
    noShowRate: 8,
    noShowRateChange: -3,
    hourlyDistribution: [
      { hour: '10AM', customers: 8, avgWait: 10 },
      { hour: '11AM', customers: 15, avgWait: 14 },
      { hour: '12PM', customers: 23, avgWait: 22 },
      { hour: '1PM', customers: 21, avgWait: 25 },
      { hour: '2PM', customers: 12, avgWait: 15 },
      { hour: '3PM', customers: 8, avgWait: 8 },
      { hour: '6PM', customers: 18, avgWait: 20 },
      { hour: '7PM', customers: 22, avgWait: 28 },
      { hour: '8PM', customers: 16, avgWait: 18 },
    ],
    dailyTrends: [
      { date: '2024-01-01', customers: 78, avgWait: 16, noShowRate: 6 },
      { date: '2024-01-02', customers: 92, avgWait: 20, noShowRate: 9 },
      { date: '2024-01-03', customers: 85, avgWait: 18, noShowRate: 7 },
      { date: '2024-01-04', customers: 96, avgWait: 22, noShowRate: 10 },
      { date: '2024-01-05', customers: 110, avgWait: 25, noShowRate: 12 },
      { date: '2024-01-06', customers: 98, avgWait: 19, noShowRate: 8 },
      { date: '2024-01-07', customers: 87, avgWait: 18, noShowRate: 8 },
    ],
    partyDistribution: [
      { size: '1-2', count: 35, percentage: 40 },
      { size: '3-4', count: 28, percentage: 32 },
      { size: '5-6', count: 15, percentage: 17 },
      { size: '7+', count: 9, percentage: 11 },
    ],
    statusBreakdown: [
      { status: 'seated', count: 75, percentage: 86 },
      { status: 'no_show', count: 7, percentage: 8 },
      { status: 'cancelled', count: 5, percentage: 6 },
    ],
    goals: {
      targetAvgWait: 20,
      targetNoShowRate: 10,
      targetCustomersPerDay: 100,
    },
  };
}

export default QueueAnalyticsDashboard;
