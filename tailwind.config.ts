import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * ZZIK Design System 2.0 (2026 Edition)
 * ════════════════════════════════════════════════════════════════
 * Philosophy: "Linear 절제 + iOS 26 Liquid Glass + 당근 따뜻함"
 *
 * Core Principles:
 * - Base: Dark Neutral (90%)
 * - Accent: Orange #ea8c15 (10%) - 유일한 유채색
 * - Effects: Liquid Glass (blur + subtle shadows)
 * - No Glow: 과도한 glow 효과 제거
 * ════════════════════════════════════════════════════════════════
 */

const config: Config = {
  // DES-065: darkMode는 항상 적용 (class 제거, media로 변경하지 않음)
  // 현재 프로젝트는 dark 모드 전용이므로 darkMode 설정 불필요
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    // DES-066, DES-067: 브레이크포인트 통합 (md 제거 - 미사용)
    screens: {
      sm: '640px', // 모바일
      lg: '1024px', // 데스크톱
      xl: '1280px', // 대형 화면
    },
    extend: {
      // ════════════════════════════════════════════════════════════
      // COLORS - DES-064, DES-072: design-tokens.ts 통합 및 시맨틱 네이밍
      // ════════════════════════════════════════════════════════════
      colors: {
        // === Brand Colors - Design Tokens에서 가져옴 ===
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
        ember: {
          700: '#7F1D1D',
          600: '#991B1B',
          500: '#CC4A3A', // Secondary
          400: '#DC5C4D',
        },
        spark: {
          600: '#E5C236',
          500: '#FFD93D', // Accent - Electric Yellow
          400: '#FDE047',
          300: '#FEF08A',
        },

        // DES-076: 최소한의 레거시 호환 (제거 예정)
        zzik: {
          bg: '#08090a',
          surface: '#121314',
          elevated: '#1a1c1f',
          'text-primary': '#f5f5f5',
          'text-secondary': '#a8a8a8',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#FF6B5B',
          success: '#22c55e',
          error: '#ef4444',
        },

        // Linear Design System Classes
        // Used as: text-linear-text-secondary, bg-linear-surface, border-linear-border
        linear: {
          bg: '#08090a',
          surface: '#121314',
          elevated: '#1a1c1f',
          border: 'rgba(255, 255, 255, 0.08)',
          'text-primary': '#f5f5f5',
          'text-secondary': '#a8a8a8',
          'text-tertiary': '#8a8a8a',
          'text-quaternary': '#5a5a5a',
        },
      },

      // ════════════════════════════════════════════════════════════
      // TYPOGRAPHY - Inter Variable + iOS 26 Large Typography
      // ════════════════════════════════════════════════════════════
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'var(--font-inter)',
          'var(--font-noto-sans-kr)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },

      // DES-146, DES-147, DES-148: 타이포그래피 개선
      // - 폰트 사이즈 스케일 최적화 (더 부드러운 점프)
      // - 한글 letter-spacing 최적화 (-0.003em ~ -0.02em)
      // - line-height 1.6+ 권장 적용
      fontSize: {
        // Display (Hero)
        'display-lg': ['72px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        display: ['56px', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.018em' }],
        'display-sm': ['48px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.015em' }],
        // Headings
        h1: ['40px', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.012em' }],
        h2: ['32px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.008em' }],
        h4: ['20px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '-0.005em' }],
        // Body - line-height 1.6+로 개선
        'body-lg': ['18px', { lineHeight: '1.65', fontWeight: '400', letterSpacing: '-0.003em' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '-0.003em' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '-0.002em' }],
        'body-xs': ['12px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0em' }],
        // Labels
        label: ['14px', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '-0.003em' }],
        'label-sm': ['12px', { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0em' }],
        // Micro - 10px (최소 가독성 크기, 배지/카운터용)
        micro: ['10px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        // iOS Legacy
        'title-lg': ['34px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        title: ['28px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.008em' }],
        'title-sm': ['22px', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.006em' }],
        headline: ['17px', { lineHeight: '1.45', fontWeight: '600', letterSpacing: '-0.004em' }],
        subhead: ['15px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.003em' }],
        footnote: ['13px', { lineHeight: '1.55', fontWeight: '400', letterSpacing: '-0.002em' }],
        caption: ['12px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0em' }],
      },

      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '0',
      },

      // ════════════════════════════════════════════════════════════
      // BORDER RADIUS - iOS 26 Liquid Glass Style
      // ════════════════════════════════════════════════════════════
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        full: '9999px',
        // Component specific
        card: '16px',
        button: '10px',
        input: '10px',
        badge: '6px',
        glass: '20px',
      },

      // ════════════════════════════════════════════════════════════
      // BOX SHADOWS - DES-074: Elevation 시스템 통합
      // ════════════════════════════════════════════════════════════
      boxShadow: {
        // Elevation levels (0-4)
        none: 'none',
        sm: '0 1px 2px rgba(0, 0, 0, 0.2)', // elevation 1
        md: '0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)', // elevation 2
        lg: '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)', // elevation 3
        xl: '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.25)', // elevation 4
        // Glass shadows
        glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3)',
        // Focus rings
        focus: '0 0 0 3px rgba(255, 107, 91, 0.15)',
      },

      // ════════════════════════════════════════════════════════════
      // BACKDROP BLUR - iOS 26 Liquid Glass
      // ════════════════════════════════════════════════════════════
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        glass: '24px',
        heavy: '40px',
      },

      // ════════════════════════════════════════════════════════════
      // ANIMATIONS - DES-073: design-tokens.ts와 통합
      // ════════════════════════════════════════════════════════════
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '400ms',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 2s infinite',
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      // DES-068: Spacing은 Tailwind 기본값 사용 (4px grid 호환)
      spacing: {
        '18': '4.5rem', // 72px
        '88': '22rem', // 352px
        '128': '32rem', // 512px
      },
    },
  },

  // ════════════════════════════════════════════════════════════
  // PLUGINS - Component Classes
  // ════════════════════════════════════════════════════════════
  plugins: [
    plugin(function ({ addUtilities, addComponents }) {
      // === Utility Classes ===
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.mask-fade-bottom': {
          'mask-image': 'linear-gradient(to bottom, black 90%, transparent 100%)',
        },
        // Safe Area
        '.pt-safe': { 'padding-top': 'env(safe-area-inset-top)' },
        '.pb-safe': { 'padding-bottom': 'env(safe-area-inset-bottom)' },
        '.pl-safe': { 'padding-left': 'env(safe-area-inset-left)' },
        '.pr-safe': { 'padding-right': 'env(safe-area-inset-right)' },
      });

      // === Component Classes (iOS 26 Liquid Glass) ===
      addComponents({
        // ═══════════════════════════════════════════
        // BUTTONS - Flat Style (No Gradient)
        // ═══════════════════════════════════════════
        '.btn-primary': {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '8px',
          padding: '14px 24px',
          'min-height': '48px',
          background: '#FF6B5B', // Flat solid orange
          color: '#ffffff',
          'font-size': '15px',
          'font-weight': '600',
          'border-radius': '10px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          'box-shadow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
          '&:hover': {
            background: '#FF8A7A',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
          '&:focus-visible': {
            outline: '2px solid #FF6B5B',
            'outline-offset': '2px',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
            transform: 'none',
          },
        },

        '.btn-secondary': {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '8px',
          padding: '14px 24px',
          'min-height': '48px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'rgba(255, 255, 255, 0.85)',
          'font-size': '15px',
          'font-weight': '500',
          'border-radius': '10px',
          cursor: 'pointer',
          'backdrop-filter': 'blur(12px)',
          transition: 'all 200ms ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)',
            'border-color': 'rgba(255, 255, 255, 0.15)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
          '&:focus-visible': {
            outline: '2px solid #FF6B5B',
            'outline-offset': '2px',
          },
        },

        '.btn-ghost': {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '8px',
          padding: '14px 24px',
          'min-height': '48px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          'font-size': '15px',
          'font-weight': '500',
          'border-radius': '10px',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          '&:hover': {
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.04)',
          },
          '&:focus-visible': {
            outline: '2px solid rgba(255, 255, 255, 0.3)',
            'outline-offset': '2px',
          },
        },

        // ═══════════════════════════════════════════
        // CARDS - Liquid Glass
        // ═══════════════════════════════════════════
        '.glass-card': {
          background: 'rgba(18, 19, 20, 0.75)',
          'backdrop-filter': 'blur(24px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          'border-radius': '16px',
          padding: '20px',
          'box-shadow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3)',
          willChange: 'transform, backdrop-filter',
          transform: 'translateZ(0)',
        },

        // === Adaptive Glass (Low Power Mode) ===
        '.low-power .glass-card': {
          'backdrop-filter': 'none',
          '-webkit-backdrop-filter': 'none',
          background: 'rgba(18, 19, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        },

        '.liquid-glass': {
          background: 'rgba(18, 19, 20, 0.75)',
          'backdrop-filter': 'blur(24px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          'border-radius': '20px',
          'box-shadow':
            'inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
        },

        '.surface-card': {
          background: '#121314',
          border: '1px solid #262626',
          'border-radius': '12px',
          padding: '16px',
        },

        // ═══════════════════════════════════════════
        // INPUT - Focus Ring with Orange
        // ═══════════════════════════════════════════
        '.input': {
          width: '100%',
          padding: '14px 16px',
          'min-height': '48px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          'border-radius': '10px',
          color: '#f5f5f5',
          'font-size': '16px',
          transition: 'all 200ms ease',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.35)',
          },
          '&:hover': {
            'border-color': 'rgba(255, 255, 255, 0.15)',
          },
          '&:focus': {
            outline: 'none',
            'border-color': '#FF6B5B',
            'box-shadow': '0 0 0 3px rgba(255, 107, 91, 0.15)',
          },
        },

        '.input-error': {
          'border-color': '#ef4444',
          '&:focus': {
            'border-color': '#ef4444',
            'box-shadow': '0 0 0 3px rgba(239, 68, 68, 0.15)',
          },
        },

        // ═══════════════════════════════════════════
        // BADGES - Orange Accent
        // ═══════════════════════════════════════════
        '.badge': {
          display: 'inline-flex',
          'align-items': 'center',
          padding: '4px 10px',
          background: 'rgba(255, 255, 255, 0.06)',
          color: 'rgba(255, 255, 255, 0.7)',
          'font-size': '12px',
          'font-weight': '500',
          'border-radius': '6px',
        },

        '.badge-orange': {
          background: 'rgba(255, 107, 91, 0.15)',
          color: '#FF6B5B',
        },

        '.badge-success': {
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
        },

        '.badge-error': {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
        },

        // ═══════════════════════════════════════════
        // NAVIGATION - Liquid Glass
        // ═══════════════════════════════════════════
        '.navbar': {
          position: 'sticky',
          top: '0',
          'z-index': '50',
          padding: '12px 16px',
          background: 'rgba(8, 9, 10, 0.85)',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          'border-bottom': '1px solid rgba(255, 255, 255, 0.08)',
          willChange: 'transform, backdrop-filter',
          transform: 'translateZ(0)',
        },

        '.low-power .navbar': {
          'backdrop-filter': 'none',
          '-webkit-backdrop-filter': 'none',
          background: 'rgba(8, 9, 10, 0.95)',
        },

        '.tabbar': {
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          display: 'flex',
          'justify-content': 'space-around',
          padding: '8px 0',
          'padding-bottom': 'calc(8px + env(safe-area-inset-bottom))',
          background: 'rgba(8, 9, 10, 0.85)',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          'border-top': '1px solid rgba(255, 255, 255, 0.08)',
          willChange: 'transform, backdrop-filter',
          transform: 'translateZ(0)',
        },

        '.low-power .tabbar': {
          'backdrop-filter': 'none',
          '-webkit-backdrop-filter': 'none',
          background: 'rgba(8, 9, 10, 0.95)',
        },

        '.tabbar-item': {
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          gap: '4px',
          padding: '8px 16px',
          'min-width': '64px',
          'min-height': '48px',
          color: 'rgba(255, 255, 255, 0.4)',
          'font-size': '11px',
          'font-weight': '500',
          transition: 'color 150ms ease',
          '&.active': {
            color: '#FF6B5B',
          },
          '&:focus-visible': {
            outline: '2px solid rgba(255, 107, 91, 0.5)',
            'outline-offset': '-2px',
            'border-radius': '8px',
          },
        },

        // ═══════════════════════════════════════════
        // SPINNER - Orange
        // ═══════════════════════════════════════════
        '.spinner': {
          width: '20px',
          height: '20px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          'border-top-color': '#FF6B5B',
          'border-radius': '50%',
          animation: 'spin 1s linear infinite',
        },

        '.spinner-lg': {
          width: '36px',
          height: '36px',
          'border-width': '3px',
        },

        // ═══════════════════════════════════════════
        // LIST & DIVIDER
        // ═══════════════════════════════════════════
        '.list-item': {
          display: 'flex',
          'align-items': 'center',
          padding: '12px 16px',
          background: 'transparent',
          'border-bottom': '1px solid rgba(255, 255, 255, 0.04)',
          transition: 'background 150ms ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.02)',
          },
          '&:active': {
            background: 'rgba(255, 255, 255, 0.04)',
          },
          '&:last-child': {
            'border-bottom': 'none',
          },
        },

        '.divider': {
          height: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
          margin: '16px 0',
        },
      });
    }),
  ],
};

export default config;
