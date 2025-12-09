'use client';

import { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Check, X, Navigation } from 'lucide-react';
import { colors, gradients, opacity } from '@/lib/design-tokens';
import type { GpsVerificationResult } from '@/lib/geo';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * GPSStep - GPS 인증 단계 컴포넌트
 */

interface GPSStepProps {
  /** GPS 인증 결과 */
  result: GpsVerificationResult | null;
  /** 거리 텍스트 */
  distanceText: string | null;
  /** 로딩 중 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** GPS 정확도 (미터) */
  accuracy: number | null;
  /** 인증 시작 */
  onVerify: () => void;
  /** 재시도 */
  onRetry: () => void;
}

const ACCURACY_LABELS: Record<GpsVerificationResult['accuracy'], { label: string; color: string }> =
  {
    exact: { label: '정확히 현장!', color: colors.success },
    close: { label: '매우 가까움', color: colors.success },
    near: { label: '근처에 있어요', color: colors.spark[500] },
    far: { label: '너무 멀어요', color: colors.error },
  };

export function GPSStep({
  result,
  distanceText,
  isLoading,
  error,
  accuracy,
  onVerify,
  onRetry,
}: GPSStepProps) {
  const prefersReducedMotion = useReducedMotion();

  // 자동으로 인증 시작
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!result && !isLoading && !error) {
      onVerify();
    }
  }, [result, isLoading, error, onVerify]);

  // 로딩 상태
  if (isLoading) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-8"
      >
        {/* 펄스 애니메이션 */}
        <div className="relative mb-6">
          {!prefersReducedMotion && (
            <m.div
              className="absolute inset-0 rounded-full"
              style={{ background: colors.temperature.warm.bg }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [opacity[50], 0, opacity[50]],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <m.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: gradients.flame,
              boxShadow: `0 4px 24px ${colors.flame[500]}66`,
            }}
            animate={!prefersReducedMotion ? { rotate: 360 } : undefined}
            transition={
              !prefersReducedMotion ? { duration: 2, repeat: Infinity, ease: 'linear' } : undefined
            }
          >
            <Navigation size={32} className="text-white" />
          </m.div>
        </div>

        <p className="text-white font-bold text-lg mb-2">위치 확인 중...</p>
        <p className="text-linear-text-tertiary text-sm">GPS 신호를 찾고 있어요</p>
      </m.div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-8"
      >
        <m.div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: `rgba(239, 68, 68, ${opacity[20]})`,
            border: `2px solid rgba(239, 68, 68, ${opacity[40]})`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <X size={40} style={{ color: colors.error }} />
        </m.div>

        <p className="text-white font-bold text-lg mb-2">위치 확인 실패</p>
        <p className="text-linear-text-tertiary text-sm text-center mb-6 max-w-xs">{error}</p>

        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="px-6 py-3 rounded-xl font-bold text-sm"
          style={{
            background: `rgba(255, 255, 255, ${opacity[10]})`,
            border: `1px solid ${colors.border.emphasis}`,
            color: 'white',
          }}
        >
          다시 시도
        </m.button>
      </m.div>
    );
  }

  // 결과 표시
  if (result) {
    const accuracyInfo = ACCURACY_LABELS[result.accuracy];
    const isSuccess = result.withinRange;

    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-8"
      >
        {/* 결과 아이콘 */}
        <m.div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: isSuccess ? gradients.success : `rgba(239, 68, 68, ${opacity[20]})`,
            border: `2px solid ${isSuccess ? `rgba(34, 197, 94, ${opacity[40]})` : `rgba(239, 68, 68, ${opacity[40]})`}`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {isSuccess ? (
            <Check size={40} style={{ color: colors.success }} />
          ) : (
            <X size={40} style={{ color: colors.error }} />
          )}
        </m.div>

        {/* 정확도 라벨 */}
        <p className="font-bold text-lg mb-1" style={{ color: accuracyInfo.color }}>
          {accuracyInfo.label}
        </p>

        {/* 거리 정보 */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-linear-text-tertiary" />
          <span className="text-linear-text-secondary">{distanceText} 거리</span>
        </div>

        {/* 점수 */}
        <m.div
          className="px-4 py-2 rounded-lg mb-4"
          style={{
            background: isSuccess
              ? `rgba(34, 197, 94, ${opacity[15]})`
              : `rgba(239, 68, 68, ${opacity[15]})`,
            border: `1px solid ${isSuccess ? `rgba(34, 197, 94, ${opacity[30]})` : `rgba(239, 68, 68, ${opacity[30]})`}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="font-bold" style={{ color: isSuccess ? colors.success : colors.error }}>
            GPS 점수: {result.score}/40점
          </span>
        </m.div>

        {/* GPS 정확도 정보 */}
        {accuracy && (
          <p className="text-linear-text-tertiary text-xs">GPS 정확도: ±{Math.round(accuracy)}m</p>
        )}

        {/* 실패 시 안내 */}
        <AnimatePresence>
          {!isSuccess && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 rounded-lg text-center"
              style={{
                background: `rgba(255, 217, 61, ${opacity[10]})`,
                border: `1px solid rgba(255, 217, 61, ${opacity[20]})`,
              }}
            >
              <p className="text-sm" style={{ color: colors.spark[500] }}>
                팝업 현장에서 100m 이내로 이동해주세요
              </p>
            </m.div>
          )}
        </AnimatePresence>

        {/* 재시도 버튼 */}
        {!isSuccess && (
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-sm"
            style={{
              background: `rgba(255, 255, 255, ${opacity[10]})`,
              border: `1px solid ${colors.border.emphasis}`,
              color: 'white',
            }}
          >
            위치 다시 확인
          </m.button>
        )}
      </m.div>
    );
  }

  // 초기 상태 (보통 보이지 않음)
  return (
    <div className="flex flex-col items-center py-8">
      <Loader2 size={32} className="animate-spin text-linear-text-tertiary" />
    </div>
  );
}

export default GPSStep;
