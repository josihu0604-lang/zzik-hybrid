'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useLocale } from '@/providers/LocaleProvider';

// ============================================
// Types & Interfaces
// ============================================

export type RefundReason = 
  | 'changed_mind'
  | 'duplicate_payment'
  | 'wrong_amount'
  | 'service_not_received'
  | 'quality_issue'
  | 'other';

interface RefundRequest {
  transactionId: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  description?: string;
}

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    amount: number;
    currency: string;
    merchantName: string;
    date: Date;
    paymentMethod?: string;
  };
  onSubmit: (request: RefundRequest) => Promise<{ success: boolean; message?: string }>;
  maxRefundableAmount?: number; // For partial refunds
}

type Step = 'reason' | 'details' | 'confirm' | 'result';

// ============================================
// Constants
// ============================================

const REFUND_REASONS: {
  value: RefundReason;
  label: string;
  labelKo: string;
  labelJa: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'changed_mind',
    label: 'Changed my mind',
    labelKo: '단순 변심',
    labelJa: '気が変わった',
    icon: <RefreshCw size={18} />,
  },
  {
    value: 'duplicate_payment',
    label: 'Duplicate payment',
    labelKo: '중복 결제',
    labelJa: '重複支払い',
    icon: <AlertTriangle size={18} />,
  },
  {
    value: 'wrong_amount',
    label: 'Wrong amount charged',
    labelKo: '잘못된 금액 청구',
    labelJa: '請求額の間違い',
    icon: <AlertTriangle size={18} />,
  },
  {
    value: 'service_not_received',
    label: 'Service not received',
    labelKo: '서비스 미제공',
    labelJa: 'サービス未受領',
    icon: <Clock size={18} />,
  },
  {
    value: 'quality_issue',
    label: 'Quality issue',
    labelKo: '품질 문제',
    labelJa: '品質問題',
    icon: <AlertTriangle size={18} />,
  },
  {
    value: 'other',
    label: 'Other reason',
    labelKo: '기타 사유',
    labelJa: 'その他',
    icon: <MessageSquare size={18} />,
  },
];

// ============================================
// Sub-Components
// ============================================

function ReasonButton({
  reason,
  isSelected,
  onSelect,
  locale,
}: {
  reason: typeof REFUND_REASONS[0];
  isSelected: boolean;
  onSelect: () => void;
  locale: string;
}) {
  const label = locale === 'ko' 
    ? reason.labelKo 
    : locale === 'ja' 
    ? reason.labelJa 
    : reason.label;

  return (
    <m.button
      onClick={onSelect}
      className="w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all"
      style={{
        background: isSelected ? rgba.flame[500] + '20' : rgba.white[5],
        border: `1px solid ${isSelected ? colors.flame[500] : rgba.white[10]}`,
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ 
          background: isSelected ? colors.flame[500] + '30' : rgba.white[10],
          color: isSelected ? colors.flame[500] : rgba.white[60],
        }}
      >
        {reason.icon}
      </div>
      <span className="font-medium text-white">{label}</span>
      {isSelected && (
        <CheckCircle 
          size={20} 
          className="ml-auto"
          style={{ color: colors.flame[500] }}
        />
      )}
    </m.button>
  );
}

// ============================================
// Main Component
// ============================================

