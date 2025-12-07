'use client';

import { ReactNode, Children, cloneElement, isValidElement, useMemo } from 'react';
import { motion } from 'framer-motion';
import { spacing, layout } from '@/lib/design-tokens';

/**
 * BentoGrid - 2026 트렌드 불규칙 그리드 레이아웃
 *
 * TikTok Shop, Instagram Shop 스타일의 다이나믹 레이아웃
 * - Hero: 풀너비 첫 번째 카드
 * - Featured: 2열 균등 배치
 * - Standard: 2열 컴팩트 배치
 *
 * Layout Pattern:
 * [Hero - Full Width]
 * [Featured 1] [Featured 2]
 * [Standard 1] [Standard 2]
 * [Standard 3] [Standard 4]
 * ...
 */

export type CardSize = 'hero' | 'featured' | 'standard' | 'compact';

interface BentoGridProps {
  children: ReactNode;
  /** 카드 간 간격 */
  gap?: keyof typeof spacing;
  /** 애니메이션 활성화 */
  animated?: boolean;
  className?: string;
}

interface BentoItemProps {
  children: ReactNode;
  size?: CardSize;
  className?: string;
  style?: React.CSSProperties;
}

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

/**
 * BentoItem - 그리드 내 개별 아이템 래퍼
 */
export function BentoItem({ children, size = 'standard', className = '', style }: BentoItemProps) {
  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'hero':
        // 풀너비 히어로 카드
        return {
          gridColumn: '1 / -1', // span all columns
          aspectRatio: '16/9',
        };
      case 'featured':
        // 2열 중 1개, 정사각형에 가까운 비율
        return {
          gridColumn: 'span 1',
          aspectRatio: '4/5',
        };
      case 'standard':
        // 2열 기본
        return {
          gridColumn: 'span 1',
          aspectRatio: '4/5',
        };
      case 'compact':
        // 작은 카드 (3열 시 사용)
        return {
          gridColumn: 'span 1',
          aspectRatio: '1/1',
        };
      default:
        return {
          gridColumn: 'span 1',
        };
    }
  }, [size]);

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      style={{
        ...sizeStyles,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * BentoGrid - 메인 그리드 컨테이너
 */
export function BentoGrid({ children, gap = 3, animated = true, className = '' }: BentoGridProps) {
  // 자동으로 첫 번째 아이템에 hero 사이즈 적용
  const processedChildren = useMemo(() => {
    const childArray = Children.toArray(children);

    return childArray.map((child, index) => {
      if (!isValidElement(child)) return child;

      // 첫 번째 아이템 = hero
      // 2-3번째 = featured
      // 나머지 = standard
      let size: CardSize = 'standard';
      if (index === 0) {
        size = 'hero';
      } else if (index <= 2) {
        size = 'featured';
      }

      // BentoItem으로 래핑되어 있으면 그대로 사용
      if (child.type === BentoItem) {
        return cloneElement(child, {
          ...(child.props as BentoItemProps),
          size: (child.props as BentoItemProps).size || size,
        });
      }

      // 자동 래핑
      return (
        <BentoItem key={index} size={size}>
          {child}
        </BentoItem>
      );
    });
  }, [children]);

  const GridComponent = animated ? motion.div : 'div';
  const gridProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'visible',
      }
    : {};

  return (
    <GridComponent
      {...gridProps}
      className={`grid grid-cols-2 ${className}`}
      style={{
        gap: spacing[gap],
        gridAutoRows: 'min-content',
      }}
    >
      {processedChildren}
    </GridComponent>
  );
}

/**
 * BentoSection - 섹션 구분용 컴포넌트
 */
interface BentoSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function BentoSection({ title, subtitle, children, className = '' }: BentoSectionProps) {
  return (
    <section className={className}>
      {(title || subtitle) && (
        <div
          className="mb-4"
          style={{
            paddingLeft: layout.page.padding,
            paddingRight: layout.page.padding,
          }}
        >
          {title && (
            <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default BentoGrid;
