'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { PartyPopper, Sparkles, X, MapPin, Share2 } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { useConfetti } from '@/hooks/useConfetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, glass, radii, typography, spacing, layout } from '@/lib/design-tokens';
import { duration, easing, springConfig } from '@/lib/animations';

/**
 * Focus trap hook for modal accessibility
 */
function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: go to previous element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to next element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}

interface PopupInfo {
  id: string;
  name: string;
  brand: string;
  location?: string;
  openDate?: string;
  imageUrl?: string;
  participantCount: number;
  targetCount: number;
}

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  popup: PopupInfo;
  userContribution?: number; // 1st, 2nd, etc. (order of participation)
}

export function CelebrationModal({
  isOpen,
  onClose,
  popup,
  userContribution,
}: CelebrationModalProps) {
  const [showShare, setShowShare] = useState(false);
  const haptic = useHaptic();
  const { celebrationBurst } = useConfetti();
  const focusTrapRef = useFocusTrap(isOpen);
  const prefersReducedMotion = useReducedMotion();

  // Handle ESC key to close modal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trigger confetti and haptic on open
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!isOpen) return;

    haptic.celebrate();
    celebrationBurst();
  }, [isOpen, haptic, celebrationBurst]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${popup.name} 팝업 오픈 확정!`,
          text: `내 참여가 만들어낸 성과! "${popup.brand}" 팝업이 드디어 열려요 🎉`,
          url: `https://zzik.app/popup/${popup.id}`,
        });
        haptic.success();
      } catch {
        // User cancelled or share error - silently ignored
      }
    } else {
      setShowShare(true);
      // Copy to clipboard fallback
      await navigator.clipboard.writeText(`https://zzik.app/popup/${popup.id}`);
      haptic.success();
    }
  }, [popup, haptic]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ padding: spacing[4] }}
        >
          {/* Backdrop - DES-055, DES-057, DES-060 */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.standard }} // DES-057: 일관된 exit duration (200ms)
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={(e) => {
              // DES-055: Only close if clicking backdrop itself
              if (e.target === e.currentTarget) {
                haptic.tap(); // DES-060: Haptic feedback
                onClose();
              }
            }}
          />

          {/* Modal Content - DES-057: Consistent exit */}
          <m.div
            ref={focusTrapRef}
            initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 10 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    ...springConfig.smooth,
                  }
            }
            className="relative w-full overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-modal-title"
            aria-describedby="celebration-modal-description"
            style={{
              maxWidth: layout.modal.maxWidthMd,
              borderRadius: radii['3xl'],
              background: `linear-gradient(to bottom, ${colors.space[900]}, ${colors.space[950]})`,
              border: `1px solid ${colors.flame[500]}4d`,
              boxShadow: `0 25px 50px -12px ${colors.flame[500]}33`,
              willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
              style={{ background: `${colors.flame[500]}33`, filter: 'blur(60px)' }}
            />
            <div
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
              style={{ background: `${colors.success}33`, filter: 'blur(60px)' }}
            />

            {/* Content */}
            <div className="relative" style={{ padding: spacing[8] }}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute transition-colors"
                aria-label="축하 모달 닫기"
                style={{
                  top: spacing[4],
                  right: spacing[4],
                  padding: spacing[2],
                  borderRadius: radii.full,
                  background: glass.light.background,
                  color: colors.text.secondary,
                }}
              >
                <X size={20} />
              </button>

              {/* Celebration icon */}
              <m.div
                initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 500, damping: 20, delay: duration.standard }
                }
                className="flex justify-center"
                style={{ marginBottom: spacing[6] }}
              >
                <div className="relative">
                  <m.div
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            rotate: [-10, 10, -10],
                            scale: [1, 1.1, 1],
                          }
                    }
                    transition={{
                      duration: duration.progress, // 500ms
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <PartyPopper size={72} style={{ color: colors.flame[500] }} />
                  </m.div>
                  {/* Sparkles around - respects reduced motion */}
                  {!prefersReducedMotion &&
                    [...Array(6)].map((_, i) => (
                      <m.div
                        key={i}
                        className="absolute"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: Math.cos((i * Math.PI) / 3) * 50,
                          y: Math.sin((i * Math.PI) / 3) * 50,
                        }}
                        transition={{
                          duration: duration.major * 3.75, // 1.5s
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          willChange: 'transform, opacity',
                        }}
                      >
                        <Sparkles size={24} style={{ color: colors.gold }} />
                      </m.div>
                    ))}
                </div>
              </m.div>

              {/* Title */}
              <m.h2
                id="celebration-modal-title"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        delay: duration.major * 0.75,
                        duration: duration.major,
                        ease: easing.smooth,
                      }
                }
                className="text-center"
                style={{
                  fontSize: typography.fontSize['3xl'].size,
                  fontWeight: typography.fontWeight.bold,
                  marginBottom: spacing[2],
                }}
              >
                <span
                  style={{
                    background: `linear-gradient(to right, ${colors.flame[400]}, ${colors.flame[500]}, ${colors.gold})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  팝업 오픈 확정!
                </span>
              </m.h2>

              {/* Popup info */}
              <m.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { delay: duration.major, ease: easing.smooth }
                }
                className="text-center"
                style={{ marginBottom: spacing[6] }}
              >
                <p
                  style={{
                    fontSize: typography.fontSize.xl.size,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing[1],
                  }}
                >
                  {popup.name}
                </p>
                <p style={{ color: colors.text.secondary }}>{popup.brand}</p>
              </m.div>

              {/* Stats */}
              <m.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { delay: duration.major * 1.25, ease: easing.smooth }
                }
                style={{
                  background: glass.light.background,
                  borderRadius: radii['2xl'],
                  padding: spacing[4],
                  marginBottom: spacing[6],
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p
                      style={{
                        fontSize: typography.fontSize['3xl'].size,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.success,
                      }}
                    >
                      {popup.participantCount}
                    </p>
                    <p
                      style={{
                        fontSize: typography.fontSize.xs.size,
                        color: colors.text.secondary,
                      }}
                    >
                      총 참여자
                    </p>
                  </div>
                  <div style={{ width: '1px', height: '48px', background: colors.border.subtle }} />
                  <div className="text-center flex-1">
                    <p
                      style={{
                        fontSize: typography.fontSize['3xl'].size,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.flame[400],
                      }}
                    >
                      100%
                    </p>
                    <p
                      style={{
                        fontSize: typography.fontSize.xs.size,
                        color: colors.text.secondary,
                      }}
                    >
                      목표 달성
                    </p>
                  </div>
                  {userContribution && (
                    <>
                      <div
                        style={{ width: '1px', height: '48px', background: colors.border.subtle }}
                      />
                      <div className="text-center flex-1">
                        <p
                          style={{
                            fontSize: typography.fontSize['3xl'].size,
                            fontWeight: typography.fontWeight.bold,
                            color: colors.gold,
                          }}
                        >
                          #{userContribution}
                        </p>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs.size,
                            color: colors.text.secondary,
                          }}
                        >
                          내 참여 순서
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </m.div>

              {/* Message */}
              <m.p
                id="celebration-modal-description"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { delay: duration.major * 1.5, ease: easing.smooth }
                }
                className="text-center"
                style={{ color: colors.text.secondary, marginBottom: spacing[6] }}
              >
                당신의 참여가 이 팝업을 열었어요!
                <br />
                <span style={{ color: colors.flame[400] }}>
                  {popup.openDate ? `${popup.openDate} 오픈 예정` : '오픈일 확정 시 알려드릴게요'}
                </span>
              </m.p>

              {/* Share button */}
              <m.button
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { delay: duration.major * 1.75, ease: easing.smooth }
                }
                onClick={handleShare}
                className="w-full flex items-center justify-center transition-all"
                aria-label={showShare ? '링크 복사됨' : '팝업 오픈 소식 공유하기'}
                style={{
                  padding: spacing[4],
                  borderRadius: radii['2xl'],
                  background: `linear-gradient(to right, ${colors.flame[500]}, ${colors.flame[600]})`,
                  color: 'white',
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.lg.size,
                  boxShadow: `0 10px 40px ${colors.flame[500]}4d`,
                  gap: spacing[2],
                }}
              >
                {showShare ? (
                  '링크가 복사되었어요!'
                ) : (
                  <>
                    <Share2 size={20} />
                    <span>자랑하기</span>
                  </>
                )}
              </m.button>

              {/* Location info */}
              {popup.location && (
                <m.p
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { delay: duration.major * 2, ease: easing.smooth }
                  }
                  className="text-center flex items-center justify-center"
                  style={{
                    fontSize: typography.fontSize.sm.size,
                    color: colors.text.muted,
                    marginTop: spacing[4],
                    gap: spacing[1],
                  }}
                >
                  <MapPin size={14} />
                  {popup.location}
                </m.p>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default CelebrationModal;
