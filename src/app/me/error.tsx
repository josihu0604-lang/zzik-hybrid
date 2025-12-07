'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';
import { User, RefreshCw, LogIn } from 'lucide-react';

/**
 * My Page Error Boundary
 * Handles errors in user dashboard (auth errors, profile fetch errors)
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MyPageError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: { component: 'MyPageErrorBoundary', page: 'me' },
        level: 'error',
      });
    }
  }, [error]);

  const isAuthError =
    error.message.includes('auth') ||
    error.message.includes('session') ||
    error.message.includes('unauthorized');

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      <div
        className="max-w-md w-full p-8 rounded-2xl text-center"
        style={{
          background: 'rgba(18, 19, 20, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(255, 107, 91, 0.1)' }}
        >
          <User className="w-8 h-8 text-flame-500" />
        </div>

        <h1 className="text-white text-xl font-bold mb-3">
          {isAuthError ? '로그인이 필요합니다' : '프로필을 불러올 수 없습니다'}
        </h1>

        <p className="text-white/60 text-sm mb-6">
          {isAuthError
            ? '세션이 만료되었거나 로그인이 필요합니다.'
            : '일시적인 오류가 발생했습니다. 다시 시도해주세요.'}
        </p>

        <div className="flex flex-col gap-3">
          {isAuthError ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => (window.location.href = '/login')}
            >
              <LogIn className="w-4 h-4 mr-2" />
              로그인하기
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={reset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
