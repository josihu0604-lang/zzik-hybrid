'use client';

import { useMemo } from 'react';
import { m } from '@/lib/motion';
import { Crown, Star, Award, Medal, Zap, Gift, TrendingUp } from 'lucide-react';
import {
  TIER_COLORS,
  TIER_THRESHOLDS,
  TIER_COMMISSION_RATES,
  getReferralsToNextTier,
  type LeaderTier,
} from '@/lib/leader';
import { colors } from '@/lib/design-tokens';

/**
 * TierProgress - 티어 진행률 컴포넌트
 *
 * Bronze -> Silver -> Gold -> Platinum 승급 진행률 표시
 */

interface TierProgressProps {
  currentTier: LeaderTier;
  totalReferrals: number;
  className?: string;
  showBenefits?: boolean;
}

const TIER_NAMES: Record<LeaderTier, string> = {
  Bronze: '브론즈',
  Silver: '실버',
  Gold: '골드',
  Platinum: '플래티넘',
};

const TIER_ICONS: Record<LeaderTier, typeof Medal> = {
  Bronze: Medal,
  Silver: Award,
  Gold: Star,
  Platinum: Crown,
};

const TIER_ORDER: LeaderTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

// Benefits per tier
const TIER_BENEFITS: Record<LeaderTier, string[]> = {
  Bronze: ['기본 수수료율 10%', '실시간 대시보드', '추천 링크 생성'],
  Silver: ['수수료율 12%', '우선 정산', '전용 배지'],
  Gold: ['수수료율 15%', '전담 매니저', 'VIP 이벤트 초대'],
  Platinum: ['수수료율 20%', '파트너 계약', '프리미엄 마케팅 지원'],
};

