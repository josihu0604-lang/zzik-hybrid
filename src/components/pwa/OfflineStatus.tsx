/**
 * Offline Status Banner
 *
 * Shows connection status and sync queue information
 * ZZIK Design System 2.0 - Liquid Glass
 */

'use client';

import { m, AnimatePresence } from '@/lib/motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '@/hooks/use-offline-sync';

export function OfflineStatus() {
  const { status, forceSync } = useOfflineSync();

  // Only show when offline or when there's pending sync
  const shouldShow = !status.isOnline || (status.queueSize > 0 && status.isOnline);

  return (
    <AnimatePresence>
      {shouldShow && (
        <m.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="max-w-screen-sm mx-auto p-4">
            <div
              className="pointer-events-auto rounded-xl border overflow-hidden"
              style={{
                background: status.isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(24px) saturate(180%)',
                borderColor: status.isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {status.isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {status.isOnline ? '온라인' : '오프라인'}
                    </p>
                    {status.queueSize > 0 && (
                      <p className="text-xs text-white/60">
                        {status.isSyncing ? '동기화 중...' : `${status.queueSize}개 대기 중`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sync Button */}
                {status.isOnline && status.queueSize > 0 && !status.isSyncing && (
                  <button
                    onClick={forceSync}
                    className="px-3 py-1.5 rounded-lg font-medium text-xs text-white transition-colors"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {status.isSyncing && (
                <div className="h-1 bg-white/10 overflow-hidden">
                  <m.div
                    className="h-full bg-green-500"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                    }}
                    style={{ width: '50%' }}
                  />
                </div>
              )}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
