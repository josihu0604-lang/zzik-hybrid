'use client';

import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { m } from '@/lib/motion';
import { QrCode, Keyboard, Camera, Check, AlertCircle } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * QRStep - QR 인증 스텝 (VerificationModal용)
 *
 * GPS 인증 후 추가 점수를 위한 QR 스캔
 *
 * Features:
 * - 모드 선택 (카메라/수동입력)
 * - 6자리 코드 입력
 * - 접근성 지원
 * - 에러 처리
 */

interface QRStepProps {
  /** QR 스캔 결과 */
  result: { score: number; verified: boolean } | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** QR 인증 시작 */
  onVerify: (code: string) => Promise<boolean>;
  /** 건너뛰기 */
  onSkip: () => void;
}

type InputMode = 'select' | 'camera' | 'manual';

/** 코드 길이 상수 */
const CODE_LENGTH = 6;

export const QRStep = memo(function QRStep({
  result,
  isLoading,
  error,
  onVerify,
  onSkip,
}: QRStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<InputMode>('select');
  const [manualCode, setManualCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 코드 인덱스 배열 (memoized)
  const codeIndices = useMemo(() => Array.from({ length: CODE_LENGTH }, (_, i) => i), []);

  // 수동 제출 핸들러 (useCallback)
  const handleManualSubmit = useCallback(async () => {
    if (manualCode.length !== CODE_LENGTH) {
      setLocalError(`${CODE_LENGTH}자리 코드를 입력해주세요`);
      return;
    }
    setLocalError(null);
    const success = await onVerify(manualCode);
    if (!success) {
      setLocalError('유효하지 않은 코드입니다');
    }
  }, [manualCode, onVerify]);

  // 코드 입력 핸들러
  const handleCodeInput = useCallback(
    (index: number, value: string) => {
      const val = value.toUpperCase();
      if (/^[A-Z0-9]?$/.test(val)) {
        const newCode = manualCode.split('');
        newCode[index] = val;
        setManualCode(newCode.join(''));
        setLocalError(null);
        // 다음 입력으로 자동 이동
        if (val && index < CODE_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    },
    [manualCode]
  );

  // 백스페이스 핸들러
  const handleBackspace = useCallback(
    (index: number) => {
      if (!manualCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [manualCode]
  );

  // 모드 변경 핸들러
  const handleModeChange = useCallback((newMode: InputMode) => {
    setMode(newMode);
    setManualCode('');
    setLocalError(null);
  }, []);

  // 에러 표시 (memoized)
  const displayError = useMemo(() => localError || error, [localError, error]);

  // 인증 완료 상태
  if (result?.verified) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: `${colors.success}20` }}
          aria-hidden="true"
        >
          <Check size={40} style={{ color: colors.success }} />
        </m.div>
        <h3 className="text-white font-bold text-xl mb-2">QR 인증 완료!</h3>
        <p className="text-linear-text-secondary mb-1">
          추가 <span style={{ color: colors.spark[500] }}>{result.score}점</span> 획득!
        </p>
      </m.div>
    );
  }

  // 모드 선택 화면
  if (mode === 'select') {
    return (
      <div className="py-6">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `${colors.flame[500]}20` }}
            aria-hidden="true"
          >
            <QrCode size={32} style={{ color: colors.flame[500] }} />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">QR 인증으로 보너스 점수!</h3>
          <p className="text-linear-text-tertiary text-sm">
            팝업 현장의 QR 코드를 스캔하면 추가 점수를 받을 수 있어요
          </p>
        </div>

        <div className="space-y-3 mb-6" role="group" aria-label="인증 방식 선택">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeChange('camera')}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            type="button"
            aria-label="카메라로 QR 코드 스캔"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${colors.flame[500]}20` }}
              aria-hidden="true"
            >
              <Camera size={24} style={{ color: colors.flame[500] }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold">카메라로 스캔</p>
              <p className="text-linear-text-tertiary text-sm">QR 코드를 직접 스캔합니다</p>
            </div>
          </m.button>

          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeChange('manual')}
            className="w-full p-4 rounded-xl flex items-center gap-4 transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            type="button"
            aria-label="코드 직접 입력"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${colors.spark[500]}20` }}
              aria-hidden="true"
            >
              <Keyboard size={24} style={{ color: colors.spark[500] }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold">코드 직접 입력</p>
              <p className="text-linear-text-tertiary text-sm">
                {CODE_LENGTH}자리 코드를 입력합니다
              </p>
            </div>
          </m.button>
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 text-linear-text-tertiary text-sm hover:text-white transition-colors"
          type="button"
        >
          건너뛰고 완료하기
        </button>
      </div>
    );
  }

  // 카메라 스캔 화면
  if (mode === 'camera') {
    return (
      <div className="py-6">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg mb-2">QR 코드 스캔</h3>
          <p className="text-linear-text-tertiary text-sm">팝업 현장의 QR 코드를 스캔하세요</p>
        </div>

        {/* Camera Preview Placeholder */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden mb-4"
          style={{
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          aria-label="카메라 미리보기 영역"
        >
          {/* Scan Frame */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div
              className="w-48 h-48 border-2 rounded-2xl"
              style={{
                borderColor: colors.flame[500],
                boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.5)',
              }}
            />
          </div>

          {/* Scanning Animation */}
          {!prefersReducedMotion && (
            <m.div
              className="absolute left-1/2 -translate-x-1/2 w-48 h-0.5"
              style={{ background: colors.flame[500] }}
              animate={{ y: [80, 200, 80] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
          )}

          {/* Demo Message */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white/60 text-xs">
              데모 모드: 실제 QR 스캔은 jsQR 라이브러리 연동 필요
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleModeChange('select')}
            className="flex-1 py-3 rounded-xl text-linear-text-secondary text-sm font-medium"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            type="button"
          >
            뒤로
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium"
            style={{
              background: colors.flame[500],
            }}
            type="button"
          >
            코드 입력으로 전환
          </button>
        </div>
      </div>
    );
  }

  // 수동 입력 화면
  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-lg mb-2">코드 입력</h3>
        <p className="text-linear-text-tertiary text-sm" id="code-input-description">
          현장에 표시된 {CODE_LENGTH}자리 코드를 입력하세요
        </p>
      </div>

      {/* Code Input */}
      <div
        className="flex gap-2 justify-center mb-4"
        role="group"
        aria-describedby="code-input-description"
      >
        {codeIndices.map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            maxLength={1}
            value={manualCode[i] || ''}
            onChange={(e) => handleCodeInput(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') handleBackspace(i);
              if (e.key === 'Enter' && manualCode.length === CODE_LENGTH) {
                handleManualSubmit();
              }
            }}
            aria-label={`코드 ${i + 1}번째 자리`}
            className="w-11 h-14 text-center text-xl font-bold rounded-lg bg-linear-surface border text-white focus:outline-none focus:ring-2 focus:ring-flame-500"
            style={{
              background: colors.space[850],
              borderColor: displayError ? colors.error : colors.border.subtle,
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      {displayError && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-4"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={16} style={{ color: colors.error }} aria-hidden="true" />
          <span className="text-sm" style={{ color: colors.error }}>
            {displayError}
          </span>
        </m.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleModeChange('select')}
          className="flex-1 py-3 rounded-xl text-linear-text-secondary text-sm font-medium"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          type="button"
        >
          뒤로
        </button>
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleManualSubmit}
          disabled={manualCode.length !== CODE_LENGTH || isLoading}
          className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: colors.flame[500],
          }}
          type="button"
          aria-busy={isLoading}
        >
          {isLoading ? '확인 중...' : '확인'}
        </m.button>
      </div>
    </div>
  );
});

export default QRStep;
