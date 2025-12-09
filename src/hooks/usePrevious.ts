'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * usePrevious Hook
 *
 * Returns the previous value of a state or prop.
 * Useful for comparing current and previous values.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * // Show difference
 * const diff = count - (prevCount ?? 0);
 *
 * // Detect direction
 * useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
 *   if (prevCount !== undefined && count > prevCount) {
 *     console.log('Increased!');
 *   }
 * }, [count, prevCount]);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  // Store current value in ref
  const ref = useRef<T | undefined>(undefined);

  // Update ref after render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ref.current = value;
  }, [value]);

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

/**
 * usePreviousDistinct - Only updates when value changes (deep comparison optional)
 *
 * @example
 * ```tsx
 * const prevUser = usePreviousDistinct(user, (a, b) => a?.id === b?.id);
 * ```
 */
export function usePreviousDistinct<T>(
  value: T,
  compare?: (prev: T | undefined, next: T) => boolean
): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const isFirstRef = useRef(true);

  // Memoize comparison function to prevent unnecessary re-renders
  const isEqual = useCallback(
    (a: T | undefined, b: T) => {
      if (compare) return compare(a, b);
      return a === b;
    },
    [compare]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isFirstRef.current) {
      isFirstRef.current = false;
      ref.current = value;
      return;
    }

    if (!isEqual(ref.current, value)) {
      ref.current = value;
    }
  }, [value, isEqual]);

  return ref.current;
}

/**
 * useHasChanged - Returns true if value has changed from previous render
 *
 * @example
 * ```tsx
 * const hasIdChanged = useHasChanged(user.id);
 * if (hasIdChanged) {
 *   refetchData();
 * }
 * ```
 */
export function useHasChanged<T>(value: T): boolean {
  const prevValue = usePrevious(value);
  return prevValue !== undefined && prevValue !== value;
}

export default usePrevious;
