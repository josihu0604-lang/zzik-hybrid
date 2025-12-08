// src/lib/global-pricing.ts

export type Region = 
  | 'KR' | 'JP' | 'TW' | 'CN' | 'TH' 
  | 'US' | 'EU' | 'SEA' | 'GLOBAL';

export type Currency = 
  | 'KRW' | 'JPY' | 'TWD' | 'CNY' | 'THB' 
  | 'USD' | 'EUR' | 'SGD';

export type TierType = 'free' | 'silver' | 'gold' | 'platinum';
export type PlanType = 'starter' | 'growth' | 'enterprise' | 'kpartner';

// 지역별 통화 매핑
export const REGION_CURRENCY: Record<Region, Currency> = {
  KR: 'KRW',
  JP: 'JPY',
  TW: 'TWD',
  CN: 'CNY',
  TH: 'THB',
  US: 'USD',
  EU: 'EUR',
  SEA: 'USD',
  GLOBAL: 'USD',
};

// 환율 (KRW 기준, 실시간 API로 대체 예정)
export const EXCHANGE_RATES: Record<Currency, number> = {
  KRW: 1,
  JPY: 0.11,        // 1 KRW = 0.11 JPY
  TWD: 0.024,       // 1 KRW = 0.024 TWD
  CNY: 0.0053,      // 1 KRW = 0.0053 CNY
  THB: 0.026,       // 1 KRW = 0.026 THB
  USD: 0.00075,     // 1 KRW = 0.00075 USD
  EUR: 0.00069,     // 1 KRW = 0.00069 EUR
  SGD: 0.001,       // 1 KRW = 0.001 SGD
};

// B2C 티어 가격 (KRW 기준)
export const TIER_PRICES_KRW: Record<TierType, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  silver: { monthly: 9900, yearly: 94800 },      // 연 20% 할인
  gold: { monthly: 19900, yearly: 190800 },
  platinum: { monthly: 39900, yearly: 382800 },
};

// B2B 플랜 가격 (KRW 기준)
export const PLAN_PRICES_KRW: Record<PlanType, { monthly: number; yearly: number }> = {
  starter: { monthly: 500000, yearly: 4500000 },    // 연 25% 할인
  growth: { monthly: 1500000, yearly: 13500000 },
  enterprise: { monthly: 5000000, yearly: 45000000 },
  kpartner: { monthly: 0, yearly: 0 },              // 협의
};

// 지역별 가격 계산
export function getTierPrice(
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly'
): { amount: number; currency: Currency; formatted: string } {
  const krwPrice = TIER_PRICES_KRW[tier][period];
  const currency = REGION_CURRENCY[region];
  const rate = EXCHANGE_RATES[currency];
  
  // 심리적 가격점으로 반올림
  const rawAmount = krwPrice * rate;
  const amount = roundToPsychological(rawAmount, currency);
  
  return {
    amount,
    currency,
    formatted: formatCurrency(amount, currency),
  };
}

// 심리적 가격점 반올림
function roundToPsychological(amount: number, currency: Currency): number {
  const rules: Record<Currency, (n: number) => number> = {
    KRW: (n) => Math.round(n / 100) * 100,           // 100원 단위
    JPY: (n) => Math.round(n / 10) * 10,             // 10엔 단위
    TWD: (n) => Math.round(n),                        // 1원 단위
    CNY: (n) => Math.round(n * 10) / 10,             // 0.1위안 단위
    THB: (n) => Math.round(n),                        // 1바트 단위
    USD: (n) => Math.round(n * 100) / 100 - 0.01,    // $X.99
    EUR: (n) => Math.round(n * 100) / 100 - 0.01,    // €X.99
    SGD: (n) => Math.round(n * 100) / 100,
  };
  
  return Math.max(0, rules[currency](amount));
}

// 통화 포맷팅
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  });
  
  return formatter.format(amount);
}

function getCurrencyLocale(currency: Currency): string {
  const locales: Record<Currency, string> = {
    KRW: 'ko-KR',
    JPY: 'ja-JP',
    TWD: 'zh-TW',
    CNY: 'zh-CN',
    THB: 'th-TH',
    USD: 'en-US',
    EUR: 'de-DE',
    SGD: 'en-SG',
  };
  return locales[currency];
}

// 티어 혜택 정의
export const TIER_FEATURES: Record<TierType, string[]> = {
  free: [
    'basic_verification',
    'monthly_10_verifications',
    'standard_notifications',
    'ads_included',
  ],
  silver: [
    'unlimited_verifications',
    'ad_free',
    'priority_notifications',
    'detailed_stats',
    'monthly_1_vip_entry',
    'silver_badge',
  ],
  gold: [
    'all_silver_features',
    'vip_24h_early_access',
    'fanmeeting_priority_2x',
    'monthly_3_vip_entries',
    'exclusive_content',
    'dedicated_support',
    'gold_badge',
  ],
  platinum: [
    'all_gold_features',
    'vip_48h_early_access',
    'fanmeeting_priority_5x',
    'unlimited_vip_entries',
    'annual_premium_experience',
    'concierge_service',
    'quarterly_goods_package',
    'platinum_badge_and_frame',
  ],
};
