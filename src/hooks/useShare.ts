'use client';

import { useState, useCallback } from 'react';

/**
 * useShare - Web Share API Hook
 *
 * Web Share API 지원 시 네이티브 공유, 미지원 시 클립보드 복사
 */

export interface ShareData {
  /** 공유 제목 */
  title: string;
  /** 공유 설명 */
  text?: string;
  /** 공유 URL */
  url: string;
  /** 리더 레퍼럴 코드 (옵션) */
  referralCode?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'kakao' | 'twitter';
  error?: string;
}

export interface UseShareReturn {
  /** Web Share API 지원 여부 */
  canShare: boolean;
  /** 공유 진행 중 */
  isSharing: boolean;
  /** 마지막 공유 결과 */
  lastResult: ShareResult | null;
  /** 네이티브 공유 실행 */
  share: (data: ShareData) => Promise<ShareResult>;
  /** 클립보드에 URL 복사 */
  copyToClipboard: (url: string) => Promise<ShareResult>;
  /** 카카오톡 공유 */
  shareToKakao: (data: ShareData) => Promise<ShareResult>;
  /** 트위터/X 공유 */
  shareToTwitter: (data: ShareData) => void;
  /** 레퍼럴 URL 생성 */
  buildReferralUrl: (baseUrl: string, referralCode?: string) => string;
}

/**
 * 레퍼럴 코드 포함 URL 생성
 */
function buildReferralUrl(baseUrl: string, referralCode?: string): string {
  const url = new URL(
    baseUrl,
    typeof window !== 'undefined' ? window.location.origin : 'https://zzik.app'
  );

  if (referralCode) {
    url.searchParams.set('ref', referralCode);
  }

  // UTM 파라미터 추가
  url.searchParams.set('utm_source', 'share');
  url.searchParams.set('utm_medium', 'social');

  return url.toString();
}

export function useShare(): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  // Web Share API 지원 확인
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  /**
   * 클립보드 복사
   */
  const copyToClipboard = useCallback(async (url: string): Promise<ShareResult> => {
    setIsSharing(true);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // 폴백: 레거시 방식
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      const result: ShareResult = { success: true, method: 'clipboard' };
      setLastResult(result);
      return result;
    } catch (error) {
      const result: ShareResult = {
        success: false,
        method: 'clipboard',
        error: error instanceof Error ? error.message : '복사 실패',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * 네이티브 공유 (Web Share API)
   */
  const share = useCallback(
    async (data: ShareData): Promise<ShareResult> => {
      setIsSharing(true);

      const shareUrl = buildReferralUrl(data.url, data.referralCode);

      try {
        if (canShare) {
          await navigator.share({
            title: data.title,
            text: data.text,
            url: shareUrl,
          });

          const result: ShareResult = { success: true, method: 'native' };
          setLastResult(result);
          return result;
        } else {
          // 폴백: 클립보드 복사
          return copyToClipboard(shareUrl);
        }
      } catch (error) {
        // 사용자가 공유 취소한 경우
        if (error instanceof Error && error.name === 'AbortError') {
          const result: ShareResult = { success: false, method: 'native', error: 'cancelled' };
          setLastResult(result);
          return result;
        }

        const result: ShareResult = {
          success: false,
          method: 'native',
          error: error instanceof Error ? error.message : '공유 실패',
        };
        setLastResult(result);
        return result;
      } finally {
        setIsSharing(false);
      }
    },
    [canShare, copyToClipboard]
  );

  /**
   * 카카오톡 공유
   */
  const shareToKakao = useCallback(
    async (data: ShareData): Promise<ShareResult> => {
      setIsSharing(true);

      const shareUrl = buildReferralUrl(data.url, data.referralCode);

      try {
        // Kakao SDK 확인
        if (typeof window !== 'undefined' && window.Kakao) {
          if (!window.Kakao.isInitialized()) {
            // Kakao SDK 초기화 필요
            const result: ShareResult = {
              success: false,
              method: 'kakao',
              error: 'Kakao SDK not initialized',
            };
            setLastResult(result);
            return result;
          }

          if (!window.Kakao.Share) {
            // Kakao Share API 미사용
            const result: ShareResult = {
              success: false,
              method: 'kakao',
              error: 'Kakao Share API not available',
            };
            setLastResult(result);
            return result;
          }

          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: data.title,
              description: data.text || '',
              imageUrl: 'https://zzik.app/og-image.png', // 기본 OG 이미지
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            buttons: [
              {
                title: '참여하기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          });

          const result: ShareResult = { success: true, method: 'kakao' };
          setLastResult(result);
          return result;
        } else {
          // 폴백: 클립보드
          return copyToClipboard(shareUrl);
        }
      } catch (error) {
        const result: ShareResult = {
          success: false,
          method: 'kakao',
          error: error instanceof Error ? error.message : '카카오톡 공유 실패',
        };
        setLastResult(result);
        return result;
      } finally {
        setIsSharing(false);
      }
    },
    [copyToClipboard]
  );

  /**
   * 트위터/X 공유 (새 창 열기)
   */
  const shareToTwitter = useCallback((data: ShareData): void => {
    const shareUrl = buildReferralUrl(data.url, data.referralCode);
    const tweetText = encodeURIComponent(`${data.title}\n\n${data.text || ''}`);
    const tweetUrl = encodeURIComponent(shareUrl);

    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');

    setLastResult({ success: true, method: 'twitter' });
  }, []);

  return {
    canShare,
    isSharing,
    lastResult,
    share,
    copyToClipboard,
    shareToKakao,
    shareToTwitter,
    buildReferralUrl,
  };
}

// Kakao SDK 타입 선언
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (appKey: string) => void;
      Share?: {
        sendDefault: (settings: KakaoShareSettings) => void;
      };
    };
  }
}

interface KakaoShareSettings {
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
  content: {
    title: string;
    description?: string;
    imageUrl?: string;
    link: {
      mobileWebUrl?: string;
      webUrl?: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl?: string;
      webUrl?: string;
    };
  }>;
}

export default useShare;
