/**
 * Sentry Client Configuration
 * Runs in the browser
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out unnecessary errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors that we can't control
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // Capacitor-specific errors (handled separately)
    'Capacitor',
    // User navigation
    'Navigation cancelled',
    'cancelled',
  ],

  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',

  // Custom error filtering
  beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
    // Filter out non-errors
    if (event.level === 'info' || event.level === 'warning') {
      return null;
    }

    // Add custom context
    if (typeof window !== 'undefined') {
      event.contexts = {
        ...event.contexts,
        app: {
          version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
          platform: (window as any).__ZZIK_PLATFORM__ || 'web',
        },
      };
    }

    return event;
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Privacy settings
  sendDefaultPii: false,

  // Maximum breadcrumbs
  maxBreadcrumbs: 50,

  // Attach stack traces
  attachStacktrace: true,
});
