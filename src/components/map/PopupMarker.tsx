'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import { Marker } from 'react-map-gl';
import { Check, Flame } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { getCategoryColor } from '@/lib/color-utils';
import type { PopupLocation } from './MapboxMap';

/**
 * PopupMarker - 카테고리별 색상 + 진행률 표시 마커
 *
 * Features:
 * - 카테고리별 색상 구분
 * - 진행률 링 표시
 * - 오픈 확정 시 특별 마커 (체크 아이콘 + 글로우)
 * - 호버/선택 상태 애니메이션
 */

interface PopupMarkerProps {
  popup: PopupLocation;
  isSelected: boolean;
  isHovered: boolean;
  index: number;
  onClick: () => void;
  onHover: (id: string | null) => void;
}

export const PopupMarker = memo(function PopupMarker({
  popup,
  isSelected,
  isHovered,
  index,
  onClick,
  onHover,
}: PopupMarkerProps) {
  const categoryColor = getCategoryColor(popup.category);
  const progress = popup.progress ?? 0;
  const isConfirmed = popup.isConfirmed || progress >= 100;
  const isHot = progress >= 70 && progress < 100;

  // Progress ring calculation (SVG circle)
  const radius = 24;
  const strokeWidth = 3;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Marker
      longitude={popup.lng}
      latitude={popup.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <m.div
        className="relative cursor-pointer"
        tabIndex={0}
        role="button"
        aria-label={`${popup.brandName} - ${popup.location}. ${popup.totalParticipants}명 참여${isConfirmed ? '. 오픈 확정' : `, ${progress}% 진행중`}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isSelected ? 1.3 : isHovered ? 1.15 : 1,
          opacity: 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 20 },
          opacity: { delay: index * 0.03, duration: 0.3 },
        }}
        onMouseEnter={() => onHover(popup.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(popup.id)}
        onBlur={() => onHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {/* Outer glow for confirmed/hot popups */}
        {(isConfirmed || isHot) && (
          <m.div
            className="absolute -inset-2 rounded-full"
            style={{
              background: isConfirmed
                ? `radial-gradient(circle, ${colors.success}40 0%, transparent 70%)`
                : `radial-gradient(circle, ${categoryColor}30 0%, transparent 70%)`,
            }}
            animate={
              isHot
                ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }
                : undefined
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Hover/Select glow effect */}
        {(isHovered || isSelected) && (
          <m.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: isConfirmed ? colors.success : categoryColor,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isSelected ? 0.6 : 0.4 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Progress Ring (for non-confirmed popups) */}
        {!isConfirmed && progress > 0 && (
          <svg
            className="absolute -inset-1"
            width={radius * 2 + 4}
            height={radius * 2 + 4}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              stroke="rgba(255, 255, 255, 0.1)"
              fill="none"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius + 2}
              cy={radius + 2}
            />
            {/* Progress circle */}
            <m.circle
              stroke={categoryColor}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius + 2}
              cy={radius + 2}
              style={{
                strokeDasharray: circumference,
              }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
        )}

        {/* Main Marker */}
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg transition-all duration-200"
          style={{
            background: isConfirmed
              ? `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`
              : categoryColor,
            boxShadow: isConfirmed
              ? `0 4px 16px ${colors.success}60`
              : `0 4px 12px ${categoryColor}60`,
            border: isSelected
              ? '3px solid white'
              : isHovered
                ? '2px solid rgba(255, 255, 255, 0.5)'
                : '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {isConfirmed ? (
            <Check size={20} strokeWidth={3} />
          ) : isHot ? (
            <Flame size={18} />
          ) : (
            popup.brandName.charAt(0)
          )}
        </div>

        {/* Participant count badge */}
        {popup.totalParticipants > 50 && (
          <m.div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-micro font-bold"
            style={{
              background: isConfirmed ? colors.success : categoryColor,
              color: 'white',
              boxShadow: `0 2px 4px ${isConfirmed ? colors.success : categoryColor}40`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.03 }}
          >
            {popup.totalParticipants > 999
              ? `${Math.floor(popup.totalParticipants / 1000)}k`
              : popup.totalParticipants}
          </m.div>
        )}

        {/* Selected pulse animation */}
        {isSelected && (
          <m.div
            className="absolute inset-0 rounded-full"
            style={{
              background: isConfirmed ? colors.success : categoryColor,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Tooltip on hover */}
        {isHovered && !isSelected && (
          <m.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
            style={{
              background: 'rgba(18, 19, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `0 4px 12px ${isConfirmed ? colors.success : categoryColor}30`,
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-white text-xs font-semibold mb-0.5">{popup.brandName}</p>
            <p className="text-white/60 text-xs">{popup.location}</p>
            {!isConfirmed && progress > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className="h-1 flex-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: categoryColor,
                    }}
                  />
                </div>
                <span className="text-micro" style={{ color: categoryColor }}>
                  {progress}%
                </span>
              </div>
            )}
            {isConfirmed && (
              <span className="text-micro font-semibold" style={{ color: colors.success }}>
                OPEN
              </span>
            )}
            {/* Arrow pointer */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(18, 19, 20, 0.95)',
              }}
            />
          </m.div>
        )}
      </m.div>
    </Marker>
  );
});

export default PopupMarker;
