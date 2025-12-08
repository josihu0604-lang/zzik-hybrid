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
  type Currency,
  type Region,
  REGION_CURRENCY,
  getTierPrice,
  formatCurrency,
  type TierType,
} from '@/lib/global-pricing';
import {
  convertCurrency,
  getCurrencyForRegion,
  CURRENCY_SYMBOLS,
  fetchExchangeRates,
} from '@/lib/currency';

// =============================================================================
// Types
// =============================================================================

interface RegionConfig {
  code: Region;
  name: string;
  currency: Currency;
  locale: string;
  flag: string;
}

// 지역 설정
const REGION_CONFIGS: Record<Region, RegionConfig> = {
  KR: { code: 'KR', name: 'South Korea', currency: 'KRW', locale: 'ko-KR', flag: '🇰🇷' },
  JP: { code: 'JP', name: 'Japan', currency: 'JPY', locale: 'ja-JP', flag: '🇯🇵' },
  TW: { code: 'TW', name: 'Taiwan', currency: 'TWD', locale: 'zh-TW', flag: '🇹🇼' },
  CN: { code: 'CN', name: 'China', currency: 'CNY', locale: 'zh-CN', flag: '🇨🇳' },
  TH: { code: 'TH', name: 'Thailand', currency: 'THB', locale: 'th-TH', flag: '🇹🇭' },
  US: { code: 'US', name: 'United States', currency: 'USD', locale: 'en-US', flag: '🇺🇸' },
  EU: { code: 'EU', name: 'Europe', currency: 'EUR', locale: 'de-DE', flag: '🇪🇺' },
  SEA: { code: 'SEA', name: 'Southeast Asia', currency: 'USD', locale: 'en-US', flag: '🌏' },
  GLOBAL: { code: 'GLOBAL', name: 'Global', currency: 'USD', locale: 'en-US', flag: '🌍' },
};

const REGION_STORAGE_KEY = 'zzik_region';

interface CurrencyContextValue {
  region: Region;
  currency: Currency;
  setRegion: (region: Region) => void;
  formatPrice: (amount: number, options?: { compact?: boolean; showCode?: boolean }) => string;
  convertFromKRW: (krwAmount: number) => number;
  getTierPricing: (tier: TierType, period: 'monthly' | 'yearly') => { amount: number; formatted: string };
  regionConfig: RegionConfig;
  currencySymbol: string;
  isLoading: boolean;
}

// =============================================================================
// Context
// =============================================================================

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// =============================================================================
// Utils
// =============================================================================

/**
 * 브라우저에서 지역 감지
 */
function detectRegion(): Region {
  if (typeof window === 'undefined') return 'GLOBAL';

  // localStorage 확인
  const stored = localStorage.getItem(REGION_STORAGE_KEY);
  if (stored && stored in REGION_CONFIGS) {
    return stored as Region;
  }

  // 타임존 기반 감지
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneToRegion: Record<string, Region> = {
    'Asia/Seoul': 'KR',
    'Asia/Tokyo': 'JP',
    'Asia/Taipei': 'TW',
    'Asia/Shanghai': 'CN',
    'Asia/Hong_Kong': 'CN',
    'Asia/Bangkok': 'TH',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'Europe/London': 'EU',
    'Europe/Paris': 'EU',
    'Europe/Berlin': 'EU',
    'Asia/Singapore': 'SEA',
    'Asia/Jakarta': 'SEA',
    'Asia/Manila': 'SEA',
  };

  if (timezone in timezoneToRegion) {
    return timezoneToRegion[timezone];
  }

  // 언어 기반 감지
  const lang = navigator.language;
  const langToRegion: Record<string, Region> = {
    'ko': 'KR',
    'ko-KR': 'KR',
    'ja': 'JP',
    'ja-JP': 'JP',
    'zh-TW': 'TW',
    'zh-CN': 'CN',
    'zh': 'CN',
    'th': 'TH',
    'th-TH': 'TH',
  };

  const baseLang = lang.split('-')[0];
  if (lang in langToRegion) return langToRegion[lang];
  if (baseLang in langToRegion) return langToRegion[baseLang];

  return 'GLOBAL';
}

/**
 * 지역 저장
 */
function saveRegion(region: Region): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REGION_STORAGE_KEY, region);
  }
}

