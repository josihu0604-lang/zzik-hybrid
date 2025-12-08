'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { m, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { OnboardingStep } from './OnboardingStep';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingCTA, OnboardingSkipButton, OnboardingNextButton } from './OnboardingCTA';
import { PainPointIcon, SolutionIcon, ActionIcon } from './AnimatedIcons';
import { colors, gradients } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * OnboardingCarousel - 30초 감성 온보딩 플로우
 *
 * Features:
 * - 풀스크린 모달
 * - 불꽃 테마 애니메이션
 * - 스와이프/탭 네비게이션
 * - 5초 자동 진행
 * - localStorage 플래그 저장
 *
 * 3단계 슬라이드:
 * Step 1 (5초): "좋아하는 브랜드 팝업, 왜 맨날 못 가?" - Pain Point
 * Step 2 (5초): "이제 당신이 결정해요. 참여하면, 열려요." - Solution
 * Step 3 (즉시): 첫 팝업 참여 유도 - Action CTA
 */

const SLIDES = [
  {
    headline: '좋아하는 브랜드 팝업,\n왜 맨날 못 가?',
    subtext: '인기 팝업은 항상 줄이 길고, 정보도 없고...\n원하는 팝업이 열리지도 않죠.',
    emphasis: undefined,
    icon: <PainPointIcon />,
    backgroundType: 'flame' as const,
    autoProgressDuration: 5,
  },
  {
    headline: '이제 당신이 결정해요.\n참여하면, 열려요.',
    subtext: '100명이 모이면 팝업이 확정!\n내가 원하는 브랜드 팝업을 직접 만들어요.',
    emphasis: '"참여하면, 열려요"',
    icon: <SolutionIcon />,
    backgroundType: 'spark' as const,
    autoProgressDuration: 5,
  },
  {
    headline: '지금 바로\n첫 팝업에 참여하세요',
    subtext: '가장 핫한 팝업들이 기다리고 있어요.\n참여하고, 방문하고, 찍음 하세요!',
    emphasis: undefined,
    icon: <ActionIcon />,
    backgroundType: 'success' as const,
    autoProgressDuration: 0, // No auto-progress on last slide
  },
];

const STORAGE_KEY = 'zzik_onboarding_completed';
const SWIPE_THRESHOLD = 70; // 스와이프 임계값 (70px)

interface OnboardingCarouselProps {
  /** 완료 후 리다이렉트 경로 */
  redirectTo?: string;
  /** Skip 버튼 표시 여부 */
  showSkip?: boolean;
  /** 완료 콜백 */
  onComplete?: () => void;
}

