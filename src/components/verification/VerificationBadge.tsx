'use client';

import { motion } from 'framer-motion';
import { Check, MapPin, Star } from 'lucide-react';
import { colors, opacity } from '@/lib/design-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * VerificationBadge - 찍음 인증 배지
 *
 * 사용처:
 * - 팝업 카드의 인증 상태 표시
 * - 프로필의 방문 기록
 * - 리뷰 작성자 인증
 */

interface VerificationBadgeProps {
  /** 인증 점수 */
  score?: number;
  /** 인증 상태 */
  status: 'verified' | 'pending' | 'none';
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 애니메이션 여부 */
  animated?: boolean;
  /** 클릭 시 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    // A11Y: Minimum 12px font size for WCAG 1.4.4 compliance
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 12,
    gap: 'gap-0.5',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-xs',
    icon: 14,
    gap: 'gap-1',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    icon: 16,
    gap: 'gap-1.5',
  },
};

export function VerificationBadge({
  score,
  status,
  size = 'md',
  animated = true,
  onClick,
  className = '',
}: VerificationBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = SIZE_CONFIG[size];

  // 상태별 스타일
  const getStatusStyle = () => {
    switch (status) {
      case 'verified':
        return {
          background:
            'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
          border: `1px solid rgba(34, 197, 94, 0.4)`,
          color: colors.success,
          icon: Check,
          label: '찍음',
        };
      case 'pending':
        return {
          background: `rgba(255, 217, 61, 0.15)`,
          border: `1px solid rgba(255, 217, 61, 0.3)`,
          color: colors.spark[500],
          icon: MapPin,
          label: '인증 대기',
        };
      default:
        return {
          background: colors.border.subtle,
          border: `1px solid ${colors.border.default}`,
          color: colors.text.secondary,
          icon: MapPin,
          label: '미인증',
        };
    }
  };

  const style = getStatusStyle();
  const Icon = style.icon;

  const badge = (
    <motion.div
      className={`
        inline-flex items-center rounded-full font-bold
        ${config.padding} ${config.text} ${config.gap}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: style.background,
        border: style.border,
        color: style.color,
      }}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `${style.label} 배지${score ? ` ${score}점` : ''}` : undefined}
      {...(animated && status === 'verified' && !prefersReducedMotion
        ? {
            animate: {
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0)',
                '0 0 0 4px rgba(34, 197, 94, 0.2)',
                '0 0 0 0 rgba(34, 197, 94, 0)',
              ],
            },
            // DES-217: 펄스 duration 1.5초로 통일
            transition: { duration: 1.5, repeat: Infinity },
          }
        : {})}
    >
      <Icon size={config.icon} />
      <span>{style.label}</span>
      {score !== undefined && status === 'verified' && (
        <span className="opacity-75">({score}점)</span>
      )}
    </motion.div>
  );

  return badge;
}

/**
 * VerificationStamp - 도장 스타일 배지 (큰 버전)
 */

interface VerificationStampProps {
  /** 인증 완료 여부 */
  verified: boolean;
  /** 팝업 이름 */
  popupName?: string;
  /** 인증 날짜 */
  verifiedAt?: Date;
  /** 크기 */
  size?: 'md' | 'lg';
}

export function VerificationStamp({
  verified,
  popupName: _popupName,
  verifiedAt,
  size = 'md',
}: VerificationStampProps) {
  const prefersReducedMotion = useReducedMotion();
  const sizeClass = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const textSize = size === 'lg' ? 'text-lg' : 'text-sm';
  const dateSize = size === 'lg' ? 'text-xs' : 'text-micro';

  if (!verified) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center`}
        style={{
          background: colors.border.subtle,
          border: `2px dashed ${colors.border.default}`,
        }}
      >
        <MapPin size={size === 'lg' ? 32 : 20} className="text-linear-text-tertiary" />
      </div>
    );
  }

  return (
    <motion.div
      className={`${sizeClass} relative`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', duration: 0.6 }}
    >
      {/* 도장 배경 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
          boxShadow: `0 4px 16px ${colors.flame[500]}66`,
        }}
      />

      {/* 도장 테두리 */}
      <div
        className="absolute inset-1 rounded-full"
        style={{
          border: `2px solid rgba(255, 255, 255, ${opacity[30]})`,
        }}
      />

      {/* 내용 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-black text-white ${textSize}`}>찍음</span>
        {verifiedAt && (
          <span className={`text-white/70 ${dateSize}`}>
            {verifiedAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* 별 장식 */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={!prefersReducedMotion ? { rotate: [0, 360] } : undefined}
        transition={
          !prefersReducedMotion ? { duration: 10, repeat: Infinity, ease: 'linear' } : undefined
        }
      >
        <Star
          size={size === 'lg' ? 20 : 14}
          fill={colors.spark[500]}
          style={{ color: colors.spark[500] }}
        />
      </motion.div>
    </motion.div>
  );
}

export default VerificationBadge;
