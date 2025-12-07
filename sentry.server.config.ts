/**
 * Sentry Server Configuration
 * Runs on the Node.js server
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Performance monitoring - lower sample rate on server
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',

  // Filter out unnecessary errors
  ignoreErrors: [
    // Database connection timeouts (handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Supabase client errors (handled by our error reporter)
    'AuthRetryableFetchError',
    'AuthSessionMissingError',
  ],

  // Custom error filtering
  beforeSend(event: Sentry.ErrorEvent, _hint: Sentry.EventHint) {
    // Add server-specific context
    event.contexts = {
      ...event.contexts,
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    // Filter sensitive data from request headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }

    return event;
  },

  // Integrations
  integrations: [
    Sentry.httpIntegration(),
    Sentry.nodeContextIntegration(),
    Sentry.requestDataIntegration({
      // Don't include sensitive data
      include: {
        cookies: false,
        data: true,
        headers: true,
        ip: false,
        query_string: true,
        url: true,
      },
    }),
  ],

  // Privacy settings
  sendDefaultPii: false,

  // Maximum breadcrumbs
  maxBreadcrumbs: 100,

  // Attach stack traces
  attachStacktrace: true,

  // Server-specific settings
  debug: false,
});
