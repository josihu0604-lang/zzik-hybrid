'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react';
import { colors, zIndex } from '@/lib/design-tokens';

/**
 * NetworkStatus - 오프라인/온라인 상태 표시
 *
 * Nielsen's Heuristics #1: Visibility of System Status
 * - 네트워크 상태 변화를 즉시 사용자에게 알림
 * - 오프라인 시 명확한 안내와 복구 옵션 제공
 *
 * WCAG: role="status", aria-live="polite"
 */

// ============================================================================
// useNetworkStatus Hook
// ============================================================================

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (!navigator.onLine === false) {
        setWasOffline(true);
        setLastOnlineTime(new Date());
        // 5초 후 wasOffline 상태 리셋
        setTimeout(() => setWasOffline(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline, lastOnlineTime };
}

// ============================================================================
// NetworkStatus Component
// ============================================================================

interface NetworkStatusProps {
  /** 배너 위치 */
  position?: 'top' | 'bottom';
  /** 닫기 버튼 표시 */
  dismissible?: boolean;
  /** 오프라인 시 콜백 */
  onOffline?: () => void;
  /** 온라인 복구 시 콜백 */
  onOnline?: () => void;
  /** 재시도 핸들러 */
  onRetry?: () => void;
  /** 추가 클래스 */
  className?: string;
}

export function NetworkStatus({
  position = 'top',
  dismissible = false,
  onOffline,
  onOnline,
  onRetry,
  className = '',
}: NetworkStatusProps) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // 오프라인/온라인 콜백
  useEffect(() => {
    if (!isOnline && onOffline) {
      onOffline();
    }
    if (isOnline && wasOffline && onOnline) {
      onOnline();
    }
  }, [isOnline, wasOffline, onOffline, onOnline]);

  // 온라인 복구 시 dismiss 리셋
  useEffect(() => {
    if (isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // 온라인이고 이전에 오프라인이 아니었거나, dismiss된 경우 표시하지 않음
  if ((isOnline && !wasOffline) || isDismissed) {
    return null;
  }

  const positionStyles =
    position === 'top'
      ? { top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0 }
      : { bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))', left: 0, right: 0 };

  return (
    <AnimatePresence>
      {(!isOnline || wasOffline) && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed px-4 py-2 ${className}`}
          style={{
            ...positionStyles,
            zIndex: zIndex.notification,
          }}
          role="status"
          aria-live="polite"
        >
          <div
            className="max-w-md mx-auto rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
            style={{
              background: isOnline
                ? `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
              border: isOnline
                ? `1px solid ${colors.success}40`
                : '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: isOnline ? `${colors.success}20` : 'rgba(239, 68, 68, 0.2)',
              }}
            >
              {isOnline ? (
                <Wifi size={16} style={{ color: colors.success }} aria-hidden="true" />
              ) : (
                <WifiOff size={16} className="text-red-400" aria-hidden="true" />
              )}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {isOnline ? '다시 연결되었습니다' : '오프라인 상태입니다'}
              </p>
              {!isOnline && (
                <p className="text-xs text-white/60 mt-0.5">인터넷 연결을 확인해주세요</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isOnline && onRetry && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                  aria-label="다시 연결 시도"
                >
                  <RefreshCw
                    size={16}
                    className={`text-white ${isRetrying ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                </motion.button>
              )}

              {dismissible && !isOnline && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismiss}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                  aria-label="알림 닫기"
                >
                  <X size={16} className="text-white" aria-hidden="true" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Offline Banner - 전체 화면 오프라인 배너
// ============================================================================

interface OfflineBannerProps {
  /** 저장된 데이터 사용 가능 여부 */
  hasCachedData?: boolean;
  /** 재시도 핸들러 */
  onRetry?: () => void;
  /** 추가 클래스 */
  className?: string;
}

export function OfflineBanner({
  hasCachedData = false,
  onRetry,
  className = '',
}: OfflineBannerProps) {
  const { isOnline } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239, 68, 68, 0.15)' }}
        >
          <WifiOff size={20} className="text-red-400" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">오프라인 모드</h3>
          <p className="text-white/60 text-xs mb-3">
            {hasCachedData
              ? '저장된 데이터를 보고 있습니다. 일부 기능이 제한될 수 있어요.'
              : '인터넷 연결이 필요합니다. 연결 후 다시 시도해주세요.'}
          </p>

          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: colors.text.primary,
              }}
            >
              <RefreshCw
                size={14}
                className={isRetrying ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              {isRetrying ? '연결 중...' : '다시 연결'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default NetworkStatus;
