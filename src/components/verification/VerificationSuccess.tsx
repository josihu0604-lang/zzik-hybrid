'use client';

import { useEffect, useState } from 'react';
import { m } from '@/lib/motion';
import { Check, MapPin, QrCode, Receipt, Loader2, Sparkles } from 'lucide-react';
import { colors, gradients, opacity } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PASS_THRESHOLD, MAX_SCORES } from '@/lib/verification';

/**
 * VerificationSuccess - 인증 성공 화면
 */

interface VerificationSuccessProps {
  /** 총 점수 */
  score: number;
  /** GPS 점수 */
  gpsScore: number;
  /** QR 점수 */
  qrScore: number;
  /** 영수증 점수 */
  receiptScore?: number;
  /** 완료 콜백 */
  onComplete: () => void;
  /** 완료 처리 중 */
  isLoading: boolean;
}

export function VerificationSuccess({
  score,
  gpsScore,
  qrScore,
  receiptScore = 0,
  onComplete,
  isLoading,
}: VerificationSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isPassed = score >= PASS_THRESHOLD;
  const prefersReducedMotion = useReducedMotion();

  // 성공 시 Confetti 효과
  useEffect(() => {
    if (isPassed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPassed]);

  const getBadgeLevel = () => {
    if (score >= 70) return { label: '완벽한 인증!', emoji: '🔥', color: colors.success };
    if (score >= PASS_THRESHOLD) return { label: '인증 성공!', emoji: '✓', color: colors.success };
    return { label: '인증 실패', emoji: '✗', color: colors.error };
  };

  const badge = getBadgeLevel();

  return (
    <div className="relative py-8">
      {/* Confetti Effect - respects reduced motion */}
      {showConfetti && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <m.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: [colors.flame[500], colors.spark[400], colors.success, '#A855F7'][
                  i % 4
                ],
                left: `${Math.random() * 100}%`,
                top: -10,
              }}
              animate={{
                y: [0, 400],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Success Badge */}
      <m.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        {/* Badge Icon */}
        <m.div
          className="relative mb-6"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Glow Effect */}
          <m.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: badge.color }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <m.div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}80 100%)`,
              boxShadow: `0 8px 32px ${badge.color}60`,
            }}
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            {isPassed ? (
              <Check size={48} className="text-white" strokeWidth={3} />
            ) : (
              <span className="text-4xl">{badge.emoji}</span>
            )}
          </m.div>

          {/* Sparkles */}
          {isPassed && (
            <m.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles size={24} style={{ color: colors.spark[400] }} />
            </m.div>
          )}
        </m.div>

        {/* Badge Label */}
        <m.h3
          className="text-2xl font-black mb-2"
          style={{ color: badge.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {badge.label}
        </m.h3>

        {/* Score Display */}
        <m.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-linear-text-tertiary text-xl">/ 100점</span>
        </m.div>

        {/* Score Breakdown */}
        <m.div
          className="w-full max-w-xs space-y-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* GPS Score */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: gpsScore > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${gpsScore > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                style={{ color: gpsScore > 0 ? colors.success : colors.text.muted }}
              />
              <span className="text-sm text-linear-text-secondary">GPS 인증</span>
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: gpsScore > 0 ? colors.success : colors.text.muted }}
            >
              {gpsScore}/{MAX_SCORES.gps}점
            </span>
          </div>

          {/* QR Score */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: qrScore > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${qrScore > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <QrCode
                size={16}
                style={{ color: qrScore > 0 ? colors.success : colors.text.muted }}
              />
              <span className="text-sm text-linear-text-secondary">QR 인증</span>
              {qrScore === 0 && (
                <span className="text-micro text-linear-text-tertiary">(선택)</span>
              )}
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: qrScore > 0 ? colors.success : colors.text.muted }}
            >
              {qrScore}/{MAX_SCORES.qr}점
            </span>
          </div>

          {/* Receipt Score */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: receiptScore > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${receiptScore > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Receipt
                size={16}
                style={{ color: receiptScore > 0 ? colors.success : colors.text.muted }}
              />
              <span className="text-sm text-linear-text-secondary">영수증 인증</span>
              {receiptScore === 0 && (
                <span className="text-micro text-linear-text-tertiary">(선택)</span>
              )}
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: receiptScore > 0 ? colors.success : colors.text.muted }}
            >
              {receiptScore}/{MAX_SCORES.receipt}점
            </span>
          </div>
        </m.div>

        {/* Complete Button */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onComplete}
          disabled={isLoading}
          className="w-full max-w-xs py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: isPassed ? gradients.successSolid : `rgba(255, 255, 255, ${opacity[10]})`,
            color: isPassed ? 'white' : colors.text.secondary,
            boxShadow: isPassed ? `0 4px 24px rgba(34, 197, 94, ${opacity[40]})` : 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              저장 중...
            </>
          ) : isPassed ? (
            <>
              <Check size={20} />
              찍음 배지 받기
            </>
          ) : (
            '닫기'
          )}
        </m.button>

        {/* Info Text */}
        {isPassed && (
          <m.p
            className="text-center text-linear-text-tertiary text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            방문 인증 완료! 프로필에서 배지를 확인하세요
          </m.p>
        )}
      </m.div>
    </div>
  );
}

export default VerificationSuccess;
