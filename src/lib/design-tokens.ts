/**
 * ZZIK Design Tokens - Brand Identity System
 *
 * Brand Story: "찍다" = 도장(Stamp) + 불꽃(Flame)
 * Visual Language: 참여 = 도장 찍기, 진행률 = 열기, 목표 달성 = 봉인 해제
 *
 * Professional Design System with:
 * - 4px spacing grid
 * - Temperature-based color system
 * - Brand-differentiated color palette
 * - Typography scale
 * - Elevation system
 */

// ============================================================================
// SPACING SYSTEM (4px Grid) - DES-068 통합
// ============================================================================

/**
 * Spacing System - 4px Grid
 *
 * Philosophy: All spacing follows a 4px base unit for visual consistency
 *
 * Usage examples:
 * ```tsx
 * // With Tailwind (preferred)
 * <div className="p-4 gap-3">  // 16px padding, 12px gap
 *
 * // With inline styles
 * <div style={{ padding: spacing[4], gap: spacing[3] }}>
 *
 * // For custom spacing
 * margin: spacing[6]  // 24px
 * ```
 *
 * Common patterns:
 * - Tight spacing: 1-2 (4-8px) - Icon gaps, inline elements
 * - Default spacing: 3-4 (12-16px) - Card padding, button padding
 * - Generous spacing: 5-6 (20-24px) - Section gaps, modal padding
 * - Large spacing: 8-12 (32-48px) - Page sections, hero spacing
 */
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px', // 2px - Minimal spacing
  1: '4px', // 4px - Base unit
  1.5: '6px', // 6px - Between 4px and 8px
  2: '8px', // 8px - Tight spacing
  2.5: '10px', // 10px - Between tight and default
  3: '12px', // 12px - Default small
  3.5: '14px', // 14px - Between small and default
  4: '16px', // 16px - Default spacing
  5: '20px', // 20px - Comfortable spacing
  6: '24px', // 24px - Generous spacing
  7: '28px', // 28px
  8: '32px', // 32px - Section spacing
  9: '36px', // 36px
  10: '40px', // 40px
  11: '44px', // 44px
  12: '48px', // 48px - Large section spacing
  14: '56px', // 56px
  16: '64px', // 64px
  20: '80px', // 80px - Hero spacing
  24: '96px', // 96px - Extra large spacing
} as const;

// ============================================================================
// LAYOUT SYSTEM - DES-163~170: 레이아웃 일관성 개선
// ============================================================================

