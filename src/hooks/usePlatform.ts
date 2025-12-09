/**
 * usePlatform Hook
 *
 * Capacitor 플랫폼 감지 및 네이티브 기능 접근 훅
 */

'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface PlatformState {
  /** 로딩 완료 여부 */
  isReady: boolean;
  /** 네이티브 앱 여부 */
  isNative: boolean;
  /** iOS 앱 */
  isIOS: boolean;
  /** Android 앱 */
  isAndroid: boolean;
  /** 웹 브라우저 */
  isWeb: boolean;
  /** PWA 설치 여부 */
  isPWA: boolean;
  /** 모바일 기기 여부 */
  isMobile: boolean;
  /** 플랫폼 이름 */
  platform: 'ios' | 'android' | 'web';
}

/**
 * 플랫폼 감지 훅
 *
 * @example
 * ```tsx
 * const { isNative, isWeb, isMobile } = usePlatform();
 *
 * if (isNative) {
 *   // 네이티브 전용 기능 사용
 * }
 * ```
 */
export function usePlatform(): PlatformState {
  const [state, setState] = useState<PlatformState>({
    isReady: false,
    isNative: false,
    isIOS: false,
    isAndroid: false,
    isWeb: true,
    isPWA: false,
    isMobile: false,
    platform: 'web',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    const isNative = Capacitor.isNativePlatform();

    // PWA 감지
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    const displayMode = window.matchMedia('(display-mode: standalone)').matches;
    const isPWA = Boolean(isStandalone) || displayMode;

    // 모바일 기기 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    );

    setState({
      isReady: true,
      isNative,
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
      isWeb: platform === 'web',
      isPWA,
      isMobile,
      platform,
    });
  }, []);

  return state;
}

/**
 * 네이티브 앱에서만 렌더링할 컴포넌트용 훅
 */
export function useNativeOnly(): boolean {
  const { isReady, isNative } = usePlatform();
  return isReady && isNative;
}

/**
 * 웹 브라우저에서만 렌더링할 컴포넌트용 훅
 */
export function useWebOnly(): boolean {
  const { isReady, isWeb } = usePlatform();
  return isReady && isWeb;
}

export default usePlatform;
