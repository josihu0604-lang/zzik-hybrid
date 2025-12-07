'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/splash';
import { hasCompletedOnboarding } from '@/components/onboarding';

/**
 * AppEntry - 앱 진입점 컴포넌트
 *
 * Flow:
 * 1. 앱 로드 → 스플래시 화면 표시 (2.5초)
 * 2. 스플래시 종료 → 온보딩 완료 여부 체크
 * 3. 온보딩 미완료 → /onboarding으로 리다이렉트
 * 4. 온보딩 완료 → 현재 페이지 표시
 *
 * 스플래시 스킵 조건:
 * - 이미 앱이 로드된 상태 (세션 내 재방문)
 * - /onboarding 페이지 직접 접근
 */

const SESSION_KEY = 'zzik_session_started';
const SKIP_SPLASH_ROUTES = ['/onboarding', '/login', '/auth'];

interface AppEntryProps {
  children: ReactNode;
}

export function AppEntry({ children }: AppEntryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 스플래시 스킵 조건 체크
    const shouldSkipSplash = () => {
      // 1. 이미 세션이 시작된 경우 (새로고침/재방문)
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem(SESSION_KEY)) {
          return true;
        }
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
    }
  }, [pathname]);

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

  // 스플래시 표시 중
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 라우팅 처리 중 (깜빡임 방지)
  if (!isReady && pathname === '/') {
    return null;
  }

  return <>{children}</>;
}

export default AppEntry;
