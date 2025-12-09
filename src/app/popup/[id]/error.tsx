'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/Button';
import { Flame, RefreshCw, Home, Search } from 'lucide-react';

/**
 * Popup Detail Error Boundary
 * Handles errors on popup detail page (not found, fetch errors)
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PopupDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: { component: 'PopupDetailErrorBoundary', page: 'popup-detail' },
        level: 'error',
      });
    }
  }, [error]);

  const isNotFound = error.message.includes('not found') || error.message.includes('404');
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

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
          <Flame className="w-8 h-8 text-flame-500" />
        </div>

        <h1 className="text-white text-xl font-bold mb-3">
          {isNotFound
            ? '팝업을 찾을 수 없습니다'
            : isNetworkError
              ? '네트워크 오류'
              : '팝업 정보를 불러올 수 없습니다'}
        </h1>

        <p className="text-white/60 text-sm mb-6">
          {isNotFound
            ? '이 팝업이 종료되었거나 존재하지 않습니다.'
            : isNetworkError
              ? '인터넷 연결을 확인하고 다시 시도해주세요.'
              : '일시적인 오류가 발생했습니다.'}
        </p>

        <div className="flex flex-col gap-3">
          {isNotFound ? (
            <>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                <Search className="w-4 h-4 mr-2" />
                다른 팝업 찾기
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="lg" fullWidth onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
