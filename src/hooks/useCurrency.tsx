'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates, setRates] = useState<ExchangeRates>(MOCK_EXCHANGE_RATES);
  const [loading, setLoading] = useState(false);

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem('user_currency') as Currency;
    if (saved && CURRENCY_SYMBOLS[saved]) {
      setCurrency(saved);
    }
  }, []);

  // Save currency preference when changed
  useEffect(() => {
    localStorage.setItem('user_currency', currency);
  }, [currency]);

  // Fetch exchange rates (mock implementation)
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // In production, call real API like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // setRates(data.rates);

      // For now, use mock data
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

  return {
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
  };
}
