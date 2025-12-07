/**
 * CSRF Client-Side Utilities
 *
 * 클라이언트에서 사용하는 CSRF 관련 함수들
 */

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_TOKEN_LENGTH = 32;

/**
 * Client-side helper to get CSRF token from cookie
 * Use this in your fetch calls
 */
export function getCsrfTokenFromCookie(): string | null {
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
 * Client-side helper to add CSRF token to fetch options
 */
export function withCsrfHeader(options: RequestInit = {}): RequestInit {
  const token = getCsrfTokenFromCookie();
  if (!token) {
    console.warn('CSRF: No token found in cookie');
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    },
  };
}
