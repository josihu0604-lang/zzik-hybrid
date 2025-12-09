'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Currency = 'USD' | 'KRW' | 'JPY' | 'CNY' | 'EUR' | 'GBP';

interface ExchangeRates {
  [key: string]: number;
}

// Mock exchange rates (in production, fetch from API)
const MOCK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  KRW: 1300,
  JPY: 150,
  CNY: 7.2,
  EUR: 0.92,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  KRW: '₩',
  JPY: '¥',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates;
  loading: boolean;
  convertPrice: (amountInUSD: number) => number;
  convert: (amount: number, from: Currency, to: Currency) => number;
  formatPrice: (amountInUSD: number, options?: { showSymbol?: boolean; decimals?: number }) => string;
  getExchangeRate: (from?: Currency, to?: Currency) => number;
  refreshRates: () => Promise<void>;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Hydration 안전: 초기값은 서버/클라이언트 동일하게 'USD'
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [rates, setRates] = useState<ExchangeRates>(MOCK_EXCHANGE_RATES);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration 이후 저장된 통화 설정 로드
  useEffect(() => {
    setIsHydrated(true);
    // 클라이언트에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_currency') as Currency;
      if (saved && CURRENCY_SYMBOLS[saved]) {
        setCurrencyState(saved);
      }
    }
  }, []);

  // 통화 변경 핸들러 (localStorage 저장 포함)
  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_currency', newCurrency);
    }
  }, []);

  // 저장은 이제 setCurrency 핸들러에서 처리됨

  // Fetch exchange rates (mock implementation)
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // In production, call real API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setRates(MOCK_EXCHANGE_RATES);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize rates
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Convert price from USD to selected currency
  const convertPrice = useCallback(
    (amountInUSD: number): number => {
      const rate = rates[currency] || 1;
      return amountInUSD * rate;
    },
    [currency, rates]
  );

  // Convert between any two currencies
  const convert = useCallback(
    (amount: number, from: Currency, to: Currency): number => {
      // Convert to USD first
      const amountInUSD = amount / (rates[from] || 1);
      // Then convert to target currency
      return amountInUSD * (rates[to] || 1);
    },
    [rates]
  );

  // Format price with currency symbol
  const formatPrice = useCallback(
    (amountInUSD: number, options?: { showSymbol?: boolean; decimals?: number }): string => {
      const { showSymbol = true, decimals = 0 } = options || {};
      const converted = convertPrice(amountInUSD);
      const symbol = CURRENCY_SYMBOLS[currency];

      // Format based on currency
      let formatted: string;
      if (currency === 'KRW' || currency === 'JPY') {
        // No decimals for KRW and JPY
        formatted = Math.round(converted).toLocaleString();
      } else {
        formatted = converted.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }

      return showSymbol ? `${symbol}${formatted}` : formatted;
    },
    [convertPrice, currency]
  );

  // Get exchange rate info
  const getExchangeRate = useCallback(
    (from: Currency = 'USD', to: Currency = currency): number => {
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      return toRate / fromRate;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loading,
        convertPrice,
        convert,
        formatPrice,
        getExchangeRate,
        refreshRates: fetchRates,
        symbol: CURRENCY_SYMBOLS[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
