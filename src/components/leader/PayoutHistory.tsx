'use client';

import { useState } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * PayoutHistory - 정산 이력
 *
 * 과거 정산 내역과 상태를 표시
 */

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  method: 'bank' | 'kakao' | 'toss';
  accountInfo?: string; // 마스킹된 계좌 정보
  referrals: number;
  checkins: number;
  failReason?: string;
}

interface PayoutHistoryProps {
  payouts: Payout[];
  className?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: '대기중',
    icon: Clock,
    color: colors.spark[500],
    bg: 'rgba(255, 217, 61, 0.15)',
    description: '정산 요청이 접수되었습니다',
  },
  processing: {
    label: '처리중',
    icon: ArrowUpRight,
    color: colors.info,
    bg: 'rgba(59, 130, 246, 0.15)',
    description: '정산이 진행 중입니다',
  },
  completed: {
    label: '완료',
    icon: CheckCircle,
    color: colors.success,
    bg: 'rgba(34, 197, 94, 0.15)',
    description: '정산이 완료되었습니다',
  },
  failed: {
    label: '실패',
    icon: XCircle,
    color: colors.error,
    bg: 'rgba(239, 68, 68, 0.15)',
    description: '정산에 실패했습니다',
  },
};

const METHOD_CONFIG = {
  bank: { label: '계좌이체', icon: CreditCard },
  kakao: { label: '카카오페이', icon: Wallet },
  toss: { label: '토스', icon: Wallet },
};

export function PayoutHistory({ payouts, className = '' }: PayoutHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Stats
  const totalPaid = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);

  if (payouts.length === 0) {
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
        <Wallet
          size={32}
          className="mx-auto mb-3 opacity-30"
          style={{ color: colors.spark[500] }}
        />
        <p className="text-linear-text-secondary text-sm">정산 이력이 없습니다</p>
        <p className="text-linear-text-tertiary text-xs mt-1">
          체크인 수익이 1만원 이상 되면 정산 요청할 수 있어요
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
        className="p-4"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 217, 61, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 217, 61, 0.2)' }}
            >
              <Wallet size={20} style={{ color: colors.spark[500] }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">정산 이력</h3>
              <p className="text-linear-text-tertiary text-xs">총 {payouts.length}건의 정산</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-micro text-linear-text-tertiary">누적 정산</p>
              <p className="text-sm font-bold" style={{ color: colors.success }}>
                {totalPaid.toLocaleString()}
              </p>
            </div>
            {pendingAmount > 0 && (
              <div className="text-right">
                <p className="text-micro text-linear-text-tertiary">진행중</p>
                <p className="text-sm font-bold" style={{ color: colors.spark[500] }}>
                  {pendingAmount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Items */}
      <div className="p-4">
        <div className="space-y-3">
          {payouts.map((payout, index) => (
            <PayoutItem
              key={payout.id}
              payout={payout}
              index={index}
              isExpanded={expandedId === payout.id}
              onToggle={() => setExpandedId(expandedId === payout.id ? null : payout.id)}
            />
          ))}
        </div>
      </div>
    </m.div>
  );
}

/**
 * PayoutItem - 개별 정산 아이템
 */
function PayoutItem({
  payout,
  index,
  isExpanded,
  onToggle,
}: {
  payout: Payout;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_CONFIG[payout.status];
  const method = METHOD_CONFIG[payout.method];
  const StatusIcon = status.icon;
  const MethodIcon = method.icon;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${payout.status === 'failed' ? colors.error + '40' : colors.border.subtle}`,
      }}
    >
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/5"
      >
        {/* Status Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: status.bg }}
        >
          <StatusIcon size={20} style={{ color: status.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold text-lg">{payout.amount.toLocaleString()}</p>
            <span
              className="px-2 py-0.5 rounded-full text-micro font-medium"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          </div>
          <p className="text-linear-text-tertiary text-xs flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(payout.requestedAt)}
            <span className="mx-1">|</span>
            <MethodIcon size={10} />
            {method.label}
          </p>
        </div>

        {/* Expand Icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp size={16} className="text-linear-text-tertiary" />
          ) : (
            <ChevronDown size={16} className="text-linear-text-tertiary" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-2 space-y-3"
              style={{ borderTop: `1px solid ${colors.border.subtle}` }}
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <p className="text-linear-text-tertiary text-micro mb-1">리퍼럴</p>
                  <p className="text-white font-bold text-sm">{payout.referrals}명</p>
                </div>
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <p className="text-linear-text-tertiary text-micro mb-1">체크인</p>
                  <p className="text-white font-bold text-sm">{payout.checkins}건</p>
                </div>
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <p className="text-linear-text-tertiary text-micro mb-1">건당 수익</p>
                  <p className="font-bold text-sm" style={{ color: colors.spark[500] }}>
                    {payout.checkins > 0
                      ? Math.round(payout.amount / payout.checkins).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>

              {/* Account Info */}
              {payout.accountInfo && (
                <div
                  className="p-3 rounded-lg flex items-center gap-2"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <CreditCard size={14} className="text-linear-text-tertiary" />
                  <span className="text-linear-text-secondary text-xs">{payout.accountInfo}</span>
                </div>
              )}

              {/* Processed Date */}
              {payout.processedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-linear-text-tertiary">처리 완료일</span>
                  <span className="text-linear-text-secondary">
                    {formatDate(payout.processedAt)}
                  </span>
                </div>
              )}

              {/* Fail Reason */}
              {payout.status === 'failed' && payout.failReason && (
                <div
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <AlertCircle
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: colors.error }}
                  />
                  <div>
                    <p className="text-xs font-medium" style={{ color: colors.error }}>
                      정산 실패 사유
                    </p>
                    <p className="text-linear-text-tertiary text-xs mt-1">{payout.failReason}</p>
                  </div>
                </div>
              )}

              {/* Status Description */}
              <p className="text-linear-text-tertiary text-xs text-center">{status.description}</p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

// Demo data
export function generateDemoPayouts(): Payout[] {
  return [
    {
      id: 'pay-1',
      amount: 42500,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      method: 'kakao',
      referrals: 23,
      checkins: 18,
    },
    {
      id: 'pay-2',
      amount: 38000,
      status: 'completed',
      requestedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      processedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      method: 'bank',
      accountInfo: '카카오뱅크 ****1234',
      referrals: 19,
      checkins: 15,
    },
    {
      id: 'pay-3',
      amount: 55000,
      status: 'completed',
      requestedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
      processedAt: new Date(Date.now() - 19 * 86400000).toISOString(),
      method: 'toss',
      accountInfo: '토스 ****5678',
      referrals: 28,
      checkins: 22,
    },
    {
      id: 'pay-4',
      amount: 12000,
      status: 'failed',
      requestedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      method: 'bank',
      accountInfo: '신한은행 ****9012',
      referrals: 8,
      checkins: 5,
      failReason: '계좌 정보가 올바르지 않습니다. 계좌 정보를 확인해주세요.',
    },
  ];
}

export const DEMO_PAYOUTS = generateDemoPayouts();

export default PayoutHistory;
