import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/error-log
 *
 * Client-side error logging endpoint
 * Receives sanitized error reports from the global error boundary
 *
 * SEC-021: Added Zod validation with size limits to prevent:
 * - Log poisoning attacks
 * - DoS via large payloads
 * - Injection attacks
 */

// SEC-021: Strict validation schema with size limits
const ErrorLogSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long (max 500 chars)'),
  stack: z.string().max(2000, 'Stack trace too long').optional(),
  digest: z
    .string()
    .max(64, 'Digest too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid digest format')
    .optional(),
  url: z.string().url('Invalid URL format').max(2048, 'URL too long'),
  userAgent: z.string().max(256, 'User agent too long'),
  timestamp: z.string().datetime('Invalid timestamp format'),
});

// SEC-021: Simple in-memory rate limiter (per IP, max 10 errors per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

export async function POST(request: NextRequest) {
  try {
    // SEC-021: Rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many error reports. Please try again later.' },
        { status: 429 }
      );
    }

    // SEC-021: Check content length before parsing (max 5KB)
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 5120) {
      return NextResponse.json({ error: 'Payload too large (max 5KB)' }, { status: 413 });
    }

    // SEC-021: Parse and validate with Zod
    let validatedPayload;
    try {
      const rawPayload = await request.json();
      validatedPayload = ErrorLogSchema.parse(rawPayload);
    } catch (parseError) {
      if (parseError instanceof z.ZodError) {
        // Don't expose validation details to potential attackers
        return NextResponse.json({ error: 'Invalid error log format' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Log error (in production, send to monitoring service like Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Log]', {
        message: validatedPayload.message,
        digest: validatedPayload.digest,
        url: validatedPayload.url,
        timestamp: validatedPayload.timestamp,
      });
    }

    // TODO: In production, integrate with error monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    // await sendToSentry(validatedPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Error Log API] Failed to process error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
