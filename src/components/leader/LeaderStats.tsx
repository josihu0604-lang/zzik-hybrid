'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, MapPin, Coins } from 'lucide-react';
import { colors, layout, spacing, rgba, withOpacity } from '@/lib/design-tokens';

/**
 * LeaderStats - 리더 통계 그리드
 */

interface LeaderStatsProps {
  totalEarnings: number;
  thisMonthEarnings: number;
  totalReferrals: number;
  thisMonthReferrals: number;
  totalCheckins: number;
  commissionRate: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만`;
  }
  return amount.toLocaleString();
}

export function LeaderStats({
  totalEarnings,
  thisMonthEarnings,
  totalReferrals,
  thisMonthReferrals,
  totalCheckins,
  commissionRate,
}: LeaderStatsProps) {
  // DES-214: 하드코딩 색상을 colors 토큰으로 교체
  const stats = [
    {
      label: '총 수익',
      value: `₩${formatCurrency(totalEarnings)}`,
      subValue: `이번 달 ₩${formatCurrency(thisMonthEarnings)}`,
      icon: Coins,
      color: colors.spark[500],
      bgColor: rgba.spark[15],
      borderColor: withOpacity(colors.spark[500], 0.3),
    },
    {
      label: '총 리퍼럴',
      value: totalReferrals.toString(),
      subValue: `이번 달 +${thisMonthReferrals}`,
      icon: Users,
      color: colors.flame[500],
      bgColor: rgba.flame[15],
      borderColor: withOpacity(colors.flame[500], 0.3),
    },
    {
      label: '체크인',
      value: totalCheckins.toString(),
      subValue: `전환율 ${totalReferrals > 0 ? Math.round((totalCheckins / totalReferrals) * 100) : 0}%`,
      icon: MapPin,
      color: colors.success,
      bgColor: rgba.success[15],
      borderColor: withOpacity(colors.success, 0.3),
    },
    {
      label: '수수료율',
      value: `${commissionRate}%`,
      subValue: '체크인당 적용',
      icon: TrendingUp,
      color: colors.info,
      bgColor: withOpacity(colors.info, 0.15),
      borderColor: withOpacity(colors.info, 0.3),
    },
  ];

  return (
    // DES-211: gap을 layout.section.gap (24px)으로 통일
    <div className="grid grid-cols-2" style={{ gap: layout.section.gap }}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            // DES-206: whileHover 통일 - scale: 1.02, y: -4
            whileHover={{ scale: 1.02, y: -4 }}
            // DES-207: whileTap 통일 - scale: 0.98
            whileTap={{ scale: 0.98 }}
            className="rounded-xl transition-all"
            style={{
              padding: spacing[4],
              background: stat.bgColor,
              border: `1px solid ${stat.borderColor}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} style={{ color: stat.color }} />
              <span className="text-linear-text-tertiary text-xs font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-black mb-0.5" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-linear-text-tertiary text-xs">{stat.subValue}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export default LeaderStats;
