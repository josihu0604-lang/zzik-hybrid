'use client';

import { useCallback, useEffect, useState } from 'react';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf-client';

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Hook for CSRF protection
 *
 * Provides:
 * - csrfToken: The current CSRF token
 * - fetchWithCsrf: A fetch wrapper that includes CSRF token
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Get token from cookie on mount
    const token = getCsrfTokenFromCookie();
    setCsrfToken(token);
  }, []);

  /**
   * Fetch wrapper that includes CSRF token in headers
   */
  const fetchWithCsrf = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = csrfToken || getCsrfTokenFromCookie();

      if (!token) {
        console.warn('CSRF: No token available');
      }

      const headers = new Headers(options.headers);

      if (token) {
        headers.set(CSRF_HEADER_NAME, token);
      }

      // Ensure JSON content type for POST/PUT/PATCH requests with body
      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important: include cookies
      });
    },
    [csrfToken]
  );

  /**
   * Helper to create headers object with CSRF token
   */
  const getCsrfHeaders = useCallback(
    (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
      const token = csrfToken || getCsrfTokenFromCookie();
      return {
        ...additionalHeaders,
        ...(token ? { [CSRF_HEADER_NAME]: token } : {}),
      };
    },
    [csrfToken]
  );

  return {
    csrfToken,
    fetchWithCsrf,
    getCsrfHeaders,
  };
}

export default useCsrf;
