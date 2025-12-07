/**
 * ZZIK Multi-Currency System
 *
 * Global currency support for 11 markets:
 * - Tier 1A: Thailand, Indonesia, Philippines
 * - Tier 1B: Kazakhstan (CIS gateway)
 * - Tier 2: Taiwan, Singapore, Malaysia
 * - Tier 3: Japan, South Korea, USA
 * - Tier 4: China (future)
 */

// =============================================================================
// Types
// =============================================================================

export type CurrencyCode =
  | 'USD' | 'THB' | 'IDR' | 'PHP' | 'KZT'
  | 'TWD' | 'SGD' | 'MYR' | 'JPY' | 'KRW' | 'CNY';

export type CountryCode =
  | 'US' | 'TH' | 'ID' | 'PH' | 'KZ'
  | 'TW' | 'SG' | 'MY' | 'JP' | 'KR' | 'CN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
  position: 'before' | 'after';
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: CurrencyCode;
  locale: string;
  flag: string;
  tier: 1 | 2 | 3 | 4;
}

// =============================================================================
// Currency Configurations
// =============================================================================

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, position: 'before' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 0, position: 'before' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, position: 'before' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 0, position: 'before' },
  KZT: { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', decimals: 0, position: 'before' },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', decimals: 0, position: 'before' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2, position: 'before' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, position: 'before' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0, position: 'before' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, position: 'before' },
};

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  US: { code: 'US', name: 'United States', currency: 'USD', locale: 'en-US', flag: '🇺🇸', tier: 3 },
  TH: { code: 'TH', name: 'Thailand', currency: 'THB', locale: 'th-TH', flag: '🇹🇭', tier: 1 },
  ID: { code: 'ID', name: 'Indonesia', currency: 'IDR', locale: 'id-ID', flag: '🇮🇩', tier: 1 },
  PH: { code: 'PH', name: 'Philippines', currency: 'PHP', locale: 'en-PH', flag: '🇵🇭', tier: 1 },
  KZ: { code: 'KZ', name: 'Kazakhstan', currency: 'KZT', locale: 'ru-KZ', flag: '🇰🇿', tier: 1 },
  TW: { code: 'TW', name: 'Taiwan', currency: 'TWD', locale: 'zh-TW', flag: '🇹🇼', tier: 2 },
  SG: { code: 'SG', name: 'Singapore', currency: 'SGD', locale: 'en-SG', flag: '🇸🇬', tier: 2 },
  MY: { code: 'MY', name: 'Malaysia', currency: 'MYR', locale: 'ms-MY', flag: '🇲🇾', tier: 2 },
  JP: { code: 'JP', name: 'Japan', currency: 'JPY', locale: 'ja-JP', flag: '🇯🇵', tier: 3 },
  KR: { code: 'KR', name: 'South Korea', currency: 'KRW', locale: 'ko-KR', flag: '🇰🇷', tier: 3 },
  CN: { code: 'CN', name: 'China', currency: 'CNY', locale: 'zh-CN', flag: '🇨🇳', tier: 4 },
};

// Exchange rates (base: USD = 1)
// Updated: December 2024
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  THB: 35,
  IDR: 15800,
  PHP: 56,
  KZT: 450,
  TWD: 31,
  SGD: 1.35,
  MYR: 4.5,
  JPY: 146,
  KRW: 1330,
  CNY: 7.25,
};

// PPP Index (100 = US baseline)
export const PPP_INDEX: Record<CountryCode, number> = {
  US: 100,
  TH: 60,
  ID: 45,
  PH: 50,
  KZ: 40,
  TW: 85,
  SG: 110,
  MY: 55,
  JP: 105,
  KR: 90,
  CN: 55,
};

// =============================================================================
// Currency Functions
// =============================================================================

/**
 * Format price in specified currency
 */
