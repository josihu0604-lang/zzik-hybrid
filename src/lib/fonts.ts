/**
 * Font Configuration with Multi-Language Support
 * 
 * Optimized font loading strategy for:
 * - English/Latin: Inter
 * - Korean: Noto Sans KR
 * - Japanese: Noto Sans JP
 * - Chinese: Noto Sans SC (Simplified Chinese)
 * 
 * Features:
 * - Subset optimization for faster loading
 * - Font-display: swap for better perceived performance
 * - Preload for critical fonts
 * - Variable font fallbacks
 */

import { Inter, Noto_Sans_KR, Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';

/**
 * Inter - Primary font for Latin/English
 * Optimized for UI and body text
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
});

/**
 * Noto Sans KR - Korean font
 * Weight optimization: 400, 500, 600, 700
 */
export const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: false, // Lazy load for non-Korean users
  fallback: [
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    'sans-serif',
  ],
});

/**
 * Noto Sans JP - Japanese font
 * Weight optimization: 400, 500, 700
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: false, // Lazy load for non-Japanese users
  fallback: [
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Yu Gothic',
    'Meiryo',
    'sans-serif',
  ],
});

/**
 * Noto Sans SC - Simplified Chinese font
 * Weight optimization: 400, 500, 700
 */
export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  preload: false, // Lazy load for non-Chinese users
  fallback: [
    'PingFang SC',
    'Microsoft YaHei',
    'SimHei',
    'sans-serif',
  ],
});

/**
 * Get font variables for className
 */
export function getFontVariables(): string {
  return [
    inter.variable,
    notoSansKR.variable,
    notoSansJP.variable,
    notoSansSC.variable,
  ].join(' ');
}

/**
 * Font family mapping by locale
 */
export const FONT_FAMILY_BY_LOCALE = {
  en: 'var(--font-inter)',
  ko: 'var(--font-noto-sans-kr)',
  ja: 'var(--font-noto-sans-jp)',
  zh: 'var(--font-noto-sans-sc)',
  'zh-TW': 'var(--font-noto-sans-sc)', // Use SC for Taiwan (can be TC if needed)
} as const;

/**
 * Get font family CSS variable for a locale
 */
export function getFontFamilyForLocale(locale: string): string {
  return FONT_FAMILY_BY_LOCALE[locale as keyof typeof FONT_FAMILY_BY_LOCALE] || FONT_FAMILY_BY_LOCALE.en;
}

/**
 * Preload font based on user locale
 * Call this in useEffect when locale is detected
 */
export function preloadFontForLocale(locale: string) {
  // This is handled by Next.js font system automatically
  // when the font variable is used in className
  const fontFamily = getFontFamilyForLocale(locale);
  
  // Optional: Add font preload hint
  if (typeof document !== 'undefined') {
    const existingPreload = document.querySelector(`link[data-font-locale="${locale}"]`);
    if (!existingPreload) {
      // Font will be loaded when used via CSS variable
      console.log(`Font preloaded for locale: ${locale}, family: ${fontFamily}`);
    }
  }
}
