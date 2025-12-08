'use client';

import { m } from 'framer-motion';
import { ReactNode } from 'react';
import {
  Search,
  Inbox,
  MapPin,
  Heart,
  Bell,
  Users,
  Calendar,
  ShoppingBag,
  Flame,
  Award,
} from 'lucide-react';
import { colors, spacing, typography } from '@/lib/design-tokens';

/**
 * EmptyState - 빈 상태 UI 컴포넌트
 *
 * Nielsen's Heuristics #10: Help and Documentation
 * - 빈 상태에서 사용자에게 다음 행동을 안내
 * - 친근한 메시지와 명확한 CTA 제공
 *
 * WCAG: 충분한 색상 대비, 명확한 레이블
 */

export type EmptyStateVariant =
  | 'search' // 검색 결과 없음
  | 'list' // 목록 비어있음
  | 'map' // 지도에 팝업 없음
  | 'favorites' // 좋아요 없음
  | 'notifications' // 알림 없음
  | 'participants' // 참여자 없음
  | 'events' // 이벤트 없음
  | 'cart' // 장바구니 비어있음
  | 'funding' // 펀딩 없음
  | 'badges' // 배지 없음
  | 'custom'; // 커스텀

export interface EmptyStateProps {
  /** 빈 상태 유형 */
  variant?: EmptyStateVariant;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** CTA 버튼 텍스트 */
  actionLabel?: string;
  /** CTA 클릭 핸들러 */
  onAction?: () => void;
  /** 보조 액션 텍스트 */
  secondaryActionLabel?: string;
  /** 보조 액션 핸들러 */
  onSecondaryAction?: () => void;
  /** 커스텀 아이콘 */
  icon?: ReactNode;
  /** 사이즈 */
  size?: 'sm' | 'md' | 'lg';
  /** 추가 클래스 */
  className?: string;
  /** 애니메이션 비활성화 */
  disableAnimation?: boolean;
}

// 변형별 기본 설정
const VARIANT_CONFIG: Record<
  Exclude<EmptyStateVariant, 'custom'>,
  {
    icon: typeof Search;
    title: string;
    description: string;
    actionLabel: string;
  }
> = {
  search: {
    icon: Search,
    title: '검색 결과가 없어요',
    description: '다른 키워드로 검색해보세요',
    actionLabel: '다시 검색',
  },
  list: {
    icon: Inbox,
    title: '목록이 비어있어요',
    description: '아직 항목이 없습니다',
    actionLabel: '둘러보기',
  },
  map: {
    icon: MapPin,
    title: '근처에 팝업이 없어요',
    description: '다른 지역을 탐색해보세요',
    actionLabel: '위치 변경',
  },
  favorites: {
    icon: Heart,
    title: '저장한 팝업이 없어요',
    description: '마음에 드는 팝업을 저장해보세요',
    actionLabel: '팝업 둘러보기',
  },
  notifications: {
    icon: Bell,
    title: '새로운 알림이 없어요',
    description: '팝업에 참여하면 알림을 받을 수 있어요',
    actionLabel: '팝업 참여하기',
  },
  participants: {
    icon: Users,
    title: '아직 참여자가 없어요',
    description: '첫 번째 참여자가 되어보세요!',
    actionLabel: '참여하기',
  },
  events: {
    icon: Calendar,
    title: '예정된 이벤트가 없어요',
    description: '곧 새로운 이벤트가 열릴 예정이에요',
    actionLabel: '알림 받기',
  },
  cart: {
    icon: ShoppingBag,
    title: '장바구니가 비어있어요',
    description: '마음에 드는 상품을 담아보세요',
    actionLabel: '쇼핑하기',
  },
  funding: {
    icon: Flame,
    title: '참여한 펀딩이 없어요',
    description: '팝업 펀딩에 참여해보세요',
    actionLabel: '펀딩 참여하기',
  },
  badges: {
    icon: Award,
    title: '획득한 배지가 없어요',
    description: '팝업을 방문하고 배지를 모아보세요',
    actionLabel: '팝업 찾기',
  },
};

// 사이즈별 설정
const SIZE_CONFIG = {
  sm: {
    iconSize: 32,
    iconContainerSize: 64,
    titleSize: typography.fontSize.lg.size,
    descriptionSize: typography.fontSize.sm.size,
    gap: spacing[3],
    padding: spacing[4],
  },
  md: {
    iconSize: 40,
    iconContainerSize: 80,
    titleSize: typography.fontSize.xl.size,
    descriptionSize: typography.fontSize.base.size,
    gap: spacing[4],
    padding: spacing[6],
  },
  lg: {
    iconSize: 48,
    iconContainerSize: 96,
    titleSize: typography.fontSize['2xl'].size,
    descriptionSize: typography.fontSize.lg.size,
    gap: spacing[5],
    padding: spacing[8],
  },
};

