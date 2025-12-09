/**
 * i18n Configuration
 *
 * Supported locales and type definitions
 */

import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zhTW from './locales/zh-TW.json';
import th from './locales/th.json';

export const LOCALES = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  'zh-TW': 'zh-TW',
  th: 'th',
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-TW': '繁體中文',
  th: 'ภาษาไทย',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  'zh-TW': '🇹🇼',
  th: '🇹🇭',
};

// Storage key for persisting locale preference
export const LOCALE_STORAGE_KEY = 'zzik_locale';

// Translation resources
export const translations = {
  ko,
  en,
  ja,
  'zh-TW': zhTW,
  th,
} as const;

// Type-safe translation keys
export type TranslationKeys = typeof ko;

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue<T>(obj: T, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate variables in translation string
 * Supports {{variable}} syntax
 */
export function interpolate(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Detect user's preferred locale from browser
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // Check localStorage first
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && Object.keys(LOCALES).includes(stored)) {
    return stored as Locale;
  }

  // Check browser language
  const browserLang = navigator.language;
  const browserLangBase = browserLang.split('-')[0];
  
  // Handle zh-TW specifically
  if (browserLang === 'zh-TW' || browserLang === 'zh-Hant') return 'zh-TW';
  if (browserLangBase === 'ko') return 'ko';
  if (browserLangBase === 'en') return 'en';
  if (browserLangBase === 'ja') return 'ja';
  if (browserLangBase === 'th') return 'th';

  // Check if user might prefer specific language
  const languages = navigator.languages || [navigator.language];
  for (const lang of languages) {
    if (lang === 'zh-TW' || lang === 'zh-Hant') return 'zh-TW';
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('th')) return 'th';
  }

  return DEFAULT_LOCALE;
}

/**
 * Date formatting by locale
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<Locale, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    'zh-TW': 'zh-TW',
    th: 'th-TH',
  };
  const localeStr = localeMap[locale] || 'ko-KR';

  return d.toLocaleDateString(localeStr, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Number formatting by locale
 */
export function formatNumber(num: number, locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
    'zh-TW': 'zh-TW',
    th: 'th-TH',
  };
  const localeStr = localeMap[locale] || 'ko-KR';
  
  return num.toLocaleString(localeStr);
}

/**
 * Currency formatting by locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  const currencyConfig: Record<Locale, { symbol: string; localeStr: string }> = {
    ko: { symbol: '₩', localeStr: 'ko-KR' },
    en: { symbol: '$', localeStr: 'en-US' },
    ja: { symbol: '¥', localeStr: 'ja-JP' },
    'zh-TW': { symbol: 'NT$', localeStr: 'zh-TW' },
    th: { symbol: '฿', localeStr: 'th-TH' },
  };
  const config = currencyConfig[locale] || currencyConfig.en;
  return `${config.symbol}${amount.toLocaleString(config.localeStr)}`;
}

/**
 * Relative time formatting
 */
export function formatRelativeTime(
  date: Date | string,
  locale: Locale,
  translations: TranslationKeys
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  const t = translations.common;

  if (minutes < 1) return t.justNow;
  if (minutes < 60) return interpolate(t.minutesAgo, { minutes });
  if (hours < 24) return interpolate(t.hoursAgo, { hours });
  if (days < 7) return interpolate(t.daysAgo, { days });

  return formatDate(d, locale);
}
