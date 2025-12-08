'use client';

import { useEffect } from 'react';
import { m } from 'framer-motion';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

/**
 * Global Error Boundary - ZZIK
 *
 * Catches all unhandled errors in the app and displays a user-friendly error page.
 * Follows ZZIK Design System 2.0 with Flame Coral accent.
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Log error to console
    console.error('Global error caught:', error);

    // Report to Sentry (production only)
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: {
          component: 'ErrorBoundary',
          digest: error.digest,
        },
        level: 'error',
        extra: {
          errorMessage: error.message,
          errorDigest: error.digest,
        },
      });
    }

    // SEC-018 FIX: Sanitize error data before sending externally
    // Filter stack traces and remove sensitive information
    if (typeof window !== 'undefined' && window.navigator.onLine) {
      // Sanitize error message - remove potential sensitive data
      const sanitizeMessage = (msg: string): string => {
        if (!msg) return 'Unknown error';

        // Patterns that might contain sensitive info
        const sensitivePatterns = [
          /password[=:]\s*\S+/gi,
          /api[_-]?key[=:]\s*\S+/gi,
          /secret[=:]\s*\S+/gi,
          /token[=:]\s*\S+/gi,
          /bearer\s+\S+/gi,
          /authorization[=:]\s*\S+/gi,
          /cookie[=:]\s*\S+/gi,
          /session[_-]?id[=:]\s*\S+/gi,
          // Email patterns in error messages
          /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          // File paths that might reveal server structure
          /\/home\/\S+/g,
          /\/var\/\S+/g,
          /C:\\Users\\\S+/gi,
        ];

        let sanitized = msg;
        for (const pattern of sensitivePatterns) {
          sanitized = sanitized.replace(pattern, '[REDACTED]');
        }

        // Truncate long messages
        if (sanitized.length > 500) {
          sanitized = sanitized.substring(0, 500) + '...[truncated]';
        }

        return sanitized;
      };

      // Sanitize stack trace - only send first few lines, no full paths
      const sanitizeStack = (stack: string | undefined): string | undefined => {
        if (!stack) return undefined;

        // In production, don't send stack traces at all
        if (process.env.NODE_ENV === 'production') {
          return undefined;
        }

        // In development, limit stack trace depth and sanitize paths
        const lines = stack.split('\n').slice(0, 5);
        return lines
          .map((line) => {
            // Remove absolute file paths
            return line
              .replace(/\/home\/\S+\//g, '.../')
              .replace(/\/var\/\S+\//g, '.../')
              .replace(/C:\\Users\\\S+\\/gi, '...\\');
          })
          .join('\n');
      };

      // Sanitize URL - remove query params that might contain sensitive data
      const sanitizeUrl = (url: string): string => {
        try {
          const parsed = new URL(url);
          // Remove sensitive query params
          const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth', 'session'];
          sensitiveParams.forEach((param) => {
            if (parsed.searchParams.has(param)) {
              parsed.searchParams.set(param, '[REDACTED]');
            }
          });
          return parsed.toString();
        } catch {
          return url;
        }
      };

      // Send sanitized error report
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sanitizeMessage(error.message),
          // Don't send stack in production, sanitize in development
          stack: sanitizeStack(error.stack),
          digest: error.digest,
          url: sanitizeUrl(window.location.href),
          // Don't send full userAgent - just browser family
          userAgent: window.navigator.userAgent.split(' ')[0],
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Fail silently if error logging fails
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <m.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Error Card (DES-198: 에러 바운더리 스타일 개선) */}
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-md w-full p-8 rounded-2xl text-center"
        style={{
          background: 'rgba(18, 19, 20, 0.95)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Glass Highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          }}
        />

        {/* Error Icon */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background:
                'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-white text-2xl font-bold mb-3">문제가 발생했습니다</h1>
        <p className="text-white/60 text-sm mb-6">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {/* Error Details (Dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-white/40 text-xs mb-2 cursor-pointer hover:text-white/60">
              오류 상세 (개발 모드)
            </summary>
            <div
              className="p-3 rounded-lg text-xs font-mono overflow-auto max-h-32"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-red-400 mb-1">{error.message}</p>
              {error.digest && <p className="text-white/40">Error ID: {error.digest}</p>}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={reset}
            aria-label="페이지 다시 로드하기"
          >
            다시 시도
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => (window.location.href = '/')}
            aria-label="홈 페이지로 이동"
          >
            홈으로 돌아가기
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-white/40 text-xs">
          문제가 계속되면{' '}
          <a href="mailto:support@zzik.app" className="text-flame-500 hover:underline">
            고객지원
          </a>
          에 문의해주세요
        </p>
      </m.div>
    </div>
  );
}
