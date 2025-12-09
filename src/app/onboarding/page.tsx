'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingCarousel, hasCompletedOnboarding } from '@/components/onboarding';
import { colors } from '@/lib/design-tokens';

/**
 * Onboarding Page
 *
 * 30초 감성 온보딩 플로우
 *
 * Features:
 * - 첫 방문자만 표시 (localStorage 기반)
 * - 이미 완료한 사용자는 홈으로 자동 리다이렉트
 * - 3단계 슬라이드 (Pain -> Solution -> Action)
 * - 5초 자동 진행, 스와이프/탭 네비게이션
 * - 건너뛰기 버튼
 *
 * localStorage Key: 'zzik_onboarding_completed'
 */

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  // 온보딩 완료 여부 확인
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkOnboardingStatus = () => {
      // 이미 온보딩을 완료한 사용자는 홈으로 리다이렉트
      if (hasCompletedOnboarding()) {
        router.replace('/');
        return;
      }

      // 첫 방문자 - 온보딩 표시
      setShouldShowOnboarding(true);
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [router]);

  // 로딩 중 표시 (깜빡임 방지)
  if (isLoading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: colors.space[950] }}
      >
        <div className="spinner spinner-lg" />
      </main>
    );
  }

  // 온보딩 표시
  if (!shouldShowOnboarding) {
    return null;
  }

  return (
    <main className="min-h-screen" style={{ background: colors.space[950] }}>
      <OnboardingCarousel
        redirectTo="/"
        showSkip={true}
        onComplete={() => {
          // Analytics 이벤트 (프로덕션 환경에서만)
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            // GA4 이벤트 전송 (있을 경우)
            if ('gtag' in window) {
              (window as { gtag?: (type: string, name: string, params: object) => void }).gtag?.(
                'event',
                'onboarding_complete',
                {
                  event_category: 'engagement',
                  event_label: 'onboarding',
                }
              );
            }
          }

          // 개발 환경 로깅
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('[Onboarding] Completed successfully');
          }
        }}
      />
    </main>
  );
}
