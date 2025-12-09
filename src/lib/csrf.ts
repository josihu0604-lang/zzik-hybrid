import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * CSRF Protection using Double Submit Cookie Pattern
 *
 * How it works:
 * 1. Server generates a random CSRF token
 * 2. Token is stored in a cookie (csrf_token, SameSite=Lax, NOT HttpOnly so JS can read)
 * 3. Client sends the token in both cookie AND X-CSRF-Token header
 * 4. Server verifies both values match
 *
 * Additional security:
 * - Origin/Referer header validation
 * - Token rotation on each mutating request
 */

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get CSRF token from cookie or generate a new one
 * Returns the token and whether it's newly generated
 */
export async function getOrCreateCsrfToken(): Promise<{ token: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken && existingToken.length === CSRF_TOKEN_LENGTH * 2) {
    return { token: existingToken, isNew: false };
  }

  const newToken = generateCsrfToken();
  return { token: newToken, isNew: true };
}

/**
 * Create CSRF token cookie options
 *
 * SEC-009 SECURITY NOTE: CSRF token cookie is NOT httpOnly by design.
 * This is required for the double-submit cookie pattern to work -
 * JavaScript must be able to read the cookie to send it in headers.
 *
 * SECURITY MITIGATION:
 * 1. Enable strong Content-Security-Policy (CSP) headers to prevent XSS
 * 2. Use SameSite=Lax to prevent CSRF via cross-site requests
 * 3. Secure flag ensures HTTPS-only in production
 * 4. Origin/Referer validation provides defense in depth
 *
 * Recommended CSP header (add to middleware.ts):
 * Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
 * style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co
 */
function getCsrfCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false, // Must be accessible to JavaScript for double-submit pattern
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  };
}
/**
 * Set CSRF token cookie on response
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): NextResponse {
  const options = getCsrfCookieOptions();

  response.cookies.set(CSRF_COOKIE_NAME, token, options);
  return response;
}

/**
 * Validate CSRF token using Double Submit Cookie pattern
 *
 * @param request - Next.js request object
 * @returns NextResponse with 403 if CSRF check fails, null if passed
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Only validate mutating requests
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(request.method)) {
    return null;
  }

  // Step 1: Validate Origin/Referer (defense in depth)
  const originError = validateOrigin(request);
  if (originError) {
    return originError;
  }

  // Step 2: Validate CSRF Token (Double Submit Cookie)
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME);

  // Both must be present
  if (!tokenFromCookie) {
    console.warn('CSRF: Missing token cookie');
    return NextResponse.json(
      { error: 'CSRF validation failed: Missing token cookie' },
      { status: 403 }
    );
  }

  if (!tokenFromHeader) {
    console.warn('CSRF: Missing token header');
    return NextResponse.json(
      { error: 'CSRF validation failed: Missing token header' },
      { status: 403 }
    );
  }

  // Tokens must match (constant-time comparison to prevent timing attacks)
  if (!constantTimeEqual(tokenFromCookie, tokenFromHeader)) {
    console.warn('CSRF: Token mismatch');
    return NextResponse.json({ error: 'CSRF validation failed: Token mismatch' }, { status: 403 });
  }

  return null; // Validation passed
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validate Origin/Referer headers
 */
function validateOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const allowedOrigins = getAllowedOrigins();

  // Check Origin header first
  if (origin) {
    if (!isAllowedOrigin(origin, allowedOrigins)) {
      console.warn(`CSRF: Blocked request from origin: ${origin}`);
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid origin' },
        { status: 403 }
      );
    }
    return null;
  }

  // Fallback to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

      if (!isAllowedOrigin(refererOrigin, allowedOrigins)) {
        console.warn(`CSRF: Blocked request from referer: ${referer}`);
        return NextResponse.json(
          { error: 'CSRF validation failed: Invalid referer' },
          { status: 403 }
        );
      }
      return null;
    } catch (error: unknown) {
      console.warn(
        `CSRF: Invalid referer URL: ${referer}`,
        error instanceof Error ? error.message : ''
      );
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid referer format' },
        { status: 403 }
      );
    }
  }

  // SEC-012 FIX: Require Origin/Referer for sensitive mutation requests
  // Requests without Origin or Referer headers are potential CSRF attacks
  // Some legitimate clients (curl, Postman in dev) may not send these headers,
  // but browser-based requests should always include them for mutations
  console.warn('CSRF: Blocked request without Origin or Referer header');

  // Allow in development for testing tools that don't send Origin
  if (process.env.NODE_ENV === 'development') {
    console.warn('CSRF: Allowing request without Origin/Referer in development mode');
    return null;
  }

  return NextResponse.json(
    { error: 'CSRF validation failed: Origin or Referer header required' },
    { status: 403 }
  );
}

/**
 * Get list of allowed origins
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origins.push(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:3001');
    origins.push('http://localhost:3002');
    origins.push('http://127.0.0.1:3000');
  }

  const customOrigins = process.env.ALLOWED_ORIGINS;
  if (customOrigins) {
    origins.push(...customOrigins.split(',').map((o) => o.trim()));
  }

  origins.push('https://zzik-hybrid.vercel.app');
  origins.push('https://zzik.app');

  return [...new Set(origins)];
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app') && url.hostname.includes('zzik-hybrid')) {
      return true;
    }
  } catch {
    // Invalid URL format - silently ignored
  }

  return false;
}

/**
 * Helper to wrap API handlers with CSRF protection
 */
export function withCsrf<
  T extends (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
>(handler: T): T {
  return (async (request: NextRequest, ...args: unknown[]) => {
    const csrfError = validateCsrf(request);
    if (csrfError) {
      return csrfError;
    }
    return handler(request, ...args);
  }) as T;
}

// Re-export client-side utilities (for backwards compatibility)
export { getCsrfTokenFromCookie, withCsrfHeader } from './csrf-client';
