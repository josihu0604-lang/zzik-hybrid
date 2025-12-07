'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { colors } from '@/lib/design-tokens';

/**
 * ReferralLink - 리더 전용 레퍼럴 링크 컴포넌트
 *
 * Features:
 * - 레퍼럴 코드 포함 URL 표시
 * - 원클릭 복사
 * - 실시간 통계 (참여자 수, 전환율)
 * - 팝업별 또는 전체 레퍼럴
 */

export interface ReferralStats {
  /** 총 클릭 수 */
  clicks: number;
  /** 총 참여 전환 수 */
  conversions: number;
  /** 총 수익 */
  earnings: number;
}

interface ReferralLinkProps {
  /** 리더 레퍼럴 코드 */
  referralCode: string;
  /** 특정 팝업 ID (없으면 전체) */
  popupId?: string;
  /** 팝업 이름 */
  popupName?: string;
  /** 레퍼럴 통계 */
  stats?: ReferralStats;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 추가 클래스 */
  className?: string;
}

export function ReferralLink({
  referralCode,
  popupId,
  popupName,
  stats,
  compact = false,
  className = '',
}: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // URL 생성
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zzik.app';
  const referralUrl = popupId
    ? `${baseUrl}/popup/${popupId}?ref=${referralCode}`
    : `${baseUrl}?ref=${referralCode}`;

  // 전환율 계산
  const conversionRate =
    stats && stats.clicks > 0 ? Math.round((stats.conversions / stats.clicks) * 100) : 0;

  // 복사 핸들러
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - clipboard API not available
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralUrl]);

  // 컴팩트 모드 (카드 내 사용)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className="flex-1 px-3 py-2 rounded-lg truncate font-mono text-xs"
          style={{
            background: 'rgba(255, 217, 61, 0.1)',
            border: '1px solid rgba(255, 217, 61, 0.2)',
            color: colors.spark[400],
          }}
        >
          {referralUrl}
        </div>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg transition-colors"
          style={{
            background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 217, 61, 0.15)',
            border: copied
              ? '1px solid rgba(34, 197, 94, 0.3)'
              : '1px solid rgba(255, 217, 61, 0.3)',
          }}
          aria-label={copied ? '복사됨' : '링크 복사'}
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} style={{ color: colors.spark[400] }} />
          )}
        </motion.button>
      </div>
    );
  }

  // 풀 모드 (대시보드용)
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 217, 61, 0.08) 0%, rgba(255, 107, 91, 0.05) 100%)',
        border: '1px solid rgba(255, 217, 61, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255, 217, 61, 0.2)' }}
          >
            <Link2 size={16} style={{ color: colors.spark[400] }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">
              {popupName ? `${popupName} 레퍼럴` : '내 레퍼럴 링크'}
            </h3>
            <p className="text-linear-text-tertiary text-xs">
              코드: <span style={{ color: colors.spark[400] }}>{referralCode}</span>
            </p>
          </div>
        </div>

        {stats && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-linear-text-tertiary text-xs hover:text-white transition-colors"
          >
            {showStats ? '숨기기' : '통계 보기'}
          </button>
        )}
      </div>

      {/* URL Input + Copy Button */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex-1 px-4 py-3 rounded-xl truncate font-mono text-sm"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          }}
        >
          {referralUrl}
        </div>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
          style={{
            background: copied
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : `linear-gradient(135deg, ${colors.spark[400]} 0%, ${colors.spark[500]} 100%)`,
            color: copied ? 'white' : '#000',
            boxShadow: copied
              ? '0 4px 16px rgba(34, 197, 94, 0.3)'
              : `0 4px 16px ${colors.spark[400]}40`,
          }}
        >
          {copied ? (
            <>
              <Check size={16} />
              복사됨
            </>
          ) : (
            <>
              <Copy size={16} />
              복사
            </>
          )}
        </motion.button>
      </div>

      {/* Stats (expandable) */}
      <AnimatePresence>
        {stats && showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="grid grid-cols-3 gap-3 pt-4 border-t"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {/* Clicks */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ExternalLink size={12} className="text-linear-text-tertiary" />
                  <span className="text-linear-text-tertiary text-xs">클릭</span>
                </div>
                <p className="text-white font-bold text-lg">{stats.clicks.toLocaleString()}</p>
              </div>

              {/* Conversions */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users size={12} className="text-linear-text-tertiary" />
                  <span className="text-linear-text-tertiary text-xs">참여</span>
                </div>
                <p className="text-white font-bold text-lg">{stats.conversions.toLocaleString()}</p>
              </div>

              {/* Conversion Rate */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={12} className="text-linear-text-tertiary" />
                  <span className="text-linear-text-tertiary text-xs">전환율</span>
                </div>
                <p className="font-bold text-lg" style={{ color: colors.spark[400] }}>
                  {conversionRate}%
                </p>
              </div>
            </div>

            {/* Earnings */}
            {stats.earnings > 0 && (
              <div
                className="mt-4 p-3 rounded-xl text-center"
                style={{
                  background: 'rgba(255, 217, 61, 0.1)',
                  border: '1px solid rgba(255, 217, 61, 0.2)',
                }}
              >
                <p className="text-linear-text-tertiary text-xs mb-1">예상 수익</p>
                <p className="font-black text-xl" style={{ color: colors.spark[400] }}>
                  ₩{stats.earnings.toLocaleString()}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <p className="text-linear-text-tertiary text-xs mt-4 text-center">
        이 링크로 참여한 사용자는 자동으로 추적됩니다
      </p>
    </div>
  );
}

export default ReferralLink;
