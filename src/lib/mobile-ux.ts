/**
 * Mobile UX Utilities
 *
 * DES-105~125: 모바일 UX 개선을 위한 유틸리티
 */

import { CSSProperties } from 'react';

// ============================================================================
// DES-105: Touch Target 일관성 - 48px 최소 터치 영역
// ============================================================================

/**
 * Apple HIG 및 Material Design 권장 최소 터치 영역
 * - Apple HIG: 44pt (약 44px)
 * - Material Design: 48dp (약 48px)
 * - ZZIK 표준: 48px (더 큰 값 채택)
 */
export const TOUCH_TARGET = {
  min: 48, // 최소 터치 영역
  comfortable: 56, // 편안한 터치 영역
  large: 64, // 큰 터치 영역
} as const;

/**
 * 터치 타겟 스타일 생성
 */
export function getTouchTargetStyle(size: keyof typeof TOUCH_TARGET = 'min'): CSSProperties {
  const minSize = TOUCH_TARGET[size];
  return {
    minWidth: `${minSize}px`,
    minHeight: `${minSize}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * 버튼에 터치 타겟 적용
 */
export function getButtonTouchStyle(
  variant: 'icon' | 'text' | 'contained' = 'contained'
): CSSProperties {
  const base = getTouchTargetStyle('min');

  switch (variant) {
    case 'icon':
      return {
        ...base,
        padding: '12px', // 48px - 24px(icon) = 24px padding
        borderRadius: '50%',
      };
    case 'text':
      return {
        ...base,
        padding: '12px 20px',
        borderRadius: '12px',
      };
    case 'contained':
    default:
      return {
        ...base,
        padding: '14px 24px',
        borderRadius: '14px',
      };
  }
}

// ============================================================================
// DES-106: 탭 피드백 추가
// ============================================================================

/**
 * 탭 피드백 효과 (Ripple effect)
 */
export interface TapFeedbackStyle {
  transition: string;
  transform: string;
  opacity: number;
}

export function getTapFeedbackStyle(isPressed: boolean): CSSProperties {
  return {
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isPressed ? 'scale(0.96)' : 'scale(1)',
    opacity: isPressed ? 0.8 : 1,
  };
}

/**
 * Active state 스타일
 */
export function getActiveStyle(isActive: boolean): CSSProperties {
  // Note: ::after pseudo-elements should be handled via CSS classes
  // This function returns base styles; use CSS class for ::after
  return {
    position: 'relative',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };
}

// ============================================================================
// DES-109: 지도 Edge 제스처 충돌 방지
// ============================================================================

/**
 * 스와이프 영역 제한 (지도 등에서 네이티브 제스처와 충돌 방지)
 */
export const SWIPE_SAFE_AREA = {
  left: 20, // 왼쪽 20px는 시스템 제스처 영역
  right: 20,
  top: 44, // 상단 44px는 상태바 + 노치 영역
  bottom: 34, // 하단 34px는 홈 인디케이터 영역
} as const;

/**
 * Safe Area Insets CSS 변수
 */
export function getSafeAreaInsets(): CSSProperties {
  return {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
  };
}

/**
 * 터치 제스처가 Edge에 너무 가까운지 확인
 */
export function isTouchNearEdge(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  return (
    x < SWIPE_SAFE_AREA.left ||
    x > viewportWidth - SWIPE_SAFE_AREA.right ||
    y < SWIPE_SAFE_AREA.top ||
    y > viewportHeight - SWIPE_SAFE_AREA.bottom
  );
}

// ============================================================================
// DES-115: Overscroll 조정
// ============================================================================

/**
 * Overscroll behavior CSS
 */
export function getOverscrollStyle(
  behavior: 'auto' | 'contain' | 'none' = 'contain'
): CSSProperties {
  return {
    overscrollBehavior: behavior,
    WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
  };
}

/**
 * Pull-to-refresh 영역에 대한 overscroll 설정
 */
export function getPullToRefreshStyle(): CSSProperties {
  return {
    overscrollBehaviorY: 'contain',
    WebkitOverflowScrolling: 'touch',
  };
}

// ============================================================================
// DES-117: 수평 스크롤 인디케이터
// ============================================================================

/**
 * 수평 스크롤 가능 여부 확인
 */
export function isHorizontallyScrollable(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth;
}

/**
 * 스크롤 위치 상태
 */
export interface ScrollPosition {
  atStart: boolean;
  atEnd: boolean;
  scrollPercentage: number;
}

/**
 * 현재 스크롤 위치 계산
 */
export function getScrollPosition(element: HTMLElement): ScrollPosition {
  const { scrollLeft, scrollWidth, clientWidth } = element;
  const maxScroll = scrollWidth - clientWidth;

  return {
    atStart: scrollLeft <= 0,
    atEnd: scrollLeft >= maxScroll - 1, // 1px tolerance
    scrollPercentage: maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0,
  };
}

// ============================================================================
// DES-125: 카드 제목 Truncation
// ============================================================================

/**
 * 텍스트 Truncation 스타일
 */
export function getTruncationStyle(lines: number = 1): CSSProperties {
  if (lines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }

  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

/**
 * 반응형 Truncation (viewport 크기에 따라)
 */
export function getResponsiveTruncation(isMobile: boolean): CSSProperties {
  return getTruncationStyle(isMobile ? 2 : 3);
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 모바일 디바이스 감지
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 터치 지원 여부
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * iOS 디바이스 감지
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

/**
 * 안전한 viewport 높이 (iOS 주소창 고려)
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0;

  // iOS에서는 visualViewport 사용
  if (window.visualViewport) {
    return window.visualViewport.height;
  }

  return window.innerHeight;
}
