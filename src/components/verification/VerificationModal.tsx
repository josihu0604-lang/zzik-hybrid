'use client';

import { useState, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X, MapPin, QrCode, Receipt, Check } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { GPSStep } from './GPSStep';
import { QRStep } from './QRStep';
import { ReceiptStep } from './ReceiptStep';
import { VerificationSuccess } from './VerificationSuccess';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/components/ui/Toast';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { Coordinates } from '@/lib/geo';
import { MAX_SCORES, PASS_THRESHOLD } from '@/lib/verification';
import { performCheckin, verifyQrCode as verifyQrCodeApi } from '@/lib/checkin';
import { logger } from '@/lib/logger';

/**
 * VerificationModal - 체크인 인증 모달
 *
 * 단계:
 * 1. GPS 인증 (필수)
 * 2. QR 스캔 (선택적 보너스)
 * 3. 완료
 */

interface VerificationModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 */
  onClose: () => void;
  /** 인증 완료 콜백 */
  onComplete: (score: number) => void;
  /** 팝업 ID */
  popupId: string;
  /** 팝업 이름 */
  popupName: string;
  /** 팝업 브랜드명 */
  brandName: string;
  /** 팝업 위치 */
  popupLocation: Coordinates;
  /** 리더 레퍼럴 코드 (있는 경우) */
  referralCode?: string;
}

type VerificationStep = 'gps' | 'qr' | 'receipt' | 'success';

interface StepConfig {
  id: VerificationStep;
  label: string;
  icon: typeof MapPin;
  maxScore: number;
}

const STEPS: StepConfig[] = [
  { id: 'gps', label: 'GPS 인증', icon: MapPin, maxScore: MAX_SCORES.gps },
  { id: 'qr', label: 'QR 인증', icon: QrCode, maxScore: MAX_SCORES.qr },
  { id: 'receipt', label: '영수증 인증', icon: Receipt, maxScore: MAX_SCORES.receipt },
];

