'use client';

import { m } from '@/lib/motion';
import { Users, MapPin, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { colors, layout } from '@/lib/design-tokens';

/**
 * CampaignCard - 캠페인 성과 카드
 */

interface Campaign {
  id: string;
  popupId: string;
  brandName: string;
  title: string;
  referrals: number;
  checkins: number;
  earnings: number;
  status: 'active' | 'completed' | 'pending';
}

interface CampaignCardProps {
  campaign: Campaign;
  index?: number;
}

export function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
  const conversionRate =
    campaign.referrals > 0 ? Math.round((campaign.checkins / campaign.referrals) * 100) : 0;

  // DES-214: 상태 색상을 colors 토큰으로 통일
  const statusConfig = {
    active: {
      label: '진행중',
      color: colors.success,
      bg: 'rgba(34, 197, 94, 0.15)',
    },
    completed: {
      label: '완료',
      color: colors.text.secondary,
      bg: 'rgba(255, 255, 255, 0.1)',
    },
    pending: {
      label: '대기중',
      color: colors.spark[500],
      bg: 'rgba(255, 217, 61, 0.15)',
    },
  };

  const status = statusConfig[campaign.status];

  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      // DES-206: whileHover 통일 - scale: 1.02, y: -4
      whileHover={{ scale: 1.02, y: -4 }}
      // DES-207: whileTap 통일 - scale: 0.98
      whileTap={{ scale: 0.98 }}
      className="rounded-xl transition-all"
      style={{
        // DES-202: 카드 패딩을 layout.card.padding (20px)으로 통일
        padding: layout.card.padding,
        background: 'rgba(18, 19, 20, 0.8)',
        // DES-205: 보더 색상을 border.subtle로 통일
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <Link
        href={`/popup/${campaign.popupId}`}
        className="block"
        aria-label={`${campaign.brandName} - ${campaign.title} 캠페인 상세 보기`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-linear-text-tertiary text-xs mb-1">{campaign.brandName}</p>
            <p className="text-white font-semibold truncate">{campaign.title}</p>
          </div>
          <span
            className="px-2 py-1 rounded-full text-xs font-bold ml-2 flex-shrink-0"
            style={{
              background: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="캠페인 통계">
          <div className="text-center" aria-label={`리퍼럴 ${campaign.referrals}명`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={12} style={{ color: colors.flame[500] }} aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-sm" aria-hidden="true">
              {campaign.referrals}
            </p>
            <p className="text-linear-text-tertiary text-micro" aria-hidden="true">
              리퍼럴
            </p>
          </div>
          <div className="text-center" aria-label={`체크인 ${campaign.checkins}명`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin size={12} style={{ color: colors.success }} aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-sm" aria-hidden="true">
              {campaign.checkins}
            </p>
            <p className="text-linear-text-tertiary text-micro" aria-hidden="true">
              체크인
            </p>
          </div>
          <div className="text-center" aria-label={`전환율 ${conversionRate}퍼센트`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={12} style={{ color: colors.info }} aria-hidden="true" />
            </div>
            <p className="text-white font-bold text-sm" aria-hidden="true">
              {conversionRate}%
            </p>
            <p className="text-linear-text-tertiary text-micro" aria-hidden="true">
              전환율
            </p>
          </div>
          <div className="text-center" aria-label={`수익 ${campaign.earnings.toLocaleString()}원`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins size={12} style={{ color: colors.spark[500] }} aria-hidden="true" />
            </div>
            <p
              className="font-bold text-sm"
              style={{ color: colors.spark[500] }}
              aria-hidden="true"
            >
              ₩{campaign.earnings.toLocaleString()}
            </p>
            <p className="text-linear-text-tertiary text-micro" aria-hidden="true">
              수익
            </p>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

/**
 * CampaignList - 캠페인 목록
 */

interface CampaignListProps {
  campaigns: Campaign[];
  className?: string;
}

export function CampaignList({ campaigns, className = '' }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div
        className={`rounded-xl p-8 text-center ${className}`}
        style={{
          background: 'rgba(18, 19, 20, 0.6)',
          // DES-205: 보더 색상을 border.subtle로 통일
          border: `1px solid ${colors.border.subtle}`,
        }}
        role="status"
        aria-label="캠페인 없음"
      >
        <Users size={32} className="mx-auto mb-3 text-linear-text-tertiary" aria-hidden="true" />
        <p className="text-linear-text-tertiary text-sm mb-1">아직 캠페인이 없어요</p>
        <p className="text-linear-text-tertiary text-xs mb-4">
          추천 링크를 공유하면 캠페인이 시작됩니다
        </p>
        <Link
          href="/leader/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255, 107, 91, 0.15)',
            color: colors.flame[500],
            border: '1px solid rgba(255, 107, 91, 0.3)',
          }}
          aria-label="추천 링크 만들기"
        >
          추천 링크 만들기
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {campaigns.map((campaign, index) => (
        <CampaignCard key={campaign.id} campaign={campaign} index={index} />
      ))}
    </div>
  );
}

export default CampaignCard;
