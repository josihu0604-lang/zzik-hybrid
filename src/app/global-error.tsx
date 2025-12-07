'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';

/**
 * Global Error - 500 Page (DES-200)
 *
 * Root error boundary for critical errors
 * Follows ZZIK Design System 2.0
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Critical global error:', error);

    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'GlobalErrorBoundary',
        digest: error.digest,
      },
      level: 'fatal',
      extra: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorDigest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-space-950 flex items-center justify-center p-4">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        {/* Error Card - DES-200: 500 페이지 브랜드 적용 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md w-full p-8 rounded-2xl text-center"
          style={{
            background: 'rgba(18, 19, 20, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Glass Highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            }}
          />

          {/* Error Icon */}
          <div className="relative mb-6">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{
                background:
                  'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.1) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              <svg
                className="w-12 h-12 text-red-400"
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
          <h1 className="text-white text-3xl font-bold mb-3">서버 오류</h1>
          <p className="text-white/70 text-base mb-2">일시적인 서버 오류가 발생했습니다.</p>
          <p className="text-white/50 text-sm mb-8">
            잠시 후 다시 시도해주세요.
            <br />
            문제가 지속되면 고객지원에 문의해주세요.
          </p>

          {/* Error Details (Dev mode) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 text-left">
              <summary className="text-white/40 text-xs mb-2 cursor-pointer hover:text-white/60">
                오류 상세 (개발 모드)
              </summary>
              <div
                className="p-3 rounded-lg text-xs font-mono overflow-auto max-h-40"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p className="text-red-400 mb-1">{error.message}</p>
                {error.digest && <p className="text-white/40">Error ID: {error.digest}</p>}
                {error.stack && (
                  <pre className="text-white/30 text-xs mt-2 overflow-auto">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
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
              aria-label="페이지 새로고침"
            >
              다시 시도
            </Button>

            <Link href="/" className="w-full">
              <Button variant="ghost" size="lg" fullWidth>
                홈으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-white/40 text-xs">
            긴급 문제는{' '}
            <a href="mailto:support@zzik.app" className="text-red-400 hover:underline">
              support@zzik.app
            </a>
            로 문의해주세요
          </p>
        </motion.div>
      </body>
    </html>
  );
}
