/**
 * useParticipation Hook
 *
 * Handles popup participation state and API calls.
 * Extracted from ParticipateButton for reuse and testability.
 */

import { useState, useCallback, useRef } from 'react';
import { useConfetti } from './useConfetti';
import { logger } from '@/lib/logger';

export type ParticipationState = 'idle' | 'loading' | 'success' | 'error' | 'already_participated';

interface ParticipationResult {
  success: boolean;
  message: string;
  goalReached?: boolean;
  popup?: {
    currentParticipants: number;
    goalParticipants: number;
  };
}

interface UseParticipationOptions {
  /** Popup ID to participate in */
  popupId: string;
  /** Whether user has already participated */
  isAlreadyParticipated?: boolean;
  /** Callback when participation succeeds */
  onSuccess?: (result: ParticipationResult) => void;
  /** Callback when participation fails */
  onError?: (error: Error) => void;
  /** Callback when goal is reached */
  onGoalReached?: () => void;
  /** Referral code if any */
  referralCode?: string;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Enable confetti on success */
  enableConfetti?: boolean;
}

interface UseParticipationReturn {
  /** Current participation state */
  state: ParticipationState;
  /** Error message if any */
  error: string | null;
  /** Execute participation */
  participate: () => Promise<void>;
  /** Reset state to idle */
  reset: () => void;
  /** Whether participation is in progress */
  isLoading: boolean;
  /** Whether user has participated (success or already) */
  hasParticipated: boolean;
}

/**
 * Custom hook for managing popup participation
 */
export function useParticipation(options: UseParticipationOptions): UseParticipationReturn {
  const {
    popupId,
    isAlreadyParticipated = false,
    onSuccess,
    onError,
    onGoalReached,
    referralCode,
    enableHaptics = true,
    enableConfetti = true,
  } = options;

  const [state, setState] = useState<ParticipationState>(
    isAlreadyParticipated ? 'already_participated' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { celebrationBurst } = useConfetti();

  /**
   * Trigger haptic feedback if available
   */
  const triggerHaptic = useCallback(
    (type: 'light' | 'medium' | 'success' | 'error') => {
      if (!enableHaptics) return;

      if ('vibrate' in navigator) {
        const patterns: Record<typeof type, number[]> = {
          light: [10],
          medium: [20],
          success: [10, 50, 20],
          error: [50, 100, 50],
        };
        navigator.vibrate(patterns[type]);
      }
    },
    [enableHaptics]
  );

  /**
   * Execute participation API call with retry logic (3 attempts, exponential backoff)
   */
  const participate = useCallback(async () => {
    if (state === 'loading' || state === 'already_participated' || state === 'success') {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState('loading');
    setError(null);
    triggerHaptic('light');

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Exponential backoff: 0ms, 1000ms, 2000ms
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }

        const response = await fetch('/api/popup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            popupId,
            referralCode,
          }),
          signal: abortControllerRef.current.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to participate');
        }

        setState('success');
        triggerHaptic('success');

        // Fire confetti on success
        if (enableConfetti) {
          celebrationBurst();
        }

        // Check if goal was reached
        if (result.goalReached) {
          onGoalReached?.();
        }

        onSuccess?.(result);
        return; // Success, exit retry loop
      } catch (err) {
        // Don't update state if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        lastError = err instanceof Error ? err : new Error('Unknown error');

        // If this is not the last attempt, continue retrying
        if (attempt < maxRetries - 1) {
          logger.warn(`Participation attempt ${attempt + 1} failed, retrying...`);
          continue;
        }
      }
    }

    // All retries failed
    if (lastError) {
      const errorMessage = lastError.message;
      setState('error');
      setError(errorMessage);
      triggerHaptic('error');
      onError?.(lastError);
    }
  }, [
    state,
    popupId,
    referralCode,
    triggerHaptic,
    enableConfetti,
    celebrationBurst,
    onSuccess,
    onError,
    onGoalReached,
  ]);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState('idle');
    setError(null);
  }, []);

  return {
    state,
    error,
    participate,
    reset,
    isLoading: state === 'loading',
    hasParticipated: state === 'success' || state === 'already_participated',
  };
}

/**
 * Get display text for participation state
 */
export function getParticipationText(state: ParticipationState): string {
  switch (state) {
    case 'idle':
      return '참여하기';
    case 'loading':
      return '참여 중...';
    case 'success':
      return '참여 완료!';
    case 'already_participated':
      return '참여 완료';
    case 'error':
      return '다시 시도';
  }
}

/**
 * Get button variant for participation state
 */
export function getParticipationVariant(
  state: ParticipationState
): 'primary' | 'success' | 'error' | 'disabled' {
  switch (state) {
    case 'idle':
      return 'primary';
    case 'loading':
      return 'disabled';
    case 'success':
    case 'already_participated':
      return 'success';
    case 'error':
      return 'error';
  }
}

export default useParticipation;
