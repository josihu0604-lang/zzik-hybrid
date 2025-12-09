/**
 * POST /api/analytics
 *
 * Analytics event collection endpoint
 * Receives batched analytics events from the client
 *
 * SEC-020: Added Zod validation with size limits
 * SEC-026: Added Rate Limiting via withMiddleware
 */

import { NextResponse } from 'next/server';
import { withMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// SEC-020: Zod validation schema with limits to prevent DoS
const AnalyticsEventSchema = z.object({
  category: z.enum(['engagement', 'navigation', 'conversion', 'share', 'error']),
  action: z.string().min(1).max(100, 'Action too long'),
  label: z.string().max(200, 'Label too long').optional(),
  value: z.number().int().min(0).max(1000000).optional(),
  // SEC-026: Limit properties depth and count
  properties: z
    .record(z.string().max(50), z.union([z.string().max(500), z.number(), z.boolean(), z.null()]))
    .refine((obj) => Object.keys(obj).length <= 20, {
      message: 'Too many properties (max 20)',
    })
    .optional(),
  timestamp: z.string().datetime().optional(),
  url: z.string().url().max(2048).optional(),
  // SEC-026: Consider privacy - hash userAgent instead of storing raw
  userAgent: z.string().max(500).optional(),
});

const AnalyticsPayloadSchema = z.object({
  // Max 100 events per batch to prevent DoS
  events: z
    .array(AnalyticsEventSchema)
    .min(1, 'At least one event required')
    .max(100, 'Too many events (max 100)'),
});

// SEC-026: Rate limiting configuration
// 60 requests/min should be enough for batched analytics
const RATE_LIMIT_PRESET = 'normal' as const;

export const POST = withMiddleware(
  async (request, _context) => {
    // Handle both JSON and Beacon API requests
    const contentType = request.headers.get('content-type');
    let rawPayload: unknown;

    try {
      if (contentType?.includes('application/json')) {
        rawPayload = await request.json();
      } else {
        // Beacon API sends as text
        const text = await request.text();
        // SEC-020: Limit text size before parsing
        if (text.length > 100000) {
          // 100KB max
          return apiError('Payload too large', 413);
        }
        rawPayload = JSON.parse(text);
      }
    } catch {
      return apiError('Invalid JSON', 400);
    }

    // SEC-020: Validate with Zod schema
    const parseResult = AnalyticsPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return apiError('Validation failed', 400, {
        details: parseResult.error.issues.slice(0, 5).map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    const payload = parseResult.data;

    // Log events in development
    logger.info('[Analytics] Received events', {
      data: { count: payload.events.length },
    });

    // TODO: In production, forward to analytics service
    // Examples:
    // - Google Analytics (Measurement Protocol)
    // - Mixpanel
    // - Amplitude
    // - Custom data warehouse

    return apiSuccess({
      received: payload.events.length,
    });
  },
  {
    // SEC-026: No auth required for analytics (public endpoint)
    requireAuth: false,
    // SEC-026: Rate limiting to prevent DoS
    rateLimit: RATE_LIMIT_PRESET,
    // SEC-026: Disable CSRF for Beacon API compatibility
    csrf: false,
  }
);

// Also support GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'analytics',
  });
}
