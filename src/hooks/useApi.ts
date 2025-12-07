'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, ApiException, type RequestConfig } from '@/lib/api-client';

/**
 * useApi - Data fetching hook
 *
 * Features:
 * - Loading/error states
 * - Automatic refetch
 * - Manual refetch
 * - Caching support
 * - Optimistic updates
 */

interface UseApiOptions<T> extends RequestConfig {
  /** Whether to fetch immediately */
  immediate?: boolean;
  /** Default data */
  initialData?: T;
  /** Transform response data */
  transform?: (data: T) => T;
  /** On success callback */
  onSuccess?: (data: T) => void;
  /** On error callback */
  onError?: (error: ApiException) => void;
  /** Refetch interval in ms (0 = disabled) */
  refetchInterval?: number;
  /** Refetch on window focus */
  refetchOnFocus?: boolean;
  /** Enable retry on network errors (default: true) */
  retryOnNetworkError?: boolean;
  /** Max retry attempts for network errors (default: 3) */
  maxRetries?: number;
}

interface UseApiReturn<T> {
  /** Response data */
  data: T | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: ApiException | null;
  /** Whether data has been fetched at least once */
  isLoaded: boolean;
  /** Fetch/refetch data */
  fetch: () => Promise<void>;
  /** Manually set data (for optimistic updates) */
  setData: (data: T | ((prev: T | undefined) => T)) => void;
  /** Reset to initial state */
  reset: () => void;
}

export function useApi<T>(path: string, options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const {
    immediate = true,
    initialData,
    transform,
    onSuccess,
    onError,
    refetchInterval = 0,
    refetchOnFocus = false,
    retryOnNetworkError = true,
    maxRetries = 3,
    ...requestConfig
  } = options;

  const [data, setDataState] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<ApiException | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch function with exponential backoff retry
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const executeWithRetry = async (attempt: number = 0): Promise<void> => {
      try {
        const response = await apiClient.request<T>(path, requestConfig);
        let responseData = response.data;

        if (transform) {
          responseData = transform(responseData);
        }

        if (mountedRef.current) {
          setDataState(responseData);
          setIsLoaded(true);
          onSuccess?.(responseData);
        }
      } catch (err) {
        const apiError =
          err instanceof ApiException
            ? err
            : new ApiException({
                message: err instanceof Error ? err.message : 'Unknown error',
                status: 0,
              });

        // Retry logic for network errors
        const shouldRetry = retryOnNetworkError && apiError.isNetworkError && attempt < maxRetries;

        if (shouldRetry) {
          // Exponential backoff: 1s, 2s, 4s, 8s...
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return executeWithRetry(attempt + 1);
        }

        if (mountedRef.current) {
          setError(apiError);
          onError?.(apiError);
        }
      } finally {
        if (mountedRef.current && attempt === 0) {
          // Only set loading false on final attempt
          setIsLoading(false);
        }
      }
    };

    await executeWithRetry();
  }, [path, requestConfig, transform, onSuccess, onError, retryOnNetworkError, maxRetries]);

  // Set data manually (for optimistic updates)
  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (prev: T | undefined) => T)(prev) : updater
    );
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setDataState(initialData);
    setError(null);
    setIsLoaded(false);
    setIsLoading(false);
  }, [initialData]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval > 0) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, fetchData]);

  // Refetch on focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, fetchData]);

  return {
    data,
    isLoading,
    error,
    isLoaded,
    fetch: fetchData,
    setData,
    reset,
  };
}

/**
 * useMutation - Mutation hook for POST/PUT/DELETE
 */

interface UseMutationOptions<T, V> {
  /** On success callback */
  onSuccess?: (data: T, variables: V) => void;
  /** On error callback */
  onError?: (error: ApiException, variables: V) => void;
  /** On settled callback (after success or error) */
  onSettled?: () => void;
}

interface UseMutationReturn<T, V> {
  /** Response data */
  data: T | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: ApiException | null;
  /** Execute mutation */
  mutate: (variables: V) => Promise<T | undefined>;
  /** Reset state */
  reset: () => void;
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);

  const mutate = useCallback(
    async (variables: V): Promise<T | undefined> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        onSuccess?.(result, variables);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiException
            ? err
            : new ApiException({
                message: err instanceof Error ? err.message : 'Unknown error',
                status: 0,
              });
        setError(apiError);
        onError?.(apiError, variables);
        return undefined;
      } finally {
        setIsLoading(false);
        onSettled?.();
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

/**
 * useApiPost - Convenience hook for POST requests
 */
export function useApiPost<T, V>(
  path: string,
  options?: UseMutationOptions<T, V>
): UseMutationReturn<T, V> {
  return useMutation<T, V>(async (data) => {
    const response = await apiClient.post<T>(path, data);
    return response.data;
  }, options);
}

/**
 * useApiPut - Convenience hook for PUT requests
 */
export function useApiPut<T, V>(
  path: string,
  options?: UseMutationOptions<T, V>
): UseMutationReturn<T, V> {
  return useMutation<T, V>(async (data) => {
    const response = await apiClient.put<T>(path, data);
    return response.data;
  }, options);
}

/**
 * useApiDelete - Convenience hook for DELETE requests
 */
export function useApiDelete<T>(
  path: string,
  options?: UseMutationOptions<T, void>
): UseMutationReturn<T, void> {
  return useMutation<T, void>(async () => {
    const response = await apiClient.delete<T>(path);
    return response.data;
  }, options);
}

export default useApi;