export const layout = {
  // 컨테이너 최대 너비
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  // DES-163: 섹션 간격 일관성 통일
  section: {
    gap: spacing[6], // 24px - 섹션 간 기본 간격
    gapLarge: spacing[8], // 32px - 섹션 간 큰 간격
    padding: spacing[4], // 16px - 섹션 내부 패딩
  },
  // DES-164: 카드 간격 일관성 통일
  card: {
    gap: spacing[4], // 16px - 카드 간 기본 간격
    gapCompact: spacing[3], // 12px - 카드 간 좁은 간격
    padding: spacing[5], // 20px - 카드 내부 패딩
  },
  // 페이지 패딩 (모바일 최적화)
  page: {
    padding: spacing[4], // 16px
    paddingLarge: spacing[6], // 24px
  },
  // DES-165: 헤더 높이 표준화
  header: {
    height: '56px', // 고정 높이
    heightMobile: '48px', // 모바일 높이
    padding: spacing[4], // 16px
  },
  // 하단 네비게이션
  bottomNav: {
    height: '64px',
    padding: spacing[2], // 8px
    safeAreaBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  // DES-168: 모달 크기 일관성
  modal: {
    maxWidthSm: '448px', // 28rem
    maxWidthMd: '640px', // 40rem
    maxWidthLg: '768px', // 48rem
    maxWidthFull: '1024px', // 64rem
    padding: spacing[6], // 24px
  },
} as const;

// ============================================================================
// COLOR PALETTE - Brand Identity
// ============================================================================

export const colors = {
  // Base (Deep Space)
  space: {
    950: '#08090a',
    900: '#0d0e0f',
    850: '#121314',
    800: '#1a1c1f',
    750: '#222426',
    700: '#2a2d30',
    600: '#3a3d41',
    500: '#4a4d51',
    400: '#6b6e73',
    300: '#8c8f94',
    200: '#adb0b5',
    100: '#ced1d6',
    50: '#eef0f2',
  },

  /**
   * Brand Primary: Flame Coral
   *
   * Why this color:
   * - "참여의 열기" = Fire, Passion, Energy
   * - Differentiated from 당근마켓 (#FF6F0F) - more red, more intense
   * - FOMO-inducing warmth
   * - Represents the "heat" of collective participation
   */
  flame: {
    950: '#4A1515',
    900: '#7F1D1D',
    800: '#991B1B',
    700: '#B91C1C',
    600: '#DC2626',
    500: '#FF6B5B', // Primary - Flame Coral
    400: '#FF8A7A',
    300: '#FCA5A5',
    200: '#FECACA',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },

  /**
   * Brand Secondary: Deep Ember
   * Darker version for depth and contrast
   */
  ember: {
    700: '#7F1D1D',
    600: '#991B1B',
    500: '#CC4A3A', // Secondary
    400: '#DC5C4D',
  },

  /**
   * Brand Accent: Electric Yellow
   * Success, celebration, premium (Leader)
   * Represents the bright center of flame
   */
  spark: {
    600: '#E5C236', // Deep yellow (darker)
    500: '#FFD93D', // Accent - Electric Yellow
    400: '#FDE047',
    300: '#FEF08A',
  },

  /**
   * @deprecated Use `flame` instead. Legacy orange kept for backward compatibility.
   * This will be removed in a future version.
   */
  orange: {
    950: '#451a03',
    900: '#7c2d12',
    800: '#9a3412',
    700: '#c2410c',
    600: '#ea580c',
    500: '#FF6B5B', // Updated to Flame Coral
    400: '#FF8A7A',
    300: '#FCA5A5',
    200: '#FECACA',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },

  // Temperature System - Heat Wave
  temperature: {
    cold: {
      bg: 'rgba(255, 107, 91, 0.08)',
      border: 'rgba(255, 107, 91, 0.15)',
      text: '#FF8A7A',
      glow: 'rgba(255, 107, 91, 0.1)',
    },
    warm: {
      bg: 'rgba(255, 107, 91, 0.15)',
      border: 'rgba(255, 107, 91, 0.25)',
      text: '#FF6B5B',
      glow: 'rgba(255, 107, 91, 0.25)',
    },
    hot: {
      bg: 'rgba(204, 74, 58, 0.2)',
      border: 'rgba(204, 74, 58, 0.4)',
      text: '#CC4A3A',
      glow: 'rgba(255, 107, 91, 0.5)',
    },
    done: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.3)',
    },
  },

  // Status
  success: '#22c55e',
  successLight: '#4ade80', // Lighter success for gradients
  successLighter: '#86efac', // Even lighter for gradient end
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Premium
  gold: '#FFD93D', // Leader premium - Electric Yellow

  // Text - WCAG AA 4.5:1 이상 대비 확보
  text: {
    primary: '#f5f5f5', // 18.5:1 대비
    secondary: '#b8b8b8', // 7.8:1 대비 (AA 충족)
    tertiary: '#9a9a9a', // 5.5:1 대비 (기존 #8a8a8a → 개선)
    muted: '#6a6a6a', // 3.5:1 대비 (기존 #5a5a5a → 개선, 대형 텍스트용)
    inverse: '#08090a',
    // A11Y: Flame 색상 텍스트용 접근성 대비 확보 버전
    flameAccessible: '#E85A4A', // flame[500]보다 어두움, 6.2:1 대비
    sparkAccessible: '#D4B82F', // spark[500]보다 어두움, 5.8:1 대비
  },

  // Borders - DES-078: 3개로 축소
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)', // 기본 보더
    default: 'rgba(255, 255, 255, 0.12)', // 강조 보더
    emphasis: 'rgba(255, 255, 255, 0.20)', // 인터랙티브 보더
  },

  // Focus ring - DES-133: 토큰화
  focus: {
    ring: '#FF6B5B', // Primary focus ring color
    ringOpacity: 'rgba(255, 107, 91, 0.15)', // Focus ring with opacity
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography System
 *
 * Usage examples:
 * ```tsx
 * // Using fontSize token
 * <p style={{ fontSize: typography.fontSize.base.size, lineHeight: typography.fontSize.base.lineHeight }}>
 *   Body text
 * </p>
 *
 * // Badge/label text (11px)
 * <span style={{ fontSize: typography.fontSize.xs.size }}>Badge</span>
 *
 * // Small text (13px)
 * <p style={{ fontSize: typography.fontSize.sm.size }}>Caption</p>
 *
 * // Body text (15px)
 * <p style={{ fontSize: typography.fontSize.base.size }}>Main content</p>
 *
 * // Large text (17px)
 * <h4 style={{ fontSize: typography.fontSize.lg.size }}>Subheading</h4>
 *
 * // Display text (20-48px)
 * <h1 style={{ fontSize: typography.fontSize['3xl'].size }}>Hero title</h1>
 * ```
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    korean: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Font sizes (with line-height and letter-spacing)
  fontSize: {
    /** 10px - Micro text, counters, timestamps */
    micro: { size: '10px', lineHeight: '14px', letterSpacing: '0.01em' },
    /** 11px - Badges, labels, counts */
    xs: { size: '11px', lineHeight: '16px', letterSpacing: '0.01em' },
    /** 13px - Captions, metadata, helper text */
    sm: { size: '13px', lineHeight: '20px', letterSpacing: '0' },
    /** 15px - Body text, descriptions */
    base: { size: '15px', lineHeight: '24px', letterSpacing: '-0.01em' },
    /** 17px - Large body, subheadings */
    lg: { size: '17px', lineHeight: '26px', letterSpacing: '-0.015em' },
    /** 20px - Card titles, section headers */
    xl: { size: '20px', lineHeight: '28px', letterSpacing: '-0.02em' },
    /** 24px - Page titles */
    '2xl': { size: '24px', lineHeight: '32px', letterSpacing: '-0.025em' },
    /** 30px - Hero subheadings */
    '3xl': { size: '30px', lineHeight: '38px', letterSpacing: '-0.03em' },
    /** 36px - Hero titles */
    '4xl': { size: '36px', lineHeight: '44px', letterSpacing: '-0.035em' },
    /** 48px - Display text */
    '5xl': { size: '48px', lineHeight: '56px', letterSpacing: '-0.04em' },
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

// ============================================================================
// ELEVATION SYSTEM - DES-074
// ============================================================================

export const elevation = {
  // 기본 그림자 (Depth levels)
  0: 'none',
  1: '0 1px 2px rgba(0, 0, 0, 0.2)',
  2: '0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
  3: '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)',
  4: '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.25)',
} as const;

// ============================================================================
// SHADOWS & EFFECTS - DES-072: 시맨틱 이름으로 변경
// ============================================================================

export const shadows = {
  // Elevation shadows (시맨틱 네이밍)
  none: elevation[0],
  sm: elevation[1],
  md: elevation[2],
  lg: elevation[3],
  xl: elevation[4],

  // Glow effects (시맨틱 네이밍)
  glow: {
    primary: '0 0 20px rgba(255, 107, 91, 0.4), 0 0 40px rgba(255, 107, 91, 0.2)', // Flame glow
    primaryIntense: '0 0 30px rgba(255, 107, 91, 0.6), 0 0 60px rgba(204, 74, 58, 0.3)',
    secondary: '0 0 30px rgba(204, 74, 58, 0.25)', // Ember glow
    accent: '0 0 20px rgba(255, 217, 61, 0.4), 0 0 40px rgba(255, 217, 61, 0.2)', // Spark glow
    success: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',

    /**
     * @deprecated Use `primary`, `secondary`, `accent`, or `success` instead.
     * Legacy named glows for backward compatibility.
     */
    flame: '0 0 20px rgba(255, 107, 91, 0.4), 0 0 40px rgba(255, 107, 91, 0.2)',
    /** @deprecated Use `primary` instead */
    orange: '0 0 20px rgba(255, 107, 91, 0.4), 0 0 40px rgba(255, 107, 91, 0.2)',
    /** @deprecated Use `success` instead */
    green: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
    /** @deprecated Use `accent` instead */
    gold: '0 0 20px rgba(255, 217, 61, 0.4), 0 0 40px rgba(255, 217, 61, 0.2)',
  },

  // Glass inner shadow
  glassInner: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
} as const;

// ============================================================================
// RADII
// ============================================================================

/**
 * Border Radius System
 *
 * Usage examples:
 * ```tsx
 * // Badges, pills
 * borderRadius: radii.full  // Fully rounded
 *
 * // Buttons, inputs
 * borderRadius: radii.md   // 10px - Default interactive elements
 *
 * // Cards, modals
 * borderRadius: radii.lg   // 14px - Containers
 * borderRadius: radii.xl   // 20px - Large containers
 * ```
 */
export const radii = {
  none: '0',
  sm: '6px', // Small elements
  md: '10px', // Buttons, inputs
  lg: '14px', // Cards
  xl: '20px', // Large cards, modals
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px', // Pills, badges, avatars
} as const;

// ============================================================================
// LIQUID GLASS SYSTEM - DES-077: 2개 티어로 축소
// ============================================================================

/**
 * Apple Liquid Glass Design Language
 * - Physically accurate lensing and refraction
 * - Multi-layer depth with specular highlights
 * - Responds to light, motion, and environment
 *
 * Implementation notes:
 * - blur(24px) + saturate(180%) is the standard iOS 26 formula
 * - Inset shadows create depth illusion
 * - Top highlight gradient simulates glass reflection
 *
 * DES-077: frosted (오버레이), standard (카드) 2개만 유지
 */

export const liquidGlass = {
  // Frosted - Light glass for overlays, dropdowns
  frosted: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    border: `1px solid ${colors.border.subtle}`,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
  },

  // Standard - Primary glass for cards, modals
  standard: {
    background: 'rgba(18, 19, 20, 0.75)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid ${colors.border.default}`,
    boxShadow:
      'inset 0 0 20px rgba(255, 255, 255, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3)',
  },

  // Highlight gradient for glass-like reflection
  highlight:
    'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',

  // Edge highlight for buttons
  edgeHighlight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
} as const;

/**
 * @deprecated Use `liquidGlass` instead.
 * Legacy alias for backward compatibility. Will be removed in a future version.
 *
 * Migration:
 * - `glass.light` → `liquidGlass.frosted`
 * - `glass.medium` → `liquidGlass.standard`
 * - `glass.heavy` → `liquidGlass.standard`
 */
export const glass = {
  light: liquidGlass.frosted,
  medium: liquidGlass.standard,
  heavy: liquidGlass.standard, // deep 제거됨, standard로 매핑
} as const;

// Helper to generate complete glass style object
export function getGlassStyle(variant: 'frosted' | 'standard' = 'standard') {
  return liquidGlass[variant];
}

// ============================================================================
// ANIMATIONS - DES-073: 애니메이션 토큰 분리
// ============================================================================

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Preset transitions
  transition: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
    spring: '400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Keyframe animations
  keyframes: {
    fadeIn: 'fade-in 0.3s ease-out',
    slideUp: 'slide-up 0.3s ease-out',
    slideDown: 'slide-down 0.3s ease-out',
    scaleIn: 'scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    shimmer: 'shimmer 2s infinite',
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s ease-in-out infinite',
    float: 'float 3s ease-in-out infinite',
  },
} as const;

