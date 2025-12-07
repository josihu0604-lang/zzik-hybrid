'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, Signal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { m, AnimatePresence } from '@/lib/motion';
import { onNetworkChange, isOnline as checkOnline } from '@/lib/offline';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    setIsOnline(checkOnline());
    const cleanup = onNetworkChange((online) => {
      setIsOnline(online);
      if (online) {
        setShowReconnected(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    });
    return cleanup;
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
      if (response.ok) {
        setIsOnline(true);
        setShowReconnected(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch {
      /* Still offline */
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showReconnected ? (
          <m.div
            key="reconnected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34, 197, 94, 0.15)' }}
            >
              <Signal className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-white text-xl font-bold mb-2">연결되었습니다!</h1>
            <p className="text-white/60 text-sm">홈으로 이동합니다...</p>
          </m.div>
        ) : (
          <m.div
            key="offline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full p-8 rounded-2xl text-center"
            style={{
              background: 'rgba(18, 19, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255, 107, 91, 0.1)' }}
            >
              <WifiOff className="w-10 h-10 text-flame-500" />
            </div>
            <h1 className="text-white text-2xl font-bold mb-3">오프라인 상태입니다</h1>
            <p className="text-white/60 text-sm mb-2">인터넷 연결이 끊어졌습니다.</p>
            <p className="text-white/40 text-xs mb-8">
              Wi-Fi 또는 모바일 데이터 연결을 확인해주세요.
            </p>
            <div
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-6"
              style={{
                background: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 107, 91, 0.1)',
              }}
            >
              <div
                className={
                  isOnline
                    ? 'w-2 h-2 rounded-full bg-green-500'
                    : 'w-2 h-2 rounded-full bg-flame-500 animate-pulse'
                }
              />
              <span className={isOnline ? 'text-sm text-green-500' : 'text-sm text-flame-500'}>
                {isOnline ? '온라인' : '오프라인'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRetry}
                disabled={isChecking}
              >
                <RefreshCw className={isChecking ? 'w-4 h-4 mr-2 animate-spin' : 'w-4 h-4 mr-2'} />
                {isChecking ? '확인 중...' : '다시 연결'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => (window.location.href = '/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 (캐시된 페이지)
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
