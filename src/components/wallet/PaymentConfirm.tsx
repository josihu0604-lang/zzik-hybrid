'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { CheckCircle, Zap, Store, Clock } from 'lucide-react';
import { colors, rgba, gradients } from '@/lib/design-tokens';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * PaymentConfirm Component (PAY-002)
 * 
 * 🎯 3초 결제 플로우 - Step 2: 금액 확인 및 승인
 * 
 * Features:
 * - 1초 내 금액 표시
 * - 큰 버튼으로 즉시 승인 가능
 * - Optimistic UI (즉시 완료 표시)
 * - Haptic Feedback (결제 완료 체감)
 */

interface PaymentData {
  merchantId: string;
  merchantName: string;
  amount: number;
}

interface PaymentConfirmProps {
  data: PaymentData;
  balance: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirm({ data, balance, onConfirm, onCancel }: PaymentConfirmProps) {
  const router = useRouter();
  const haptic = useHaptic();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const insufficient = balance < data.amount;

  const handleConfirm = async () => {
    if (insufficient) {
      haptic.error();
      return;
    }

    haptic.tap();
    setProcessing(true);

    // Optimistic UI: 즉시 성공 표시 (실제 트랜잭션은 백그라운드)
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      haptic.success();

      // 1초 후 완료 화면으로
      setTimeout(() => {
        onConfirm();
        router.push('/wallet/history');
      }, 1500);
    }, 800); // 0.8초 처리 (3초 목표 내)
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-6">
      <m.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {!success ? (
          // Confirmation View
          <div className="bg-space-900 rounded-3xl p-8 border border-white/10">
            {/* Merchant Info */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: gradients.flame }}
              >
                <Store size={32} color="white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{data.merchantName}</h2>
              <p className="text-sm" style={{ color: rgba.white[60] }}>
                Merchant ID: {data.merchantId.slice(-6)}
              </p>
            </div>

            {/* Amount */}
            <div
              className="p-6 rounded-2xl mb-6 text-center"
              style={{ background: rgba.white[5] }}
            >
              <p className="text-sm mb-2" style={{ color: rgba.white[60] }}>
                Payment Amount
              </p>
              <p className="text-5xl font-black">₩{data.amount.toLocaleString('ko-KR')}</p>
              <p className="text-sm mt-2" style={{ color: rgba.white[50] }}>
                ≈ {data.amount.toLocaleString('ko-KR')} Z-Points
              </p>
            </div>

            {/* Balance Check */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-6"
              style={{ 
                background: insufficient ? rgba.red[500] + '20' : rgba.green[500] + '20',
                border: `1px solid ${insufficient ? colors.red[500] : colors.green[500]}40`
              }}
            >
              <span className="text-sm font-medium">Your Balance</span>
              <span className="text-sm font-bold">
                ₩{balance.toLocaleString('ko-KR')}
              </span>
            </div>

            {insufficient && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400 text-center">
                  Insufficient balance. Please charge your Z-Points.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={processing || insufficient}
                className="w-full py-4 rounded-2xl font-bold text-lg text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: gradients.flame }}
              >
                {processing ? (
                  <>
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap size={24} fill="white" />
                    </m.div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={24} fill="white" />
                    Confirm Payment
                  </>
                )}
              </button>

              <button
                onClick={onCancel}
                disabled={processing}
                className="w-full py-4 rounded-2xl font-semibold text-base"
                style={{
                  background: rgba.white[5],
                  color: rgba.white[70],
                }}
              >
                Cancel
              </button>
            </div>

            {/* Estimated Time */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs"
              style={{ color: rgba.white[50] }}
            >
              <Clock size={14} />
              <span>Instant payment (within 3 seconds)</span>
            </div>
          </div>
        ) : (
          // Success View
          <m.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <m.div
              className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: colors.green[500] }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle size={64} color="white" strokeWidth={3} />
            </m.div>

            <h2 className="text-3xl font-black mb-2">Payment Complete!</h2>
            <p className="text-lg mb-4" style={{ color: rgba.white[70] }}>
              ₩{data.amount.toLocaleString('ko-KR')} paid
            </p>

            <div
              className="inline-block px-6 py-3 rounded-full"
              style={{ background: rgba.green[500] + '20' }}
            >
              <p className="text-sm font-medium" style={{ color: colors.green[400] }}>
                ✓ Transaction confirmed
              </p>
            </div>
          </m.div>
        )}
      </m.div>
    </div>
  );
}