export function VerificationModal({
  isOpen,
  onClose,
  onComplete,
  popupId,
  popupName,
  brandName,
  popupLocation,
  referralCode,
}: VerificationModalProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<VerificationStep>('gps');
  const [gpsScore, setGpsScore] = useState(0);
  const [qrScore, setQrScore] = useState(0);
  const [receiptScore, setReceiptScore] = useState(0);
  const [qrResult, setQrResult] = useState<{ score: number; verified: boolean } | null>(null);
  const [receiptResult, setReceiptResult] = useState<{
    score: number;
    verified: boolean;
    brandMatched: boolean;
    dateValid: boolean;
    extractedText?: string;
  } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [verifiedQrCode, setVerifiedQrCode] = useState<string | null>(null);

  // Focus trap with WCAG 2.1 AA compliance
  const { containerRef: focusTrapRef } = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    initialFocus: 'first',
    returnFocus: true,
    onEscape: useCallback(() => {
      // Reset state when closing via Escape
      setCurrentStep('gps');
      setGpsScore(0);
      setQrScore(0);
      setReceiptScore(0);
      setQrResult(null);
      setReceiptResult(null);
      setQrError(null);
      setReceiptError(null);
      setUserLocation(null);
      setVerifiedQrCode(null);
      onClose();
    }, [onClose]),
    preventScroll: true,
  });

  const totalScore = gpsScore + qrScore + receiptScore;
  const isPassed = totalScore >= PASS_THRESHOLD;

  // GPS 훅
  const {
    position,
    verificationResult: gpsResult,
    distanceText,
    isLoading: gpsLoading,
    error: gpsError,
    accuracy,
    verifyLocation,
    reset: resetGps,
  } = useGeolocation({
    popupLocation,
    maxRange: 100,
    autoVerify: false,
  });

  // GPS 인증 결과 처리
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (gpsResult && currentStep === 'gps') {
      setGpsScore(gpsResult.score);

      // 사용자 위치 저장 (체크인 API 호출 시 필요)
      if (position) {
        setUserLocation(position);
      }

      // GPS 성공 시 QR 스텝으로 이동 (추가 점수 기회)
      if (gpsResult.withinRange) {
        setTimeout(() => {
          setCurrentStep('qr');
        }, 1000);
      }
    }
  }, [gpsResult, currentStep, position]);

  // QR 인증 처리
  const handleQrVerify = useCallback(
    async (code: string): Promise<boolean> => {
      setQrLoading(true);
      setQrError(null);

      try {
        // 실제 API를 통한 QR 검증
        const result = await verifyQrCodeApi({ popupId, code });

        if (result.success && result.data?.valid) {
          const score = result.data.score || MAX_SCORES.qr;
          setQrScore(score);
          setQrResult({ score, verified: true });
          setVerifiedQrCode(code); // 체크인 시 사용

          // 성공 후 영수증 스텝으로 (추가 점수 기회)
          setTimeout(() => {
            setCurrentStep('receipt');
          }, 1500);
          return true;
        } else {
          setQrError(result.data?.message || result.error || '유효하지 않은 코드입니다');
          return false;
        }
      } catch (error) {
        logger.error(
          'QR verification error',
          error instanceof Error ? error : new Error(String(error))
        );
        setQrError('QR 인증 중 오류가 발생했습니다');
        return false;
      } finally {
        setQrLoading(false);
      }
    },
    [popupId]
  );

  // QR 건너뛰기 (Receipt 스텝으로 이동)
  const handleQrSkip = useCallback(() => {
    setCurrentStep('receipt');
  }, []);

  // Receipt 인증 처리
  const handleReceiptVerify = useCallback(
    async (imageBase64: string): Promise<void> => {
      setReceiptLoading(true);
      setReceiptError(null);

      try {
        const response = await fetch('/api/receipt/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            brandName,
            checkInDate: new Date().toISOString(),
            popupId,
          }),
        });

        if (!response.ok) {
          throw new Error('Receipt verification failed');
        }

        const result = await response.json();

        setReceiptResult(result);

        if (result.verified) {
          setReceiptScore(result.score);
          // 성공 후 완료 화면으로
          setTimeout(() => {
            setCurrentStep('success');
          }, 1500);
        }
        // 실패해도 결과는 표시 (ReceiptStep에서 처리)
      } catch (error) {
        logger.error(
          'Receipt verification error',
          error instanceof Error ? error : new Error(String(error))
        );
        setReceiptError('영수증 인증 중 오류가 발생했습니다');
      } finally {
        setReceiptLoading(false);
      }
    },
    [popupId, brandName]
  );

  // Receipt 건너뛰기 (완료 화면으로)
  const handleReceiptSkip = useCallback(() => {
    setCurrentStep('success');
  }, []);

  // GPS 인증 시작
  const handleGpsVerify = useCallback(() => {
    verifyLocation();
  }, [verifyLocation]);

  // GPS 재시도
  const handleGpsRetry = useCallback(() => {
    resetGps();
    setTimeout(() => {
      verifyLocation();
    }, 100);
  }, [resetGps, verifyLocation]);

  // 인증 완료 처리
  const handleComplete = useCallback(async () => {
    setIsCompleting(true);

    try {
      // 서버에 체크인 기록 저장
      const result = await performCheckin({
        popupId,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        qrCode: verifiedQrCode || undefined,
        referralCode: referralCode || undefined,
      });

      if (result.success && result.data) {
        const serverScore = result.data.checkin.totalScore;
        const summary = result.data.summary;

        toast.celebrate(summary.message || `찍음 완료! ${serverScore}점 획득!`);
        onComplete(serverScore);
        onClose();
      } else {
        // 이미 체크인한 경우 (409 Conflict)
        if (result.details?.checkin) {
          const existingScore = result.details.checkin.total_score;
          toast.info(`이미 체크인하셨습니다. (${existingScore}점)`);
          onComplete(existingScore);
          onClose();
        } else {
          throw new Error(result.error || '체크인 저장에 실패했습니다');
        }
      }
    } catch (error) {
      logger.error('Checkin error', error instanceof Error ? error : new Error(String(error)));
      toast.error(error instanceof Error ? error.message : '체크인 저장에 실패했습니다');
    } finally {
      setIsCompleting(false);
    }
  }, [popupId, userLocation, verifiedQrCode, referralCode, toast, onComplete, onClose]);

  // 모달 닫을 때 상태 초기화
  // NOTE: handleClose must be defined before useFocusTrap (moved above)
  const handleClose = useCallback(() => {
    setCurrentStep('gps');
    setGpsScore(0);
    setQrScore(0);
    setReceiptScore(0);
    setQrResult(null);
    setReceiptResult(null);
    setQrError(null);
    setReceiptError(null);
    setUserLocation(null);
    setVerifiedQrCode(null);
    resetGps();
    onClose();
  }, [resetGps, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - DES-055: Debounced click, DES-057: Consistent exit */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} // DES-057: 일관된 exit duration
            onClick={(e) => {
              // DES-055: Only close if clicking backdrop itself (with debouncing)
              if (e.target === e.currentTarget) {
                // Debounce: prevent rapid clicks
                const target = e.currentTarget;
                target.style.pointerEvents = 'none';
                setTimeout(() => {
                  handleClose();
                }, 50);
              }
            }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal - DES-057: Consistent exit animation */}
          <m.div
            ref={focusTrapRef}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 overflow-y-auto"
            style={{
              maxHeight: 'min(90vh, 90dvh)', // DES-115: vh/dvh 호환성
              WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
              overscrollBehaviorY: 'contain', // Pull-to-refresh 방지
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-modal-title"
            aria-describedby="verification-modal-description"
          >
            <div
              className="w-full max-w-lg mx-auto rounded-t-3xl"
              style={{
                background: 'linear-gradient(180deg, #121314 0%, #08090a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: 'none',
              }}
            >
              {/* Header */}
              <div className="sticky top-0 px-5 py-4 flex items-center justify-between border-b border-linear-border bg-linear-surface/80 backdrop-blur-xl rounded-t-3xl">
                <div>
                  <h2 id="verification-modal-title" className="text-white font-bold text-lg">
                    체크인 인증
                  </h2>
                  <p
                    id="verification-modal-description"
                    className="text-linear-text-tertiary text-xs"
                  >
                    {popupName}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-linear-elevated transition-colors"
                  aria-label="체크인 인증 모달 닫기"
                >
                  <X size={20} className="text-linear-text-secondary" aria-hidden="true" />
                </button>
              </div>

              {/* Progress Steps */}
              {currentStep !== 'success' && (
                <div className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = step.id === currentStep;
                      const isCompleted =
                        (step.id === 'gps' && gpsScore > 0) ||
                        (step.id === 'qr' && qrScore > 0) ||
                        (step.id === 'receipt' && receiptScore > 0);

                      return (
                        <div key={step.id} className="flex items-center">
                          <m.div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{
                              background: isActive
                                ? `${colors.flame[500]}26`
                                : isCompleted
                                  ? `${colors.success}26`
                                  : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${
                                isActive
                                  ? `${colors.flame[500]}4d`
                                  : isCompleted
                                    ? `${colors.success}4d`
                                    : 'rgba(255, 255, 255, 0.08)'
                              }`,
                            }}
                            animate={{
                              scale: isActive ? 1.05 : 1,
                            }}
                          >
                            {isCompleted ? (
                              <Check size={16} style={{ color: colors.success }} />
                            ) : (
                              <Icon
                                size={16}
                                style={{
                                  color: isActive ? colors.flame[500] : colors.text.secondary,
                                }}
                              />
                            )}
                            <span
                              className="text-xs font-medium"
                              style={{
                                color: isActive
                                  ? colors.flame[500]
                                  : isCompleted
                                    ? colors.success
                                    : colors.text.secondary,
                              }}
                            >
                              {step.label}
                            </span>
                          </m.div>

                          {index < STEPS.length - 1 && (
                            <div
                              className="w-8 h-0.5 mx-1"
                              style={{
                                background:
                                  (index === 0 && gpsScore > 0) || (index === 1 && qrScore > 0)
                                    ? `${colors.success}80`
                                    : 'rgba(255, 255, 255, 0.1)',
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 현재 점수 */}
                  <div className="mt-4 text-center">
                    <span className="text-linear-text-tertiary text-sm">현재 점수: </span>
                    <span
                      className="font-bold"
                      style={{ color: isPassed ? colors.success : colors.flame[500] }}
                    >
                      {totalScore}점
                    </span>
                    <span className="text-linear-text-tertiary text-sm"> / 100점</span>
                    {totalScore > 0 && totalScore < PASS_THRESHOLD && (
                      <span className="text-xs text-linear-text-tertiary ml-2">
                        (통과까지 {PASS_THRESHOLD - totalScore}점 필요)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Step Content */}
              <div className="px-5 pb-8 pb-safe">
                <AnimatePresence mode="wait">
                  {currentStep === 'gps' && (
                    <m.div
                      key="gps"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <GPSStep
                        result={gpsResult}
                        distanceText={distanceText}
                        isLoading={gpsLoading}
                        error={gpsError}
                        accuracy={accuracy}
                        onVerify={handleGpsVerify}
                        onRetry={handleGpsRetry}
                      />
                    </m.div>
                  )}

                  {currentStep === 'qr' && (
                    <m.div
                      key="qr"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <QRStep
                        result={qrResult}
                        isLoading={qrLoading}
                        error={qrError}
                        onVerify={handleQrVerify}
                        onSkip={handleQrSkip}
                      />
                    </m.div>
                  )}

                  {currentStep === 'receipt' && (
                    <m.div
                      key="receipt"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ReceiptStep
                        popupId={popupId}
                        brandName={brandName}
                        checkInDate={new Date()}
                        result={receiptResult}
                        isLoading={receiptLoading}
                        error={receiptError}
                        onVerify={handleReceiptVerify}
                        onSkip={handleReceiptSkip}
                      />
                    </m.div>
                  )}

                  {currentStep === 'success' && (
                    <m.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <VerificationSuccess
                        score={totalScore}
                        gpsScore={gpsScore}
                        qrScore={qrScore}
                        receiptScore={receiptScore}
                        onComplete={handleComplete}
                        isLoading={isCompleting}
                      />
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default VerificationModal;
