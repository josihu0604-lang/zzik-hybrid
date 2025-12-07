'use client';

import { useCallback } from 'react';

type HapticPattern = 'tap' | 'success' | 'error' | 'celebration' | 'selection';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: 20,
  error: [30, 20, 30],
  celebration: [20, 50, 20, 50, 20],
  selection: 5,
};

/**
 * Hook for haptic feedback on mobile devices
 *
 * Usage:
 * const { trigger, isSupported } = useHaptic();
 * trigger('success'); // Triggers success haptic pattern
 */
export function useHaptic() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = useCallback(
    (pattern: HapticPattern = 'tap') => {
      if (!isSupported) return false;

      try {
        const vibrationPattern = HAPTIC_PATTERNS[pattern];
        navigator.vibrate(vibrationPattern);
        return true;
      } catch {
        return false;
      }
    },
    [isSupported]
  );

  const tap = useCallback(() => trigger('tap'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);
  const celebrate = useCallback(() => trigger('celebration'), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);

  return {
    isSupported,
    trigger,
    tap,
    success,
    error,
    celebrate,
    selection,
  };
}

export default useHaptic;
