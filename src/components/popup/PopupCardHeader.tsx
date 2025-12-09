'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { colors, categories } from '@/lib/design-tokens';
import type { PopupData } from './PopupCard';

interface PopupCardHeaderProps {
  popup: Pick<PopupData, 'brandName' | 'brandLogo' | 'location' | 'category'>;
  highlightText?: (text: string) => React.ReactNode;
  /** 표시 변형 - overlay는 이미지 위에 표시될 때 사용 */
  variant?: 'default' | 'overlay';
}

// Brand avatar gradient based on name - ZZIK brand-aligned
function getBrandGradient(name: string): string {
  const gradients = [
    `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`, // Flame → Ember
    `linear-gradient(135deg, ${colors.ember[400]} 0%, ${colors.flame[600]} 100%)`, // Ember → Deep Flame
    `linear-gradient(135deg, ${colors.spark[400]} 0%, ${colors.flame[400]} 100%)`, // Spark → Flame
    `linear-gradient(135deg, ${colors.flame[300]} 0%, ${colors.spark[500]} 100%)`, // Light Flame → Spark
    `linear-gradient(135deg, ${colors.ember[500]} 0%, ${colors.spark[400]} 100%)`, // Ember → Spark
    `linear-gradient(135deg, ${colors.flame[400]} 0%, ${colors.ember[400]} 100%)`, // Flame → Ember light
    `linear-gradient(135deg, ${colors.spark[500]} 0%, ${colors.ember[500]} 100%)`, // Spark → Ember
    `linear-gradient(135deg, ${colors.flame[600]} 0%, ${colors.spark[600]} 100%)`, // Deep Flame → Deep Spark
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

// DES-139: memo 적용으로 불필요한 리렌더링 방지
function PopupCardHeaderComponent({
  popup,
  highlightText,
  variant = 'default',
}: PopupCardHeaderProps) {
  const categoryInfo = categories[popup.category] || categories.all;
  const [imageError, setImageError] = useState(false);

  // Overlay variant - 이미지 위에 브랜드명만 간단히 표시
  if (variant === 'overlay') {
    return (
      <div className="flex items-center gap-2">
        {popup.brandLogo && !imageError ? (
          <Image
            src={popup.brandLogo}
            alt={`${popup.brandName} 로고`}
            width={28}
            height={28}
            loading="lazy"
            sizes="28px"
            className="rounded-lg flex-shrink-0"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-white font-bold text-xs">
              {popup.brandName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className="font-semibold text-white text-sm drop-shadow-lg"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {popup.brandName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      {/* Brand Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Brand Avatar */}
        {popup.brandLogo && !imageError ? (
          <Image
            src={popup.brandLogo}
            alt={`${popup.brandName} 로고`}
            width={44}
            height={44}
            loading="lazy"
            sizes="44px"
            className="rounded-xl flex-shrink-0"
            style={{ border: `1px solid ${colors.border.subtle}` }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: getBrandGradient(popup.brandName),
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.2)',
            }}
            aria-hidden="true"
          >
            <span className="text-white font-bold text-base">
              {popup.brandName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Brand Name & Location */}
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold truncate"
            style={{
              color: colors.text.primary,
              fontSize: '15px',
              lineHeight: '20px',
              letterSpacing: '-0.01em',
            }}
          >
            {highlightText ? highlightText(popup.brandName) : popup.brandName}
          </h3>
          <div className="flex items-center gap-1 mt-0.5" style={{ color: colors.text.tertiary }}>
            <MapPin size={12} strokeWidth={2} aria-hidden="true" />
            <span
              className="truncate"
              style={{
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              {highlightText ? highlightText(popup.location) : popup.location}
            </span>
          </div>
        </div>
      </div>

      {/* Category Badge */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
        style={{
          background: `${categoryInfo.color}15`,
          border: `1px solid ${categoryInfo.color}30`,
        }}
        aria-label={`카테고리: ${categoryInfo.label}`}
      >
        <span
          style={{ color: categoryInfo.color, fontSize: '12px', fontWeight: 500 }}
          aria-hidden="true"
        >
          {categoryInfo.label}
        </span>
      </div>
    </div>
  );
}

export const PopupCardHeader = memo(PopupCardHeaderComponent);
export default PopupCardHeader;
