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
  type CountryCode,
  type CurrencyCode,
  COUNTRIES,
  CURRENCIES,
  detectCountry,
  saveCountry,
  formatPrice as formatPriceUtil,
  convertFromUSD,
  getLocalizedPrice,
  getExperiencePrice,
  type ExperienceType,
} from '@/lib/currency';

// =============================================================================
// Types
// =============================================================================

interface CurrencyContextValue {
  country: CountryCode;
  currency: CurrencyCode;
  setCountry: (country: CountryCode) => void;
  formatPrice: (amount: number, options?: { compact?: boolean; showCode?: boolean }) => string;
  formatUsdPrice: (usdAmount: number, options?: { compact?: boolean; showCode?: boolean }) => string;
  convertFromUsd: (usdAmount: number) => number;
  getExperiencePrice: (type: ExperienceType) => { amount: number; formatted: string };
  countryConfig: typeof COUNTRIES[CountryCode];
  currencyConfig: typeof CURRENCIES[CurrencyCode];
}

// =============================================================================
// Context
// =============================================================================

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCountry?: CountryCode;
}

export function CurrencyProvider({ children, defaultCountry }: CurrencyProviderProps) {
  const [country, setCountryState] = useState<CountryCode>(defaultCountry || 'US');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage or detection
  useEffect(() => {
    const detected = detectCountry();
    setCountryState(detected);
    setIsInitialized(true);
  }, []);

  // Set country with persistence
  const setCountry = useCallback((newCountry: CountryCode) => {
    setCountryState(newCountry);
    saveCountry(newCountry);
  }, []);

  // Derived values
  const countryConfig = COUNTRIES[country];
  const currency = countryConfig.currency;
  const currencyConfig = CURRENCIES[currency];

  // Format price in current currency
  const formatPrice = useCallback(
    (amount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      return formatPriceUtil(amount, currency, options);
    },
    [currency]
  );

  // Format USD price converted to local currency
  const formatUsdPrice = useCallback(
    (usdAmount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      const localPrice = getLocalizedPrice(usdAmount, country);
      return formatPriceUtil(localPrice.amount, localPrice.currency, options);
    },
    [country]
  );

  // Convert USD to local currency
  const convertFromUsd = useCallback(
    (usdAmount: number) => {
      return convertFromUSD(usdAmount, currency);
    },
    [currency]
  );

  // Get experience price for current country
  const getExpPrice = useCallback(
    (type: ExperienceType) => {
      const price = getExperiencePrice(type, country);
      return { amount: price.amount, formatted: price.formatted };
    },
    [country]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      country,
      currency,
      setCountry,
      formatPrice,
      formatUsdPrice,
      convertFromUsd,
      getExperiencePrice: getExpPrice,
      countryConfig,
      currencyConfig,
    }),
    [country, currency, setCountry, formatPrice, formatUsdPrice, convertFromUsd, getExpPrice, countryConfig, currencyConfig]
  );

  // Prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
}

// =============================================================================
// Standalone Hook (no provider needed)
// =============================================================================

export function useCurrencyStandalone(initialCountry?: CountryCode) {
  const [country, setCountryState] = useState<CountryCode>(initialCountry || 'US');

  useEffect(() => {
    if (!initialCountry) {
      const detected = detectCountry();
      setCountryState(detected);
    }
  }, [initialCountry]);

  const setCountry = useCallback((newCountry: CountryCode) => {
    setCountryState(newCountry);
    saveCountry(newCountry);
  }, []);

  const countryConfig = COUNTRIES[country];
  const currency = countryConfig.currency;
  const currencyConfig = CURRENCIES[currency];

  const formatPrice = useCallback(
    (amount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      return formatPriceUtil(amount, currency, options);
    },
    [currency]
  );

  const formatUsdPrice = useCallback(
    (usdAmount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      const localPrice = getLocalizedPrice(usdAmount, country);
      return formatPriceUtil(localPrice.amount, localPrice.currency, options);
    },
    [country]
  );

  return {
    country,
    currency,
    setCountry,
    formatPrice,
    formatUsdPrice,
    countryConfig,
    currencyConfig,
  };
}