/**
 * @deprecated Use `animations.transition` instead.
 * Legacy export for backward compatibility. Will be removed in a future version.
 */
export const transitions = animations.transition;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

/**
 * Z-index Scale - Layering System
 *
 * Purpose: Maintain consistent stacking order across the application
 * Usage: import { zIndex } from '@/lib/design-tokens'
 *
 * Layers:
 * - base: Default page content (1)
 * - dropdown: Dropdown menus, tooltips (10)
 * - sticky: Sticky headers, sidebars (20)
 * - fixed: Fixed navigation bars (30)
 * - modalBackdrop: Modal overlay backgrounds (40)
 * - modal: Modal dialogs (50)
 * - popover: Popovers, toasts (60)
 * - tooltip: Tooltips (70)
 * - notification: System notifications (80)
 * - max: Highest layer (emergency use) (9999)
 *
 * Usage examples:
 * ```tsx
 * // Fixed header
 * <header style={{ zIndex: zIndex.fixed }}>
 *
 * // Modal overlay
 * <div style={{ zIndex: zIndex.modalBackdrop }}>
 * <div style={{ zIndex: zIndex.modal }}>Modal content</div>
 *
 * // Toast notification
 * <div style={{ zIndex: zIndex.notification }}>
 * ```
 */
export const zIndex = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  max: 9999,
} as const;

