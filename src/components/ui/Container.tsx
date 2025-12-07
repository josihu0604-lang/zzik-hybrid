'use client';

import { type ReactNode } from 'react';
import { spacing } from '@/lib/design-tokens';

/**
 * Container Component - ZZIK Design System (DES-087)
 *
 * Responsive container with consistent max-width and padding
 * - Supports multiple size variants
 * - Centered by default
 * - Responsive padding based on viewport
 * - Integration with 4px grid system
 *
 * Usage:
 * <Container>content</Container>
 * <Container size="lg" noPadding>content</Container>
 */

interface ContainerProps {
  children: ReactNode;
  /** Container size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Remove horizontal padding */
  noPadding?: boolean;
  /** Remove vertical padding */
  noPaddingY?: boolean;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** HTML id attribute */
  id?: string;
  /** Semantic HTML element */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside';
}

const sizeMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
} as const;

export function Container({
  children,
  size = 'lg',
  noPadding = false,
  noPaddingY = false,
  className = '',
  style,
  id,
  as: Element = 'div',
}: ContainerProps) {
  const maxWidth = sizeMap[size];
  const paddingX = noPadding ? '0' : spacing[5];
  const paddingY = noPaddingY ? '0' : spacing[4];

  return (
    <Element
      id={id}
      className={className}
      style={{
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </Element>
  );
}

/**
 * Grid Component - ZZIK Design System (DES-088)
 *
 * Responsive CSS Grid layout system
 * - Automatic responsive columns
 * - Consistent gap using 4px grid
 * - Flexible column control
 *
 * Usage:
 * <Grid cols={3} gap={4}>
 *   <div>item 1</div>
 *   <div>item 2</div>
 * </Grid>
 */

interface GridProps {
  children: ReactNode;
  /** Number of columns (responsive object or number) */
  cols?: number | { sm?: number; md?: number; lg?: number };
  /** Gap between grid items (4px units) */
  gap?: keyof typeof spacing;
  /** Row gap (overrides gap for rows) */
  rowGap?: keyof typeof spacing;
  /** Column gap (overrides gap for columns) */
  colGap?: keyof typeof spacing;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

export function Grid({
  children,
  cols = 1,
  gap = 4,
  rowGap,
  colGap,
  className = '',
  style,
}: GridProps) {
  // Generate grid template columns based on responsive object or number
  const getGridTemplateColumns = () => {
    if (typeof cols === 'number') {
      return `repeat(${cols}, 1fr)`;
    }
    // For responsive, use CSS media queries via inline styles
    // This is a simplified version - for full responsive control, use Tailwind classes
    return `repeat(${cols.sm || 1}, 1fr)`;
  };

  const gridGap = spacing[gap];
  const gridRowGap = rowGap ? spacing[rowGap] : gridGap;
  const gridColGap = colGap ? spacing[colGap] : gridGap;

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: getGridTemplateColumns(),
        gap: gridGap,
        rowGap: gridRowGap,
        columnGap: gridColGap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Flex Component - Flexbox layout helper
 *
 * Simplified flexbox component for common layouts
 *
 * Usage:
 * <Flex direction="row" align="center" justify="between" gap={3}>
 *   <div>item 1</div>
 *   <div>item 2</div>
 * </Flex>
 */

interface FlexProps {
  children: ReactNode;
  /** Flex direction */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Flex wrap */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Gap between items (4px units) */
  gap?: keyof typeof spacing;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const;

export function Flex({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  gap = 0,
  className = '',
  style,
}: FlexProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        flexWrap: wrap,
        gap: spacing[gap],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stack Component - Vertical/Horizontal spacing
 *
 * Simple spacing component for stacking elements
 *
 * Usage:
 * <Stack spacing={4}>
 *   <div>item 1</div>
 *   <div>item 2</div>
 * </Stack>
 */

interface StackProps {
  children: ReactNode;
  /** Spacing between items (4px units) */
  spacing?: keyof typeof spacing;
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

export function Stack({
  children,
  spacing: spacingValue = 4,
  direction = 'vertical',
  className = '',
  style,
}: StackProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: spacing[spacingValue],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Container;