export function OnboardingCarousel({
  redirectTo = '/',
  showSkip = true,
  onComplete,
}: OnboardingCarouselProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerProgress, setTimerProgress] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const currentConfig = SLIDES[currentSlide];

  // 온보딩 완료 처리
  const handleComplete = useCallback(() => {
    // localStorage에 완료 상태 저장 (Safari Private 모드 대응)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // localStorage 사용 불가 시 sessionStorage fallback
        try {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch {
          // 스토리지 완전 비활성화 - 쿠키 대체
          document.cookie = `${STORAGE_KEY}=true; path=/; max-age=31536000; SameSite=Lax`;
        }
      }
    }
    onComplete?.();
    router.push(redirectTo);
  }, [onComplete, redirectTo, router]);

  // 다음 슬라이드로 이동
  const goToNext = useCallback(() => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
      setTimerProgress(0);
    }
  }, [isLastSlide, handleComplete]);

  // 이전 슬라이드로 이동
  const goToPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
      setTimerProgress(0);
    }
  }, [currentSlide]);

  // 특정 슬라이드로 이동
  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      setTimerProgress(0);
    },
    [currentSlide]
  );

  // 스와이프 핸들러
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // 왼쪽으로 스와이프 (다음)
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        goToNext();
      }
      // 오른쪽으로 스와이프 (이전)
      else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        goToPrev();
      }
    },
    [goToNext, goToPrev]
  );

  // 자동 진행 타이머
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const duration = currentConfig.autoProgressDuration;

    if (duration === 0) {
      setTimerProgress(0);
      return;
    }

    // 타이머 초기화
    startTimeRef.current = Date.now();
    setTimerProgress(0);

    // 프레임 업데이트 (MOB-015: requestAnimationFrame 사용)
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setTimerProgress(progress);

      if (progress >= 1) {
        goToNext();
      } else {
        timerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    timerRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, [currentSlide, currentConfig.autoProgressDuration, goToNext]);

  // 키보드 네비게이션
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, handleComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: colors.space[950] }}>
      {/* 배경 그라디언트 오버레이 */}
      <m.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background:
            SLIDES[currentSlide].backgroundType === 'flame'
              ? gradients.flameFade
              : SLIDES[currentSlide].backgroundType === 'spark'
                ? gradients.sparkFade
                : gradients.successFade,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      />

      {/* Skip Button (상단 우측) */}
      {showSkip && (
        <div className="absolute top-4 pt-safe right-4 z-20">
          <OnboardingSkipButton onClick={handleComplete} />
        </div>
      )}

      {/* Progress Indicator (상단 좌측) */}
      <div className="absolute top-4 pt-safe left-4 right-20 z-20">
        <OnboardingProgress
          total={SLIDES.length}
          current={currentSlide}
          timerProgress={timerProgress}
          onDotClick={goToSlide}
          variant="bars"
        />
      </div>

      {/* Slides Container */}
      <m.div
        className="relative w-full h-full max-w-lg mx-auto"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNext();
          }
        }}
        tabIndex={0}
        role="region"
        aria-label="온보딩 슬라이드"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {SLIDES.map(
            (slide, index) =>
              index === currentSlide && (
                <OnboardingStep
                  key={index}
                  index={index}
                  headline={slide.headline}
                  subtext={slide.subtext}
                  emphasis={slide.emphasis}
                  icon={slide.icon}
                  backgroundType={slide.backgroundType}
                  isActive={index === currentSlide}
                  direction={direction}
                >
                  {/* Last Slide: CTA Button */}
                  {index === SLIDES.length - 1 && (
                    <OnboardingCTA
                      text="첫 팝업 보러가기"
                      onClick={handleComplete}
                      subtext="지금 가장 핫한 팝업에 참여하세요!"
                    />
                  )}
                </OnboardingStep>
              )
          )}
        </AnimatePresence>
      </m.div>

      {/* Navigation Hint (first slide only, respects reduced motion) */}
      {currentSlide === 0 && !prefersReducedMotion && (
        <m.div
          className="absolute bottom-24 pb-safe left-1/2 -translate-x-1/2 text-xs z-10"
          style={{ color: colors.text.tertiary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
          aria-hidden="true"
        >
          스와이프하여 다음으로
        </m.div>
      )}

      {/* Next Button with Timer (non-last slides) */}
      {!isLastSlide && (
        <div className="absolute bottom-8 pb-safe right-4 z-20">
          <OnboardingNextButton onClick={goToNext} progress={timerProgress} />
        </div>
      )}

      {/* 하단 장식 요소 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${colors.space[950]}80 100%)`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * 온보딩 완료 여부 확인 (다중 스토리지 지원)
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true; // SSR에서는 완료로 간주

  // 1. localStorage 체크
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return true;
  } catch {
    // localStorage 접근 불가
  }

  // 2. sessionStorage fallback
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return true;
  } catch {
    // sessionStorage 접근 불가
  }

  // 3. cookie fallback
  return document.cookie.includes(`${STORAGE_KEY}=true`);
}

/**
 * 온보딩 상태 초기화 (테스트용)
 */
export function resetOnboarding(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default OnboardingCarousel;
