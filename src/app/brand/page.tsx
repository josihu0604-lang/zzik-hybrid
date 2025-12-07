'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { m } from '@/lib/motion';
import {
  TrendingUp,
  Users,
  MapPin,
  Target,
  ArrowUpRight,
  Plus,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { GlassCard, AnimatedCounter } from '@/components/cosmic';
import { colors, shadows, gradients } from '@/lib/design-tokens';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import type { BrandDashboardSummary } from '@/types/brand';

// Mock data for demo
const mockSummary: BrandDashboardSummary = {
  active_campaigns: 3,
  total_campaigns: 12,
  total_participants: 2847,
  total_checkins: 1523,
  avg_conversion_rate: 53.5,
  total_reach: 15420,
  recent_campaigns: [
    {
      id: '1',
      brand_id: 'b1',
      popup_id: 'p1',
      title: '2024 Winter Collection',
      description: '겨울 신상품 런칭 팝업',
      image_url: null,
      location: '성수동 카페거리',
      latitude: 37.5445,
      longitude: 127.0561,
      category: 'fashion',
      goal_participants: 200,
      current_participants: 156,
      deadline_at: '2025-01-15T00:00:00Z',
      starts_at: '2025-01-20T00:00:00Z',
      ends_at: '2025-01-25T00:00:00Z',
      status: 'funding',
      progress_percent: 78,
      total_checkins: 0,
      conversion_rate: 0,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-06T00:00:00Z',
    },
    {
      id: '2',
      brand_id: 'b1',
      popup_id: 'p2',
      title: 'Holiday Special Event',
      description: '홀리데이 특별 이벤트',
      image_url: null,
      location: '홍대입구역',
      latitude: 37.5563,
      longitude: 126.9234,
      category: 'lifestyle',
      goal_participants: 150,
      current_participants: 150,
      deadline_at: '2024-12-20T00:00:00Z',
      starts_at: '2024-12-25T00:00:00Z',
      ends_at: '2024-12-31T00:00:00Z',
      status: 'confirmed',
      progress_percent: 100,
      total_checkins: 89,
      conversion_rate: 59.3,
      created_at: '2024-11-15T00:00:00Z',
      updated_at: '2024-12-06T00:00:00Z',
    },
  ],
};

const statCards = [
  {
    label: '활성 캠페인',
    key: 'active_campaigns' as const,
    suffix: '개',
    icon: Flame,
    color: colors.flame[500],
  },
  {
    label: '총 참여자',
    key: 'total_participants' as const,
    suffix: '명',
    icon: Users,
    color: colors.spark[500],
  },
  {
    label: '체크인 수',
    key: 'total_checkins' as const,
    suffix: '회',
    icon: MapPin,
    color: colors.success,
  },
  {
    label: '평균 전환율',
    key: 'avg_conversion_rate' as const,
    suffix: '%',
    icon: Target,
    color: colors.info,
  },
];

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: '초안', bg: 'rgba(107, 114, 128, 0.2)', text: colors.text.secondary },
    funding: { label: '펀딩중', bg: 'rgba(255, 107, 91, 0.15)', text: colors.flame[500] },
    confirmed: { label: '오픈 확정', bg: 'rgba(34, 197, 94, 0.15)', text: colors.success },
    active: { label: '진행중', bg: 'rgba(59, 130, 246, 0.15)', text: colors.info },
    completed: { label: '완료', bg: 'rgba(107, 114, 128, 0.15)', text: colors.text.tertiary },
    cancelled: { label: '취소됨', bg: 'rgba(239, 68, 68, 0.15)', text: colors.error },
  };
  return statusConfig[status] || statusConfig.draft;
}

export default function BrandDashboardPage() {
  const [summary, setSummary] = useState<BrandDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setSummary(mockSummary);
      setLoading(false);
    }, 800);
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

  if (!summary) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">브랜드 대시보드</h1>
          <p className="mt-1" style={{ color: colors.text.secondary }}>
            캠페인 성과를 한눈에 확인하세요
          </p>
        </div>
        <Link href="/brand/campaigns/new">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: gradients.flame,
              boxShadow: shadows.glow.primary,
            }}
          >
            <Plus size={20} />새 캠페인 만들기
          </m.button>
        </Link>
      </m.div>

      {/* Stats Grid */}
      <m.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = summary[stat.key];

          return (
            <m.div key={stat.key} variants={staggerItem}>
              <GlassCard padding="md" hover glow="flame">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg" style={{ background: `${stat.color}20` }}>
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight size={16} style={{ color: colors.text.tertiary }} />
                </div>
                <div className="mt-4">
                  <p className="text-2xl lg:text-3xl font-bold" style={{ color: stat.color }}>
                    <AnimatedCounter
                      value={typeof value === 'number' ? value : 0}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                    {stat.label}
                  </p>
                </div>
              </GlassCard>
            </m.div>
          );
        })}
      </m.div>

      {/* Recent Campaigns */}
      <m.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">최근 캠페인</h2>
          <Link href="/brand/campaigns">
            <m.span
              whileHover={{ x: 4 }}
              className="flex items-center gap-1 text-sm"
              style={{ color: colors.flame[500] }}
            >
              전체 보기
              <ChevronRight size={16} />
            </m.span>
          </Link>
        </div>

        <div className="space-y-4">
          {summary.recent_campaigns.map((campaign) => {
            const status = getStatusBadge(campaign.status);

            return (
              <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}`}>
                <GlassCard padding="md" hover glow="flame">
                  <div className="flex items-start gap-4">
                    {/* Campaign Image Placeholder */}
                    <div
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: gradients.cold,
                        border: `1px solid ${colors.border.subtle}`,
                      }}
                    >
                      <Flame size={24} style={{ color: colors.flame[400] }} />
                    </div>

                    {/* Campaign Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white truncate">{campaign.title}</h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                          style={{ background: status.bg, color: status.text }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p
                        className="text-sm mt-1 flex items-center gap-1"
                        style={{ color: colors.text.secondary }}
                      >
                        <MapPin size={14} />
                        {campaign.location}
                      </p>

                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color: colors.text.tertiary }}>참여 진행률</span>
                          <span style={{ color: colors.flame[500] }}>
                            {campaign.current_participants}/{campaign.goal_participants}명
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                        >
                          <m.div
                            initial={{ width: 0 }}
                            animate={{ width: `${campaign.progress_percent}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              background:
                                campaign.progress_percent >= 100 ? colors.success : gradients.flame,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </m.section>

      {/* Quick Stats */}
      <m.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="grid lg:grid-cols-2 gap-4"
      >
        {/* Reach */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">총 도달</h3>
            <TrendingUp size={20} style={{ color: colors.spark[500] }} />
          </div>
          <p className="text-4xl font-bold" style={{ color: colors.spark[500] }}>
            <AnimatedCounter value={summary.total_reach} suffix="" />
          </p>
          <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
            누적 노출 수
          </p>
        </GlassCard>

        {/* Campaigns Overview */}
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">캠페인 현황</h3>
            <Megaphone size={20} style={{ color: colors.flame[500] }} />
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-4xl font-bold" style={{ color: colors.flame[500] }}>
                {summary.active_campaigns}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                활성
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold" style={{ color: colors.text.tertiary }}>
                {summary.total_campaigns}
              </p>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                전체
              </p>
            </div>
          </div>
        </GlassCard>
      </m.section>
    </div>
  );
}

function Megaphone({ size = 24, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
