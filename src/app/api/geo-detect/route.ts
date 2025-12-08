import { NextRequest, NextResponse } from 'next/server';
import { COUNTRIES, type CountryCode } from '@/lib/currency';

/**
 * GET /api/geo-detect
 * 
 * Auto-detects user's country from:
 * 1. Vercel geo headers (x-vercel-ip-country)
 * 2. Cloudflare headers (cf-ipcountry)
 * 3. Accept-Language header
 * 4. Falls back to 'US'
 * 
 * Response:
 * {
 *   countryCode: "TH",
 *   country: { code, name, currency, locale, flag, tier },
 *   detectionMethod: "vercel-geo" | "cloudflare" | "language" | "default"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    let countryCode: CountryCode = 'US';
    let detectionMethod: 'vercel-geo' | 'cloudflare' | 'language' | 'default' = 'default';

    // Try Vercel geo header
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    if (vercelCountry && vercelCountry.toUpperCase() in COUNTRIES) {
      countryCode = vercelCountry.toUpperCase() as CountryCode;
      detectionMethod = 'vercel-geo';
    }

    // Try Cloudflare header
    if (detectionMethod === 'default') {
      const cfCountry = request.headers.get('cf-ipcountry');
      if (cfCountry && cfCountry.toUpperCase() in COUNTRIES) {
        countryCode = cfCountry.toUpperCase() as CountryCode;
        detectionMethod = 'cloudflare';
      }
    }

    // Try Accept-Language header
    if (detectionMethod === 'default') {
      const acceptLang = request.headers.get('accept-language');
      if (acceptLang) {
        const langToCountry: Record<string, CountryCode> = {
          'th': 'TH',
          'id': 'ID',
          'tl': 'PH',
          'fil': 'PH',
          'kk': 'KZ',
          'ms': 'MY',
          'ja': 'JP',
          'ko': 'KR',
          'zh-TW': 'TW',
          'zh-CN': 'CN',
          'zh-HK': 'CN',
        };

        // Parse first language from Accept-Language
        const primaryLang = acceptLang.split(',')[0].trim().split(';')[0];
        if (primaryLang in langToCountry) {
          countryCode = langToCountry[primaryLang];
          detectionMethod = 'language';
        } else {
          const baseLang = primaryLang.split('-')[0];
          if (baseLang in langToCountry) {
            countryCode = langToCountry[baseLang];
            detectionMethod = 'language';
          }
        }
      }
    }

    const country = COUNTRIES[countryCode];

    return NextResponse.json({
      countryCode,
      country,
      detectionMethod,
    });
  } catch (error) {
    console.error('[API] Geo detect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
