'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { m } from '@/lib/motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Flame,
  BarChart3,
  QrCode,
  Receipt,
  Navigation,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { GlassCard, AnimatedCounter } from '@/components/cosmic';
import { colors, gradients } from '@/lib/design-tokens';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import type { BrandCampaign, CampaignStats } from '@/types/brand';

// Mock data
const mockCampaigns: Record<string, BrandCampaign> = {
  '1': {
    id: '1',
    brand_id: 'b1',
    popup_id: 'p1',
    title: '2024 Winter Collection',
    description: '겨울 신상품 런칭 팝업스토어입니다. 새로운 컬렉션을 가장 먼저 만나보세요.',
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
  '2': {
    id: '2',
    brand_id: 'b1',
    popup_id: 'p2',
    title: 'Holiday Special Event',
    description: '홀리데이 특별 이벤트! 연말 분위기를 함께 즐겨요.',
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
};

const mockStats: CampaignStats = {
  campaign_id: '2',
  total_participants: 150,
  goal_participants: 150,
  progress_percent: 100,
  total_checkins: 89,
  passed_checkins: 72,
  conversion_rate: 59.3,
  daily_participants: [
    { date: '2024-12-01', count: 12 },
    { date: '2024-12-02', count: 18 },
    { date: '2024-12-03', count: 15 },
    { date: '2024-12-04', count: 22 },
    { date: '2024-12-05', count: 25 },
    { date: '2024-12-06', count: 28 },
    { date: '2024-12-07', count: 30 },
  ],
  daily_checkins: [
    { date: '2024-12-25', count: 15 },
    { date: '2024-12-26', count: 18 },
    { date: '2024-12-27', count: 12 },
    { date: '2024-12-28', count: 20 },
    { date: '2024-12-29', count: 14 },
    { date: '2024-12-30', count: 10 },
  ],
  verification_breakdown: {
    gps_verified: 89,
    qr_verified: 78,
    receipt_verified: 45,
    multi_verified: 38,
  },
};

interface PageParams {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: '초안', bg: 'rgba(107, 114, 128, 0.2)', text: colors.text.secondary },
  funding: { label: '펀딩중', bg: 'rgba(255, 107, 91, 0.15)', text: colors.flame[500] },
  confirmed: { label: '오픈 확정', bg: 'rgba(34, 197, 94, 0.15)', text: colors.success },
  active: { label: '진행중', bg: 'rgba(59, 130, 246, 0.15)', text: colors.info },
  completed: { label: '완료', bg: 'rgba(107, 114, 128, 0.15)', text: colors.text.tertiary },
  cancelled: { label: '취소됨', bg: 'rgba(239, 68, 68, 0.15)', text: colors.error },
};

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

export default function CampaignDetailPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const [campaign, setCampaign] = useState<BrandCampaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCampaign(mockCampaigns[resolvedParams.id] || mockCampaigns['1']);
      setStats(mockStats);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-white">캠페인을 찾을 수 없습니다</p>
      </div>
    );
  }

  const status = statusConfig[campaign.status] || statusConfig.draft;
  const showCheckinStats = ['confirmed', 'active', 'completed'].includes(campaign.status);
  const maxDailyParticipants = stats
    ? Math.max(...stats.daily_participants.map((d) => d.count), 1)
    : 1;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <Link href="/brand/campaigns">
            <m.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl mt-1"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <ArrowLeft size={20} style={{ color: colors.text.secondary }} />
            </m.button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{campaign.title}</h1>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: status.bg, color: status.text }}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-2" style={{ color: colors.text.secondary }}>
              {campaign.description}
            </p>
          </div>
        </div>
        <m.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
        >
          <MoreHorizontal size={20} style={{ color: colors.text.secondary }} />
        </m.button>
      </m.div>

      {/* Campaign Info Card */}
      <m.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <GlassCard padding="lg" glow="flame">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            <div
              className="w-full lg:w-48 h-48 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: gradients.cold,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              <Flame size={48} style={{ color: colors.flame[400] }} />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} style={{ color: colors.text.tertiary }} />
                  <span style={{ color: colors.text.secondary }}>{campaign.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={18} style={{ color: colors.text.tertiary }} />
                  <span style={{ color: colors.text.secondary }}>
                    목표 {campaign.goal_participants}명
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} style={{ color: colors.text.tertiary }} />
                  <span style={{ color: colors.text.secondary }}>
                    마감 {formatShortDate(campaign.deadline_at)}
                  </span>
                </div>
                {campaign.starts_at && (
                  <div className="flex items-center gap-2">
                    <Clock size={18} style={{ color: colors.text.tertiary }} />
                    <span style={{ color: colors.text.secondary }}>
                      시작 {formatShortDate(campaign.starts_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: colors.text.secondary }}>참여 진행률</span>
                  <span style={{ color: colors.flame[500] }} className="font-semibold">
                    {campaign.current_participants}/{campaign.goal_participants}명 (
                    {campaign.progress_percent}%)
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 107, 91, 0.1)' }}
                >
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${campaign.progress_percent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
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
      </m.div>

      {/* Stats Grid */}
      <m.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <m.div variants={staggerItem}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} style={{ color: colors.flame[500] }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.flame[500] }}>
              <AnimatedCounter value={campaign.current_participants} />
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              참여자
            </p>
          </GlassCard>
        </m.div>

        <m.div variants={staggerItem}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-2">
              <Target size={20} style={{ color: colors.spark[500] }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.spark[500] }}>
              {campaign.progress_percent}%
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              달성률
            </p>
          </GlassCard>
        </m.div>

        {showCheckinStats && (
          <>
            <m.div variants={staggerItem}>
              <GlassCard padding="md">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle size={20} style={{ color: colors.success }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: colors.success }}>
                  <AnimatedCounter value={campaign.total_checkins} />
                </p>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  체크인
                </p>
              </GlassCard>
            </m.div>

            <m.div variants={staggerItem}>
              <GlassCard padding="md">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp size={20} style={{ color: colors.info }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: colors.info }}>
                  {campaign.conversion_rate}%
                </p>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  전환율
                </p>
              </GlassCard>
            </m.div>
          </>
        )}
      </m.div>

      {/* Charts */}
      {stats && (
        <m.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Daily Participation Chart */}
          <GlassCard padding="lg">
            <h3 className="font-semibold text-white mb-4">일별 참여 추이</h3>
            <div className="h-40 flex items-end gap-1">
              {stats.daily_participants.slice(-7).map((day, idx) => (
                <m.div
                  key={day.date}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(day.count / maxDailyParticipants) * 100}%`,
                  }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex-1 rounded-t-md min-h-[4px]"
                  style={{ background: gradients.flame }}
                  title={`${formatShortDate(day.date)}: ${day.count}명`}
                />
              ))}
            </div>
            <div
              className="flex justify-between mt-2 text-xs"
              style={{ color: colors.text.tertiary }}
            >
              {stats.daily_participants.slice(-7).map((day) => (
                <span key={day.date}>
                  {formatShortDate(day.date).replace('월 ', '/').replace('일', '')}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Verification Breakdown */}
          {showCheckinStats && (
            <GlassCard padding="lg">
              <h3 className="font-semibold text-white mb-4">인증 방법 통계</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      <Navigation size={16} />
                      GPS 인증
                    </span>
                    <span className="text-sm text-white">
                      {stats.verification_breakdown.gps_verified}회
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <m.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.verification_breakdown.gps_verified / stats.total_checkins) * 100
                        }%`,
                      }}
                      className="h-full rounded-full"
                      style={{ background: colors.info }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      <QrCode size={16} />
                      QR 인증
                    </span>
                    <span className="text-sm text-white">
                      {stats.verification_breakdown.qr_verified}회
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <m.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.verification_breakdown.qr_verified / stats.total_checkins) * 100
                        }%`,
                      }}
                      className="h-full rounded-full"
                      style={{ background: colors.flame[500] }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      <Receipt size={16} />
                      영수증 인증
                    </span>
                    <span className="text-sm text-white">
                      {stats.verification_breakdown.receipt_verified}회
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <m.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.verification_breakdown.receipt_verified / stats.total_checkins) *
                          100
                        }%`,
                      }}
                      className="h-full rounded-full"
                      style={{ background: colors.spark[500] }}
                    />
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t" style={{ borderColor: colors.border.subtle }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      <CheckCircle size={16} style={{ color: colors.success }} />
                      복합 인증 (3단계)
                    </span>
                    <span className="text-sm font-semibold" style={{ color: colors.success }}>
                      {stats.verification_breakdown.multi_verified}회
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </m.div>
      )}

      {/* Actions */}
      <m.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="flex gap-4"
      >
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${colors.border.subtle}`,
            color: colors.text.secondary,
          }}
        >
          <Edit size={18} />
          수정하기
        </m.button>
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium"
          style={{
            background: gradients.flame,
            color: 'white',
          }}
        >
          <BarChart3 size={18} />
          리포트 다운로드
        </m.button>
      </m.div>
    </div>
  );
}
