'use client';

import { useState, useCallback, useRef } from 'react';
import { m } from 'framer-motion';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { VerificationModal } from '@/components/verification';
import { VerificationBadge } from '@/components/verification';
import { useHaptic } from '@/hooks/useHaptic';
import { isTouchNearEdge } from '@/lib/mobile-ux';

/**
 * CheckinButton - 찍음 (Triple Verification) 버튼
 *
 * 확정된 팝업에서 방문 인증을 위한 CTA
 * 새로운 VerificationModal 사용
 */

interface CheckinButtonProps {
  popupId: string;
  brandName: string;
  status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
  /** 팝업 위치 (GPS 인증용) */
  popupLocation?: { latitude: number; longitude: number };
  alreadyCheckedIn?: boolean;
  /** 인증 완료 후 점수 */
  checkinScore?: number;
  className?: string;
  /** 인증 완료 콜백 */
  onCheckinComplete?: (score: number) => void;
}

// 서울 성수동 기본 위치 (데모용)
const DEFAULT_POPUP_LOCATION = {
  latitude: 37.5445,
  longitude: 127.0567,
};

export function CheckinButton({
  popupId,
  brandName,
  status,
  popupLocation = DEFAULT_POPUP_LOCATION,
  alreadyCheckedIn = false,
  checkinScore,
  className = '',
  onCheckinComplete,
}: CheckinButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(alreadyCheckedIn);
  const [score, setScore] = useState(checkinScore || 0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // DES-029: 햅틱 피드백
  const haptic = useHaptic();

  // 체크인 불가능한 상태
  const isDisabled = status === 'funding' || status === 'cancelled';

  // 인증 완료 처리
  const handleComplete = useCallback(
    (completedScore: number) => {
      setIsCheckedIn(true);
      setScore(completedScore);
      onCheckinComplete?.(completedScore);
      // DES-029: 체크인 성공 햅틱
      haptic.celebrate();
    },
    [onCheckinComplete, haptic]
  );

  // 버튼 텍스트와 스타일
  const getButtonConfig = () => {
    if (isCheckedIn) {
      return {
        text: '찍음 완료',
        icon: <Check size={20} aria-hidden="true" />,
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        shadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
        disabled: true,
        statusDescription: undefined,
      };
    }
    if (status === 'funding') {
      return {
        text: '오픈 대기 중',
        icon: <Loader2 size={20} className="animate-spin" aria-hidden="true" />,
        background: colors.space[800],
        shadow: 'none',
        disabled: true,
        statusDescription: '펀딩 진행 중입니다. 목표 인원이 달성되면 오픈됩니다.',
      };
    }
    if (status === 'cancelled') {
      return {
        text: '취소됨',
        icon: null,
        background: colors.space[800],
        shadow: 'none',
        disabled: true,
        statusDescription: undefined,
      };
    }
    return {
      text: '찍기',
      icon: <MapPin size={20} aria-hidden="true" />,
      background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[600]} 100%)`,
      shadow: `0 8px 24px ${colors.flame[500]}40`,
      disabled: false,
      statusDescription: undefined,
    };
  };

  const config = getButtonConfig();

  // DES-109: 엣지 스와이프 대응
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const startPos = touchStartRef.current;

      // 엣지에서 시작된 터치는 무시 (뒤로가기 제스처 방지)
      if (isTouchNearEdge(startPos.x, startPos.y, window.innerWidth, window.innerHeight)) {
        touchStartRef.current = null;
        return;
      }

      // 일반 탭으로 처리
      if (!isDisabled && !isCheckedIn) {
        haptic.tap();
        setIsModalOpen(true);
      }

      touchStartRef.current = null;
    },
    [isDisabled, isCheckedIn, haptic]
  );

  return (
    <>
      {/* Main Button */}
      <m.button
        onClick={() => {
          if (!isDisabled && !isCheckedIn) {
            // DES-029: 체크인 버튼 클릭 햅틱
            haptic.tap();
            setIsModalOpen(true);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={config.disabled}
        whileHover={!config.disabled ? { scale: 1.02 } : undefined}
        whileTap={!config.disabled ? { scale: 0.97 } : undefined} // DES-214: 탭 스케일 0.97로 통일
        transition={{ duration: 0.15 }} // DES-214: transition 추가
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${className}`}
        style={{
          background: config.background,
          color: config.disabled && !isCheckedIn ? colors.text.muted : 'white',
          cursor: config.disabled ? 'not-allowed' : 'pointer',
          boxShadow: config.shadow,
        }}
        aria-busy={status === 'funding'}
        aria-describedby={config.statusDescription ? 'checkin-status-description' : undefined}
        aria-label={
          isCheckedIn
            ? `찍음 완료 - ${score}점 획득`
            : status === 'funding'
              ? '오픈 대기 중입니다'
              : status === 'cancelled'
                ? '취소된 팝업입니다'
                : `${brandName} 팝업 체크인하기`
        }
      >
        {config.icon}
        {config.text}
        {isCheckedIn && score > 0 && <span className="text-sm opacity-80">({score}점)</span>}
      </m.button>

      {/* Loading state description for screen readers */}
      {config.statusDescription && (
        <p id="checkin-status-description" className="sr-only">
          {config.statusDescription}
        </p>
      )}

      {/* Checked-in Badge (below button) */}
      {isCheckedIn && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex justify-center"
        >
          <VerificationBadge score={score} status="verified" size="md" animated />
        </m.div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
        popupId={popupId}
        popupName={brandName}
        brandName={brandName}
        popupLocation={popupLocation}
      />
    </>
  );
}

export default CheckinButton;
