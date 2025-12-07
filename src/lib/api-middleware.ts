/**
 * API Middleware - Unified security layer for all API routes
 *
 * Features:
 * - Authentication (Supabase session validation)
 * - CSRF protection (double-submit cookie pattern)
 * - Rate limiting (IP-based with presets)
 * - Input validation (Zod schemas)
 * - Error handling (consistent responses)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateCsrf } from '@/lib/csrf';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export interface ApiContext {
  userId?: string;
  userEmail?: string;
  isAuthenticated: boolean;
  ip: string;
}

export interface MiddlewareOptions {
  /** Require authentication (default: false for GET, true for mutations) */
  requireAuth?: boolean;
  /** Enable CSRF protection (default: true for mutations) */
  csrf?: boolean;
  /** Rate limit preset (default: 'normal') */
  rateLimit?: 'strict' | 'normal' | 'relaxed' | false;
  /** Zod schema for request body validation */
  bodySchema?: z.ZodType;
  /** Zod schema for query params validation */
  querySchema?: z.ZodType;
  /** Allow guest users (create temporary session) */
  allowGuest?: boolean;
}

type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: ApiContext,
  validatedData?: T
) => Promise<NextResponse>;

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export function apiError(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// ============================================================================
// REDIRECT VALIDATION
// ============================================================================

/**
 * Validate redirect URL to prevent open redirect attacks
 * Only allows relative paths starting with /
 */
export function validateRedirectUrl(url: string | null, fallback: string = '/'): string {
  if (!url) return fallback;

  // Must start with single slash, not double slash
  if (!url.startsWith('/') || url.startsWith('//')) {
    return fallback;
  }

  // Check for protocol-relative URLs disguised
  try {
    const parsed = new URL(url, 'http://localhost');
    if (parsed.host !== 'localhost') {
      return fallback;
    }
  } catch {
    return fallback;
  }

  // Block common redirect attack patterns
  const dangerousPatterns = [
    /^\/\\/i, // \/
    /^\/[^/]*:/i, // /evil:
    /%2f/i, // encoded /
    /%5c/i, // encoded \
    /javascript:/i, // javascript:
    /data:/i, // data:
    /vbscript:/i, // vbscript:
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) {
      return fallback;
    }
  }

  return url;
}

// ============================================================================
// SECURE GUEST ID GENERATION
// ============================================================================

/**
 * SEC-003 FIX: Generate secure, unpredictable guest user ID
 *
 * Uses crypto.randomUUID() instead of IP + timestamp which was predictable
 * and could allow session hijacking or enumeration attacks.
 */
function generateSecureGuestId(): string {
  // Use cryptographically secure random UUID
  return `guest_${crypto.randomUUID()}`;
}

// ============================================================================
// MIDDLEWARE WRAPPER
// ============================================================================

/**
 * Wrap an API handler with security middleware
 *
 * @example
 * export const POST = withMiddleware(
 *   async (request, context, data) => {
 *     // data is validated PopupParticipation
 *     return apiSuccess({ message: 'Participated!' });
 *   },
 *   {
 *     requireAuth: true,
 *     csrf: true,
 *     rateLimit: 'strict',
 *     bodySchema: PopupParticipationSchema,
 *   }
 * );
 */
export function withMiddleware<T = unknown>(
  handler: ApiHandler<T>,
  options: MiddlewareOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = getClientIP(request);
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);

    // Determine defaults based on method
    const requireAuth = options.requireAuth ?? isMutation;
    const enableCsrf = options.csrf ?? isMutation;
    const rateLimitPreset = options.rateLimit ?? 'normal';

    // ========================================
    // 1. Rate Limiting
    // ========================================
    if (rateLimitPreset !== false) {
      const limit = RATE_LIMITS[rateLimitPreset];
      const result = checkRateLimit(ip, limit.limit, limit.windowMs);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(result.resetIn / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(result.resetIn / 1000)),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Date.now() + result.resetIn),
            },
          }
        );
      }
    }

    // ========================================
    // 2. CSRF Protection (for mutations)
    // ========================================
    if (enableCsrf && isMutation) {
      const csrfError = validateCsrf(request);
      if (csrfError) {
        return csrfError;
      }
    }

    // ========================================
    // 3. Authentication
    // ========================================
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        userId = user.id;
        userEmail = user.email;
      }
    } catch {
      // Auth service unavailable - allow if not required
      if (requireAuth) {
        return apiError('Authentication service unavailable', 503);
      }
    }

    if (requireAuth && !userId) {
      if (options.allowGuest) {
        // Generate guest ID for tracking
        userId = generateSecureGuestId();
      } else {
        return apiError('Authentication required', 401);
      }
    }

    // ========================================
    // 4. Input Validation
    // ========================================
    let validatedData: T | undefined;

    // Query params validation
    if (options.querySchema) {
      try {
        const params = Object.fromEntries(new URL(request.url).searchParams);
        validatedData = options.querySchema.parse(params) as T;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return apiError('Invalid query parameters', 400, {
            validation: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
        }
        return apiError('Invalid query parameters', 400);
      }
    }

    // Body validation (for mutations)
    if (options.bodySchema && isMutation) {
      try {
        const body = await request.json();
        validatedData = options.bodySchema.parse(body) as T;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return apiError('Invalid request body', 400, {
            validation: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          });
        }
        if (error instanceof SyntaxError) {
          return apiError('Invalid JSON in request body', 400);
        }
        return apiError('Invalid request body', 400);
      }
    }

    // ========================================
    // 5. Execute Handler
    // ========================================
    const context: ApiContext = {
      userId,
      userEmail,
      isAuthenticated: !!userId && !userId.startsWith('guest_'),
      ip,
    };

    try {
      return await handler(request, context, validatedData);
    } catch (error) {
      console.error('API Handler Error:', error);

      // SEC-011 FIX: Enhanced error message sanitization
      // Don't expose internal errors in production
      // In development, sanitize sensitive patterns from error messages
      let message = 'Internal server error';

      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        // Sanitize sensitive information from error messages even in dev
        const sensitivePatterns = [
          /password[=:]\s*\S+/gi,
          /api[_-]?key[=:]\s*\S+/gi,
          /secret[=:]\s*\S+/gi,
          /token[=:]\s*\S+/gi,
          /authorization[=:]\s*\S+/gi,
          /bearer\s+\S+/gi,
        ];

        message = error.message;
        for (const pattern of sensitivePatterns) {
          message = message.replace(pattern, '[REDACTED]');
        }
      }

      return apiError(message, 500);
    }
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const PopupParticipationSchema = z.object({
  popupId: z.string().uuid('Invalid popup ID format'),
  referralCode: z.string().optional(),
});

export const PopupQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['funding', 'confirmed', 'completed', 'cancelled']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type PopupParticipation = z.infer<typeof PopupParticipationSchema>;
export type PopupQuery = z.infer<typeof PopupQuerySchema>;
