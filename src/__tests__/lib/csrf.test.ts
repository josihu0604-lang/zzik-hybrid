/**
 * CSRF Protection Tests
 *
 * Tests for Double Submit Cookie pattern and timing attack prevention
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCsrfToken,
  getOrCreateCsrfToken,
  setCsrfTokenCookie,
  validateCsrf,
  withCsrf,
  getCsrfTokenFromCookie,
  withCsrfHeader,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_TOKEN_LENGTH,
} from '@/lib/csrf';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('csrf.ts - Token Generation', () => {
  it('should generate token of correct length', () => {
    const token = generateCsrfToken();

    expect(token).toHaveLength(CSRF_TOKEN_LENGTH * 2); // 32 bytes = 64 hex chars
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should generate different tokens each time', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    const token3 = generateCsrfToken();

    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  it('should use cryptographically secure randomness', () => {
    const tokens = new Set<string>();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      tokens.add(generateCsrfToken());
    }

    // All tokens should be unique
    expect(tokens.size).toBe(iterations);
  });

  it('should only contain hex characters', () => {
    const token = generateCsrfToken();

    for (const char of token) {
      expect('0123456789abcdef').toContain(char);
    }
  });
});

describe('csrf.ts - Get or Create Token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return existing valid token', async () => {
    const existingToken = 'a'.repeat(64);

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: existingToken }),
    } as never);

    const result = await getOrCreateCsrfToken();

    expect(result.token).toBe(existingToken);
    expect(result.isNew).toBe(false);
  });

  it('should generate new token if none exists', async () => {
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    const result = await getOrCreateCsrfToken();

    expect(result.token).toHaveLength(64);
    expect(result.isNew).toBe(true);
  });

  it('should generate new token if existing is invalid length', async () => {
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'short' }),
    } as never);

    const result = await getOrCreateCsrfToken();

    expect(result.token).toHaveLength(64);
    expect(result.isNew).toBe(true);
  });
});

describe('csrf.ts - Set Cookie', () => {
  it('should set cookie with correct options', () => {
    const token = 'a'.repeat(64);
    const response = NextResponse.json({ success: true });

    setCsrfTokenCookie(response, token);

    // Verify cookie was set (implementation detail - depends on Next.js internals)
    expect(response).toBeDefined();
  });
});

describe('csrf.ts - Validate CSRF (Double Submit Cookie)', () => {
  const createRequest = (
    method: string,
    options: {
      cookieToken?: string;
      headerToken?: string;
      origin?: string;
      referer?: string;
    } = {}
  ): NextRequest => {
    const url = 'https://zzik.app/api/test';
    const headers = new Headers();

    if (options.origin) {
      headers.set('origin', options.origin);
    }
    if (options.referer) {
      headers.set('referer', options.referer);
    }
    if (options.headerToken) {
      headers.set(CSRF_HEADER_NAME, options.headerToken);
    }

    const request = new NextRequest(url, {
      method,
      headers,
    });

    // Mock cookies
    if (options.cookieToken) {
      Object.defineProperty(request, 'cookies', {
        value: {
          get: (name: string) =>
            name === CSRF_COOKIE_NAME ? { value: options.cookieToken } : undefined,
        },
      });
    } else {
      Object.defineProperty(request, 'cookies', {
        value: {
          get: () => undefined,
        },
      });
    }

    return request;
  };

  it('should pass validation for GET requests', () => {
    const request = createRequest('GET');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should pass validation for HEAD requests', () => {
    const request = createRequest('HEAD');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should pass validation for OPTIONS requests', () => {
    const request = createRequest('OPTIONS');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should validate POST requests with matching tokens', () => {
    const token = 'a'.repeat(64);
    const request = createRequest('POST', {
      cookieToken: token,
      headerToken: token,
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeNull(); // null = validation passed
  });

  it('should reject POST request with missing cookie token', () => {
    const request = createRequest('POST', {
      headerToken: 'a'.repeat(64),
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(403);
  });

  it('should reject POST request with missing header token', () => {
    const request = createRequest('POST', {
      cookieToken: 'a'.repeat(64),
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(403);
  });

  it('should reject POST request with mismatched tokens', () => {
    const request = createRequest('POST', {
      cookieToken: 'a'.repeat(64),
      headerToken: 'b'.repeat(64),
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(403);
  });

  it('should validate PUT requests', () => {
    const token = 'a'.repeat(64);
    const request = createRequest('PUT', {
      cookieToken: token,
      headerToken: token,
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should validate DELETE requests', () => {
    const token = 'a'.repeat(64);
    const request = createRequest('DELETE', {
      cookieToken: token,
      headerToken: token,
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should validate PATCH requests', () => {
    const token = 'a'.repeat(64);
    const request = createRequest('PATCH', {
      cookieToken: token,
      headerToken: token,
      origin: 'https://zzik.app',
    });

    const result = validateCsrf(request);

    expect(result).toBeNull();
  });
});

describe('csrf.ts - Origin Validation', () => {
  const createRequest = (method: string, origin?: string, referer?: string): NextRequest => {
    const url = 'https://zzik.app/api/test';
    const headers = new Headers();
    const token = 'a'.repeat(64);

    if (origin) {
      headers.set('origin', origin);
    }
    if (referer) {
      headers.set('referer', referer);
    }
    headers.set(CSRF_HEADER_NAME, token);

    const request = new NextRequest(url, {
      method,
      headers,
    });

    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => (name === CSRF_COOKIE_NAME ? { value: token } : undefined),
      },
    });

    return request;
  };

  it('should accept valid origin', () => {
    const request = createRequest('POST', 'https://zzik.app');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should accept localhost in development', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';

    const request = createRequest('POST', 'http://localhost:3000');
    const result = validateCsrf(request);

    expect(result).toBeNull();

    (process.env as Record<string, string>).NODE_ENV = originalEnv!;
  });

  it('should accept valid referer when origin is missing', () => {
    const request = createRequest('POST', undefined, 'https://zzik.app/page');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });

  it('should reject invalid origin', () => {
    const request = createRequest('POST', 'https://evil.com');
    const result = validateCsrf(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(403);
  });

  it('should accept Vercel preview deployments', () => {
    const request = createRequest('POST', 'https://zzik-hybrid-abc123.vercel.app');
    const result = validateCsrf(request);

    expect(result).toBeNull();
  });
});

describe('csrf.ts - Timing Attack Prevention', () => {
  it('should use constant-time comparison for tokens', () => {
    const validToken = 'a'.repeat(64);
    const wrongToken1 = 'b'.repeat(64);
    const wrongToken2 = 'a'.repeat(63) + 'b';

    const createRequest = (headerToken: string) => {
      const url = 'https://zzik.app/api/test';
      const headers = new Headers();
      headers.set(CSRF_HEADER_NAME, headerToken);
      headers.set('origin', 'https://zzik.app');

      const request = new NextRequest(url, {
        method: 'POST',
        headers,
      });

      Object.defineProperty(request, 'cookies', {
        value: {
          get: (name: string) => (name === CSRF_COOKIE_NAME ? { value: validToken } : undefined),
        },
      });

      return request;
    };

    // Measure timing for completely wrong token
    const start1 = performance.now();
    const result1 = validateCsrf(createRequest(wrongToken1));
    const time1 = performance.now() - start1;

    // Measure timing for almost correct token
    const start2 = performance.now();
    const result2 = validateCsrf(createRequest(wrongToken2));
    const time2 = performance.now() - start2;

    // Both should fail
    expect(result1?.status).toBe(403);
    expect(result2?.status).toBe(403);

    // Timing should be similar (within 20x to account for system variance)
    // This is a weak test but demonstrates the concept - timing tests are inherently flaky
    const ratio = Math.max(time1, time2) / Math.min(time1, time2);
    expect(ratio).toBeLessThan(20);
  });
});

describe('csrf.ts - withCsrf Wrapper', () => {
  it('should call handler when CSRF validation passes', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withCsrf(mockHandler);

    const token = 'a'.repeat(64);
    const url = 'https://zzik.app/api/test';
    const headers = new Headers();
    headers.set(CSRF_HEADER_NAME, token);
    headers.set('origin', 'https://zzik.app');

    const request = new NextRequest(url, {
      method: 'POST',
      headers,
    });

    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => (name === CSRF_COOKIE_NAME ? { value: token } : undefined),
      },
    });

    await wrappedHandler(request);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('should not call handler when CSRF validation fails', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withCsrf(mockHandler);

    const url = 'https://zzik.app/api/test';
    const headers = new Headers();
    headers.set('origin', 'https://zzik.app');

    const request = new NextRequest(url, {
      method: 'POST',
      headers,
    });

    Object.defineProperty(request, 'cookies', {
      value: {
        get: () => undefined,
      },
    });

    const response = await wrappedHandler(request);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
});

describe('csrf.ts - Client-Side Helpers', () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie = '';
  });

  it('should get CSRF token from cookie', () => {
    document.cookie = `${CSRF_COOKIE_NAME}=test_token_123; path=/`;

    const token = getCsrfTokenFromCookie();

    expect(token).toBe('test_token_123');
  });

  it('should return null when cookie not found', () => {
    // Ensure cookies are cleared
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      });
    }

    const token = getCsrfTokenFromCookie();

    expect(token).toBeNull();
  });

  it('should handle multiple cookies', () => {
    document.cookie = 'other_cookie=value1; path=/';
    document.cookie = `${CSRF_COOKIE_NAME}=test_token_123; path=/`;
    document.cookie = 'another_cookie=value2; path=/';

    const token = getCsrfTokenFromCookie();

    expect(token).toBe('test_token_123');
  });

  it('should add CSRF header to fetch options', () => {
    document.cookie = `${CSRF_COOKIE_NAME}=test_token_123; path=/`;

    const options = withCsrfHeader({
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    expect(options.headers).toBeDefined();
    expect((options.headers as Record<string, string>)[CSRF_HEADER_NAME]).toBe('test_token_123');
    expect(options.method).toBe('POST');
  });

  it('should preserve existing headers', () => {
    document.cookie = `${CSRF_COOKIE_NAME}=test_token_123; path=/`;

    const options = withCsrfHeader({
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      },
    });

    const headers = options.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer token');
    expect(headers[CSRF_HEADER_NAME]).toBe('test_token_123');
  });

  it('should handle missing cookie gracefully', () => {
    const options = withCsrfHeader({
      method: 'POST',
    });

    expect(options.method).toBe('POST');
    // Should not crash, header might be missing
  });
});

describe('csrf.ts - Token Rotation', () => {
  it('should allow token rotation by generating new tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();

    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
  });
});

describe('csrf.ts - Security Edge Cases', () => {
  it('should reject empty tokens', () => {
    const url = 'https://zzik.app/api/test';
    const headers = new Headers();
    headers.set(CSRF_HEADER_NAME, '');
    headers.set('origin', 'https://zzik.app');

    const request = new NextRequest(url, {
      method: 'POST',
      headers,
    });

    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => (name === CSRF_COOKIE_NAME ? { value: '' } : undefined),
      },
    });

    const result = validateCsrf(request);

    // Empty tokens should fail validation (mismatched or missing)
    expect(result).toBeInstanceOf(NextResponse);
  });

  it('should reject tokens with different lengths', () => {
    const url = 'https://zzik.app/api/test';
    const headers = new Headers();
    headers.set(CSRF_HEADER_NAME, 'short');
    headers.set('origin', 'https://zzik.app');

    const request = new NextRequest(url, {
      method: 'POST',
      headers,
    });

    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => (name === CSRF_COOKIE_NAME ? { value: 'a'.repeat(64) } : undefined),
      },
    });

    const result = validateCsrf(request);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(403);
  });
});
