/**
 * usePopupDetail Hook
 *
 * Handles data fetching and state management for popup detail page
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useConfetti } from '@/hooks/useConfetti';
import { useRealtimeParticipants } from '@/hooks/useRealtimeParticipants';

// Popup data type from API
export interface PopupDetailData {
  id: string;
  brandName: string;
  title: string;
  description?: string;
  location: string;
  category: string;
  imageUrl?: string;
  currentParticipants: number;
  goalParticipants: number;
  status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
  daysLeft: number;
  deadlineAt: string;
  startsAt?: string;
  endsAt?: string;
}

// Category-based brand colors
export const CATEGORY_COLORS = {
  fashion: {
    primary: '#FF6B5B',
    secondary: '#FF8A7A',
    gradient: 'linear-gradient(135deg, #FF6B5B 0%, #FF8A7A 50%, #FFA596 100%)',
  },
  beauty: {
    primary: '#FF4D8F',
    secondary: '#FF7AA8',
    gradient: 'linear-gradient(135deg, #FF4D8F 0%, #FF7AA8 50%, #FFA8C8 100%)',
  },
  food: {
    primary: '#FFD93D',
    secondary: '#FFE066',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE066 50%, #FFEB99 100%)',
  },
  lifestyle: {
    primary: '#6B8EFF',
    secondary: '#8AA7FF',
    gradient: 'linear-gradient(135deg, #6B8EFF 0%, #8AA7FF 50%, #AABFFF 100%)',
  },
  art: {
    primary: '#A855F7',
    secondary: '#C084FC',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #D8B4FE 100%)',
  },
};

// Default category color (fallback)
export const DEFAULT_COLOR = CATEGORY_COLORS.fashion;

export type CategoryColor = (typeof CATEGORY_COLORS)[keyof typeof CATEGORY_COLORS];

// Get category color with fallback
export function getCategoryColor(category: string): CategoryColor {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || DEFAULT_COLOR;
}

// Extract brand initials (up to 2 characters)
export function getBrandInitials(name: string): string {
  const words = name.split(' ');
  if (words.length >= 2) {
    return words[0].charAt(0) + words[1].charAt(0);
  }
  return name.substring(0, 2).toUpperCase();
}

interface UsePopupDetailOptions {
  id: string | undefined;
  referralCode: string | null;
}

interface UsePopupDetailReturn {
  popup: PopupDetailData | null;
  isLoading: boolean;
  error: string | null;
  isParticipated: boolean;
  participants: number;
  showCelebration: boolean;
  brandColor: CategoryColor;
  progress: number;
  isConfirmedOrDone: boolean;
  realtime: ReturnType<typeof useRealtimeParticipants>;
  confetti: ReturnType<typeof useConfetti>;
  handleParticipate: () => Promise<void>;
  setShowCelebration: (show: boolean) => void;
}

export function usePopupDetail({ id, referralCode }: UsePopupDetailOptions): UsePopupDetailReturn {
  const [popup, setPopup] = useState<PopupDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipated, setIsParticipated] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Toast and Confetti hooks
  const toast = useToast();
  const confetti = useConfetti();

  // Realtime participants hook
  const realtime = useRealtimeParticipants({
    popupId: id || '',
    initialCount: participants,
    goalCount: popup?.goalParticipants || 100,
    enabled: !!popup && popup.status === 'funding',
    onGoalReached: () => {
      // Trigger confetti celebration
      if ('celebrationBurst' in confetti && typeof confetti.celebrationBurst === 'function') {
        confetti.celebrationBurst();
      } else if ('fire' in confetti && typeof confetti.fire === 'function') {
        confetti.fire();
      }
      setShowCelebration(true);
      toast.celebrate('목표 달성! 팝업이 오픈됩니다!');
    },
  });

  // Sync realtime count with local participants state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (realtime.count > participants) {
      setParticipants(realtime.count);
    }
  }, [realtime.count, participants]);

  // SEC-013 SECURITY NOTE: Referral code stored in localStorage
  // XSS Risk: If an XSS attack occurs, malicious scripts could read/modify this value.
  // This is acceptable for referral tracking as:
  // 1. Referral codes are not sensitive authentication tokens
  // 2. Server validates referral codes independently
  // 3. Manipulation only affects referral attribution, not security
  //
  // MIGRATION NOTE: For enhanced security, consider:
  // - Using httpOnly cookies with SameSite=Lax (requires API change)
  // - Storing referral codes in server session storage
  // - Implementing CSP headers to mitigate XSS risk (see csrf.ts)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (referralCode && id) {
      // Validate referral code format before storing (basic sanitization)
      const validReferralCode = /^[A-Z0-9]{6,12}$/i.test(referralCode);
      if (validReferralCode) {
        const normalizedCode = referralCode.toUpperCase();
        localStorage.setItem(`zzik_ref_${id}`, normalizedCode);
        // Also store globally for cross-popup attribution
        localStorage.setItem(
          'zzik_referral',
          JSON.stringify({
            code: normalizedCode,
            popupId: id,
            capturedAt: Date.now(),
            source: 'url',
          })
        );
      }
    }
  }, [referralCode, id]);

  // Fetch popup data on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchPopup = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        // PERF-001: Fetch single popup instead of entire list for better performance
        const response = await fetch(`/api/popup?id=${id}`);
        const result = await response.json();

        if (result.success && result.data?.popup) {
          // API returns single popup when id parameter is provided
          setPopup(result.data.popup);
          setParticipants(result.data.popup.currentParticipants);
        } else if (result.success && result.data?.popups) {
          // Fallback: API returned list, find specific popup
          const foundPopup = result.data.popups.find((p: PopupDetailData) => p.id === id);
          if (foundPopup) {
            setPopup(foundPopup);
            setParticipants(foundPopup.currentParticipants);
          } else {
            setError('팝업을 찾을 수 없습니다.');
          }
        } else {
          setError(result.error || '데이터를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopup();
  }, [id]);

  const brandColor = popup ? getCategoryColor(popup.category) : DEFAULT_COLOR;
  const progress = popup ? (participants / popup.goalParticipants) * 100 : 0;
  const isConfirmedOrDone = popup
    ? popup.status === 'confirmed' || popup.status === 'completed' || progress >= 100
    : false;

  /**
   * Track referral to API (non-blocking)
   * Called after successful participation
   */
  const trackReferralAsync = async (popupId: string, refCode: string, csrfToken: string | null) => {
    try {
      await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          action: 'track',
          referralCode: refCode,
          popupId,
        }),
      });
      // Clear the stored referral after successful tracking
      localStorage.removeItem(`zzik_ref_${popupId}`);
    } catch (error) {
      // Non-critical error, log but don't show to user
      console.warn('[Referral] Failed to track:', error);
    }
  };

  const handleParticipate = useCallback(async () => {
    if (!popup) return;

    // Get CSRF token from cookie
    const getCsrfToken = (): string | null => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_token') {
          return value;
        }
      }
      return null;
    };

    const csrfToken = getCsrfToken();

    // Get stored referral code
    const storedRefCode = localStorage.getItem(`zzik_ref_${popup.id}`) || referralCode;

    // Optimistic UI update
    const previousParticipated = isParticipated;
    const previousParticipants = participants;

    setIsParticipated(true);
    setParticipants((p) => p + 1);

    try {
      // API call with error handling
      const response = await fetch('/api/popup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          popupId: popup.id,
          referralCode: storedRefCode || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '참여에 실패했습니다');
      }

      // Track referral if present (async, non-blocking)
      if (storedRefCode) {
        trackReferralAsync(popup.id, storedRefCode, csrfToken);
      }

      // Update with real data from server
      if (data.data?.popup) {
        setParticipants(data.data.popup.currentParticipants);

        // Check if goal reached (100%)
        const newProgress = (data.data.popup.currentParticipants / popup.goalParticipants) * 100;
        if (newProgress >= 100) {
          // Trigger confetti celebration
          if ('celebrationBurst' in confetti && typeof confetti.celebrationBurst === 'function') {
            confetti.celebrationBurst();
          } else if ('fire' in confetti && typeof confetti.fire === 'function') {
            confetti.fire();
          }
          setShowCelebration(true);
          toast.celebrate('목표 달성! 팝업이 오픈됩니다!');
        } else {
          toast.success('참여 완료!');
        }
      } else {
        toast.success('참여 완료!');
      }

      // Success - optimistic update confirmed
    } catch (error) {
      // Revert optimistic update on error
      setIsParticipated(previousParticipated);
      setParticipants(previousParticipants);

      // Show error toast
      const message =
        error instanceof Error ? error.message : '참여에 실패했습니다. 다시 시도해주세요.';
      console.error('Participation error:', message);

      // Display user-friendly error with toast
      toast.error(message);
    }
  }, [popup, isParticipated, participants, referralCode, confetti, toast]);

  return {
    popup,
    isLoading,
    error,
    isParticipated,
    participants,
    showCelebration,
    brandColor,
    progress,
    isConfirmedOrDone,
    realtime,
    confetti,
    handleParticipate,
    setShowCelebration,
  };
}
