'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  CreditCard,
  Info,
  X,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { useCsrf } from '@/hooks/useCsrf';
import { logger } from '@/lib/logger';

/**
 * PayoutRequest - 정산 요청 컴포넌트
 *
 * Features:
 * - 현재 정산 가능 금액 표시
 * - 정산 요청 버튼
 * - 예상 입금일 표시
 * - 은행 정보 입력 모달
 * - 최소 정산 금액 안내
 */

interface PayoutSummary {
  pendingAmount: number;
  confirmedAmount: number;
  processingAmount: number;
  paidTotal: number;
  payableAmount: number;
  lastPayoutDate: string | null;
  nextPayoutDate: string;
  minPayoutAmount: number;
  canRequestPayout: boolean;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface PayoutRequestProps {
  className?: string;
  onPayoutRequested?: () => void;
}

// Bank list for Korea
const BANK_LIST = [
  '카카오뱅크',
  '토스뱅크',
  'KB국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  'SC제일은행',
  '케이뱅크',
  'NH농협은행',
  '기업은행',
  '우체국',
];

export function PayoutRequest({ className = '', onPayoutRequested }: PayoutRequestProps) {
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Bank info form
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const { csrfToken, getCsrfHeaders } = useCsrf();

  // Fetch payout summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leader/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        body: JSON.stringify({ action: 'summary' }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.data.summary);
      } else {
        setError(data.error || 'Failed to load payout summary');
      }
    } catch (err) {
      logger.error(
        'Error fetching payout summary',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Failed to load payout summary');
    } finally {
      setLoading(false);
    }
  }, [getCsrfHeaders]);

  useEffect(() => {
    if (csrfToken) {
      fetchSummary();
    }
  }, [csrfToken, fetchSummary]);

  // Handle payout request
  const handleRequestPayout = async () => {
    if (!summary?.canRequestPayout) return;

    // Validate bank info
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
      setError('Please fill in all bank information');
      return;
    }

    try {
      setRequesting(true);
      setError(null);

      const response = await fetch('/api/leader/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCsrfHeaders(),
        },
        body: JSON.stringify({
          action: 'request',
          amount: summary.payableAmount,
          bankName: bankInfo.bankName,
          accountNumber: bankInfo.accountNumber,
          accountHolder: bankInfo.accountHolder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${summary.payableAmount.toLocaleString()}won payout requested!`);
        setShowModal(false);
        fetchSummary(); // Refresh summary
        onPayoutRequested?.();
      } else {
        setError(data.error || 'Failed to request payout');
      }
    } catch (err) {
      logger.error('Error requesting payout', err instanceof Error ? err : new Error(String(err)));
      setError('Failed to request payout. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Get day of week for next payout
  const getPayoutDayInfo = (): string => {
    if (!summary?.nextPayoutDate) return '';
    const date = new Date(summary.nextPayoutDate);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    return `${diffDays}일 후`;
  };

  if (loading) {
    return (
      <div
        className={`rounded-xl p-6 ${className}`}
        style={{
          background: 'rgba(18, 19, 20, 0.8)',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin" style={{ color: colors.spark[500] }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
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
            background: `linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)`,
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
                <h3 className="text-white font-bold text-sm">정산 요청</h3>
                <p className="text-linear-text-tertiary text-xs">
                  {summary?.canRequestPayout
                    ? '정산 요청 가능'
                    : `최소 ${summary?.minPayoutAmount.toLocaleString()}원 필요`}
                </p>
              </div>
            </div>

            {/* Next payout date badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: colors.text.secondary,
              }}
            >
              <Calendar size={12} />
              <span>
                다음 정산: {formatDate(summary?.nextPayoutDate || null)} ({getPayoutDayInfo()})
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Error/Success messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <AlertCircle size={16} style={{ color: colors.error }} />
                <span className="text-sm" style={{ color: colors.error }}>
                  {error}
                </span>
                <button onClick={() => setError(null)} className="ml-auto p-1">
                  <X size={14} style={{ color: colors.error }} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <CheckCircle size={16} style={{ color: colors.success }} />
                <span className="text-sm" style={{ color: colors.success }}>
                  {success}
                </span>
                <button onClick={() => setSuccess(null)} className="ml-auto p-1">
                  <X size={14} style={{ color: colors.success }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payable amount display */}
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${summary?.canRequestPayout ? colors.success + '40' : colors.border.subtle}`,
            }}
          >
            <p className="text-linear-text-tertiary text-xs mb-1">정산 가능 금액</p>
            <p
              className="text-3xl font-black"
              style={{
                color: summary?.canRequestPayout ? colors.success : colors.text.primary,
              }}
            >
              {(summary?.payableAmount || 0).toLocaleString()}
              <span className="text-base font-normal ml-1">원</span>
            </p>
            {!summary?.canRequestPayout && (
              <p className="text-linear-text-tertiary text-xs mt-2">
                {(summary?.minPayoutAmount || 10000).toLocaleString()}원 이상부터 정산 가능
              </p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="p-3 rounded-lg text-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Clock size={14} className="mx-auto mb-1" style={{ color: colors.spark[500] }} />
              <p className="text-linear-text-tertiary text-micro">대기중</p>
              <p className="text-white font-bold text-sm">
                {(summary?.pendingAmount || 0).toLocaleString()}
              </p>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Loader2 size={14} className="mx-auto mb-1" style={{ color: colors.info }} />
              <p className="text-linear-text-tertiary text-micro">처리중</p>
              <p className="text-white font-bold text-sm">
                {(
                  (summary?.confirmedAmount || 0) + (summary?.processingAmount || 0)
                ).toLocaleString()}
              </p>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <CheckCircle size={14} className="mx-auto mb-1" style={{ color: colors.success }} />
              <p className="text-linear-text-tertiary text-micro">누적 지급</p>
              <p className="font-bold text-sm" style={{ color: colors.success }}>
                {(summary?.paidTotal || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Info box */}
          <div
            className="flex items-start gap-2 p-3 rounded-lg"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.info }} />
            <div className="text-xs" style={{ color: colors.info }}>
              <p className="font-medium mb-1">정산 안내</p>
              <ul className="space-y-0.5 text-linear-text-tertiary">
                <li>- 최소 정산 금액: {(summary?.minPayoutAmount || 10000).toLocaleString()}원</li>
                <li>- 정산 주기: 매주 목요일</li>
                <li>- 수수료: 0% (무료)</li>
              </ul>
            </div>
          </div>

          {/* Request button */}
          <motion.button
            onClick={() => setShowModal(true)}
            disabled={!summary?.canRequestPayout}
            whileHover={summary?.canRequestPayout ? { scale: 1.02 } : {}}
            whileTap={summary?.canRequestPayout ? { scale: 0.98 } : {}}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: summary?.canRequestPayout
                ? `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`
                : 'rgba(255, 255, 255, 0.1)',
              color: summary?.canRequestPayout ? '#fff' : colors.text.tertiary,
              boxShadow: summary?.canRequestPayout ? `0 4px 16px ${colors.success}40` : 'none',
              cursor: summary?.canRequestPayout ? 'pointer' : 'not-allowed',
            }}
          >
            <Wallet size={18} />
            {summary?.canRequestPayout
              ? `${(summary?.payableAmount || 0).toLocaleString()}원 정산 요청하기`
              : '정산 요청 불가'}
            {summary?.canRequestPayout && <ChevronRight size={16} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Bank Info Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
              style={{
                background: colors.space[850],
                border: `1px solid ${colors.border.default}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                  >
                    <CreditCard size={20} style={{ color: colors.success }} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">정산 정보 입력</h3>
                    <p className="text-linear-text-tertiary text-xs">
                      {(summary?.payableAmount || 0).toLocaleString()}원 정산 요청
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-linear-text-tertiary" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* Bank selection */}
                <div>
                  <label className="block text-linear-text-secondary text-sm mb-2">은행</label>
                  <select
                    value={bankInfo.bankName}
                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${colors.border.default}`,
                      color: bankInfo.bankName ? colors.text.primary : colors.text.tertiary,
                    }}
                  >
                    <option value="">은행 선택</option>
                    {BANK_LIST.map((bank) => (
                      <option key={bank} value={bank} style={{ background: colors.space[800] }}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account number */}
                <div>
                  <label className="block text-linear-text-secondary text-sm mb-2">계좌번호</label>
                  <input
                    type="text"
                    value={bankInfo.accountNumber}
                    onChange={(e) =>
                      setBankInfo({ ...bankInfo, accountNumber: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="'-' 없이 숫자만 입력"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 placeholder:text-linear-text-muted"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${colors.border.default}`,
                    }}
                  />
                </div>

                {/* Account holder */}
                <div>
                  <label className="block text-linear-text-secondary text-sm mb-2">예금주</label>
                  <input
                    type="text"
                    value={bankInfo.accountHolder}
                    onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                    placeholder="예금주명 입력"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 placeholder:text-linear-text-muted"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${colors.border.default}`,
                    }}
                  />
                </div>

                {/* Expected payment date */}
                <div
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: colors.spark[500] }} />
                    <span className="text-linear-text-secondary text-sm">예상 입금일</span>
                  </div>
                  <span className="text-white font-bold text-sm">
                    {formatDate(summary?.nextPayoutDate || null)} (목)
                  </span>
                </div>

                {/* Submit button */}
                <motion.button
                  onClick={handleRequestPayout}
                  disabled={
                    requesting ||
                    !bankInfo.bankName ||
                    !bankInfo.accountNumber ||
                    !bankInfo.accountHolder
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`,
                    color: 'white',
                    boxShadow: `0 4px 16px ${colors.success}40`,
                  }}
                >
                  {requesting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      처리중...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      정산 요청 완료
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PayoutRequest;
