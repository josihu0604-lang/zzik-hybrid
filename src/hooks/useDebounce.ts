'use client';

import { useState, useEffect } from 'react';

/**
 * useDebounce - 값 변경을 지연시키는 훅
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms), 기본값 300ms
 * @returns 디바운스된 값
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 500);
 *
 * useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
 *   // API 호출은 debouncedQuery가 변경될 때만 실행
 *   if (debouncedQuery) {
 *     fetchSearchResults(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // 지연 후 값 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: 값이 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback - 콜백 함수를 디바운스하는 훅
 *
 * @param callback - 디바운스할 콜백 함수
 * @param delay - 지연 시간 (ms), 기본값 300ms
 * @returns 디바운스된 콜백 함수
 *
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, 500);
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timerRef = { current: undefined as NodeJS.Timeout | undefined };
  const callbackRef = { current: callback };

  // Update callback ref when callback changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    callbackRef.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}

export default useDebounce;
