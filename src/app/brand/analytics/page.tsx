'use client';

import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Target,
  MapPin,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { GlassCard, AnimatedCounter } from '@/components/cosmic';
import { colors, gradients } from '@/lib/design-tokens';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

// Mock analytics data
const mockAnalytics = {
  overview: {
    total_reach: 15420,
    reach_change: 12.5,
    total_participants: 2847,
    participants_change: 8.3,
    avg_conversion: 53.5,
    conversion_change: -2.1,
    total_checkins: 1523,
    checkins_change: 15.2,
  },
  monthly_data: [
    { month: '7월', participants: 180, checkins: 95 },
    { month: '8월', participants: 220, checkins: 120 },
    { month: '9월', participants: 350, checkins: 185 },
    { month: '10월', participants: 480, checkins: 260 },
    { month: '11월', participants: 620, checkins: 340 },
    { month: '12월', participants: 720, checkins: 380 },
  ],
  category_breakdown: [
    { name: '패션', value: 45, color: colors.flame[500] },
    { name: '뷰티', value: 25, color: colors.spark[500] },
    { name: '라이프스타일', value: 15, color: colors.info },
    { name: '카페', value: 10, color: colors.success },
    { name: '기타', value: 5, color: colors.text.tertiary },
  ],
  top_campaigns: [
    { name: 'Winter Collection', participants: 250, conversion: 79.2 },
    { name: 'Holiday Special', participants: 150, conversion: 59.3 },
    { name: 'New Year Launch', participants: 45, conversion: 0 },
  ],
  top_locations: [
    { name: '성수동', count: 4 },
    { name: '홍대', count: 3 },
    { name: '강남', count: 3 },
    { name: '잠실', count: 2 },
  ],
};

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  change: number;
  icon: typeof TrendingUp;
  color: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  suffix = '',
  change,
  icon: Icon,
  color,
  delay: _delay = 0,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <m.div variants={staggerItem}>
      <GlassCard padding="md" hover>
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: isPositive ? colors.success : colors.error }}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-white">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            {label}
          </p>
        </div>
      </GlassCard>
    </m.div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxMonthly = Math.max(...mockAnalytics.monthly_data.map((d) => d.participants), 1);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <m.div variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">분석</h1>
        <p className="mt-1" style={{ color: colors.text.secondary }}>
          캠페인 성과를 분석하고 인사이트를 확인하세요
        </p>
      </m.div>

      {/* Overview Stats */}
      <m.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="총 도달"
          value={mockAnalytics.overview.total_reach}
          change={mockAnalytics.overview.reach_change}
          icon={TrendingUp}
          color={colors.spark[500]}
        />
        <StatCard
          label="총 참여자"
          value={mockAnalytics.overview.total_participants}
          suffix="명"
          change={mockAnalytics.overview.participants_change}
          icon={Users}
          color={colors.flame[500]}
        />
        <StatCard
          label="평균 전환율"
          value={mockAnalytics.overview.avg_conversion}
          suffix="%"
          change={mockAnalytics.overview.conversion_change}
          icon={Target}
          color={colors.info}
        />
        <StatCard
          label="총 체크인"
          value={mockAnalytics.overview.total_checkins}
          suffix="회"
          change={mockAnalytics.overview.checkins_change}
          icon={MapPin}
          color={colors.success}
        />
      </m.div>

      {/* Charts Row */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Monthly Trend Chart */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">월별 추이</h3>
            <BarChart3 size={20} style={{ color: colors.text.tertiary }} />
          </div>
          <div className="h-48 flex items-end gap-2">
            {mockAnalytics.monthly_data.map((month, idx) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-1">
                  <m.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(month.participants / maxMonthly) * 140}px`,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="w-full rounded-t-md"
                    style={{ background: gradients.flame }}
                    title={`참여: ${month.participants}명`}
                  />
                  <m.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(month.checkins / maxMonthly) * 140}px`,
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.05 + 0.1 }}
                    className="w-full rounded-b-md"
                    style={{ background: colors.success }}
                    title={`체크인: ${month.checkins}회`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {mockAnalytics.monthly_data.map((month) => (
              <span key={month.month} className="text-xs" style={{ color: colors.text.tertiary }}>
                {month.month}
              </span>
            ))}
          </div>
          <div
            className="flex gap-4 mt-4 pt-4 border-t"
            style={{ borderColor: colors.border.subtle }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: colors.flame[500] }} />
              <span className="text-xs" style={{ color: colors.text.secondary }}>
                참여자
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: colors.success }} />
              <span className="text-xs" style={{ color: colors.text.secondary }}>
                체크인
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">카테고리별 분포</h3>
            <PieChart size={20} style={{ color: colors.text.tertiary }} />
          </div>
          <div className="space-y-4">
            {mockAnalytics.category_breakdown.map((cat, idx) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: colors.text.secondary }}>{cat.name}</span>
                  <span className="font-medium text-white">{cat.value}%</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </m.div>

      {/* Bottom Row */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Top Campaigns */}
        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4">성과 TOP 캠페인</h3>
          <div className="space-y-4">
            {mockAnalytics.top_campaigns.map((campaign, idx) => (
              <div
                key={campaign.name}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background:
                        idx === 0
                          ? colors.spark[500]
                          : idx === 1
                            ? colors.text.tertiary
                            : 'rgba(255, 255, 255, 0.1)',
                      color: idx <= 1 ? '#000' : colors.text.secondary,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-white font-medium">{campaign.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{campaign.participants}명</p>
                  <p className="text-xs" style={{ color: colors.text.tertiary }}>
                    전환율 {campaign.conversion}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Locations */}
        <GlassCard padding="lg">
          <h3 className="font-semibold text-white mb-4">인기 지역</h3>
          <div className="space-y-4">
            {mockAnalytics.top_locations.map((location) => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin size={18} style={{ color: colors.flame[400] }} />
                  <span style={{ color: colors.text.secondary }}>{location.name}</span>
                </div>
                <span className="text-white font-semibold">{location.count}개 캠페인</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </m.div>
    </div>
  );
}
