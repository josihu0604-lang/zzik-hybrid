'use client';

import { type ReactNode } from 'react';
import { typography, colors } from '@/lib/design-tokens';

/**
 * Typography Component - ZZIK Design System (DES-080)
 *
 * Type-safe Typography atom component
 * - Standardized text styles
 * - Semantic HTML elements
 * - Design token integration
 * - Accessibility support
 *
 * Usage:
 * <Typography variant="h1">Title</Typography>
 * <Typography variant="body" color="secondary">Text</Typography>
 */

// ============================================================================
// TYPES
// ============================================================================

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'label';

type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'inverse'
  | 'flame'
  | 'success'
  | 'warning'
  | 'error';

type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: TypographyAlign;
  as?: TypographyElement;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  id?: string;
  'aria-label'?: string;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles: Record<
  TypographyVariant,
  {
    element: TypographyElement;
    fontSize: string;
    lineHeight: string;
    fontWeight: number;
    letterSpacing: string;
  }
> = {
  h1: {
    element: 'h1',
    fontSize: typography.fontSize['5xl'].size,
    lineHeight: typography.fontSize['5xl'].lineHeight,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: typography.fontSize['5xl'].letterSpacing,
  },
  h2: {
    element: 'h2',
    fontSize: typography.fontSize['4xl'].size,
    lineHeight: typography.fontSize['4xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.fontSize['4xl'].letterSpacing,
  },
  h3: {
    element: 'h3',
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.fontSize['3xl'].letterSpacing,
  },
  h4: {
    element: 'h4',
    fontSize: typography.fontSize['2xl'].size,
    lineHeight: typography.fontSize['2xl'].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize['2xl'].letterSpacing,
  },
  h5: {
    element: 'h5',
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.fontSize.xl.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize.xl.letterSpacing,
  },
  h6: {
    element: 'h6',
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize.lg.letterSpacing,
  },
  subtitle1: {
    element: 'p',
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.fontSize.lg.letterSpacing,
  },
  subtitle2: {
    element: 'p',
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.fontSize.base.letterSpacing,
  },
  body: {
    element: 'p',
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.fontSize.base.letterSpacing,
  },
  bodyLarge: {
    element: 'p',
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.fontSize.lg.letterSpacing,
  },
  bodySmall: {
    element: 'p',
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.fontSize.sm.letterSpacing,
  },
  caption: {
    element: 'span',
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.fontSize.sm.letterSpacing,
  },
  overline: {
    element: 'span',
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: '0.08em',
  },
  label: {
    element: 'label',
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.fontSize.sm.letterSpacing,
  },
};

// ============================================================================
// COLOR MAP
// ============================================================================

const colorMap: Record<TypographyColor, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  muted: colors.text.muted,
  inverse: colors.text.inverse,
  flame: colors.flame[500],
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Typography({
  variant = 'body',
  color = 'primary',
  align = 'left',
  as,
  className = '',
  children,
  style,
  id,
  'aria-label': ariaLabel,
}: TypographyProps) {
  const styles = variantStyles[variant];
  const Element = as || styles.element;

  return (
    <Element
      id={id}
      aria-label={ariaLabel}
      className={className}
      style={{
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        fontWeight: styles.fontWeight,
        letterSpacing: styles.letterSpacing,
        color: colorMap[color],
        textAlign: align,
        fontFamily: typography.fontFamily.sans,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Element>
  );
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export function Heading1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" {...props} />;
}

export function Heading2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function Heading3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function Heading4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h4" {...props} />;
}

export function Body(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props} />;
}

export function BodyLarge(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="bodyLarge" {...props} />;
}

export function BodySmall(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="bodySmall" {...props} />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props} />;
}

export function Label(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" {...props} />;
}

export default Typography;
