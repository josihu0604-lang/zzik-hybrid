'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from '@/lib/motion';
import { Receipt, Camera, Upload, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { colors, opacity, gradients } from '@/lib/design-tokens';
import type { ReceiptVerificationResult } from '@/lib/verification';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ReceiptStep - 영수증 인증 단계 컴포넌트
 *
 * Triple Verification의 마지막 단계 (선택적, 20점)
 */

interface ReceiptStepProps {
  /** 팝업 ID */
  popupId: string;
  /** 팝업 브랜드명 */
  brandName: string;
  /** 체크인 날짜 */
  checkInDate: Date;
  /** 영수증 인증 결과 */
  result: ReceiptVerificationResult | null;
  /** 로딩 중 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 영수증 인증 시작 */
  onVerify: (imageBase64: string) => Promise<void>;
  /** 건너뛰기 */
  onSkip: () => void;
}

type InputMode = 'select' | 'preview';

export function ReceiptStep({
  popupId: _popupId,
  brandName,
  checkInDate,
  result,
  isLoading,
  error,
  onVerify,
  onSkip,
}: ReceiptStepProps) {
  useReducedMotion();
  const [mode, setMode] = useState<InputMode>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(async (file: File) => {
    setLocalError(null);

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('이미지 크기는 10MB 이하여야 합니다');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setLocalError('이미지 파일만 업로드 가능합니다');
      return;
    }

    // Base64로 변환
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setMode('preview');
    };
    reader.onerror = () => {
      setLocalError('이미지를 읽을 수 없습니다');
    };
    reader.readAsDataURL(file);
  }, []);

  // 카메라 촬영
  const handleCameraCapture = useCallback(() => {
    const input = fileInputRef.current;
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
    }
  }, []);

  // 갤러리 선택
  const handleGallerySelect = useCallback(() => {
    const input = fileInputRef.current;
    if (input) {
      input.removeAttribute('capture');
      input.click();
    }
  }, []);

  // 영수증 검증 실행
  const handleVerifyReceipt = useCallback(async () => {
    if (!imagePreview) return;
    const base64Data = imagePreview.split(',')[1];
    await onVerify(base64Data);
  }, [imagePreview, onVerify]);

  // 다시 선택
  const handleReselect = useCallback(() => {
    setMode('select');
    setImagePreview(null);
    setLocalError(null);
  }, []);

  const displayError = localError || error;

  // 인증 완료 상태
  if (result?.verified) {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center py-8"
      >
        <m.div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: gradients.success,
            border: `2px solid rgba(34, 197, 94, ${opacity[40]})`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Check size={40} style={{ color: colors.success }} />
        </m.div>

        <p className="text-white font-bold text-xl mb-2">영수증 인증 완료!</p>
        <p className="text-linear-text-secondary mb-1">
          추가 <span style={{ color: colors.spark[500] }}>{result.score}점</span> 획득!
        </p>

        {/* 검증 세부 정보 */}
        <m.div
          className="mt-4 p-4 rounded-xl w-full max-w-xs"
          style={{
            background: `rgba(34, 197, 94, ${opacity[10]})`,
            border: `1px solid rgba(34, 197, 94, ${opacity[20]})`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-linear-text-tertiary">브랜드 확인</span>
              <span style={{ color: result.brandMatched ? colors.success : colors.error }}>
                {result.brandMatched ? '일치' : '불일치'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-linear-text-tertiary">날짜 확인</span>
              <span style={{ color: result.dateValid ? colors.success : colors.error }}>
                {result.dateValid ? '유효' : '무효'}
              </span>
            </div>
          </div>
        </m.div>
      </m.div>
    );
  }

  // 인증 실패 상태
  if (result && !result.verified) {
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

        <p className="text-white font-bold text-lg mb-2">영수증 인증 실패</p>
        <p className="text-linear-text-secondary text-sm text-center mb-4 max-w-xs">
          {!result.brandMatched && '브랜드가 일치하지 않습니다. '}
          {!result.dateValid && '날짜가 유효하지 않습니다. '}
          {result.extractedText && (
            <span className="block mt-2 text-xs text-linear-text-tertiary">
              추출된 텍스트: {result.extractedText.substring(0, 50)}...
            </span>
          )}
        </p>

        <div className="flex gap-3">
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReselect}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{
              background: `rgba(255, 255, 255, ${opacity[10]})`,
              border: `1px solid ${colors.border.emphasis}`,
              color: 'white',
            }}
          >
            다시 시도
          </m.button>
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            className="px-6 py-3 rounded-xl font-bold text-sm text-linear-text-secondary"
            style={{
              background: `rgba(255, 255, 255, ${opacity[5]})`,
            }}
          >
            건너뛰기
          </m.button>
        </div>
      </m.div>
    );
  }

  // 미리보기 화면
  if (mode === 'preview' && imagePreview) {
    return (
      <div className="py-6">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg mb-2">영수증 확인</h3>
          <p className="text-linear-text-tertiary text-sm">
            영수증이 선명한지 확인하고 검증을 시작하세요
          </p>
        </div>

        {/* 이미지 미리보기 */}
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4"
          style={{
            background: '#000',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Image
            src={imagePreview}
            alt="영수증 미리보기"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        {/* 에러 메시지 */}
        <AnimatePresence>
          {displayError && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg"
              style={{
                background: `rgba(239, 68, 68, ${opacity[10]})`,
                border: `1px solid rgba(239, 68, 68, ${opacity[20]})`,
              }}
            >
              <AlertCircle size={16} style={{ color: colors.error }} />
              <span className="text-sm" style={{ color: colors.error }}>
                {displayError}
              </span>
            </m.div>
          )}
        </AnimatePresence>

        {/* 검증 정보 */}
        <div
          className="mb-4 p-3 rounded-lg"
          style={{
            background: `rgba(255, 217, 61, ${opacity[10]})`,
            border: `1px solid rgba(255, 217, 61, ${opacity[20]})`,
          }}
        >
          <p className="text-xs text-linear-text-tertiary">
            <span className="font-semibold" style={{ color: colors.spark[500] }}>
              검증 항목:
            </span>
            <br />
            브랜드: {brandName}
            <br />
            날짜: {checkInDate.toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleReselect}
            className="flex-1 py-3 rounded-xl text-linear-text-secondary text-sm font-medium"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            disabled={isLoading}
          >
            다시 선택
          </button>
          <m.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyReceipt}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: colors.flame[500],
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                검증 중...
              </span>
            ) : (
              '검증하기'
            )}
          </m.button>
        </div>
      </div>
    );
  }

  // 모드 선택 화면
  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: `${colors.flame[500]}20` }}
        >
          <Receipt size={32} style={{ color: colors.flame[500] }} />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">영수증 인증 (선택)</h3>
        <p className="text-linear-text-tertiary text-sm">
          {brandName}의 영수증으로 추가 20점을 받으세요
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <div className="space-y-3 mb-6">
        {/* 카메라 촬영 */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCameraCapture}
          className="w-full p-4 rounded-xl flex items-center gap-4 transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          type="button"
          aria-label="카메라로 영수증 촬영"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${colors.flame[500]}20` }}
          >
            <Camera size={24} style={{ color: colors.flame[500] }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">카메라로 촬영</p>
            <p className="text-linear-text-tertiary text-sm">영수증을 직접 촬영합니다</p>
          </div>
        </m.button>

        {/* 갤러리 선택 */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGallerySelect}
          className="w-full p-4 rounded-xl flex items-center gap-4 transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          type="button"
          aria-label="갤러리에서 영수증 선택"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${colors.spark[500]}20` }}
          >
            <Upload size={24} style={{ color: colors.spark[500] }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">갤러리에서 선택</p>
            <p className="text-linear-text-tertiary text-sm">저장된 영수증을 선택합니다</p>
          </div>
        </m.button>
      </div>

      {/* 안내 메시지 */}
      <div
        className="p-3 rounded-lg mb-4"
        style={{
          background: `rgba(255, 217, 61, ${opacity[10]})`,
          border: `1px solid rgba(255, 217, 61, ${opacity[20]})`,
        }}
      >
        <p className="text-xs text-linear-text-tertiary">
          <span className="font-semibold" style={{ color: colors.spark[500] }}>
            촬영 팁:
          </span>
          <br />
          • 영수증 전체가 보이도록 촬영하세요
          <br />
          • 조명이 밝은 곳에서 촬영하세요
          <br />• 브랜드명과 날짜가 선명해야 합니다
        </p>
      </div>

      {/* 건너뛰기 */}
      <button
        onClick={onSkip}
        className="w-full py-3 text-linear-text-tertiary text-sm hover:text-white transition-colors"
      >
        건너뛰고 완료하기
      </button>
    </div>
  );
}

export default ReceiptStep;
