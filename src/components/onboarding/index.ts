/**
 * Onboarding Components
 *
 * 30초 감성 온보딩 플로우 컴포넌트
 *
 * Features:
 * - 3단계 슬라이드 (Pain -> Solution -> Action)
 * - 5초 자동 진행 + 스와이프/탭 네비게이션
 * - 불꽃 테마 애니메이션
 * - localStorage 완료 상태 저장
 *
 * Usage:
 * ```tsx
 * import { OnboardingCarousel, hasCompletedOnboarding } from '@/components/onboarding';
 *
 * // 온보딩 완료 여부 확인
 * if (!hasCompletedOnboarding()) {
 *   router.push('/onboarding');
 * }
 *
 * // 온보딩 캐러셀 사용
 * <OnboardingCarousel
 *   redirectTo="/"
 *   showSkip={true}
 *   onComplete={() => console.log('완료!')}
 * />
 * ```
 */

// Main Carousel
export { OnboardingCarousel, hasCompletedOnboarding, resetOnboarding } from './OnboardingCarousel';

// Step Components
export { OnboardingStep } from './OnboardingStep';
export { OnboardingSlide } from './OnboardingSlide';

// Progress Indicators
export { OnboardingProgress, OnboardingProgressBar } from './OnboardingProgress';

// CTA Buttons
export { OnboardingCTA, OnboardingSkipButton, OnboardingNextButton } from './OnboardingCTA';

// Animated Icons
export { PainPointIcon, SolutionIcon, ActionIcon } from './AnimatedIcons';
