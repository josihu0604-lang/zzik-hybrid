'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * ReferralList - 최근 리퍼럴 목록
 *
 * 리퍼럴 유저 목록과 체크인 상태를 표시
 */

export interface Referral {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  popupName: string;
  referredAt: string;
  status: 'pending' | 'checked_in' | 'expired';
  checkedInAt?: string;
  earnings?: number;
}

interface ReferralListProps {
  referrals: Referral[];
  className?: string;
  showFilter?: boolean;
}

type FilterType = 'all' | 'pending' | 'checked_in' | 'expired';

const STATUS_CONFIG = {
  pending: {
    label: '방문 대기',
    icon: Clock,
    color: colors.spark[500],
    bg: 'rgba(255, 217, 61, 0.15)',
  },
  checked_in: {
    label: '체크인 완료',
    icon: CheckCircle,
    color: colors.success,
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  expired: {
    label: '기간 만료',
    icon: XCircle,
    color: colors.text.tertiary,
    bg: 'rgba(255, 255, 255, 0.08)',
  },
};

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '방문 대기' },
  { value: 'checked_in', label: '체크인' },
  { value: 'expired', label: '만료' },
];

export function ReferralList({ referrals, className = '', showFilter = true }: ReferralListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter referrals
  const filteredReferrals =
    filter === 'all' ? referrals : referrals.filter((r) => r.status === filter);

  // Show only first 5 when collapsed
  const displayReferrals = isExpanded ? filteredReferrals : filteredReferrals.slice(0, 5);
  const hasMore = filteredReferrals.length > 5;

  // Stats
  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    checkedIn: referrals.filter((r) => r.status === 'checked_in').length,
    expired: referrals.filter((r) => r.status === 'expired').length,
  };

  const conversionRate = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  if (referrals.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 text-center ${className}`}
        style={{
          background: 'rgba(18, 19, 20, 0.8)',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <Users size={32} className="mx-auto mb-3 opacity-30" style={{ color: colors.flame[500] }} />
        <p className="text-linear-text-secondary text-sm">아직 리퍼럴이 없습니다</p>
        <p className="text-linear-text-tertiary text-xs mt-1">
          추천 링크를 공유해서 첫 리퍼럴을 만들어보세요!
        </p>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 107, 91, 0.1) 0%, rgba(255, 217, 61, 0.1) 100%)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255, 107, 91, 0.2)' }}
          >
            <Users size={20} style={{ color: colors.flame[500] }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">최근 리퍼럴</h3>
            <p className="text-linear-text-tertiary text-xs">
              {stats.total}명 중 {stats.checkedIn}명 체크인 ({conversionRate}%)
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: colors.spark[500] }}>
              {stats.pending}
            </p>
            <p className="text-micro text-linear-text-tertiary">대기</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold" style={{ color: colors.success }}>
              {stats.checkedIn}
            </p>
            <p className="text-micro text-linear-text-tertiary">완료</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      {showFilter && (
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-linear-text-tertiary flex-shrink-0" />
          {FILTER_OPTIONS.map((option) => (
            <m.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(option.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background:
                  filter === option.value ? 'rgba(255, 107, 91, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: filter === option.value ? colors.flame[500] : colors.text.secondary,
                border: `1px solid ${filter === option.value ? colors.flame[500] + '40' : 'transparent'}`,
              }}
            >
              {option.label}
            </m.button>
          ))}
        </div>
      )}

      {/* Referral Items */}
      <div className="p-4 pt-2">
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {displayReferrals.map((referral, index) => (
              <ReferralItem key={referral.id} referral={referral} index={index} />
            ))}
          </div>
        </AnimatePresence>

        {/* Show More/Less Button */}
        {hasMore && (
          <m.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: colors.text.secondary,
            }}
          >
            {isExpanded ? (
              <>
                접기 <ChevronUp size={14} />
              </>
            ) : (
              <>
                {filteredReferrals.length - 5}명 더 보기 <ChevronDown size={14} />
              </>
            )}
          </m.button>
        )}
      </div>
    </m.div>
  );
}

/**
 * ReferralItem - 개별 리퍼럴 아이템
 */
function ReferralItem({ referral, index }: { referral: Referral; index: number }) {
  const status = STATUS_CONFIG[referral.status];
  const StatusIcon = status.icon;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <m.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.03 }}
      layout
      className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]}30 0%, ${colors.spark[500]}30 100%)`,
          color: colors.flame[400],
        }}
      >
        {referral.userInitial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm truncate">{referral.userName}</p>
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-micro font-medium"
            style={{ background: status.bg, color: status.color }}
          >
            <StatusIcon size={10} />
            {status.label}
          </span>
        </div>
        <p className="text-linear-text-tertiary text-xs truncate">{referral.popupName}</p>
      </div>

      {/* Right Side */}
      <div className="text-right flex-shrink-0">
        {referral.status === 'checked_in' && referral.earnings ? (
          <p className="text-sm font-bold" style={{ color: colors.spark[500] }}>
            +{referral.earnings.toLocaleString()}
          </p>
        ) : null}
        <p className="text-micro text-linear-text-tertiary flex items-center gap-1 justify-end">
          <Calendar size={10} />
          {formatDate(referral.referredAt)}
        </p>
      </div>
    </m.div>
  );
}

// Demo data generator
export function generateDemoReferrals(count: number = 10): Referral[] {
  const names = [
    '김민수',
    '이지현',
    '박서준',
    '최유나',
    '정다은',
    '강현우',
    '윤소희',
    '임재현',
    '한미영',
    '오승현',
  ];
  const popups = [
    '성수 카페 팝업',
    '뷰티 브랜드 체험존',
    '패션 편집샵',
    'K-POP 굿즈샵',
    '푸드 페스티벌',
  ];
  const statuses: Referral['status'][] = ['pending', 'checked_in', 'expired'];

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length];
    const status = statuses[Math.floor(Math.random() * 3)];
    const daysAgo = Math.floor(Math.random() * 14);
    const referredAt = new Date();
    referredAt.setDate(referredAt.getDate() - daysAgo);
    referredAt.setHours(referredAt.getHours() - Math.floor(Math.random() * 24));

    return {
      id: `ref-${i + 1}`,
      userId: `user-${i + 1}`,
      userName: name,
      userInitial: name.charAt(0),
      popupName: popups[Math.floor(Math.random() * popups.length)],
      referredAt: referredAt.toISOString(),
      status,
      checkedInAt:
        status === 'checked_in'
          ? new Date(referredAt.getTime() + Math.random() * 86400000).toISOString()
          : undefined,
      earnings: status === 'checked_in' ? 500 + Math.floor(Math.random() * 500) : undefined,
    };
  });
}

export const DEMO_REFERRALS = generateDemoReferrals(12);

export default ReferralList;
