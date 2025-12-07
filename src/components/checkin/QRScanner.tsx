'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Camera, X, Keyboard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { logger } from '@/lib/logger';

// Design token aliases - memoized for stability
const surface = colors.space[850];
const borderSubtle = colors.border.subtle;

/**
 * QRScanner - QR 코드 스캔 컴포넌트
 *
 * 카메라 스캔 또는 수동 코드 입력 지원
 *
 * Features:
 * - 카메라 QR 스캔
 * - 수동 코드 입력
 * - 접근성 지원 (키보드 네비게이션, ARIA)
 * - 에러 처리 및 재시도
 */

interface QRScannerProps {
  /** QR 코드 스캔 콜백 */
  onScan: (code: string) => Promise<boolean>;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 외부 로딩 상태 */
  isLoading?: boolean;
}

type ScanMode = 'camera' | 'manual';
type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

/** 코드 입력 필드 개수 */
const CODE_LENGTH = 6;

export const QRScanner = memo(function QRScanner({
  onScan,
  onClose,
  isLoading = false,
}: QRScannerProps) {
  const [mode, setMode] = useState<ScanMode>('camera');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [manualCode, setManualCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 코드 배열 (memoized)
  const codeIndices = useMemo(() => Array.from({ length: CODE_LENGTH }, (_, i) => i), []);

  // 카메라 정지 (먼저 정의)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  // 코드 감지 처리 (useCallback으로 메모이제이션)
  const handleCodeDetected = useCallback(
    async (code: string) => {
      if (status === 'scanning' || status === 'success') return;

      setStatus('scanning');
      stopCamera();

      try {
        const isValid = await onScan(code);
        setStatus(isValid ? 'success' : 'error');
        if (!isValid) {
          setErrorMessage('유효하지 않은 QR 코드입니다');
        }
      } catch {
        setStatus('error');
        setErrorMessage('인증에 실패했습니다');
      }
    },
    [status, stopCamera, onScan]
  );

  // QR 스캔 시작 (handleCodeDetected 의존성 추가)
  const startScanning = useCallback(() => {
    if (scanIntervalRef.current) return;

    scanIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // 실제 구현에서는 jsQR 라이브러리 사용:
      // import jsQR from 'jsqr';
      // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // const code = jsQR(imageData.data, canvas.width, canvas.height);
      // if (code) handleCodeDetected(code.data);

      // Demo: 랜덤하게 QR 감지 시뮬레이션 (0.1% 확률)
      if (Math.random() < 0.001) {
        const demoCode = '123456';
        handleCodeDetected(demoCode);
      }
    }, 100);
  }, [handleCodeDetected]);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        startScanning();
      }
    } catch (err) {
      logger.error('Camera error', err instanceof Error ? err : new Error(String(err)));
      setCameraError('카메라 접근 권한이 필요합니다');
      setMode('manual');
    }
  }, [startScanning]);

  // 수동 코드 제출 (useCallback으로 메모이제이션)
  const handleManualSubmit = useCallback(async () => {
    const trimmedCode = manualCode.trim();
    if (!trimmedCode || trimmedCode.length !== CODE_LENGTH) {
      setErrorMessage(`${CODE_LENGTH}자리 코드를 입력해주세요`);
      return;
    }

    setStatus('scanning');
    try {
      const isValid = await onScan(trimmedCode);
      setStatus(isValid ? 'success' : 'error');
      if (!isValid) {
        setErrorMessage('유효하지 않은 코드입니다');
      }
    } catch {
      setStatus('error');
      setErrorMessage('인증에 실패했습니다');
    }
  }, [manualCode, onScan]);

  // 코드 입력 핸들러 (재사용 가능)
  const handleCodeInput = useCallback(
    (index: number, value: string) => {
      const val = value.toUpperCase();
      if (/^[A-Z0-9]?$/.test(val)) {
        const newCode = manualCode.split('');
        newCode[index] = val;
        setManualCode(newCode.join(''));
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

  // 카메라 모드일 때만 시작
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // 성공 시 자동 닫기
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(onClose, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
    if (mode === 'camera') startCamera();
  }, [mode, startCamera]);

  // 모드 전환 핸들러
  const handleModeChange = useCallback((newMode: ScanMode) => {
    setMode(newMode);
    setErrorMessage('');
  }, []);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <m.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: surface,
          border: `1px solid ${borderSubtle}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-linear-border">
          <h3 id="qr-scanner-title" className="text-white font-bold">
            QR 코드 인증
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="QR 스캐너 닫기"
            type="button"
          >
            <X size={20} className="text-linear-text-secondary" aria-hidden="true" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-2 gap-2 border-b border-linear-border" role="tablist">
          <button
            onClick={() => handleModeChange('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'camera' ? 'bg-white/10 text-white' : 'text-linear-text-tertiary'
            }`}
            role="tab"
            aria-selected={mode === 'camera'}
            aria-controls="camera-panel"
            type="button"
          >
            <Camera size={16} aria-hidden="true" />
            카메라 스캔
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'manual' ? 'bg-white/10 text-white' : 'text-linear-text-tertiary'
            }`}
            role="tab"
            aria-selected={mode === 'manual'}
            aria-controls="manual-panel"
            type="button"
          >
            <Keyboard size={16} aria-hidden="true" />
            코드 입력
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <m.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="py-12 text-center"
              >
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: `${colors.success}20` }}
                >
                  <CheckCircle size={32} style={{ color: colors.success }} />
                </m.div>
                <p className="text-white font-bold">인증 성공!</p>
                <p className="text-linear-text-tertiary text-sm mt-1">QR 코드가 확인되었습니다</p>
              </m.div>
            ) : status === 'error' ? (
              <m.div
                key="error"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="py-12 text-center"
              >
                <m.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: `${colors.error}20` }}
                >
                  <AlertCircle size={32} style={{ color: colors.error }} />
                </m.div>
                <p className="text-white font-bold">인증 실패</p>
                <p className="text-linear-text-tertiary text-sm mt-1">{errorMessage}</p>
                <button
                  onClick={handleRetry}
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: `${colors.flame[500]}20`,
                    color: colors.flame[500],
                  }}
                  type="button"
                >
                  다시 시도
                </button>
              </m.div>
            ) : mode === 'camera' ? (
              <m.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
                id="camera-panel"
                role="tabpanel"
                aria-labelledby="camera-tab"
              >
                {cameraError ? (
                  <div className="py-12 text-center" role="alert">
                    <Camera
                      size={48}
                      className="mx-auto mb-4 text-linear-text-tertiary"
                      aria-hidden="true"
                    />
                    <p className="text-linear-text-tertiary text-sm">{cameraError}</p>
                  </div>
                ) : (
                  <>
                    {/* Video Preview */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        aria-label="카메라 미리보기"
                      />
                      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                      {/* Scan Overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <div
                          className="w-48 h-48 border-2 rounded-2xl"
                          style={{
                            borderColor: colors.flame[500],
                            boxShadow: `0 0 0 1000px rgba(0, 0, 0, 0.5)`,
                          }}
                        />
                      </div>

                      {/* Scanning Animation */}
                      <m.div
                        className="absolute left-1/2 -translate-x-1/2 w-48 h-0.5"
                        style={{ background: colors.flame[500] }}
                        animate={{ y: [80, 200, 80] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden="true"
                      />
                    </div>

                    <p className="text-center text-linear-text-tertiary text-sm mt-4">
                      팝업 현장의 QR 코드를 스캔하세요
                    </p>
                  </>
                )}
              </m.div>
            ) : (
              <m.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="manual-panel"
                role="tabpanel"
                aria-labelledby="manual-tab"
              >
                <p className="text-linear-text-tertiary text-sm mb-4" id="code-input-desc">
                  현장에 표시된 {CODE_LENGTH}자리 코드를 입력하세요
                </p>

                {/* Code Input */}
                <div className="flex gap-2 mb-4" role="group" aria-describedby="code-input-desc">
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
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-linear-surface border border-linear-border text-white focus:outline-none focus:ring-2 focus:ring-flame-500"
                      style={{
                        background: surface,
                        borderColor: errorMessage ? colors.error : borderSubtle,
                      }}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <m.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm mb-3"
                    style={{ color: colors.error }}
                    role="alert"
                  >
                    {errorMessage}
                  </m.p>
                )}

                {/* Submit Button */}
                <m.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualSubmit}
                  disabled={manualCode.length !== CODE_LENGTH || isLoading || status === 'scanning'}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
                    color: 'white',
                  }}
                  type="button"
                  aria-busy={status === 'scanning'}
                >
                  {status === 'scanning' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                      인증 중...
                    </>
                  ) : (
                    '코드 확인'
                  )}
                </m.button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </m.div>
  );
});

export default QRScanner;