// ============================================================================
// OPACITY SCALE - DES-119: 투명도 표준화
// ============================================================================

/**
 * Opacity Scale - Transparency System
 *
 * Purpose: Standardize opacity values across the application
 * Guidelines:
 * - Use 0.05 steps for subtle differences (5, 10, 15, 20, 25)
 * - Use 0.10 steps for major differences (30, 40, 50, 60, 70, 80, 90)
 * - Prefer established values over arbitrary decimals
 *
 * Usage examples:
 * ```tsx
 * // With rgba colors
 * background: `rgba(255, 107, 91, ${opacity[10]})` // 0.1
 *
 * // With CSS opacity
 * <div style={{ opacity: opacity[80] }}>Content</div>
 *
 * // Inline style
 * style={{ color: colors.flame[500], opacity: opacity[60] }}
 * ```
 *
 * Common use cases:
 * - 5-10: Subtle backgrounds, hover states
 * - 15-25: Borders, dividers
 * - 30-40: Disabled states, placeholder text
 * - 50-60: Secondary content
 * - 70-80: Primary content with reduced emphasis
 * - 90-100: Full opacity
 */
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  15: 0.15,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  85: 0.85,
  90: 0.9,
  92: 0.92,
  95: 0.95,
  100: 1,
} as const;

// ============================================================================
// GRADIENTS - DES-120: 그라디언트 정의 통합
// ============================================================================

