/**
 * i18n - Internationalization Module
 *
 * Usage:
 * ```tsx
 * import { useTranslation } from '@/i18n';
 *
 * function MyComponent() {
 *   const { t, locale, setLocale } = useTranslation();
 *   return <p>{t('common.loading')}</p>;
 * }
 * ```
 */

// Provider and hooks
export { LanguageProvider, useLanguage, useTranslation } from './LanguageProvider';

// Configuration and types
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  LOCALE_FLAGS,
  LOCALE_STORAGE_KEY,
  translations,
  detectLocale,
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  type Locale,
  type TranslationKeys,
} from './config';
