'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';
import { Search, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SearchError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: { component: 'SearchErrorBoundary', page: 'search' },
        level: 'error',
      });
    }
  }, [error]);

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
          <Search className="w-8 h-8 text-flame-500" />
        </div>

        <h1 className="text-white text-xl font-bold mb-3">검색에 문제가 발생했습니다</h1>

        <p className="text-white/60 text-sm mb-6">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" fullWidth onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={() => (window.location.href = '/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
