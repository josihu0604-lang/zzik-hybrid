/**
 * ZZIK Platform Detection Utilities
 *
 * 웹 브라우저 vs Capacitor 네이티브 앱 감지
 */

'use client';

import { Capacitor } from '@capacitor/core';

/**
 * 현재 플랫폼 정보
 */
export interface PlatformInfo {
  /** 네이티브 앱 여부 */
  isNative: boolean;
  /** iOS 앱 */
  isIOS: boolean;
  /** Android 앱 */
  isAndroid: boolean;
  /** 웹 브라우저 */
  isWeb: boolean;
  /** 플랫폼 이름 */
  platform: 'ios' | 'android' | 'web';
}

/**
 * 현재 플랫폼 감지
 */
export function getPlatform(): PlatformInfo {
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  const isNative = Capacitor.isNativePlatform();

  return {
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    platform,
  };
}

/**
 * 네이티브 앱에서 실행 중인지 확인
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * 웹 브라우저에서 실행 중인지 확인
 */
export function isWebBrowser(): boolean {
  return !Capacitor.isNativePlatform();
}

/**
 * iOS에서 실행 중인지 확인
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Android에서 실행 중인지 확인
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * PWA로 설치되어 실행 중인지 확인
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;

  // iOS Safari standalone mode
  const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;

  // PWA display-mode
  const displayMode = window.matchMedia('(display-mode: standalone)').matches;

  return Boolean(isStandalone) || displayMode;
}

/**
 * 모바일 기기인지 확인 (웹 브라우저 기준)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

/**
 * 앱 스토어 링크 가져오기
 */
export function getAppStoreLinks() {
  return {
    ios: 'https://apps.apple.com/app/zzik/id123456789', // TODO: 실제 앱 ID로 변경
    android: 'https://play.google.com/store/apps/details?id=kr.zzik.app',
  };
}

/**
 * 현재 플랫폼에 맞는 앱 스토어 링크 반환
 */
export function getAppStoreLink(): string | null {
  if (typeof window === 'undefined') return null;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const links = getAppStoreLinks();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return links.ios;
  }
  if (/android/.test(userAgent)) {
    return links.android;
  }

  return null;
}
