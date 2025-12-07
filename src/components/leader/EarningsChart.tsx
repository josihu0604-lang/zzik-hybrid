'use client';

import { useState, useMemo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { duration, easing } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * EarningsChart - 수익 추이 차트
 *
 * 7일/30일 수익 현황을 시각화 (바 차트 + 라인 차트 토글)
 */

interface DailyEarning {
  date: string;
  amount: number;
  checkins: number;
}

interface EarningsChartProps {
  data: DailyEarning[];
  data30Days?: DailyEarning[];
  className?: string;
}

type Period = '7d' | '30d';
type ChartType = 'bar' | 'line';

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

export function EarningsChart({ data, data30Days, className = '' }: EarningsChartProps) {
  const [period, setPeriod] = useState<Period>('7d');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const prefersReducedMotion = useReducedMotion();

  // Select data based on period
  const chartData = useMemo(() => {
    if (period === '30d' && data30Days) {
      return data30Days;
    }
    return data;
  }, [period, data, data30Days]);

  // Calculate max amount for scaling
  const maxAmount = useMemo(() => Math.max(...chartData.map((d) => d.amount), 1), [chartData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEarnings = chartData.reduce((sum, d) => sum + d.amount, 0);
    const totalCheckins = chartData.reduce((sum, d) => sum + d.checkins, 0);

    // Calculate change rate (compare halves)
    const midPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, midPoint).reduce((sum, d) => sum + d.amount, 0);
    const secondHalf = chartData.slice(midPoint).reduce((sum, d) => sum + d.amount, 0);

    const changeRate = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    // Daily average
    const avgDaily = Math.round(totalEarnings / chartData.length);

    return {
      total: totalEarnings,
      checkins: totalCheckins,
      changeRate,
      avgDaily,
    };
  }, [chartData]);

  const TrendIcon = stats.changeRate > 0 ? TrendingUp : stats.changeRate < 0 ? TrendingDown : Minus;
  const trendColor =
    stats.changeRate > 0
      ? colors.success
      : stats.changeRate < 0
        ? colors.error
        : colors.text.secondary;

  return (
    <m.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: duration.major, ease: easing.smooth }
      }
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: `1px solid ${colors.border.subtle}`,
        willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-sm">
              {period === '7d' ? '7일간' : '30일간'} 수익
            </h3>
            {/* Period Toggle */}
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <button
                onClick={() => setPeriod('7d')}
                className="px-2 py-0.5 rounded-full text-micro font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-spark-500"
                style={{
                  background: period === '7d' ? colors.spark[500] : 'transparent',
                  color: period === '7d' ? '#000' : colors.text.tertiary,
                }}
                aria-pressed={period === '7d'}
                aria-label="7일 수익 보기"
              >
                7일
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className="px-2 py-0.5 rounded-full text-micro font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-spark-500"
                style={{
                  background: period === '30d' ? colors.spark[500] : 'transparent',
                  color: period === '30d' ? '#000' : colors.text.tertiary,
                }}
                aria-pressed={period === '30d'}
                aria-label="30일 수익 보기"
              >
                30일
              </button>
            </div>
          </div>
          <p className="text-2xl font-black" style={{ color: colors.spark[500] }}>
            {stats.total.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div
            className="flex items-center rounded-lg p-0.5"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <button
              onClick={() => setChartType('bar')}
              className="p-1.5 rounded transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-spark-500"
              style={{
                background: chartType === 'bar' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              }}
              aria-pressed={chartType === 'bar'}
              aria-label="바 차트 보기"
            >
              <BarChart3
                size={14}
                style={{
                  color: chartType === 'bar' ? colors.spark[500] : colors.text.tertiary,
                }}
              />
            </button>
            <button
              onClick={() => setChartType('line')}
              className="p-1.5 rounded transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-spark-500"
              style={{
                background: chartType === 'line' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              }}
              aria-pressed={chartType === 'line'}
              aria-label="라인 차트 보기"
            >
              <LineChart
                size={14}
                style={{
                  color: chartType === 'line' ? colors.spark[500] : colors.text.tertiary,
                }}
              />
            </button>
          </div>

          {/* Trend Badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${trendColor}20`,
              color: trendColor,
            }}
          >
            <TrendIcon size={12} />
            {stats.changeRate > 0 ? '+' : ''}
            {stats.changeRate}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pb-2">
        <AnimatePresence mode="wait">
          {chartType === 'bar' ? (
            <BarChartView
              key="bar"
              data={chartData}
              maxAmount={maxAmount}
              period={period}
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <LineChartView
              key="line"
              data={chartData}
              maxAmount={maxAmount}
              period={period}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <div
        className="px-4 py-3 flex items-center justify-around"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="text-center">
          <p className="text-micro text-linear-text-tertiary mb-0.5">체크인</p>
          <p className="text-sm font-bold text-white">{stats.checkins}건</p>
        </div>
        <div className="w-px h-6" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="text-center">
          <p className="text-micro text-linear-text-tertiary mb-0.5">일 평균</p>
          <p className="text-sm font-bold" style={{ color: colors.spark[500] }}>
            {stats.avgDaily.toLocaleString()}
          </p>
        </div>
        <div className="w-px h-6" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="text-center">
          <p className="text-micro text-linear-text-tertiary mb-0.5">건당 수익</p>
          <p className="text-sm font-bold text-white">
            {stats.checkins > 0 ? Math.round(stats.total / stats.checkins).toLocaleString() : 0}
          </p>
        </div>
      </div>
    </m.div>
  );
}

/**
 * BarChartView - 바 차트
 */
function BarChartView({
  data,
  maxAmount,
  period,
  prefersReducedMotion,
}: {
  data: DailyEarning[];
  maxAmount: number;
  period: Period;
  prefersReducedMotion: boolean;
}) {
  // For 30 days, show every 5th day label
  const showLabel = (index: number) => {
    if (period === '7d') return true;
    return index % 5 === 0 || index === data.length - 1;
  };

  const getLabel = (date: string) => {
    if (period === '7d') {
      return DAYS_KR[new Date(date).getDay()];
    }
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: duration.standard }}
      className="h-28"
    >
      <div
        className="flex items-end justify-between h-full"
        style={{ gap: period === '7d' ? '4px' : '2px' }}
      >
        {data.map((day, index) => {
          const height = (day.amount / maxAmount) * 100;
          const isToday = index === data.length - 1;

          return (
            <m.div
              key={day.date}
              className="flex-1 flex flex-col items-center"
              initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      delay: index * (period === '7d' ? 0.05 : 0.02),
                      duration: duration.major * 0.75, // 300ms
                      ease: easing.smooth,
                    }
              }
              style={{ originY: 1, willChange: prefersReducedMotion ? 'auto' : 'transform' }}
            >
              <div
                className="w-full rounded-t-sm relative group cursor-pointer transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  background:
                    day.amount > 0
                      ? isToday
                        ? `linear-gradient(180deg, ${colors.spark[400]} 0%, ${colors.spark[500]} 100%)`
                        : `linear-gradient(180deg, ${colors.spark[500]} 0%, ${colors.spark[600] || colors.spark[500]}80 100%)`
                      : 'rgba(255, 255, 255, 0.1)',
                  minHeight: '4px',
                  boxShadow: isToday ? `0 0 8px ${colors.spark[500]}40` : 'none',
                }}
              >
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-white font-bold">{day.amount.toLocaleString()}</p>
                  <p className="text-linear-text-tertiary">{day.checkins}건</p>
                </div>
              </div>
              {showLabel(index) && (
                <span
                  className="mt-1 font-medium"
                  style={{
                    fontSize: period === '7d' ? '10px' : '8px',
                    color: isToday ? colors.spark[500] : colors.text.tertiary,
                  }}
                >
                  {getLabel(day.date)}
                </span>
              )}
            </m.div>
          );
        })}
      </div>
    </m.div>
  );
}

