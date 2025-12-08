'use client';

import { useCallback, useEffect } from 'react';

/**
 * useAnalytics - 사용자 행동 분석 훅
 *
 * Features:
 * - 페이지 뷰 추적
 * - 이벤트 추적
 * - 사용자 속성 설정
 * - 전환 추적
 *
 * 추후 Google Analytics, Mixpanel 등 연동 가능
 */

export type EventCategory =
  | 'engagement' // 참여 관련
  | 'navigation' // 페이지 이동
  | 'conversion' // 전환 (참여, 체크인)
  | 'share' // 공유
  | 'error'; // 오류

/**
 * Analytics property value types
 */
export type AnalyticsPropertyValue = string | number | boolean | null | undefined;

/**
 * Analytics properties map
 */
export interface AnalyticsProperties {
  [key: string]: AnalyticsPropertyValue;
}

export interface AnalyticsEvent {
  /** 이벤트 카테고리 */
  category: EventCategory;
  /** 이벤트 액션 */
  action: string;
  /** 이벤트 라벨 */
  label?: string;
  /** 이벤트 값 */
  value?: number;
  /** 추가 속성 */
  properties?: AnalyticsProperties;
}

export interface UseAnalyticsReturn {
  /** 이벤트 추적 */
  trackEvent: (event: AnalyticsEvent) => void;
  /** 페이지 뷰 추적 */
  trackPageView: (pageName: string, properties?: AnalyticsProperties) => void;
  /** 사용자 속성 설정 */
  setUserProperties: (properties: AnalyticsProperties) => void;
  /** 전환 추적 */
  trackConversion: (conversionType: string, value?: number) => void;
}

/**
 * QUA-023: Event logging disabled in production
 *
 * Logs analytics events only in development for debugging.
 * In production, events are sent to analytics service without console logging.
 *
 * Security/Performance Notes:
 * - Prevents sensitive analytics data from appearing in production logs
 * - Reduces console overhead in production
 * - Debug information only visible during development
 */
const logEvent = (type: string, data: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Analytics] ${type}:`, data);
  }
};

// 이벤트 큐 (배치 전송용)
let eventQueue: AnalyticsEvent[] = [];
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 30000; // 30초

// 이벤트 배치 전송
const flushEvents = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];

  try {
    // 추후 실제 분석 서비스로 전송
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify({ events }),
    // });

    logEvent('Batch Sent', { count: events.length });
  } catch (error) {
    // 실패 시 큐에 다시 추가
    eventQueue = [...events, ...eventQueue].slice(0, 100);
    console.error('[Analytics] Failed to send events:', error);
  }
};

// 주기적 배치 전송 설정
if (typeof window !== 'undefined') {
  setInterval(flushEvents, BATCH_INTERVAL);

  // 페이지 언로드 시 전송
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Beacon API로 전송 (비동기, 페이지 닫혀도 완료됨)
      const data = JSON.stringify({ events: eventQueue });
      navigator.sendBeacon('/api/analytics', data);
    }
  });
}

export function useAnalytics(): UseAnalyticsReturn {
  // 이벤트 추적
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    eventQueue.push(enrichedEvent);
    logEvent('Event', enrichedEvent);

    // 배치 사이즈 도달 시 즉시 전송
    if (eventQueue.length >= BATCH_SIZE) {
      flushEvents();
    }
  }, []);

  // 페이지 뷰 추적
  const trackPageView = useCallback(
    (pageName: string, properties?: AnalyticsProperties) => {
      trackEvent({
        category: 'navigation',
        action: 'page_view',
        label: pageName,
        properties: {
          ...properties,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        },
      });
    },
    [trackEvent]
  );

  // 사용자 속성 설정
  const setUserProperties = useCallback((properties: AnalyticsProperties) => {
    // localStorage에 저장 (추후 전송 시 포함)
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('zzik_user_props') || '{}');
      localStorage.setItem('zzik_user_props', JSON.stringify({ ...existing, ...properties }));
    }

    logEvent('User Properties', properties);
  }, []);

  // 전환 추적
  const trackConversion = useCallback(
    (conversionType: string, value?: number) => {
      trackEvent({
        category: 'conversion',
        action: conversionType,
        value,
        properties: {
          conversionType,
          conversionValue: value,
        },
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    setUserProperties,
    trackConversion,
  };
}

/**
 * 미리 정의된 이벤트 헬퍼
 */
export const AnalyticsEvents = {
  // 참여 이벤트
  participate: (popupId: string, popupName: string) => ({
    category: 'conversion' as const,
    action: 'participate',
    label: popupName,
    properties: { popupId, popupName },
  }),

  // 체크인 이벤트
  checkin: (popupId: string, score: number) => ({
    category: 'conversion' as const,
    action: 'checkin',
    value: score,
    properties: { popupId, score },
  }),

  // 공유 이벤트
  share: (method: string, popupId?: string) => ({
    category: 'share' as const,
    action: 'share',
    label: method,
    properties: { method, popupId },
  }),

  // 북마크 이벤트
  bookmark: (popupId: string, action: 'add' | 'remove') => ({
    category: 'engagement' as const,
    action: `bookmark_${action}`,
    properties: { popupId },
  }),

  // 검색 이벤트
  search: (query: string, resultCount: number) => ({
    category: 'engagement' as const,
    action: 'search',
    label: query,
    value: resultCount,
    properties: { query, resultCount },
  }),

  // 필터 이벤트
  filter: (filterType: string, filterValue: string) => ({
    category: 'engagement' as const,
    action: 'filter',
    label: `${filterType}:${filterValue}`,
    properties: { filterType, filterValue },
  }),

  // 오류 이벤트
  error: (errorType: string, errorMessage: string) => ({
    category: 'error' as const,
    action: errorType,
    label: errorMessage,
    properties: { errorType, errorMessage },
  }),
};

/**
 * 페이지 뷰 자동 추적 훅
 */
export function usePageView(pageName: string) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}

export default useAnalytics;