export function RefundRequestModal({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  maxRefundableAmount,
}: RefundRequestModalProps) {
  const { locale } = useLocale();
  const [step, setStep] = useState<Step>('reason');
  const [selectedReason, setSelectedReason] = useState<RefundReason | null>(null);
  const [description, setDescription] = useState('');
  const [refundAmount, setRefundAmount] = useState(transaction.amount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

  const maxAmount = maxRefundableAmount ?? transaction.amount;
  const isPartialRefund = refundAmount < transaction.amount;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      const response = await onSubmit({
        transactionId: transaction.id,
        amount: refundAmount,
        currency: transaction.currency,
        reason: selectedReason,
        description: description || undefined,
      });
      setResult(response);
      setStep('result');
    } catch (error) {
      setResult({ success: false, message: 'An error occurred' });
      setStep('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('reason');
    setSelectedReason(null);
    setDescription('');
    setRefundAmount(transaction.amount);
    setResult(null);
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <m.div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ 
              background: colors.space[900],
              border: `1px solid ${rgba.white[10]}`,
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div 
              className="sticky top-0 z-10 flex items-center justify-between p-4"
              style={{ 
                background: colors.space[900],
                borderBottom: `1px solid ${rgba.white[10]}`,
              }}
            >
              {step !== 'reason' && step !== 'result' ? (
                <button
                  onClick={() => setStep(step === 'confirm' ? 'details' : 'reason')}
                  className="p-2 rounded-lg"
                  style={{ background: rgba.white[5] }}
                >
                  <ArrowLeft size={20} style={{ color: rgba.white[60] }} />
                </button>
              ) : (
                <div />
              )}
              <h2 className="font-bold text-lg text-white">
                {locale === 'ko' ? '환불 요청' : 'Request Refund'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg"
                style={{ background: rgba.white[5] }}
              >
                <X size={20} style={{ color: rgba.white[60] }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Transaction Info (always visible except result) */}
              {step !== 'result' && (
                <div 
                  className="p-4 rounded-xl mb-6"
                  style={{ background: rgba.white[5] }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: rgba.white[60] }}>
                      {locale === 'ko' ? '가맹점' : 'Merchant'}
                    </span>
                    <span className="font-semibold text-white">{transaction.merchantName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: rgba.white[60] }}>
                      {locale === 'ko' ? '결제일' : 'Date'}
                    </span>
                    <span className="text-sm text-white">{formatDate(transaction.date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: rgba.white[60] }}>
                      {locale === 'ko' ? '결제 금액' : 'Amount'}
                    </span>
                    <span className="font-bold text-lg text-white">
                      {transaction.currency === 'KRW' ? '₩' : '$'}
                      {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Step 1: Select Reason */}
              {step === 'reason' && (
                <div className="space-y-3">
                  <p className="text-sm mb-4" style={{ color: rgba.white[60] }}>
                    {locale === 'ko' 
                      ? '환불 사유를 선택해주세요' 
                      : 'Please select a reason for your refund'}
                  </p>
                  {REFUND_REASONS.map(reason => (
                    <ReasonButton
                      key={reason.value}
                      reason={reason}
                      isSelected={selectedReason === reason.value}
                      onSelect={() => setSelectedReason(reason.value)}
                      locale={locale}
                    />
                  ))}
                  <button
                    onClick={() => setStep('details')}
                    disabled={!selectedReason}
                    className="w-full py-4 rounded-xl font-bold text-white mt-4 disabled:opacity-50"
                    style={{ background: gradients.flame }}
                  >
                    {locale === 'ko' ? '다음' : 'Next'}
                  </button>
                </div>
              )}

              {/* Step 2: Details */}
              {step === 'details' && (
                <div className="space-y-4">
                  {/* Refund Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: rgba.white[60] }}>
                      {locale === 'ko' ? '환불 금액' : 'Refund Amount'}
                    </label>
                    <div className="relative">
                      <span 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold"
                        style={{ color: rgba.white[60] }}
                      >
                        {transaction.currency === 'KRW' ? '₩' : '$'}
                      </span>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Math.min(Number(e.target.value), maxAmount))}
                        max={maxAmount}
                        className="w-full pl-10 pr-4 py-4 rounded-xl text-xl font-bold bg-white/5 border border-white/10 text-white focus:outline-none focus:border-flame-500"
                      />
                    </div>
                    <p className="text-xs mt-2" style={{ color: rgba.white[50] }}>
                      {locale === 'ko' 
                        ? `최대 환불 가능 금액: ₩${maxAmount.toLocaleString()}` 
                        : `Maximum refundable: ${transaction.currency === 'KRW' ? '₩' : '$'}${maxAmount.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: rgba.white[60] }}>
                      {locale === 'ko' ? '상세 내용 (선택)' : 'Additional Details (Optional)'}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={locale === 'ko' ? '환불 사유를 자세히 설명해주세요...' : 'Please describe the reason for your refund...'}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-flame-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setStep('confirm')}
                    disabled={refundAmount <= 0 || refundAmount > maxAmount}
                    className="w-full py-4 rounded-xl font-bold text-white disabled:opacity-50"
                    style={{ background: gradients.flame }}
                  >
                    {locale === 'ko' ? '확인' : 'Review'}
                  </button>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: colors.yellow[500] + '10', border: `1px solid ${colors.yellow[500]}30` }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} style={{ color: colors.yellow[400] }} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-white mb-1">
                          {locale === 'ko' ? '환불 확인' : 'Confirm Refund'}
                        </p>
                        <p className="text-sm" style={{ color: rgba.white[60] }}>
                          {locale === 'ko' 
                            ? '환불 요청 후 취소할 수 없습니다. 계속하시겠습니까?'
                            : 'This action cannot be undone. Are you sure you want to proceed?'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div 
                    className="p-4 rounded-xl space-y-3"
                    style={{ background: rgba.white[5] }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: rgba.white[60] }}>
                        {locale === 'ko' ? '환불 사유' : 'Reason'}
                      </span>
                      <span className="text-white">
                        {REFUND_REASONS.find(r => r.value === selectedReason)?.[
                          locale === 'ko' ? 'labelKo' : locale === 'ja' ? 'labelJa' : 'label'
                        ]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: rgba.white[60] }}>
                        {locale === 'ko' ? '환불 금액' : 'Refund Amount'}
                      </span>
                      <span className="font-bold text-lg" style={{ color: colors.green[400] }}>
                        {transaction.currency === 'KRW' ? '₩' : '$'}
                        {refundAmount.toLocaleString()}
                      </span>
                    </div>
                    {isPartialRefund && (
                      <div className="pt-2 border-t" style={{ borderColor: rgba.white[10] }}>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: colors.blue[500] + '20', color: colors.blue[400] }}
                        >
                          {locale === 'ko' ? '부분 환불' : 'Partial Refund'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('details')}
                      className="flex-1 py-4 rounded-xl font-semibold"
                      style={{ background: rgba.white[5], color: rgba.white[70] }}
                    >
                      {locale === 'ko' ? '취소' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: colors.red[500] }}
                    >
                      {isSubmitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <RefreshCw size={18} />
                          {locale === 'ko' ? '환불 요청' : 'Request Refund'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Result */}
              {step === 'result' && result && (
                <div className="text-center py-8">
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ 
                      background: result.success ? colors.green[500] : colors.red[500] 
                    }}
                  >
                    {result.success ? (
                      <CheckCircle size={40} color="white" />
                    ) : (
                      <X size={40} color="white" />
                    )}
                  </m.div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {result.success 
                      ? (locale === 'ko' ? '환불 요청 완료' : 'Refund Requested')
                      : (locale === 'ko' ? '환불 요청 실패' : 'Refund Failed')}
                  </h3>

                  <p className="mb-6" style={{ color: rgba.white[60] }}>
                    {result.message || (result.success 
                      ? (locale === 'ko' 
                          ? '환불 처리에 3-5 영업일이 소요될 수 있습니다.'
                          : 'Refund may take 3-5 business days to process.')
                      : (locale === 'ko' 
                          ? '다시 시도해주세요.'
                          : 'Please try again.'))}
                  </p>

                  {result.success && (
                    <div 
                      className="p-4 rounded-xl mb-6 text-left"
                      style={{ background: rgba.white[5] }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} style={{ color: colors.yellow[400] }} />
                        <span className="text-sm font-medium" style={{ color: colors.yellow[400] }}>
                          {locale === 'ko' ? '처리 중' : 'Processing'}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: rgba.white[60] }}>
                        {locale === 'ko' 
                          ? '환불 상태는 거래 내역에서 확인할 수 있습니다.'
                          : 'You can check the refund status in your transaction history.'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-4 rounded-xl font-bold text-white"
                    style={{ background: gradients.flame }}
                  >
                    {locale === 'ko' ? '확인' : 'Done'}
                  </button>
                </div>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Exports
// ============================================

export default RefundRequestModal;
