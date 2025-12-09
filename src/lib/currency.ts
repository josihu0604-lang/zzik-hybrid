// src/lib/currency.ts

import { Currency, EXCHANGE_RATES, Region, REGION_CURRENCY } from './global-pricing';

// 실시간 환율 캐시
let exchangeRatesCache: Record<Currency, number> = { ...EXCHANGE_RATES };
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

// 실시간 환율 가져오기
export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  const now = Date.now();
  
  if (now - lastFetchTime < CACHE_DURATION) {
    return exchangeRatesCache;
  }
  
  try {
    // 실제 구현 시 환율 API 사용 (예: Open Exchange Rates, Fixer.io)
    const response = await fetch('/api/exchange-rates');
    const data = await response.json();
    
    exchangeRatesCache = data.rates;
    lastFetchTime = now;
    
    return exchangeRatesCache;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return EXCHANGE_RATES; // 폴백
  }
}

// 통화 변환
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  
  // KRW를 기준으로 변환
  const amountInKRW = amount / exchangeRatesCache[from];
  const convertedAmount = amountInKRW * exchangeRatesCache[to];
  
  return convertedAmount;
}

// 지역에서 통화 가져오기
export function getCurrencyForRegion(region: Region): Currency {
  return REGION_CURRENCY[region];
}

// 통화 심볼
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  KRW: '₩',
  JPY: '¥',
  TWD: 'NT$',
  CNY: '¥',
  THB: '฿',
  USD: '$',
  EUR: '€',
  SGD: 'S$',
};

// 통화 포맷 옵션
export function getCurrencyFormatOptions(currency: Currency): Intl.NumberFormatOptions {
  const noDecimals = ['KRW', 'JPY'];
  
  return {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
    maximumFractionDigits: noDecimals.includes(currency) ? 0 : 2,
  };
}

// 금액 포맷팅 (React 컴포넌트용)
export function useFormattedPrice(amount: number, currency: Currency): string {
  const locale = getLocaleForCurrency(currency);
  const options = getCurrencyFormatOptions(currency);
  
  return new Intl.NumberFormat(locale, options).format(amount);
}

function getLocaleForCurrency(currency: Currency): string {
  const localeMap: Record<Currency, string> = {
    KRW: 'ko-KR',
    JPY: 'ja-JP',
    TWD: 'zh-TW',
    CNY: 'zh-CN',
    THB: 'th-TH',
    USD: 'en-US',
    EUR: 'de-DE',
    SGD: 'en-SG',
  };
  
  return localeMap[currency];
}
