/**
 * Sentry Edge Configuration
 * Runs on Edge Runtime (Middleware, Edge API Routes)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Performance monitoring - minimal on edge
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,

  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',

  // Filter out unnecessary errors
  ignoreErrors: [
    // Edge runtime limitations
    'Dynamic Code Evaluation',
    'TextEncoder',
    'TextDecoder',
  ],

  // Custom error filtering
  beforeSend(event: Sentry.ErrorEvent, _hint: Sentry.EventHint) {
    // Add edge-specific context
    event.contexts = {
      ...event.contexts,
      runtime: {
        type: 'edge',
        region: process.env.VERCEL_REGION || 'unknown',
      },
    };

    // Filter sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }

    return event;
  },

  // Privacy settings
  sendDefaultPii: false,

  // Maximum breadcrumbs - lower for edge
  maxBreadcrumbs: 30,

  // Attach stack traces
  attachStacktrace: true,

  // Edge-specific settings
  debug: false,
});
