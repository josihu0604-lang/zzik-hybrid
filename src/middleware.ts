import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimitAsync, getClientIP } from '@/lib/rate-limiter';

function generateTraceId(): string {
  return crypto.randomUUID();
}

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

// ... existing helper functions ...

/**
 * Handle CORS preflight (OPTIONS) requests
 */
function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(request, response);
}

/**
 * Add strict security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  const headers = response.headers;
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enforce HTTPS (HSTS) - 1 year
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Control browser features (PWA optimized)
  headers.set(
    'Permissions-Policy',
    'camera=*, geolocation=*, microphone=(), payment=*, usb=()'
  );
  
  // DNS Prefetch control
  headers.set('X-DNS-Prefetch-Control', 'off');
}

// NOTE: updateSession must be called carefully.
// We are re-implementing middleware logic to inject headers cleanly.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Generate Trace ID
  const traceId = generateTraceId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-trace-id', traceId);

  // 2. Handle CORS & Session
  if (pathname.startsWith('/api/')) {
    // Global API Rate Limiter (Safety Net: 200 req/min)
    if (request.method !== 'OPTIONS') {
      const ip = getClientIP(request);
      // Use relaxed limit for global safety net, individual routes have stricter limits
      const limitResult = await checkRateLimitAsync(ip, 200, 60000); 
      
      if (!limitResult.success) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Too many requests' }), 
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(limitResult.resetIn / 1000))
            } 
          }
        );
      }
    }

    if (request.method === 'OPTIONS') {
      const res = handleCorsPreflightRequest(request);
      res.headers.set('x-trace-id', traceId);
      addSecurityHeaders(res);
      return res;
    }

    // Update Session passes request through
    const res = await updateSession(new NextRequest(request, { headers: requestHeaders }));
    const finalRes = addCorsHeaders(request, res);
    finalRes.headers.set('x-trace-id', traceId);
    addSecurityHeaders(finalRes);
    return finalRes;
  }

  // Non-API routes
  const res = await updateSession(new NextRequest(request, { headers: requestHeaders }));
  res.headers.set('x-trace-id', traceId);
  addSecurityHeaders(res);
  
  return res;
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
