import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Get allowed origins for CORS
 */
function getAllowedCorsOrigins(): string[] {
  const origins: string[] = [];

  // Environment-based origins
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origins.push(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:3001');
    origins.push('http://localhost:3002');
    origins.push('http://127.0.0.1:3000');
  }

  // Custom allowed origins from environment variable
  const customOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (customOrigins) {
    origins.push(...customOrigins.split(',').map((o) => o.trim()));
  }

  // Production origins
  origins.push('https://zzik-hybrid.vercel.app');
  origins.push('https://zzik.app');

  return [...new Set(origins)];
}

/**
 * Check if origin is allowed for CORS
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedCorsOrigins();

  // Direct match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow same-origin requests
  if (origin === process.env.NEXT_PUBLIC_SITE_URL) {
    return true;
  }

  // Allow Vercel preview deployments
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.vercel.app') && url.hostname.includes('zzik-hybrid')) {
      return true;
    }
  } catch {
    // Invalid URL format
  }

  return false;
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  // Determine allowed origin
  let allowedOrigin = '*';
  if (origin && isOriginAllowed(origin)) {
    allowedOrigin = origin;
  } else if (!origin) {
    // Same-origin requests don't send Origin header
    allowedOrigin = request.headers.get('referer')
      ? new URL(request.headers.get('referer')!).origin
      : '*';
  }

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) requests
 */
function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(request, response);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }

    // For non-OPTIONS requests, continue processing and add CORS headers to response
    const response = await updateSession(request);
    return addCorsHeaders(request, response);
  }

  // For non-API routes, continue with normal session handling
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
