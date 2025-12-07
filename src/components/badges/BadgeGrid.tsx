'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';
import type { UserBadges, BadgeCategory } from '@/lib/badges';
import { getTotalBadgePoints } from '@/lib/badges';
import { BadgeCard } from './BadgeCard';

interface BadgeGridProps {
  userBadges: UserBadges;
  /** Filter by category */
  category?: BadgeCategory | 'all';
  /** Show only earned badges */
  earnedOnly?: boolean;
  /** Compact mode (icons only) */
  compact?: boolean;
  /** Click handler for badge */
  onBadgeClick?: (badgeId: string) => void;
}

function BadgeGridComponent({
  userBadges,
  category = 'all',
  earnedOnly = false,
  compact = false,
  onBadgeClick,
}: BadgeGridProps) {
  const { earned, inProgress, locked } = userBadges;

  // Filter badges by category
  const filterByCategory = <T extends { category: BadgeCategory }>(badges: T[]): T[] => {
    if (category === 'all') return badges;
    return badges.filter((b) => b.category === category);
  };

  const filteredEarned = filterByCategory(earned);
  const filteredInProgress = earnedOnly ? [] : filterByCategory(inProgress);
  const filteredLocked = earnedOnly ? [] : filterByCategory(locked);

  const totalPoints = getTotalBadgePoints(earned);

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: colors.space[800] }}
      >
        <div>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            획득한 배지
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            {earned.length}개
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            총 포인트
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.spark[500] }}>
            {totalPoints.toLocaleString()}P
          </p>
        </div>
      </div>

      {/* Earned badges */}
      {filteredEarned.length > 0 && (
        <section aria-labelledby="earned-badges-title">
          <h2
            id="earned-badges-title"
            className="text-sm font-semibold mb-3"
            style={{ color: colors.text.secondary }}
          >
            획득한 배지 ({filteredEarned.length})
          </h2>
          <motion.div
            className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-3 gap-3'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredEarned.map((badge) => (
              <motion.div key={badge.id} variants={itemVariants}>
                <BadgeCard
                  badge={badge}
                  earned
                  compact={compact}
                  onClick={() => onBadgeClick?.(badge.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* In progress badges */}
      {filteredInProgress.length > 0 && (
        <section aria-labelledby="progress-badges-title">
          <h2
            id="progress-badges-title"
            className="text-sm font-semibold mb-3"
            style={{ color: colors.text.secondary }}
          >
            진행 중 ({filteredInProgress.length})
          </h2>
          <motion.div
            className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-3 gap-3'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredInProgress.map((badge) => (
              <motion.div key={badge.id} variants={itemVariants}>
                <BadgeCard
                  badge={badge}
                  progress={badge.progress}
                  current={badge.current}
                  compact={compact}
                  onClick={() => onBadgeClick?.(badge.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Locked badges */}
      {filteredLocked.length > 0 && !earnedOnly && (
        <section aria-labelledby="locked-badges-title">
          <h2
            id="locked-badges-title"
            className="text-sm font-semibold mb-3"
            style={{ color: colors.text.muted }}
          >
            미획득 ({filteredLocked.length})
          </h2>
          <motion.div
            className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-3 gap-3'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredLocked.map((badge) => (
              <motion.div key={badge.id} variants={itemVariants}>
                <BadgeCard
                  badge={badge}
                  compact={compact}
                  onClick={() => onBadgeClick?.(badge.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Empty state */}
      {filteredEarned.length === 0 &&
        filteredInProgress.length === 0 &&
        filteredLocked.length === 0 && (
          <div className="text-center py-12 rounded-xl" style={{ background: colors.space[800] }}>
            <span className="text-4xl mb-3 block" aria-hidden="true">
              🏅
            </span>
            <p style={{ color: colors.text.secondary }}>아직 배지가 없습니다</p>
            <p className="text-sm mt-1" style={{ color: colors.text.muted }}>
              팝업에 참여하고 배지를 모아보세요!
            </p>
          </div>
        )}
    </div>
  );
}

export const BadgeGrid = memo(BadgeGridComponent);
export default BadgeGrid;