/**
 * LineChartView - 라인 차트 (SVG)
 */
function LineChartView({
  data,
  maxAmount,
  period,
  prefersReducedMotion,
}: {
  data: DailyEarning[];
  maxAmount: number;
  period: Period;
  prefersReducedMotion: boolean;
}) {
  const width = 300;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate path points
  const points = useMemo(() => {
    return data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - (d.amount / maxAmount) * chartHeight,
      amount: d.amount,
      date: d.date,
      checkins: d.checkins,
    }));
  }, [data, maxAmount, chartWidth, chartHeight, padding.left, padding.top]);

  // Generate SVG path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, point, i) => {
      return path + (i === 0 ? `M ${point.x},${point.y}` : ` L ${point.x},${point.y}`);
    }, '');
  }, [points]);

  // Generate area path (for gradient fill)
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baseline = padding.top + chartHeight;
    return (
      linePath + ` L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z`
    );
  }, [linePath, points, chartHeight, padding.top]);

  // X-axis labels
  const getLabel = (date: string) => {
    if (period === '7d') {
      return DAYS_KR[new Date(date).getDay()];
    }
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const labelIndices = useMemo(() => {
    if (period === '7d') return data.map((_, i) => i);
    // For 30 days, show every 7th
    return data.map((_, i) => i).filter((i) => i % 7 === 0 || i === data.length - 1);
  }, [data, period]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: duration.standard }}
      className="relative"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.spark[500]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.spark[500]} stopOpacity="0" />
          </linearGradient>

          {/* Glow filter for line */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines (horizontal) */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={width - padding.right}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <m.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: duration.progress }} // 500ms
        />

        {/* Line */}
        <m.path
          d={linePath}
          fill="none"
          stroke={colors.spark[500]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: duration.major * 2.5, ease: 'easeInOut' }
          } // 1s
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i} className="group cursor-pointer">
            {/* Invisible larger hit area */}
            <circle cx={point.x} cy={point.y} r="10" fill="transparent" />

            {/* Visible point */}
            <m.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={i === points.length - 1 ? colors.spark[400] : colors.spark[500]}
              stroke={colors.space[850]}
              strokeWidth="2"
              initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      delay: duration.progress + i * 0.03, // 500ms + stagger
                      duration: duration.standard, // 200ms
                      ease: easing.smooth,
                    }
              }
              className="group-hover:r-6 transition-all"
            />

            {/* Tooltip on hover - using foreignObject for HTML */}
            <foreignObject
              x={point.x - 40}
              y={point.y - 50}
              width="80"
              height="40"
              className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <div
                className="px-2 py-1 rounded text-xs text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p className="text-white font-bold">{point.amount.toLocaleString()}</p>
                <p className="text-linear-text-tertiary">{point.checkins}건</p>
              </div>
            </foreignObject>
          </g>
        ))}

        {/* X-axis labels */}
        {labelIndices.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={height - 4}
            textAnchor="middle"
            fill={i === data.length - 1 ? colors.spark[500] : colors.text.tertiary}
            fontSize={period === '7d' ? '10' : '8'}
            fontWeight="500"
          >
            {getLabel(data[i].date)}
          </text>
        ))}
      </svg>
    </m.div>
  );
}

// Demo data generators
export function generateDemoEarningsData(days: number = 7): DailyEarning[] {
  const data: DailyEarning[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Create more realistic variation
    const baseCheckins = Math.floor(Math.random() * 5) + 1;
    const checkins = Math.max(0, baseCheckins + Math.floor(Math.random() * 3) - 1);
    const amount = checkins * (500 + Math.floor(Math.random() * 300));

    data.push({
      date: date.toISOString().split('T')[0],
      amount,
      checkins,
    });
  }

  return data;
}

export function generateDemo30DaysData(): DailyEarning[] {
  return generateDemoEarningsData(30);
}

export const DEMO_EARNINGS_7D = generateDemoEarningsData(7);
export const DEMO_EARNINGS_30D = generateDemoEarningsData(30);

export default EarningsChart;
