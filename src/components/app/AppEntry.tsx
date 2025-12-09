'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/splash';
import { hasCompletedOnboarding } from '@/components/onboarding';

/**
 * AppEntry - 앱 진입점 컴포넌트 (Hydration-Safe)
 *
 * Flow:
 * 1. SSR: 스켈레톤 표시 (Hydration 안전)
 * 2. 클라이언트 마운트 → 스플래시 조건 체크
 * 3. 스플래시 표시 또는 스킵
 * 4. 온보딩 체크 → 적절한 페이지로 이동
 *
 * Hydration 안전 보장:
 * - 초기 상태를 null로 설정하여 SSR과 CSR 일치
 * - useEffect에서만 브라우저 API 접근
 */

const SESSION_KEY = 'zzik_session_started';
const SKIP_SPLASH_ROUTES = ['/onboarding', '/login', '/auth'];

interface AppEntryProps {
  children: ReactNode;
}

export function AppEntry({ children }: AppEntryProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Hydration 안전: 초기값을 null로 설정하여 SSR/CSR 일치
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 감지 - Hydration 이후에만 실행
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트 후 스플래시 조건 체크
  useEffect(() => {
    if (!isMounted) return;

    // 스플래시 스킵 조건 체크
    const shouldSkipSplash = () => {
      // 1. 이미 세션이 시작된 경우 (새로고침/재방문)
      if (sessionStorage.getItem(SESSION_KEY)) {
        return true;
      }

      // 2. 특정 라우트에서는 스플래시 스킵
      if (SKIP_SPLASH_ROUTES.some((route) => pathname?.startsWith(route))) {
        return true;
      }

      return false;
    };

    if (shouldSkipSplash()) {
      setShowSplash(false);
      setIsReady(true);
    } else {
      setShowSplash(true);
    }
  }, [pathname, isMounted]);

  const handleSplashComplete = () => {
    // 세션 시작 마킹
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, 'true');
    }

    setShowSplash(false);

    // 온보딩 체크 (메인 페이지에서만)
    if (pathname === '/' && !hasCompletedOnboarding()) {
      router.replace('/onboarding');
    } else {
      setIsReady(true);
    }
  };

  // Hydration 안전: 마운트 전 또는 스플래시 결정 전에는 스켈레톤 표시
  if (!isMounted || showSplash === null) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-space-800" />
          <div className="h-4 w-24 bg-space-800 rounded" />
        </div>
      </div>
    );
  }

  // 스플래시 표시 중
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 라우팅 처리 중 (깜빡임 방지)
  if (!isReady && pathname === '/') {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-space-800" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AppEntry;