// =============================================================================
// Provider
// =============================================================================

interface CurrencyProviderProps {
  children: ReactNode;
  defaultRegion?: Region;
}

export function CurrencyProvider({ children, defaultRegion }: CurrencyProviderProps) {
  const [region, setRegionState] = useState<Region>(defaultRegion || 'GLOBAL');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or detection
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const detected = detectRegion();
    setRegionState(detected);
    setIsInitialized(true);
    
    // 환율 데이터 프리패치
    fetchExchangeRates().finally(() => setIsLoading(false));
  }, []);

  // Set region with persistence
  const setRegion = useCallback((newRegion: Region) => {
    setRegionState(newRegion);
    saveRegion(newRegion);
  }, []);

  // Derived values
  const regionConfig = REGION_CONFIGS[region];
  const currency = getCurrencyForRegion(region);
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  // Format price in current currency
  const formatPrice = useCallback(
    (amount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      const { compact = false, showCode = false } = options || {};
      
      let formattedAmount: string;
      
      if (compact && amount >= 1000000) {
        formattedAmount = `${(amount / 1000000).toFixed(1)}M`;
      } else if (compact && amount >= 1000) {
        formattedAmount = `${(amount / 1000).toFixed(0)}K`;
      } else {
        formattedAmount = formatCurrency(amount, currency);
        return showCode ? `${formattedAmount} ${currency}` : formattedAmount;
      }
      
      const result = `${currencySymbol}${formattedAmount}`;
      return showCode ? `${result} ${currency}` : result;
    },
    [currency, currencySymbol]
  );

  // Convert KRW to local currency
  const convertFromKRW = useCallback(
    (krwAmount: number) => {
      return convertCurrency(krwAmount, 'KRW', currency);
    },
    [currency]
  );

  // Get tier price for current region
  const getTierPricing = useCallback(
    (tier: TierType, period: 'monthly' | 'yearly') => {
      const price = getTierPrice(tier, region, period);
      return { amount: price.amount, formatted: price.formatted };
    },
    [region]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      region,
      currency,
      setRegion,
      formatPrice,
      convertFromKRW,
      getTierPricing,
      regionConfig,
      currencySymbol,
      isLoading,
    }),
    [region, currency, setRegion, formatPrice, convertFromKRW, getTierPricing, regionConfig, currencySymbol, isLoading]
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

export function useCurrencyStandalone(initialRegion?: Region) {
  const [region, setRegionState] = useState<Region>(initialRegion || 'GLOBAL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (!initialRegion) {
      const detected = detectRegion();
      setRegionState(detected);
    }
    fetchExchangeRates().finally(() => setIsLoading(false));
  }, [initialRegion]);

  const setRegion = useCallback((newRegion: Region) => {
    setRegionState(newRegion);
    saveRegion(newRegion);
  }, []);

  const regionConfig = REGION_CONFIGS[region];
  const currency = getCurrencyForRegion(region);
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const formatPrice = useCallback(
    (amount: number, options?: { compact?: boolean; showCode?: boolean }) => {
      const { compact = false, showCode = false } = options || {};
      
      let formattedAmount: string;
      
      if (compact && amount >= 1000000) {
        formattedAmount = `${(amount / 1000000).toFixed(1)}M`;
      } else if (compact && amount >= 1000) {
        formattedAmount = `${(amount / 1000).toFixed(0)}K`;
      } else {
        formattedAmount = formatCurrency(amount, currency);
        return showCode ? `${formattedAmount} ${currency}` : formattedAmount;
      }
      
      const result = `${currencySymbol}${formattedAmount}`;
      return showCode ? `${result} ${currency}` : result;
    },
    [currency, currencySymbol]
  );

  const getTierPricing = useCallback(
    (tier: TierType, period: 'monthly' | 'yearly') => {
      const price = getTierPrice(tier, region, period);
      return { amount: price.amount, formatted: price.formatted };
    },
    [region]
  );

  return {
    region,
    currency,
    setRegion,
    formatPrice,
    getTierPricing,
    regionConfig,
    currencySymbol,
    isLoading,
  };
}

// =============================================================================
// Exports
// =============================================================================

export { REGION_CONFIGS };
export type { Region, Currency, RegionConfig };
