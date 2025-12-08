import { NextRequest, NextResponse } from 'next/server';
import { EXCHANGE_RATES, CURRENCIES, type CurrencyCode } from '@/lib/currency';

/**
 * GET /api/exchange-rates
 * 
 * Returns current exchange rates for all supported currencies
 * Base currency: USD (rate = 1)
 * 
 * Response:
 * {
 *   rates: { USD: 1, THB: 35, ... },
 *   currencies: { USD: { code, symbol, name, decimals, position }, ... },
 *   updatedAt: "2024-12-08T00:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetCurrency = searchParams.get('currency') as CurrencyCode | null;

    // If specific currency requested, return just that rate
    if (targetCurrency) {
      if (!(targetCurrency in EXCHANGE_RATES)) {
        return NextResponse.json(
          { error: 'Invalid currency code' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        currency: targetCurrency,
        rate: EXCHANGE_RATES[targetCurrency],
        config: CURRENCIES[targetCurrency],
        base: 'USD',
        updatedAt: new Date().toISOString(),
      });
    }

    // Return all rates
    return NextResponse.json({
      rates: EXCHANGE_RATES,
      currencies: CURRENCIES,
      base: 'USD',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Exchange rates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
