/**
 * i18n Configuration
 *
 * Supported locales and type definitions
 */

import ko from './locales/ko.json';
import en from './locales/en.json';
import ru from './locales/ru.json';

export const LOCALES = {
  en: 'en',
  ko: 'ko',
  ru: 'ru',
} as const;

export type Locale = keyof typeof LOCALES;

// Changed default to English for global expansion
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ru: 'Русский',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🌐',
  ko: '🇰🇷',
  ru: '🇷🇺',
};

// Storage key for persisting locale preference
export const LOCALE_STORAGE_KEY = 'zzik_locale';

// Translation resources
export const translations = {
  en,
  ko,
  ru,
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
  if (stored && (stored === 'en' || stored === 'ko' || stored === 'ru')) {
    return stored as Locale;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ko') return 'ko';
  if (browserLang === 'ru') return 'ru';
  if (browserLang === 'en') return 'en';

  // Check if user might prefer specific language
  const languages = navigator.languages || [navigator.language];
  for (const lang of languages) {
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ru')) return 'ru';
  }

  // Default to English for global users
  return DEFAULT_LOCALE;
}

/**
 * Date formatting by locale
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Number formatting by locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return num.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US');
}

/**
 * Currency formatting by locale
 */
export function formatCurrency(amount: number, locale: Locale): string {
  if (locale === 'ko') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }
  return `$${amount.toLocaleString('en-US')}`;
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
