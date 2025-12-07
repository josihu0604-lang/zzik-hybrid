'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Check, Link2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { colors } from '@/lib/design-tokens';

/**
 * ReferralCard - 리퍼럴 코드 카드
 */

interface ReferralCardProps {
  referralCode: string;
  referralLink: string;
  className?: string;
}

export function ReferralCard({ referralCode, referralLink, className = '' }: ReferralCardProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const toast = useToast();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied('code');
      toast.success('추천 코드가 복사되었습니다!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied('link');
      toast.success('추천 링크가 복사되었습니다!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleShare = async () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-5 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 217, 61, 0.1) 0%, rgba(255, 107, 91, 0.1) 100%)',
        border: '1px solid rgba(255, 217, 61, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Link2 size={18} style={{ color: colors.spark[400] }} />
        <h3 className="text-white font-bold">내 추천 코드</h3>
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <p className="text-linear-text-tertiary text-xs mb-2">추천 코드</p>
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className="font-mono font-bold text-xl tracking-wider"
            style={{ color: colors.spark[400] }}
          >
            {referralCode}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyCode}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: copied === 'code' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 217, 61, 0.2)',
            }}
          >
            {copied === 'code' ? (
              <Check size={18} style={{ color: colors.success }} />
            ) : (
              <Copy size={18} style={{ color: colors.spark[400] }} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <p className="text-linear-text-tertiary text-xs mb-2">추천 링크</p>
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span className="text-white text-sm truncate flex-1 mr-2 font-mono">{referralLink}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyLink}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: copied === 'link' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {copied === 'link' ? (
              <Check size={18} style={{ color: colors.success }} />
            ) : (
              <Copy size={18} className="text-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: 'linear-gradient(135deg, #FFD93D 0%, #FFC700 100%)',
          color: 'black',
          boxShadow: '0 4px 16px rgba(255, 217, 61, 0.3)',
        }}
      >
        <Share2 size={18} />
        친구에게 공유하기
      </motion.button>

      {/* Info */}
      <p className="text-center text-linear-text-tertiary text-xs mt-3">
        친구가 체크인하면 수익이 발생해요!
      </p>
    </motion.div>
  );
}

export default ReferralCard;
