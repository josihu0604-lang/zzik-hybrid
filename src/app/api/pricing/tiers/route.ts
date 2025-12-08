import { NextRequest, NextResponse } from 'next/server';
import {
  COUNTRIES,
  EXPERIENCE_BASE_PRICES_USD,
  getExperiencePrice,
  type CountryCode,
  type ExperienceType,
} from '@/lib/currency';

/**
 * GET /api/pricing/tiers
 * 
 * Returns pricing tiers for all countries and experience types
 * Applies PPP adjustment and currency conversion
 * 
 * Query params:
 * - country: Return pricing for specific country
 * - type: Return pricing for specific experience type
 * 
 * Response:
 * {
 *   baseUSD: { popup: 5, hightough: 150, ... },
 *   pricing: {
 *     TH: {
 *       popup: { amount: 150, currency: "THB", formatted: "฿150" },
 *       hightough: { ... }
 *     },
 *     ...
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryFilter = searchParams.get('country') as CountryCode | null;
    const typeFilter = searchParams.get('type') as ExperienceType | null;

    // Validate filters
    if (countryFilter && !(countryFilter in COUNTRIES)) {
      return NextResponse.json(
        { error: 'Invalid country code' },
        { status: 400 }
      );
    }

    if (typeFilter && !(typeFilter in EXPERIENCE_BASE_PRICES_USD)) {
      return NextResponse.json(
        { error: 'Invalid experience type' },
        { status: 400 }
      );
    }

    // Build pricing matrix
    const pricing: Record<
      CountryCode,
      Record<ExperienceType, { amount: number; currency: string; formatted: string }>
    > = {} as any;

    const countries = countryFilter
      ? [countryFilter]
      : (Object.keys(COUNTRIES) as CountryCode[]);

    const types = typeFilter
      ? [typeFilter]
      : (Object.keys(EXPERIENCE_BASE_PRICES_USD) as ExperienceType[]);

    for (const country of countries) {
      pricing[country] = {} as any;
      for (const type of types) {
        pricing[country][type] = getExperiencePrice(type, country);
      }
    }

    // If specific country+type requested, return simplified response
    if (countryFilter && typeFilter) {
      return NextResponse.json({
        country: countryFilter,
        type: typeFilter,
        baseUSD: EXPERIENCE_BASE_PRICES_USD[typeFilter],
        price: pricing[countryFilter][typeFilter],
      });
    }

    // Return full matrix
    return NextResponse.json({
      baseUSD: EXPERIENCE_BASE_PRICES_USD,
      pricing,
    });
  } catch (error) {
    console.error('[API] Pricing tiers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
