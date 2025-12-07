'use client';

import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * InstallPrompt - PWA 설치 프롬프트
 *
 * Features:
 * - beforeinstallprompt 이벤트 캡처
 * - iOS Safari 설치 안내
 * - 한 번 거절 시 일정 기간 숨김
 */

const STORAGE_KEY = 'zzik_pwa_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // 플랫폼 감지
  useEffect(() => {
    // iOS 감지
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Standalone 모드 감지 (이미 설치됨)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // 이미 거절한 경우 확인
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS에서는 즉시 표시 (홈 화면 추가 안내)
    if (ios && !standalone) {
      setTimeout(() => setIsVisible(true), 5000); // 5초 후 표시
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 설치 실행
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // 닫기 (일정 기간 숨김)
  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
  }, []);

  // 이미 설치되었거나 표시 조건 미충족
  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto sm:bottom-6"
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(18, 19, 20, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 107, 91, 0.2)',
            boxShadow: '0 -4px 32px rgba(255, 107, 91, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[600]} 100%)`,
                  boxShadow: `0 4px 16px ${colors.flame[500]}40`,
                }}
              >
                <Smartphone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">ZZIK 앱 설치</h3>
                <p className="text-linear-text-secondary text-sm">홈 화면에서 바로 실행하세요</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="닫기"
            >
              <X size={18} className="text-linear-text-tertiary" />
            </button>
          </div>

          {/* Benefits */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-linear-text-secondary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              빠른 실행
            </div>
            <div className="flex items-center gap-1.5 text-linear-text-secondary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              오프라인 지원
            </div>
            <div className="flex items-center gap-1.5 text-linear-text-secondary text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              푸시 알림
            </div>
          </div>

          {/* Install Button */}
          {isIOS ? (
            // iOS: Safari 안내
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Share size={20} style={{ color: colors.flame[500] }} />
              <p className="text-white text-sm">
                <span style={{ color: colors.flame[500] }}>공유</span> 버튼 →{' '}
                <span style={{ color: colors.flame[500] }}>홈 화면에 추가</span>
              </p>
            </div>
          ) : (
            // Android/Desktop: 네이티브 설치
            <m.button
              onClick={handleInstall}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.flame[600]} 100%)`,
                boxShadow: `0 4px 16px ${colors.flame[500]}30`,
              }}
            >
              <Download size={18} />
              설치하기
            </m.button>
          )}
        </div>
      </m.div>
    </AnimatePresence>
  );
}

// ============================================
// Update Available Prompt
// ============================================

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      setRegistration(reg);
      if (reg.waiting) {
        setShowUpdate(true);
      }
    };

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate(reg);
            }
          });
        }
      });

      // Check if there's already a waiting worker
      if (reg.waiting) {
        handleUpdate(reg);
      }
    });

    // Listen for controller change (new SW activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setShowUpdate(false);
  }, []);

  return (
    <AnimatePresence>
      {showUpdate && (
        <m.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="bg-blue-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium">새 버전이 있습니다!</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1 text-sm text-blue-200 hover:text-white transition-colors"
                >
                  나중에
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  업데이트
                </button>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
