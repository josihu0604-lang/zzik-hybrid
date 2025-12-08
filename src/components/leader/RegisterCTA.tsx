'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { Rocket, Gift, TrendingUp, Users, Check, Loader2 } from 'lucide-react';
import { TIER_COLORS, type LeaderTier } from '@/lib/leader';

/**
 * RegisterCTA - 리더 등록 CTA 컴포넌트
 */

interface RegisterCTAProps {
  onRegister: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const BENEFITS = [
  {
    icon: Gift,
    title: '추천 수익',
    description: '친구가 체크인할 때마다 수익 발생',
    color: '#FFD93D',
  },
  {
    icon: TrendingUp,
    title: '티어 보상',
    description: '추천 실적에 따라 수수료율 상승',
    color: '#22c55e',
  },
  {
    icon: Users,
    title: '전용 혜택',
    description: '리더 전용 프로모션 및 이벤트',
    color: '#A855F7',
  },
];

const TIER_PREVIEW: { tier: LeaderTier; referrals: string; rate: string }[] = [
  { tier: 'Bronze', referrals: '0-9명', rate: '5%' },
  { tier: 'Silver', referrals: '10-49명', rate: '7%' },
  { tier: 'Gold', referrals: '50-99명', rate: '10%' },
  { tier: 'Platinum', referrals: '100명+', rate: '15%' },
];

export function RegisterCTA({ onRegister, isLoading = false, className = '' }: RegisterCTAProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255, 107, 91, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        border: '1px solid rgba(255, 107, 91, 0.3)',
      }}
    >
      {/* Header */}
      <div
        className="p-6 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 107, 91, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
        }}
      >
        <m.div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FF6B5B 0%, #A855F7 100%)',
            boxShadow: '0 4px 24px rgba(255, 107, 91, 0.4)',
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            boxShadow: isHovered
              ? '0 8px 32px rgba(255, 107, 91, 0.6)'
              : '0 4px 24px rgba(255, 107, 91, 0.4)',
          }}
        >
          <Rocket size={32} className="text-white" />
        </m.div>
        <h2 className="text-white text-xl font-black mb-2">ZZIK 리더가 되어보세요!</h2>
        <p className="text-linear-text-tertiary text-sm">친구를 추천하고 수익을 창출하세요</p>
      </div>

      {/* Benefits */}
      <div className="p-5">
        <div className="space-y-3 mb-5">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <m.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${benefit.color}20` }}
                >
                  <Icon size={20} style={{ color: benefit.color }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{benefit.title}</p>
                  <p className="text-linear-text-tertiary text-xs">{benefit.description}</p>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Tier Preview */}
        <div
          className="p-4 rounded-xl mb-5"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <p className="text-linear-text-tertiary text-xs mb-3 text-center">티어별 수수료율</p>
          <div className="grid grid-cols-4 gap-2">
            {TIER_PREVIEW.map((item) => (
              <div key={item.tier} className="text-center">
                <div
                  className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1"
                  style={{
                    background: `${TIER_COLORS[item.tier]}30`,
                    border: `1px solid ${TIER_COLORS[item.tier]}50`,
                  }}
                >
                  <span className="text-xs">
                    {item.tier === 'Platinum'
                      ? '👑'
                      : item.tier === 'Gold'
                        ? '🥇'
                        : item.tier === 'Silver'
                          ? '🥈'
                          : '🥉'}
                  </span>
                </div>
                <p className="font-bold text-sm" style={{ color: TIER_COLORS[item.tier] }}>
                  {item.rate}
                </p>
                <p className="text-linear-text-tertiary text-micro">{item.referrals}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Register Button */}
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={onRegister}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FF6B5B 0%, #A855F7 100%)',
            boxShadow: '0 4px 24px rgba(255, 107, 91, 0.4)',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <Check size={20} />
              리더로 등록하기
            </>
          )}
        </m.button>

        <p className="text-center text-linear-text-tertiary text-xs mt-3">
          등록 즉시 추천 코드가 발급됩니다
        </p>
      </div>
    </m.div>
  );
}

export default RegisterCTA;