export function TierProgress({
  currentTier,
  totalReferrals,
  className = '',
  showBenefits = false,
}: TierProgressProps) {
  const { nextTier, remaining } = getReferralsToNextTier(totalReferrals);
  const tierColor = TIER_COLORS[currentTier];
  const TierIcon = TIER_ICONS[currentTier];
  const currentIndex = TIER_ORDER.indexOf(currentTier);

  // Calculate progress to next tier
  const progressData = useMemo(() => {
    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : totalReferrals;
    const progressRange = nextThreshold - currentThreshold;
    const currentProgress = totalReferrals - currentThreshold;
    const percentage = nextTier ? Math.min(100, (currentProgress / progressRange) * 100) : 100;

    return {
      currentThreshold,
      nextThreshold,
      percentage,
      isMaxTier: !nextTier,
    };
  }, [currentTier, totalReferrals, nextTier]);

  // Calculate all tier milestones for the visual
  const milestones = useMemo(() => {
    return TIER_ORDER.map((tier, index) => ({
      tier,
      threshold: TIER_THRESHOLDS[tier],
      color: TIER_COLORS[tier],
      name: TIER_NAMES[tier],
      Icon: TIER_ICONS[tier],
      isReached: index <= currentIndex,
      isCurrent: index === currentIndex,
    }));
  }, [currentIndex]);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(18, 19, 20, 0.8)',
        border: `1px solid ${tierColor}40`,
        boxShadow: `0 4px 24px ${tierColor}20`,
      }}
    >
      {/* Header */}
      <div
        className="p-5"
        style={{
          background: `linear-gradient(135deg, ${tierColor}15 0%, ${tierColor}05 100%)`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Tier Badge */}
            <m.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${tierColor} 0%, ${tierColor}80 100%)`,
                boxShadow: `0 4px 20px ${tierColor}50`,
              }}
              animate={{
                boxShadow: [
                  `0 4px 20px ${tierColor}50`,
                  `0 6px 28px ${tierColor}70`,
                  `0 4px 20px ${tierColor}50`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TierIcon size={28} color="#fff" />
            </m.div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-xl">{TIER_NAMES[currentTier]}</p>
                <span
                  className="px-2 py-0.5 rounded-full text-micro font-bold"
                  style={{
                    background: `${tierColor}30`,
                    color: tierColor,
                  }}
                >
                  {TIER_COMMISSION_RATES[currentTier]}%
                </span>
              </div>
              <p className="text-linear-text-tertiary text-xs mt-0.5">
                총 {totalReferrals}명 추천 완료
              </p>
            </div>
          </div>

          {nextTier && (
            <div className="text-right">
              <p className="text-linear-text-tertiary text-xs mb-1">다음 티어까지</p>
              <div className="flex items-center gap-1">
                <p className="font-bold text-lg" style={{ color: TIER_COLORS[nextTier] }}>
                  {remaining}
                </p>
                <span className="text-linear-text-tertiary text-xs">명</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative">
          {/* Background Track */}
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            {/* Progress Fill */}
            <m.div
              className="h-full rounded-full relative"
              style={{
                background: nextTier
                  ? `linear-gradient(90deg, ${tierColor} 0%, ${TIER_COLORS[nextTier]} 100%)`
                  : tierColor,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressData.percentage}%` }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Shimmer effect */}
              <m.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </m.div>
          </div>

          {/* Milestone Markers */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1">
            {milestones.map((milestone, index) => {
              // Calculate position based on tier thresholds
              const maxThreshold = TIER_THRESHOLDS.Platinum;
              const position = (milestone.threshold / maxThreshold) * 100;
              const MIcon = milestone.Icon;

              return (
                <m.div
                  key={milestone.tier}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center border-2 z-10"
                    style={{
                      background: milestone.isReached ? milestone.color : colors.space[800],
                      borderColor: milestone.isReached ? milestone.color : colors.border.default,
                      boxShadow: milestone.isCurrent ? `0 0 8px ${milestone.color}` : 'none',
                    }}
                  >
                    {milestone.isReached && <MIcon size={10} color="#fff" />}
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>

        {/* Tier Labels */}
        <div className="flex justify-between mt-4 px-1">
          {milestones.map((milestone) => (
            <div
              key={milestone.tier}
              className="text-center"
              style={{
                width: `${100 / milestones.length}%`,
              }}
            >
              <p
                className="text-micro font-medium"
                style={{
                  color: milestone.isReached ? milestone.color : colors.text.tertiary,
                }}
              >
                {milestone.name}
              </p>
              <p
                className="text-micro"
                style={{
                  color: milestone.isReached ? colors.text.secondary : colors.text.muted,
                }}
              >
                {milestone.threshold}+
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Max Tier Celebration */}
      {progressData.isMaxTier && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-3 text-center"
          style={{
            background: `linear-gradient(135deg, ${tierColor}20 0%, ${tierColor}10 100%)`,
            borderTop: `1px solid ${tierColor}30`,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap size={16} style={{ color: tierColor }} />
            <p className="text-sm font-bold" style={{ color: tierColor }}>
              최고 티어 달성!
            </p>
            <Zap size={16} style={{ color: tierColor }} />
          </div>
          <p className="text-linear-text-tertiary text-xs mt-1">
            최고 수수료율 {TIER_COMMISSION_RATES.Platinum}%를 받고 있습니다
          </p>
        </m.div>
      )}

      {/* Next Tier Benefits Preview */}
      {nextTier && !progressData.isMaxTier && (
        <div
          className="px-5 py-4"
          style={{
            borderTop: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Gift size={14} style={{ color: TIER_COLORS[nextTier] }} />
            <p className="text-xs font-medium text-linear-text-secondary">
              {TIER_NAMES[nextTier]} 달성 시 혜택
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIER_BENEFITS[nextTier].slice(0, 2).map((benefit, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-lg text-micro font-medium"
                style={{
                  background: `${TIER_COLORS[nextTier]}15`,
                  color: TIER_COLORS[nextTier],
                  border: `1px solid ${TIER_COLORS[nextTier]}30`,
                }}
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Benefits (optional) */}
      {showBenefits && (
        <div
          className="px-5 py-4"
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderTop: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: tierColor }} />
            <p className="text-xs font-medium text-linear-text-secondary">현재 혜택</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {TIER_BENEFITS[currentTier].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-linear-text-secondary"
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor }} />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      )}
    </m.div>
  );
}

export default TierProgress;
