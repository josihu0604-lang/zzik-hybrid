'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Share2, Copy, MessageCircle, Link2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { colors } from '@/lib/design-tokens';
import { logger } from '@/lib/logger';

/**
 * ShareButton - 공유 버튼 컴포넌트
 *
 * Features:
 * - 클립보드 복사
 * - Web Share API (모바일)
 * - 카카오톡 공유 (optional)
 * - 리퍼럴 코드 자동 포함
 */

// Type definition for Kakao SDK Share functionality (local to this component)
interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoShareContent {
  title: string;
  description: string;
  imageUrl: string;
  link: KakaoShareLink;
}

interface KakaoShareButton {
  title: string;
  link: KakaoShareLink;
}

interface KakaoShareOptions {
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
  content: KakaoShareContent;
  buttons?: KakaoShareButton[];
}

interface KakaoShareSDK {
  Share?: {
    sendDefault: (options: KakaoShareOptions) => void;
  };
}

interface ShareButtonProps {
  popupId: string;
  brandName: string;
  title: string;
  referralCode?: string;
  variant?: 'button' | 'icon';
  className?: string;
}

export function ShareButton({
  popupId,
  brandName,
  title,
  referralCode,
  variant = 'button',
  className = '',
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  // Generate share URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zzik.kr';
  const shareUrl = referralCode
    ? `${baseUrl}/popup/${popupId}?ref=${referralCode}`
    : `${baseUrl}/popup/${popupId}`;

  const shareText = `[${brandName}] ${title} - 지금 참여하고 팝업 오픈에 함께하세요!`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 복사되었습니다!');
      setShowModal(false);
    } catch {
      // Fallback for older browsers - clipboard API not available
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('링크가 복사되었습니다!');
      setShowModal(false);
    }
  };

  // DES-045: Native Share API 개선
  const handleNativeShare = async () => {
    // Check if Web Share API is available
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        // Check if we can share this data
        const shareData = {
          title: `${brandName} 팝업`,
          text: shareText,
          url: shareUrl,
        };

        // Optional: Check if navigator.canShare is available
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Fallback to modal
          setShowModal(true);
          return;
        }

        await navigator.share(shareData);
        toast.success('공유되었습니다!');
        setShowModal(false);
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          logger.error('Share failed', err instanceof Error ? err : new Error(String(err)));
          // Fallback to modal on error
          setShowModal(true);
        }
      }
    } else {
      // Fallback to modal
      setShowModal(true);
    }
  };

  // Kakao Share (if SDK loaded)
  const handleKakaoShare = () => {
    // Type assertion to local interface (avoids global Window extension conflicts)
    const Kakao = (window as { Kakao?: KakaoShareSDK }).Kakao;
    if (Kakao?.Share) {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${brandName} 팝업`,
          description: shareText,
          imageUrl: `${baseUrl}/og-image.png`,
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
      setShowModal(false);
    } else {
      toast.error('카카오톡 공유를 사용할 수 없습니다');
    }
  };

  // Quick share (mobile: native, desktop: modal)
  const handleQuickShare = () => {
    // DES-045: Try native share first on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile && 'share' in navigator && typeof navigator.share === 'function') {
      handleNativeShare();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'button' ? (
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickShare}
          className={`flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl font-bold text-sm transition-all ${className}`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
          }}
        >
          <Share2 size={16} />
          <span>친구 초대</span>
        </m.button>
      ) : (
        <m.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleQuickShare}
          className={`p-3 rounded-full transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${className}`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          aria-label="공유하기"
        >
          <Share2 size={18} className="text-white" />
        </m.button>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
            />

            {/* Modal - MOB-014: swipe-to-dismiss */}
            <m.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                // MOB-014: 하단으로 100px 이상 드래그 시 닫기
                if (info.offset.y > 100) {
                  setShowModal(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-[50] p-5 pb-safe"
              style={{
                paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                paddingTop: 'max(8px, env(safe-area-inset-top))',
              }}
            >
              <div
                className="max-w-lg mx-auto rounded-2xl p-5"
                style={{
                  background: 'rgba(18, 19, 20, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* MOB-014: 드래그 핸들 */}
                <div
                  className="w-12 h-1 rounded-full mx-auto mb-4 drag-handle"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                  aria-hidden="true"
                />
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-lg">공유하기</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="닫기"
                  >
                    <X size={20} className="text-white/60" />
                  </button>
                </div>

                {/* Share URL Preview */}
                <div
                  className="rounded-xl p-3 mb-5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <p className="text-linear-text-tertiary text-xs mb-1">공유 링크</p>
                  <p className="text-white text-sm truncate font-mono">{shareUrl}</p>
                  {referralCode && (
                    <p className="text-spark-500 text-xs mt-1">리퍼럴 코드 포함: {referralCode}</p>
                  )}
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Copy Link */}
                  <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: 'rgba(255, 107, 91, 0.15)',
                      border: '1px solid rgba(255, 107, 91, 0.3)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255, 107, 91, 0.3)' }}
                    >
                      <Copy size={20} style={{ color: colors.flame[500] }} />
                    </div>
                    <span className="text-white text-xs font-medium">링크 복사</span>
                  </m.button>

                  {/* Kakao */}
                  <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleKakaoShare}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: 'rgba(254, 229, 0, 0.15)',
                      border: '1px solid rgba(254, 229, 0, 0.3)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(254, 229, 0, 0.3)' }}
                    >
                      <MessageCircle size={20} style={{ color: '#FEE500' }} />
                    </div>
                    <span className="text-white text-xs font-medium">카카오톡</span>
                  </m.button>

                  {/* More (Native Share) */}
                  <m.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255, 255, 255, 0.15)' }}
                    >
                      <Link2 size={20} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">더보기</span>
                  </m.button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
