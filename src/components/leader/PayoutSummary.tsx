'use client';

import { m } from '@/lib/motion';
import { Clock, CheckCircle, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { colors } from '@/lib/design-tokens';

/**
 * PayoutSummary - 정산 현황 요약
 *
 * 대기/확정/지급완료 수익 표시
 */

interface PayoutData {
  pending: number;
  confirmed: number;
  paid: number;
  nextPayoutDate?: string;
}

interface PayoutSummaryProps {
  data: PayoutData;
  className?: string;
}

export function PayoutSummary({ data, className = '' }: PayoutSummaryProps) {
  const total = data.pending + data.confirmed + data.paid;

  const items = [
    {
      label: '정산 대기',
      amount: data.pending,
      icon: Clock,
      color: colors.spark[500],
      description: '체크인 확인 대기 중',
    },
    {
      label: '정산 확정',
      amount: data.confirmed,
      icon: CheckCircle,
      color: colors.success,
      description: '다음 정산일에 지급 예정',
    },
    {
      label: '지급 완료',
      amount: data.paid,
      icon: Wallet,
      color: colors.info,
      description: '누적 지급 금액',
    },
  ];

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
            'linear-gradient(135deg, rgba(255, 217, 61, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div>
          <h3 className="text-white font-bold text-sm">정산 현황</h3>
          <p className="text-linear-text-tertiary text-xs">
            {data.nextPayoutDate ? `다음 정산: ${data.nextPayoutDate}` : '정산일 확인 필요'}
          </p>
        </div>
        <Link
          href="/leader/payouts"
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: colors.spark[500] }}
        >
          상세보기 <ArrowRight size={12} />
        </Link>
      </div>

      {/* Payout Items */}
      <div className="p-4">
        <div className="space-y-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            const percentage = total > 0 ? (item.amount / total) * 100 : 0;

            return (
              <m.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}
                >
                  <Icon size={18} style={{ color: item.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-linear-text-secondary text-xs">{item.label}</span>
                    <span className="font-bold text-sm" style={{ color: item.color }}>
                      {item.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <m.div
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Request Payout Button */}
        {data.confirmed >= 10000 && (
          <m.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${colors.success} 0%, ${colors.success}cc 100%)`,
              boxShadow: `0 4px 16px ${colors.success}40`,
            }}
          >
            <Wallet size={16} />
            {data.confirmed.toLocaleString()} 정산 요청하기
          </m.button>
        )}
      </div>
    </m.div>
  );
}

// Demo data
export const DEMO_PAYOUT_DATA: PayoutData = {
  pending: 15000,
  confirmed: 42500,
  paid: 125000,
  nextPayoutDate: '12/15',
};

export default PayoutSummary;
