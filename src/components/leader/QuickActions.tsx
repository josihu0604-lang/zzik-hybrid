'use client';

import { m } from '@/lib/motion';
import { Share2, MessageCircle, Instagram, Copy, Link2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { colors } from '@/lib/design-tokens';

/**
 * QuickActions - 빠른 공유 액션
 *
 * SNS 공유 및 링크 복사 버튼 그리드
 */

interface QuickActionsProps {
  referralCode: string;
  referralLink: string;
  className?: string;
}

export function QuickActions({ referralCode, referralLink, className = '' }: QuickActionsProps) {
  const toast = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('링크가 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success('코드가 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleKakaoShare = () => {
    // Kakao SDK share
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Kakao) {
      const Kakao = (
        window as unknown as Record<string, { Share: { sendDefault: (config: unknown) => void } }>
      ).Kakao;
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'ZZIK 추천',
          description: '이 링크로 가입하면 특별 혜택이!',
          imageUrl: 'https://zzik.kr/og-image.png',
          link: {
            mobileWebUrl: referralLink,
            webUrl: referralLink,
          },
        },
        buttons: [
          {
            title: '지금 참여하기',
            link: {
              mobileWebUrl: referralLink,
              webUrl: referralLink,
            },
          },
        ],
      });
    } else {
      // Fallback: Kakao 링크
      window.open(
        `https://accounts.kakao.com/login?continue=${encodeURIComponent(referralLink)}`,
        '_blank'
      );
    }
  };

  const handleInstagramShare = () => {
    // Instagram은 직접 공유 미지원, 스토리 공유 안내
    toast.info('Instagram 스토리에 링크를 붙여넣어 공유해보세요!');
    handleCopyLink();
  };

  const handleNativeShare = async () => {
    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'ZZIK 추천',
          text: '이 링크로 가입하면 특별 혜택이!',
          url: referralLink,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const actions = [
    {
      icon: MessageCircle,
      label: '카카오톡',
      color: '#FEE500',
      bgColor: 'rgba(254, 229, 0, 0.15)',
      onClick: handleKakaoShare,
    },
    {
      icon: Instagram,
      label: '인스타그램',
      color: '#E4405F',
      bgColor: 'rgba(228, 64, 95, 0.15)',
      onClick: handleInstagramShare,
    },
    {
      icon: Link2,
      label: '링크 복사',
      color: colors.spark[500],
      bgColor: 'rgba(255, 217, 61, 0.15)',
      onClick: handleCopyLink,
    },
    {
      icon: Copy,
      label: '코드 복사',
      color: colors.flame[500],
      bgColor: 'rgba(255, 107, 91, 0.15)',
      onClick: handleCopyCode,
    },
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">빠른 공유</h3>
        <m.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNativeShare}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: colors.text.secondary,
          }}
        >
          <Share2 size={12} />
          더보기
        </m.button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <m.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
              style={{
                background: action.bgColor,
                border: `1px solid ${action.color}30`,
              }}
            >
              <Icon size={20} style={{ color: action.color }} />
              <span className="text-micro text-linear-text-secondary font-medium">
                {action.label}
              </span>
            </m.button>
          );
        })}
      </div>

      {/* Referral Code Display */}
      <div
        className="mt-3 p-2 rounded-lg flex items-center justify-between"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span className="text-linear-text-tertiary text-xs">내 코드:</span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: colors.spark[500] }}>
            {referralCode}
          </span>
          <ExternalLink size={12} className="text-linear-text-tertiary" />
        </div>
      </div>
    </m.div>
  );
}

export default QuickActions;
