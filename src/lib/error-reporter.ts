/**
 * Error Reporting System
 *
 * Centralized error reporting for production monitoring
 * Ready for integration with Sentry, LogRocket, or similar services
 *
 * Usage:
 * ```ts
 * import { reportError } from '@/lib/error-reporter';
 *
 * try {
 *   // ...
 * } catch (error) {
 *   reportError(error, { context: 'HomePage', action: 'loadPopups' });
 * }
 * ```
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';
import { ApiException } from './api-client';

interface ErrorContext {
  /** Component or module name */
  context?: string;
  /** User action that triggered the error */
  action?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** User ID (if available) */
  userId?: string;
  /** Error severity */
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorReport {
  message: string;
  name: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  environment: string;
  url: string;
  userAgent: string;
}

/**
 * Report error to monitoring service (Sentry, LogRocket, etc.)
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  // Extract error information
  const errorInfo =
    error instanceof Error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : {
          message: String(error),
          name: 'UnknownError',
          stack: undefined,
        };

  // Build error report
  const report: ErrorReport = {
    ...errorInfo,
    context,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  };

  // Log to console (always)
  logger.error(`[ErrorReporter] ${errorInfo.name}: ${errorInfo.message}`, error, {
    module: context?.context || 'Unknown',
    data: context?.metadata,
  });

  // Send to monitoring service (production only)
  if (process.env.NODE_ENV === 'production') {
    // Map internal severity to Sentry severity levels
    const severityMap: Record<string, 'fatal' | 'error' | 'warning' | 'info'> = {
      critical: 'fatal',
      high: 'error',
      medium: 'warning',
      low: 'info',
    };
    const sentryLevel = severityMap[context?.severity || 'high'] || 'error';

    // Send to Sentry
    try {
      Sentry.captureException(error, {
        tags: {
          context: context?.context || 'unknown',
          action: context?.action || 'unknown',
        },
        level: sentryLevel,
        extra: {
          ...context?.metadata,
          timestamp: report.timestamp,
          url: report.url,
          userAgent: report.userAgent,
        },
        user: context?.userId ? { id: context?.userId } : undefined,
      });
    } catch (sentryError) {
      console.error('[ErrorReporter] Failed to send to Sentry:', sentryError);
    }

    // Also send to our own endpoint (if configured)
    sendToErrorEndpoint(report).catch((sendError) => {
      console.error('[ErrorReporter] Failed to send error report:', sendError);
    });
  }
}

/**
 * Send error report to backend endpoint
 */
async function sendToErrorEndpoint(report: ErrorReport): Promise<void> {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') return;

  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Don't wait for response (fire and forget)
      keepalive: true,
    });
  } catch {
    // Silently fail - don't want error reporting to break the app
  }
}

/**
 * Report API error specifically
 */
export function reportApiError(error: ApiException, context?: ErrorContext): void {
  reportError(error, {
    ...context,
    metadata: {
      ...context?.metadata,
      status: error.status,
      code: error.code,
      isNetworkError: error.isNetworkError,
      isServerError: error.isServerError,
      details: error.details,
    },
  });
}

/**
 * Report critical error (app-breaking)
 */
export function reportCriticalError(error: unknown, context?: ErrorContext): void {
  reportError(error, {
    ...context,
    severity: 'critical',
  });
}

/**
 * Set user context for error reporting
 * Call this after user logs in
 */
export function setErrorReportingUser(userId: string | null): void {
  if (process.env.NODE_ENV === 'production') {
    // Set user in Sentry
    try {
      if (userId) {
        Sentry.setUser({ id: userId });
      } else {
        Sentry.setUser(null);
      }
    } catch (error) {
      console.error('[ErrorReporter] Failed to set user in Sentry:', error);
    }
  }

  // Store in memory for error reports
  if (typeof window !== 'undefined') {
    (window as unknown as { __ZZIK_USER_ID__: string | null }).__ZZIK_USER_ID__ = userId;
  }
}

export default reportError;