/**
 * Gradient Definitions
 *
 * Purpose: Standardize gradient usage across the application
 * Usage: import { gradients } from '@/lib/design-tokens'
 */
export const gradients = {
  // Brand gradients
  flame: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
  flameVertical: `linear-gradient(180deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
  spark: `linear-gradient(135deg, ${colors.spark[500]} 0%, ${colors.spark[600]} 100%)`,

  // Success gradients
  success: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
  successSolid: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',

  // Temperature gradients (for progress/heat)
  cold: 'linear-gradient(135deg, rgba(255, 107, 91, 0.08) 0%, rgba(255, 107, 91, 0.04) 100%)',
  warm: 'linear-gradient(135deg, rgba(255, 107, 91, 0.15) 0%, rgba(255, 107, 91, 0.08) 100%)',
  hot: 'linear-gradient(135deg, rgba(204, 74, 58, 0.2) 0%, rgba(255, 107, 91, 0.15) 100%)',

  // Background gradients (for onboarding/hero)
  flameFade: `linear-gradient(180deg, rgba(255, 107, 91, 0.15) 0%, ${colors.space[950]} 50%)`,
  sparkFade: `linear-gradient(180deg, rgba(255, 217, 61, 0.1) 0%, ${colors.space[950]} 50%)`,
  successFade: `linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, ${colors.space[950]} 50%)`,
  spaceFade: `linear-gradient(180deg, ${colors.space[850]} 0%, ${colors.space[950]} 100%)`,

  // Glass/Modal backgrounds
  modal: `linear-gradient(180deg, ${colors.space[850]} 0%, ${colors.space[950]} 100%)`,
} as const;

// ============================================================================
// IMAGE PLACEHOLDERS
// ============================================================================

// Blur placeholder for images (Base64 encoded tiny image)
export const BLUR_PLACEHOLDERS = {
  dark: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBQYSIRMxQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAMBAQEAAAAAAAAAAAAAAAABAhEhMf/aAAwDAQACEQMRAD8AzLadxNpl1LcW8bTJIhQrJIzgA+x9/a2m27jDaWoiBPJOXD+iaKK5X0X6K7P/2Q==',
  light:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIRAAAgEEAgMBAQAAAAAAAAAAAQIAAwQFEQYhEjFBUWH/xAAVAQEBAAAAAAAAAAAAAAAAAAACBP/EABgRAAMBAQAAAAAAAAAAAAAAAAABAgMR/9oADAMBEQCEPwC+Y3j2Qx1a6vlLSuKvIG3ZQdEf1/V1pSlJI0P/2Q==',
} as const;

// ============================================================================
// CATEGORY ICONS & COLORS
// ============================================================================

// Category colors - ZZIK brand-aligned palette
export const categoryColors = {
  all: colors.flame[500], // Flame Coral - Primary
  fashion: colors.spark[400], // Electric Yellow variant
  beauty: colors.ember[400], // Deep Ember variant
  kpop: colors.flame[400], // Flame variant
  food: colors.flame[600], // Warm flame
  cafe: colors.spark[500], // Electric Yellow
  lifestyle: colors.ember[500], // Deep Ember
  culture: colors.flame[300], // Light flame
  tech: colors.spark[600], // Deep yellow
} as const;

export const categories = {
  all: { label: '전체', icon: 'Flame', color: categoryColors.all },
  fashion: { label: '패션', icon: 'Shirt', color: categoryColors.fashion },
  beauty: { label: '뷰티', icon: 'Sparkles', color: categoryColors.beauty },
  kpop: { label: 'K-Pop', icon: 'Music', color: categoryColors.kpop },
  food: { label: '맛집', icon: 'UtensilsCrossed', color: categoryColors.food },
  cafe: { label: '카페', icon: 'Coffee', color: categoryColors.cafe },
  lifestyle: { label: '라이프', icon: 'Heart', color: categoryColors.lifestyle },
  culture: { label: '문화', icon: 'Palette', color: categoryColors.culture },
  tech: { label: '테크', icon: 'Smartphone', color: categoryColors.tech },
} as const;

// ============================================================================
// THEME SYSTEM - DES-075: 기본 구조 추가
// ============================================================================

export const theme = {
  // 현재는 Dark 모드만 지원
  mode: 'dark' as const,

  // 기본 색상 (시맨틱)
  semantic: {
    background: {
      primary: colors.space[950], // #08090a
      secondary: colors.space[850], // #121314
      tertiary: colors.space[800], // #1a1c1f
    },
    text: {
      primary: colors.text.primary, // #f5f5f5
      secondary: colors.text.secondary, // #a8a8a8
      tertiary: colors.text.tertiary, // #7a7a7a
      muted: colors.text.muted, // #5a5a5a
    },
    border: colors.border,
    interactive: {
      primary: colors.flame[500], // Flame Coral
      primaryHover: colors.flame[400],
      secondary: colors.ember[500], // Deep Ember
      accent: colors.spark[500], // Electric Yellow
    },
    status: {
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
    },
  },
} as const;

// ============================================================================
// BRAND IDENTITY
// ============================================================================

export const brand = {
  name: 'ZZIK',
  tagline: '참여하면 열린다',
  taglineEn: 'Join to Open',

  // Core metaphors
  metaphors: {
    participation: 'stamp', // 참여 = 도장 찍기
    progress: 'heat', // 진행률 = 열기/온도
    completion: 'sealBreak', // 목표 달성 = 봉인 해제
  },

  // Primary colors (시맨틱)
  primary: colors.flame[500], // Flame Coral
  secondary: colors.ember[500], // Deep Ember
  accent: colors.spark[500], // Electric Yellow
} as const;

// ============================================================================
// TOUCH TARGET & ACCESSIBILITY - A11Y 필수 상수
// ============================================================================

/**
 * Touch Target 최소 크기 (WCAG 2.5.5 / Apple HIG / Material Design)
 *
 * - Apple HIG: 최소 44x44pt
 * - Material Design: 최소 48x48dp
 * - WCAG 2.5.5: 최소 24x24 CSS px (AA), 44x44 (AAA)
 *
 * 사용 예:
 * ```tsx
 * <button style={{ minWidth: touchTarget.min, minHeight: touchTarget.min }}>
 *   클릭
 * </button>
 * ```
 */
export const touchTarget = {
  /** 최소 터치 영역 - WCAG AA (44px) */
  min: '44px',
  /** 권장 터치 영역 - Material Design (48px) */
  comfortable: '48px',
  /** 넉넉한 터치 영역 - FAB, 주요 CTA (56px) */
  large: '56px',
  /** 숫자 값 (계산용) */
  minPx: 44,
  comfortablePx: 48,
  largePx: 56,
} as const;

/**
 * 접근성 포커스 스타일
 * focus-visible 상태에서 적용할 스타일
 */
export const focusStyles = {
  /** 기본 포커스 링 */
  ring: `0 0 0 3px rgba(255, 107, 91, 0.4)`,
  /** 고대비 포커스 링 (접근성 모드) */
  ringHighContrast: `0 0 0 3px ${colors.flame[500]}`,
  /** 오프셋 */
  offset: '2px',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTemperatureStyles(progress: number) {
  if (progress >= 100) return colors.temperature.done;
  if (progress >= 70) return colors.temperature.hot;
  if (progress >= 30) return colors.temperature.warm;
  return colors.temperature.cold;
}

export function getTemperatureName(progress: number): 'cold' | 'warm' | 'hot' | 'done' {
  if (progress >= 100) return 'done';
  if (progress >= 70) return 'hot';
  if (progress >= 30) return 'warm';
  return 'cold';
}

/**
 * Helper function to create rgba color with opacity
 * @param hexColor - Hex color (e.g., '#FF6B5B')
 * @param opacityValue - Opacity value (0-100) or decimal (0-1)
 * @returns rgba string
 */
export function withOpacity(hexColor: string, opacityValue: number): string {
  // Handle opacity as percentage (0-100) or decimal (0-1)
  const alpha = opacityValue > 1 ? opacityValue / 100 : opacityValue;

  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Commonly used rgba colors with design tokens
 */
export const rgba = {
  // Flame colors
  flame: {
    5: withOpacity(colors.flame[500], opacity[5]),
    10: withOpacity(colors.flame[500], opacity[10]),
    15: withOpacity(colors.flame[500], opacity[15]),
    20: withOpacity(colors.flame[500], opacity[20]),
    30: withOpacity(colors.flame[500], opacity[30]),
    40: withOpacity(colors.flame[500], opacity[40]),
    90: withOpacity(colors.flame[500], opacity[90]),
  },
  // Spark colors
  spark: {
    15: withOpacity(colors.spark[500], opacity[15]),
    20: withOpacity(colors.spark[500], opacity[20]),
  },
  // Success colors
  success: {
    10: withOpacity(colors.success, opacity[10]),
    15: withOpacity(colors.success, opacity[15]),
    20: withOpacity(colors.success, opacity[20]),
    30: withOpacity(colors.success, opacity[30]),
  },
  // Space (background) colors - expanded for glass effects
  space: {
    75: withOpacity(colors.space[850], opacity[75]),
    80: withOpacity(colors.space[850], opacity[80]),
    85: withOpacity(colors.space[950], opacity[85]),
    90: withOpacity(colors.space[950], opacity[90]),
    92: withOpacity(colors.space[950], opacity[92]),
    95: withOpacity(colors.space[850], opacity[95]),
    98: withOpacity(colors.space[950], 0.98),
  },
  // Space 850 variant for specific components
  space850: {
    75: withOpacity(colors.space[850], opacity[75]),
    80: withOpacity(colors.space[850], opacity[80]),
    90: withOpacity(colors.space[850], opacity[90]),
    95: withOpacity(colors.space[850], opacity[95]),
    98: withOpacity(colors.space[850], 0.98),
  },
  // White colors (expanded for full coverage)
  white: {
    3: withOpacity('#FFFFFF', 0.03),
    4: withOpacity('#FFFFFF', 0.04),
    5: withOpacity('#FFFFFF', opacity[5]),
    6: withOpacity('#FFFFFF', 0.06),
    8: withOpacity('#FFFFFF', 0.08),
    10: withOpacity('#FFFFFF', opacity[10]),
    12: withOpacity('#FFFFFF', 0.12),
    15: withOpacity('#FFFFFF', opacity[15]),
    20: withOpacity('#FFFFFF', opacity[20]),
    25: withOpacity('#FFFFFF', opacity[25]),
    30: withOpacity('#FFFFFF', opacity[30]),
    40: withOpacity('#FFFFFF', opacity[40]),
    50: withOpacity('#FFFFFF', opacity[50]),
    60: withOpacity('#FFFFFF', opacity[60]),
  },
  // Black colors (expanded)
  black: {
    20: withOpacity('#000000', opacity[20]),
    25: withOpacity('#000000', opacity[25]),
    30: withOpacity('#000000', opacity[30]),
    40: withOpacity('#000000', opacity[40]),
    50: withOpacity('#000000', opacity[50]),
    60: withOpacity('#000000', opacity[60]),
    70: withOpacity('#000000', opacity[70]),
    80: withOpacity('#000000', opacity[80]),
  },
  // Error colors
  error: {
    10: withOpacity(colors.error, opacity[10]),
    15: withOpacity(colors.error, opacity[15]),
    20: withOpacity(colors.error, opacity[20]),
    95: withOpacity(colors.error, opacity[95]),
  },
} as const;

// ============================================================================
// CSS VARIABLES GENERATOR
// ============================================================================

export function generateCSSVariables(): string {
  return `
    --zzik-space-50: ${colors.space[50]};
    --zzik-space-100: ${colors.space[100]};
    --zzik-space-200: ${colors.space[200]};
    --zzik-space-300: ${colors.space[300]};
    --zzik-space-400: ${colors.space[400]};
    --zzik-space-500: ${colors.space[500]};
    --zzik-space-600: ${colors.space[600]};
    --zzik-space-700: ${colors.space[700]};
    --zzik-space-750: ${colors.space[750]};
    --zzik-space-800: ${colors.space[800]};
    --zzik-space-850: ${colors.space[850]};
    --zzik-space-900: ${colors.space[900]};
    --zzik-space-950: ${colors.space[950]};

    --zzik-flame-50: ${colors.flame[50]};
    --zzik-flame-100: ${colors.flame[100]};
    --zzik-flame-200: ${colors.flame[200]};
    --zzik-flame-300: ${colors.flame[300]};
    --zzik-flame-400: ${colors.flame[400]};
    --zzik-flame-500: ${colors.flame[500]};
    --zzik-flame-600: ${colors.flame[600]};
    --zzik-flame-700: ${colors.flame[700]};
    --zzik-flame-800: ${colors.flame[800]};
    --zzik-flame-900: ${colors.flame[900]};
    --zzik-flame-950: ${colors.flame[950]};

    --zzik-primary: ${brand.primary};
    --zzik-secondary: ${brand.secondary};
    --zzik-accent: ${brand.accent};
  `;
}
