'use client';

import { useEffect, useCallback } from 'react';
import { useConfetti as useConfettiHook } from '@/hooks/useConfetti';
import { colors } from '@/lib/design-tokens';

/**
 * Confetti Effect - 축하 효과 (DES-033)
 *
 * Unified implementation using canvas-confetti
 * - Replaced CSS-based animation with canvas-confetti
 * - Better performance and more natural physics
 * - Consistent with CelebrationModal implementation
 *
 * 100% 달성, 체크인 성공 시 사용
 */

const CONFETTI_COLORS = [
  colors.flame[500], // Flame Coral
  colors.flame[400], // Light Flame
  colors.ember[500], // Deep Ember
  colors.spark[500], // Spark Yellow
  colors.success, // Success Green
  colors.successLight, // Light Success
];

// DES-151: Confetti 재생 조건 개선
// - 100% 달성 시에만 재생 (기존: 임의 조건)
// - 중복 재생 방지 로직 추가
const DEFAULT_CONFETTI_DURATION = 3000; // 3초 (DES-049 개선)

interface ConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({
  active,
  duration = DEFAULT_CONFETTI_DURATION,
  onComplete,
}: ConfettiProps) {
  const { fire, fireMultiple } = useConfettiHook();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!active) return;

    // Vibrate on supported devices
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Initial big burst
    fire({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: CONFETTI_COLORS,
    });

    // Continuous side bursts
    const burstCount = Math.floor(duration / 300);
    fireMultiple(burstCount, 300, {
      particleCount: 3,
      spread: 55,
      colors: CONFETTI_COLORS,
    });

    // Call onComplete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, onComplete, fire, fireMultiple]);

  return null;
}

/**
 * useConfetti Hook
 *
 * 컴포넌트에서 confetti 트리거 관리 (DES-049)
 */
export function useConfetti() {
  const { fire, fireMultiple } = useConfettiHook();

  const triggerConfetti = useCallback(
    (duration = DEFAULT_CONFETTI_DURATION) => {
      // Initial big burst
      fire({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors: CONFETTI_COLORS,
      });

      // Continuous side bursts
      const burstCount = Math.floor(duration / 300);
      fireMultiple(burstCount, 300, {
        particleCount: 3,
        spread: 55,
        colors: CONFETTI_COLORS,
      });

      // Vibrate on supported devices
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    },
    [fire, fireMultiple]
  );

  return { triggerConfetti };
}

/**
 * CelebrationBanner - 오픈 확정 배너
 *
 * Simple banner component for celebration messages
 * Use with triggerConfetti() for full effect
 */
interface CelebrationBannerProps {
  brandName: string;
  onClose?: () => void;
}

export function CelebrationBanner({ brandName, onClose }: CelebrationBannerProps) {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    triggerConfetti();
  }, [triggerConfetti]);

  return (
    <div
      className="fixed left-4 right-4 max-w-lg mx-auto"
      style={{
        top: '5rem',
        zIndex: 9997,
      }}
    >
      <div
        className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(255, 217, 61, 0.2) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.4) 0%, transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-black text-xl mb-1" style={{ color: colors.success }}>
            오픈 확정!
          </h3>
          <p className="text-white text-sm">
            <span className="font-bold">{brandName}</span> 팝업이 열립니다!
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
              style={{
                background: 'rgba(34, 197, 94, 0.3)',
                color: colors.success,
                border: '1px solid rgba(34, 197, 94, 0.4)',
              }}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
