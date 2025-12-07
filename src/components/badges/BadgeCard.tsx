'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import type { Badge, EarnedBadge } from '@/lib/badges';
import { getRarityColor, getRarityLabel } from '@/lib/badges';

interface BadgeCardProps {
  badge: Badge | EarnedBadge;
  /** Is this badge earned? */
  earned?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Current value towards threshold */
  current?: number;
  /** Show as compact (icon only) */
  compact?: boolean;
  /** Click handler */
  onClick?: () => void;
}

function BadgeCardComponent({
  badge,
  earned = false,
  progress = 0,
  current = 0,
  compact = false,
  onClick,
}: BadgeCardProps) {
  const isLocked = !earned && badge.secret;
  const rarityColor = getRarityColor(badge.rarity);

  // Compact badge (icon only)
  if (compact) {
    return (
      <motion.button
        type="button"
        className="relative flex items-center justify-center rounded-xl transition-colors"
        style={{
          width: 48,
          height: 48,
          background: earned ? `${rarityColor}20` : colors.space[800],
          border: `2px solid ${earned ? rarityColor : colors.border.subtle}`,
          opacity: earned ? 1 : 0.5,
        }}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`${badge.name}${earned ? ' (획득)' : ' (미획득)'}`}
      >
        <span className="text-xl" aria-hidden="true">
          {isLocked ? '🔒' : badge.icon}
        </span>
        {earned && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ background: colors.success }}
            aria-hidden="true"
          />
        )}
      </motion.button>
    );
  }

  // Full badge card
  return (
    <motion.button
      type="button"
      className="relative flex flex-col items-center p-4 rounded-2xl transition-colors text-center w-full"
      style={{
        background: earned ? `${rarityColor}10` : colors.space[800],
        border: `1px solid ${earned ? `${rarityColor}40` : colors.border.subtle}`,
        opacity: isLocked ? 0.4 : earned ? 1 : 0.7,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLocked}
      aria-label={`${badge.name}: ${badge.description}${earned ? ' (획득 완료)' : ` (진행률: ${progress}%)`}`}
    >
      {/* Rarity indicator */}
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium"
        style={{
          background: `${rarityColor}20`,
          color: rarityColor,
        }}
        aria-label={`희귀도: ${getRarityLabel(badge.rarity)}`}
      >
        {getRarityLabel(badge.rarity)}
      </div>

      {/* Badge icon */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-xl mb-3"
        style={{
          background: earned ? `${rarityColor}20` : colors.space[700],
          border: `2px solid ${earned ? rarityColor : 'transparent'}`,
        }}
        aria-hidden="true"
      >
        {isLocked ? (
          <Lock size={24} style={{ color: colors.text.muted }} />
        ) : (
          <span className="text-2xl">{badge.icon}</span>
        )}
      </div>

      {/* Badge name */}
      <h3
        className="font-semibold text-sm mb-1"
        style={{ color: earned ? colors.text.primary : colors.text.secondary }}
      >
        {isLocked ? '???' : badge.name}
      </h3>

      {/* Badge description */}
      <p className="text-xs mb-3 line-clamp-2" style={{ color: colors.text.tertiary }}>
        {isLocked ? '비밀 배지입니다' : badge.description}
      </p>

      {/* Progress bar (for non-earned badges) */}
      {!earned && !isLocked && (
        <div className="w-full">
          <div
            className="w-full h-1.5 rounded-full overflow-hidden mb-1"
            style={{ background: colors.space[700] }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: rarityColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px]" style={{ color: colors.text.muted }}>
            {current} / {badge.criteria.threshold}
          </p>
        </div>
      )}

      {/* Earned indicator */}
      {earned && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg"
          style={{ background: `${colors.success}20` }}
        >
          <span className="text-xs" style={{ color: colors.success }}>
            +{badge.points}P 획득
          </span>
        </div>
      )}
    </motion.button>
  );
}

export const BadgeCard = memo(BadgeCardComponent);
export default BadgeCard;