export function EmptyState({
  variant = 'list',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  size = 'md',
  className = '',
  disableAnimation = false,
}: EmptyStateProps) {
  const config = variant !== 'custom' ? VARIANT_CONFIG[variant] : null;
  const sizeConfig = SIZE_CONFIG[size];
  const IconComponent = config?.icon || Inbox;

  const displayTitle = title || config?.title || '내용이 없어요';
  const displayDescription = description || config?.description || '';
  const displayActionLabel = actionLabel || config?.actionLabel;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.4, ease: 'backOut' as const },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.4 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3, duration: 0.3 },
    },
  };

  const MotionWrapper = disableAnimation ? 'div' : m.div;

  return (
    <MotionWrapper
      className={`flex flex-col items-center justify-center text-center ${className}`}
      style={{ padding: sizeConfig.padding }}
      {...(!disableAnimation && {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'visible',
      })}
      role="status"
      aria-live="polite"
    >
      {/* Icon Container */}
      <MotionWrapper
        className="flex items-center justify-center rounded-2xl mb-4"
        style={{
          width: sizeConfig.iconContainerSize,
          height: sizeConfig.iconContainerSize,
          background: `rgba(255, 107, 91, 0.1)`,
          border: `1px solid rgba(255, 107, 91, 0.2)`,
        }}
        {...(!disableAnimation && { variants: iconVariants })}
      >
        {icon || (
          <IconComponent
            size={sizeConfig.iconSize}
            style={{ color: colors.flame[500] }}
            aria-hidden="true"
          />
        )}
      </MotionWrapper>

      {/* Title */}
      <MotionWrapper
        {...(!disableAnimation && { variants: textVariants })}
        style={{
          fontSize: sizeConfig.titleSize,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing[2],
        }}
      >
        <h3>{displayTitle}</h3>
      </MotionWrapper>

      {/* Description */}
      {displayDescription && (
        <MotionWrapper
          {...(!disableAnimation && { variants: textVariants })}
          style={{
            fontSize: sizeConfig.descriptionSize,
            color: colors.text.secondary,
            maxWidth: '280px',
            marginBottom: sizeConfig.gap,
          }}
        >
          <p>{displayDescription}</p>
        </MotionWrapper>
      )}

      {/* Action Buttons */}
      {(displayActionLabel || secondaryActionLabel) && (
        <MotionWrapper
          className="flex flex-col sm:flex-row items-center"
          style={{ gap: spacing[3], marginTop: spacing[2] }}
          {...(!disableAnimation && { variants: buttonVariants })}
        >
          {displayActionLabel && onAction && (
            <m.button
              onClick={onAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
                boxShadow: `0 4px 16px rgba(255, 107, 91, 0.3)`,
                fontSize: typography.fontSize.sm.size,
              }}
              aria-label={displayActionLabel}
            >
              {displayActionLabel}
            </m.button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <m.button
              onClick={onSecondaryAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${colors.border.default}`,
                color: colors.text.secondary,
                fontSize: typography.fontSize.sm.size,
              }}
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </m.button>
          )}
        </MotionWrapper>
      )}
    </MotionWrapper>
  );
}

/**
 * SearchEmptyState - 검색 결과 없음 특화
 *
 * @deprecated This component is currently unused in the project.
 * Consider using EmptyState with variant="search" instead.
 * This component may be removed in a future version.
 */
export function SearchEmptyState({
  query,
  onClear,
  onRetry,
}: {
  query?: string;
  onClear?: () => void;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title={query ? `"${query}" 검색 결과가 없어요` : '검색 결과가 없어요'}
      description="다른 키워드로 검색하거나 필터를 변경해보세요"
      actionLabel="검색어 지우기"
      onAction={onClear}
      secondaryActionLabel="다시 검색"
      onSecondaryAction={onRetry}
    />
  );
}

/**
 * ParticipationEmptyState - 참여 없음 특화
 *
 * @deprecated This component is currently unused in the project.
 * Consider using EmptyState with variant="funding" instead.
 * This component may be removed in a future version.
 */
export function ParticipationEmptyState({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      variant="funding"
      title="아직 참여한 팝업이 없어요"
      description="마음에 드는 팝업을 찾아 참여해보세요. 당신의 참여가 팝업을 열어요!"
      actionLabel="팝업 둘러보기"
      onAction={onExplore}
    />
  );
}

export default EmptyState;
