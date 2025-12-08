// src/app/api/exchange-rates/route.ts
// 실시간 환율 API 엔드포인트 (Production Level)

import { NextResponse } from 'next/server';
import { Currency, EXCHANGE_RATES } from '@/lib/global-pricing';

// 지원하는 통화 목록
const SUPPORTED_CURRENCIES: Currency[] = [
  'KRW', 'JPY', 'TWD', 'CNY', 'THB', 'USD', 'EUR', 'SGD'
];

/**
 * 폴백 환율 (global-pricing.ts의 기본값 기반)
 * USD 기준으로 변환
 */
function getFallbackRatesUSD(): Record<Currency, number> {
  // KRW 기준 환율을 USD 기준으로 변환
  const krwToUsd = EXCHANGE_RATES.USD; // 0.00075
  
  return {
    KRW: 1 / krwToUsd,           // ~1333.33
    JPY: EXCHANGE_RATES.JPY / krwToUsd,   // ~146.67
    TWD: EXCHANGE_RATES.TWD / krwToUsd,   // ~32.00
    CNY: EXCHANGE_RATES.CNY / krwToUsd,   // ~7.07
    THB: EXCHANGE_RATES.THB / krwToUsd,   // ~34.67
    USD: 1,
    EUR: EXCHANGE_RATES.EUR / krwToUsd,   // ~0.92
    SGD: EXCHANGE_RATES.SGD / krwToUsd,   // ~1.33
  };
}

/**
 * 외부 환율 API에서 데이터 가져오기
 * Next.js 'next: { revalidate }' 옵션을 사용하여 서버리스 환경에서도 효율적인 캐싱 구현
 */
async function fetchExternalRates(): Promise<{ rates: Record<Currency, number> | null; source: string }> {
  const apiKey = process.env.OPEN_EXCHANGE_RATES_APP_ID;
  
  // 1. API 키가 없는 경우 즉시 폴백 반환
  if (!apiKey) {
    // console.warn('OPEN_EXCHANGE_RATES_APP_ID not configured, using fallback rates');
    return { rates: null, source: 'fallback' };
  }

  try {
    const currencies = SUPPORTED_CURRENCIES.join(',');
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=${currencies}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // 1시간 캐싱 (Vercel Data Cache)
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // USD 기준 환율을 KRW 기준으로 변환 로직 필요시 여기서 처리
    // Open Exchange Rates는 기본적으로 USD 기준
    const rates = data.rates;

    // KRW가 없는 경우 (혹은 다른 필수 통화 누락 시) 폴백
    if (!rates || !rates.KRW) {
      throw new Error('Invalid API response: missing KRW rate');
    }

    // API 응답을 Currency 타입에 맞게 필터링
    const filteredRates: Partial<Record<Currency, number>> = {};
    for (const currency of SUPPORTED_CURRENCIES) {
      if (rates[currency]) {
        filteredRates[currency] = rates[currency];
      }
    }

    return { rates: filteredRates as Record<Currency, number>, source: 'openexchangerates' };
  } catch (error) {
    console.error('Failed to fetch external exchange rates:', error);
    return { rates: null, source: 'fallback' };
  }
}

/**
 * GET /api/exchange-rates
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const base = url.searchParams.get('base') || 'USD';

    // 1. 환율 데이터 가져오기 (API or Fallback)
    const { rates: externalRates, source } = await fetchExternalRates();
    const rates = externalRates || getFallbackRatesUSD();

    const now = Date.now();

    // 2. 기본 통화 변환 로직 (Base Currency Conversion)
    let responseRates = rates;
    if (base !== 'USD' && rates[base as Currency]) {
      const baseRate = rates[base as Currency];
      responseRates = {} as Record<Currency, number>;
      for (const currency of SUPPORTED_CURRENCIES) {
        // Base가 KRW이고 Target이 USD라면:
        // KRW(USD) = 1333, USD(USD) = 1
        // USD(KRW) = 1 / 1333
        // JPY(KRW) = JPY(USD) / KRW(USD) = 146 / 1333
        responseRates[currency] = rates[currency] / baseRate;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        base,
        rates: responseRates,
        timestamp: now,
        source,
      },
    });
  } catch (error) {
    console.error('Exchange rates API error:', error);
    
    return NextResponse.json({
      success: true,
      data: {
        base: 'USD',
        rates: getFallbackRatesUSD(),
        timestamp: Date.now(),
        source: 'fallback',
        error: 'Internal Server Error',
      },
    });
  }
}

/**
 * POST /api/exchange-rates/convert
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, from, to } = body;

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    if (!SUPPORTED_CURRENCIES.includes(from) || !SUPPORTED_CURRENCIES.includes(to)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid currency code',
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }, { status: 400 });
    }

    // 환율 가져오기
    const { rates: externalRates, source } = await fetchExternalRates();
    const rates = externalRates || getFallbackRatesUSD();

    // 변환: Amount(From) -> USD -> Target(To)
    // AmountInUSD = Amount / Rate(From)
    // TargetAmount = AmountInUSD * Rate(To)
    const rateFrom = rates[from as Currency];
    const rateTo = rates[to as Currency];
    
    const amountInUSD = amount / rateFrom;
    const convertedAmount = amountInUSD * rateTo;

    // 소수점 처리
    const decimals = ['KRW', 'JPY'].includes(to) ? 0 : 2;
    const roundedAmount = Number(convertedAmount.toFixed(decimals));

    return NextResponse.json({
      success: true,
      data: {
        originalAmount: amount,
        from,
        convertedAmount: roundedAmount,
        to,
        rate: rateTo / rateFrom,
        timestamp: Date.now(),
        source,
      },
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json({ success: false, error: 'Conversion failed' }, { status: 500 });
  }
}

/**
 * 통화별 소수점 자릿수 반환
 */
function getDecimalsForCurrency(currency: Currency): number {
  const noDecimals: Currency[] = ['KRW', 'JPY'];
  return noDecimals.includes(currency) ? 0 : 2;
}
