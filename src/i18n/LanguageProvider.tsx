'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type Locale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  translations,
  detectLocale,
  getNestedValue,
  interpolate,
  formatDate as formatDateUtil,
  formatNumber as formatNumberUtil,
  formatCurrency as formatCurrencyUtil,
  formatRelativeTime as formatRelativeTimeUtil,
} from './config';

/**
 * i18n Context Types
 */
interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatDate: (date: Date | string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  formatRelativeTime: (date: Date | string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * LanguageProvider - i18n Context Provider
 */
interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect and set locale on client
  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    setIsHydrated(true);

    // Update HTML lang attribute
    document.documentElement.lang = detected;
  }, []);

  // Set locale and persist
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const currentTranslations = translations[locale];
      const value = getNestedValue(currentTranslations, key);

      if (!value) {
        // Fallback to Korean if key not found
        const fallback = getNestedValue(translations.ko, key);
        if (fallback) {
          return interpolate(fallback, variables);
        }
        // Return key if not found
        console.warn(`[i18n] Missing translation: ${key}`);
        return key;
      }

      return interpolate(value, variables);
    },
    [locale]
  );

  // Formatting functions
  const formatDate = useCallback((date: Date | string) => formatDateUtil(date, locale), [locale]);

  const formatNumber = useCallback((num: number) => formatNumberUtil(num, locale), [locale]);

  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyUtil(amount, locale),
    [locale]
  );

  const formatRelativeTime = useCallback(
    (date: Date | string) => formatRelativeTimeUtil(date, locale, translations[locale]),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    }),
    [locale, setLocale, t, formatDate, formatNumber, formatCurrency, formatRelativeTime]
  );

  // Prevent hydration mismatch by rendering with default locale on server
  if (!isHydrated) {
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * useLanguage - Access language context
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * useTranslation - Simplified translation hook
 * Returns only the t function for component-level usage
 */
export function useTranslation() {
  const { t, locale, setLocale, formatDate, formatNumber, formatCurrency, formatRelativeTime } =
    useLanguage();
  return { t, locale, setLocale, formatDate, formatNumber, formatCurrency, formatRelativeTime };
}

export default LanguageProvider;