export function formatPrice(
  amount: number,
  currencyCode: CurrencyCode,
  options?: { compact?: boolean; showCode?: boolean }
): string {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return `${amount}`;

  const { compact = false, showCode = false } = options || {};

  let formattedAmount: string;

  if (compact && amount >= 1000000) {
    formattedAmount = `${(amount / 1000000).toFixed(1)}M`;
  } else if (compact && amount >= 1000) {
    formattedAmount = `${(amount / 1000).toFixed(currency.decimals > 0 ? 1 : 0)}K`;
  } else {
    formattedAmount = amount.toLocaleString(undefined, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    });
  }

  const result = currency.position === 'before'
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount}${currency.symbol}`;

  return showCode ? `${result} ${currency.code}` : result;
}

/**
 * Convert USD to target currency
 */
export function convertFromUSD(usdAmount: number, targetCurrency: CurrencyCode): number {
  const rate = EXCHANGE_RATES[targetCurrency];
  const currency = CURRENCIES[targetCurrency];
  const converted = usdAmount * rate;
  return currency.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(currency.decimals));
}

/**
 * Convert from any currency to USD
 */
export function convertToUSD(amount: number, sourceCurrency: CurrencyCode): number {
  const rate = EXCHANGE_RATES[sourceCurrency];
  return Number((amount / rate).toFixed(2));
}

/**
 * Convert between any two currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return amount;
  const usdAmount = convertToUSD(amount, fromCurrency);
  return convertFromUSD(usdAmount, toCurrency);
}

/**
 * Apply PPP adjustment to base USD price for a specific country
 */
export function applyPPPAdjustment(baseUsdPrice: number, countryCode: CountryCode): number {
  const pppIndex = PPP_INDEX[countryCode];
  return Math.round(baseUsdPrice * (pppIndex / 100));
}

/**
 * Get localized price for a country (USD base price -> Local currency with PPP)
 */
export function getLocalizedPrice(baseUsdPrice: number, countryCode: CountryCode): {
  amount: number;
  currency: CurrencyCode;
  formatted: string;
} {
  const country = COUNTRIES[countryCode];
  const pppAdjusted = applyPPPAdjustment(baseUsdPrice, countryCode);
  const localAmount = convertFromUSD(pppAdjusted, country.currency);

  return {
    amount: localAmount,
    currency: country.currency,
    formatted: formatPrice(localAmount, country.currency),
  };
}

/**
 * Get all localized prices for a base USD price
 */
export function getAllLocalizedPrices(baseUsdPrice: number): Record<CountryCode, {
  amount: number;
  currency: CurrencyCode;
  formatted: string;
}> {
  const result = {} as Record<CountryCode, { amount: number; currency: CurrencyCode; formatted: string }>;

  for (const countryCode of Object.keys(COUNTRIES) as CountryCode[]) {
    result[countryCode] = getLocalizedPrice(baseUsdPrice, countryCode);
  }

  return result;
}

// =============================================================================
// Price Tiers (VIP Experiences)
// =============================================================================

export const EXPERIENCE_BASE_PRICES_USD = {
  popup: 5,        // Basic check-in
  hightough: 150,  // Meet & Greet
  soundcheck: 300, // Soundcheck access
  backstage: 1500, // Full backstage
} as const;

export type ExperienceType = keyof typeof EXPERIENCE_BASE_PRICES_USD;

/**
 * Get experience price for a specific country
 */
export function getExperiencePrice(
  experienceType: ExperienceType,
  countryCode: CountryCode
): { amount: number; currency: CurrencyCode; formatted: string } {
  const basePrice = EXPERIENCE_BASE_PRICES_USD[experienceType];
  return getLocalizedPrice(basePrice, countryCode);
}

// =============================================================================
// Storage Keys
// =============================================================================

export const CURRENCY_STORAGE_KEY = 'zzik_currency';
export const COUNTRY_STORAGE_KEY = 'zzik_country';

/**
 * Detect user's country from browser
 */
export function detectCountry(): CountryCode {
  if (typeof window === 'undefined') return 'US';

  // Check localStorage first
  const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
  if (stored && stored in COUNTRIES) {
    return stored as CountryCode;
  }

  // Check browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneToCountry: Record<string, CountryCode> = {
    'Asia/Bangkok': 'TH',
    'Asia/Jakarta': 'ID',
    'Asia/Manila': 'PH',
    'Asia/Almaty': 'KZ',
    'Asia/Taipei': 'TW',
    'Asia/Singapore': 'SG',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Tokyo': 'JP',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
  };

  if (timezone in timezoneToCountry) {
    return timezoneToCountry[timezone];
  }

  // Check browser language
  const lang = navigator.language;
  const langToCountry: Record<string, CountryCode> = {
    'th': 'TH',
    'id': 'ID',
    'tl': 'PH',
    'fil': 'PH',
    'kk': 'KZ',
    'ru-KZ': 'KZ',
    'zh-TW': 'TW',
    'ms': 'MY',
    'ja': 'JP',
    'ko': 'KR',
    'zh-CN': 'CN',
    'zh': 'CN',
  };

  const baseLang = lang.split('-')[0];
  if (lang in langToCountry) return langToCountry[lang];
  if (baseLang in langToCountry) return langToCountry[baseLang];

  return 'US';
}

/**
 * Save user's country preference
 */
export function saveCountry(countryCode: CountryCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTRY_STORAGE_KEY, countryCode);
  }
}

/**
 * Get country list for selection UI
 */
export function getCountryList(tier?: number): CountryConfig[] {
  const countries = Object.values(COUNTRIES);
  if (tier !== undefined) {
    return countries.filter(c => c.tier === tier).sort((a, b) => a.name.localeCompare(b.name));
  }
  return countries.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
