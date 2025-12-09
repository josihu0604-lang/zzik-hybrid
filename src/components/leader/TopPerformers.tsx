'use client';

import { m } from 'framer-motion';
import { Trophy, TrendingUp, Users, MapPin } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * TopPerformers - 상위 성과 팝업 카드
 *
 * 리더의 상위 성과 캠페인을 표시
 */

interface TopPerformer {
  popupId: string;
  brandName: string;
  title: string;
  referrals: number;
  checkins: number;
  earnings: number;
  conversionRate: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
  className?: string;
}

export function TopPerformers({ performers, className = '' }: TopPerformersProps) {
  if (performers.length === 0) {
    return (
      <div
        className={`rounded-xl p-6 text-center ${className}`}
        style={{
          background: 'rgba(18, 19, 20, 0.8)',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <Trophy
          size={32}
          className="mx-auto mb-3 opacity-30"
          style={{ color: colors.spark[500] }}
        />
        <p className="text-linear-text-secondary text-sm">아직 성과 데이터가 없습니다</p>
        <p className="text-linear-text-tertiary text-xs mt-1">
          추천 링크를 공유하고 성과를 쌓아보세요!
        </p>
      </div>
    );
  }

  const topPerformer = performers[0];
  const otherPerformers = performers.slice(1, 4);

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} style={{ color: colors.spark[500] }} />
        <h3 className="text-white font-bold">상위 성과 캠페인</h3>
      </div>

      {/* Top Performer Card */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="rounded-xl p-5 mb-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 199, 0, 0.1) 100%)',
          border: '1px solid rgba(255, 217, 61, 0.3)',
        }}
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold mb-3"
          style={{
            background: colors.spark[500],
            color: 'black',
          }}
        >
          <Trophy size={12} />
          TOP 1
        </div>

        {/* Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-linear-text-tertiary text-xs mb-1">{topPerformer.brandName}</p>
            <h4 className="text-white font-bold text-lg mb-2">{topPerformer.title}</h4>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <Users size={14} style={{ color: colors.flame[500] }} />
                <div>
                  <p className="text-white font-bold text-sm">{topPerformer.referrals}</p>
                  <p className="text-linear-text-tertiary text-micro">리퍼럴</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: colors.success }} />
                <div>
                  <p className="text-white font-bold text-sm">{topPerformer.checkins}</p>
                  <p className="text-linear-text-tertiary text-micro">체크인</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} style={{ color: colors.info }} />
                <div>
                  <p className="text-white font-bold text-sm">{topPerformer.conversionRate}%</p>
                  <p className="text-linear-text-tertiary text-micro">전환율</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="text-right">
            <p className="text-linear-text-tertiary text-xs mb-1">수익</p>
            <p className="text-2xl font-black" style={{ color: colors.spark[500] }}>
              {formatCurrency(topPerformer.earnings)}
            </p>
          </div>
        </div>
      </m.div>

      {/* Other Performers */}
      {otherPerformers.length > 0 && (
        <div className="space-y-2">
          {otherPerformers.map((performer, index) => (
            <m.div
              key={performer.popupId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: 'rgba(18, 19, 20, 0.8)',
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              {/* Rank Badge */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: colors.text.secondary,
                }}
              >
                {index + 2}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{performer.title}</p>
                <p className="text-linear-text-tertiary text-xs">{performer.brandName}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 ml-3">
                <div className="text-center">
                  <p className="text-white font-bold text-sm">{performer.checkins}</p>
                  <p className="text-linear-text-tertiary text-micro">체크인</p>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="font-bold text-sm" style={{ color: colors.spark[500] }}>
                    {formatCurrency(performer.earnings)}
                  </p>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Format currency (Korean Won)
 */
function formatCurrency(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만`;
    }
    return `${man}.${Math.floor(remainder / 1000)}만`;
  }
  return `${amount.toLocaleString()}`;
}

export default TopPerformers;
