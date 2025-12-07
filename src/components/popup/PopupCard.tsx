'use client';

import { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Flame } from 'lucide-react';
import { colors, radii, liquidGlass } from '@/lib/design-tokens';
import { ProgressBar } from './ProgressBar';

/**
 * PopupCard - Legacy compatible component
 *
 * For backward compatibility with existing pages.
 */

export interface PopupData {
  id: string;
  brandName: string;
  brandLogo?: string;
  imageUrl?: string;
  title: string;
  location: string;
  currentParticipants: number;
  goalParticipants: number;
  daysLeft: number;
  category?: string;
  isParticipated?: boolean;
}

interface PopupCardProps {
  popup: PopupData;
  onParticipate?: (popupId: string) => void;
  onCardClick?: (popupId: string) => void;
  highlightText?: (text: string) => ReactNode;
}

function PopupCardComponent({
  popup,
  onParticipate,
  onCardClick,
  highlightText,
}: PopupCardProps) {
  const progress = Math.round((popup.currentParticipants / popup.goalParticipants) * 100);
  const isHot = progress >= 70;
  const isUrgent = popup.daysLeft <= 3;

  const handleClick = () => {
    onCardClick?.(popup.id);
  };

  const handleParticipate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onParticipate?.(popup.id);
  };

  const renderText = (text: string) => {
    return highlightText ? highlightText(text) : text;
  };

  return (
    <motion.article
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{
        ...liquidGlass.standard,
        borderRadius: radii.xl,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isHot && (
                <div className="flex items-center gap-1">
                  <Flame size={12} style={{ color: colors.flame[500] }} />
                  <span className="text-xs font-bold" style={{ color: colors.flame[500] }}>
                    HOT
                  </span>
                </div>
              )}
              {isUrgent && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                  }}
                >
                  마감 임박
                </span>
              )}
            </div>
            <p className="text-xs mb-1" style={{ color: colors.text.tertiary }}>
              {renderText(popup.brandName)}
            </p>
            <h3 className="font-bold text-base" style={{ color: colors.text.primary }}>
              {renderText(popup.title)}
            </h3>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar current={popup.currentParticipants} goal={popup.goalParticipants} size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users size={12} style={{ color: colors.text.tertiary }} />
              <span className="text-xs" style={{ color: colors.text.secondary }}>
                {popup.currentParticipants}/{popup.goalParticipants}
              </span>
            </div>
            {popup.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} style={{ color: colors.text.tertiary }} />
                <span className="text-xs" style={{ color: colors.text.secondary }}>
                  {renderText(popup.location)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock size={12} style={{ color: colors.flame[500] }} />
              <span className="text-xs font-medium" style={{ color: colors.flame[500] }}>
                D-{popup.daysLeft}
              </span>
            </div>

            {!popup.isParticipated && onParticipate && (
              <button
                onClick={handleParticipate}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
                  color: 'white',
                }}
              >
                참여
              </button>
            )}

            {popup.isParticipated && (
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: colors.success,
                }}
              >
                참여중
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const PopupCard = memo(PopupCardComponent);
