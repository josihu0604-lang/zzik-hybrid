# ZZIK 글로벌 기술 구현 로드맵
## Technical Implementation Roadmap

**버전**: 1.0  
**작성일**: 2025-12-07  
**상태**: FINAL  

---

## 1. Executive Summary

### 1.1 현재 기술 스택

| 영역 | 기술 | 상태 |
|------|------|------|
| Frontend | Next.js 15, TypeScript 5.7, Tailwind CSS v4 | ✅ Production |
| Mobile | Capacitor 7.x (iOS + Android) | ✅ Production |
| Design | iOS 26 Liquid Glass, Catalyst UI Kit | ✅ Production |
| Backend | Supabase (Auth, PostgreSQL, Storage) | ✅ Production |
| Hosting | Vercel (Seoul Region) | ✅ Production |
| Maps | Mapbox GL JS, Kakao Maps API | ✅ Production |
| AI/ML | Google Gemini AI | ✅ Production |

### 1.2 글로벌 확장을 위한 개발 필요 항목

| 항목 | 우선순위 | 예상 공수 | 상태 |
|------|---------|----------|------|
| 글로벌 가격 시스템 | 🔴 Critical | 2주 | ⏳ 미구현 |
| VIP 티켓 모듈 | 🔴 Critical | 2주 | ⏳ 미구현 |
| Stripe 결제 연동 | 🔴 Critical | 2주 | ⏳ 미구현 |
| 다국어 확장 (ja, zh-TW) | 🔴 Critical | 2주 | ⏳ 미구현 |
| 지역 감지 시스템 | 🟡 High | 1주 | ⏳ 미구현 |
| 통화 변환 시스템 | 🟡 High | 1주 | ⏳ 미구현 |
| K-Experience 컴포넌트 | 🟡 High | 2주 | ⏳ 미구현 |
| 글로벌 CDN 최적화 | 🟢 Medium | 1주 | ⏳ 미구현 |

---

## 2. Phase 1: 글로벌 인프라 (Week 1-2)

### 2.1 글로벌 가격 시스템

#### 파일: `src/lib/global-pricing.ts`

```typescript
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
```

### 2.2 VIP 티켓 모듈

#### 파일: `src/lib/vip-ticket.ts`

```typescript
// src/lib/vip-ticket.ts

import { TierType, getTierPrice, TIER_FEATURES, Region } from './global-pricing';

export interface VIPTicket {
  id: string;
  userId: string;
  tier: TierType;
  region: Region;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  paymentMethod: string;
  transactionHistory: Transaction[];
}

export interface Transaction {
  id: string;
  ticketId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  stripePaymentIntentId?: string;
}

// VIP 티켓 생성
export async function createVIPTicket(
  userId: string,
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly'
): Promise<VIPTicket> {
  const price = getTierPrice(tier, region, period);
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (period === 'yearly' ? 12 : 1));
  
  const ticket: VIPTicket = {
    id: generateTicketId(),
    userId,
    tier,
    region,
    startDate,
    endDate,
    isActive: false,  // 결제 완료 후 활성화
    autoRenew: true,
    paymentMethod: '',
    transactionHistory: [],
  };
  
  // Supabase에 저장
  await saveTicket(ticket);
  
  return ticket;
}

// 티켓 업그레이드
export async function upgradeTicket(
  ticketId: string,
  newTier: TierType
): Promise<VIPTicket> {
  const ticket = await getTicket(ticketId);
  
  if (!ticket) throw new Error('Ticket not found');
  
  // 업그레이드 가격 계산 (비례 계산)
  const remainingDays = getRemainingDays(ticket.endDate);
  const upgradePrice = calculateUpgradePrice(ticket.tier, newTier, remainingDays, ticket.region);
  
  // 결제 처리 후 업그레이드
  ticket.tier = newTier;
  await updateTicket(ticket);
  
  return ticket;
}

// 티켓 갱신
export async function renewTicket(ticketId: string): Promise<VIPTicket> {
  const ticket = await getTicket(ticketId);
  
  if (!ticket) throw new Error('Ticket not found');
  
  const newEndDate = new Date(ticket.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + 1);
  
  ticket.endDate = newEndDate;
  await updateTicket(ticket);
  
  return ticket;
}

// 혜택 확인
export function getTicketBenefits(tier: TierType): string[] {
  return TIER_FEATURES[tier];
}

// 권한 확인
export function hasAccess(ticket: VIPTicket | null, feature: string): boolean {
  if (!ticket || !ticket.isActive) {
    return TIER_FEATURES.free.includes(feature);
  }
  
  return TIER_FEATURES[ticket.tier].includes(feature);
}

// 유틸리티 함수들
function generateTicketId(): string {
  return `VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRemainingDays(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateUpgradePrice(
  currentTier: TierType,
  newTier: TierType,
  remainingDays: number,
  region: Region
): number {
  const currentPrice = getTierPrice(currentTier, region, 'monthly');
  const newPrice = getTierPrice(newTier, region, 'monthly');
  
  const dailyDiff = (newPrice.amount - currentPrice.amount) / 30;
  return Math.max(0, dailyDiff * remainingDays);
}

// Supabase 함수들 (구현 필요)
async function saveTicket(ticket: VIPTicket): Promise<void> {
  // TODO: Supabase insert
}

async function getTicket(ticketId: string): Promise<VIPTicket | null> {
  // TODO: Supabase select
  return null;
}

async function updateTicket(ticket: VIPTicket): Promise<void> {
  // TODO: Supabase update
}
```

### 2.3 통화 변환 시스템

#### 파일: `src/lib/currency.ts`

```typescript
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
```

---

## 3. Phase 2: 결제 시스템 (Week 3-4)

### 3.1 Stripe 결제 연동

#### 파일: `src/lib/payment/stripe.ts`

```typescript
// src/lib/payment/stripe.ts

import Stripe from 'stripe';
import { TierType, PlanType, Region, getTierPrice } from '../global-pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Stripe Price ID 매핑 (Stripe Dashboard에서 생성 후 매핑)
const STRIPE_PRICES: Record<string, string> = {
  // B2C Tiers (Monthly)
  'silver_monthly_KR': 'price_xxx_silver_kr_monthly',
  'silver_monthly_JP': 'price_xxx_silver_jp_monthly',
  'silver_monthly_US': 'price_xxx_silver_us_monthly',
  // ... 추가
  
  // B2C Tiers (Yearly)
  'silver_yearly_KR': 'price_xxx_silver_kr_yearly',
  // ... 추가
  
  // B2B Plans
  'starter_monthly_KR': 'price_xxx_starter_kr_monthly',
  // ... 추가
};

// Checkout 세션 생성
export async function createCheckoutSession(
  userId: string,
  tier: TierType,
  region: Region,
  period: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const priceKey = `${tier}_${period}_${region}`;
  const priceId = STRIPE_PRICES[priceKey];
  
  if (!priceId) {
    throw new Error(`Price not found for: ${priceKey}`);
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: await getUserEmail(userId),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      region,
      period,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
        region,
      },
    },
    // 지역별 결제 방법
    payment_method_types: getPaymentMethodsForRegion(region),
    // 세금 계산 (선택)
    automatic_tax: { enabled: true },
  });
  
  return session;
}

// 지역별 결제 방법
function getPaymentMethodsForRegion(region: Region): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const methodsMap: Record<Region, Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> = {
    KR: ['card'],
    JP: ['card'],
    TW: ['card'],
    CN: ['card', 'alipay', 'wechat_pay'],
    TH: ['card', 'promptpay'],
    US: ['card'],
    EU: ['card', 'sepa_debit', 'ideal', 'bancontact'],
    SEA: ['card', 'grabpay'],
    GLOBAL: ['card'],
  };
  
  return methodsMap[region];
}

// 구독 취소
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// 구독 업그레이드
export async function upgradeSubscription(
  subscriptionId: string,
  newTier: TierType,
  region: Region
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriod = subscription.items.data[0].price.recurring?.interval === 'year' 
    ? 'yearly' 
    : 'monthly';
  
  const newPriceKey = `${newTier}_${currentPeriod}_${region}`;
  const newPriceId = STRIPE_PRICES[newPriceKey];
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// 결제 내역 조회
export async function getPaymentHistory(
  customerId: string,
  limit: number = 10
): Promise<Stripe.PaymentIntent[]> {
  const paymentIntents = await stripe.paymentIntents.list({
    customer: customerId,
    limit,
  });
  
  return paymentIntents.data;
}

// Customer Portal 세션 생성 (구독 관리)
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// 유틸리티
async function getUserEmail(userId: string): Promise<string> {
  // Supabase에서 사용자 이메일 조회
  return 'user@example.com'; // TODO: 실제 구현
}
```

### 3.2 결제 API 라우트

#### 파일: `src/app/api/payment/route.ts`

```typescript
// src/app/api/payment/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { tier, region, period } = body;
    
    // 유효성 검사
    if (!tier || !region || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zzik.app';
    
    const session = await createCheckoutSession(
      user.id,
      tier,
      region,
      period,
      `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/payment/cancel`
    );
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
```

### 3.3 Stripe Webhook

#### 파일: `src/app/api/payment/webhook/route.ts`

```typescript
// src/app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createVIPTicket } from '@/lib/vip-ticket';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancel(subscription);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, tier, region, period } = session.metadata!;
  
  // VIP 티켓 생성 및 활성화
  const ticket = await createVIPTicket(userId, tier as any, region as any, period as any);
  
  // 이메일 발송
  // await sendWelcomeEmail(userId, tier);
  
  console.log(`VIP Ticket created: ${ticket.id}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { userId, tier, region } = subscription.metadata;
  
  // 티켓 업데이트
  // await updateUserTicket(userId, { tier, status: subscription.status });
  
  console.log(`Subscription updated for user: ${userId}`);
}

async function handleSubscriptionCancel(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;
  
  // 티켓 비활성화
  // await deactivateUserTicket(userId);
  
  console.log(`Subscription cancelled for user: ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // 결제 실패 알림
  // await sendPaymentFailedNotification(customerId);
  
  console.log(`Payment failed for customer: ${customerId}`);
}
```

---

## 4. Phase 3: 글로벌 UX (Week 5-6)

### 4.1 지역 감지 시스템

#### 파일: `src/lib/geo-detection.ts`

```typescript
// src/lib/geo-detection.ts

import { Region } from './global-pricing';
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';

interface GeoData {
  country: string;
  region: Region;
  locale: Locale;
  timezone: string;
  currency: string;
}

// IP 기반 지역 감지
export async function detectGeoFromIP(): Promise<GeoData> {
  try {
    // 실제 구현 시 IP 지오로케이션 API 사용
    // 예: MaxMind, IP-API, ipinfo.io
    const response = await fetch('/api/geo-detect');
    const data = await response.json();
    
    return {
      country: data.country,
      region: countryToRegion(data.country),
      locale: countryToLocale(data.country),
      timezone: data.timezone,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Geo detection failed:', error);
    return getDefaultGeoData();
  }
}

// 브라우저 설정 기반 감지
export function detectGeoFromBrowser(): Partial<GeoData> {
  const browserLocale = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return {
    locale: browserLocaleToLocale(browserLocale),
    timezone,
  };
}

// 국가 → 지역 매핑
function countryToRegion(country: string): Region {
  const regionMap: Record<string, Region> = {
    KR: 'KR',
    JP: 'JP',
    TW: 'TW',
    CN: 'CN',
    HK: 'TW',  // 홍콩은 대만과 같은 번체 사용
    TH: 'TH',
    VN: 'SEA',
    SG: 'SEA',
    MY: 'SEA',
    ID: 'SEA',
    PH: 'SEA',
    US: 'US',
    CA: 'US',
    GB: 'EU',
    DE: 'EU',
    FR: 'EU',
    // ... 기타 국가
  };
  
  return regionMap[country] || 'GLOBAL';
}

// 국가 → 로케일 매핑
function countryToLocale(country: string): Locale {
  const localeMap: Record<string, Locale> = {
    KR: 'ko',
    JP: 'ja',
    TW: 'zh-TW',
    CN: 'zh-CN',
    HK: 'zh-TW',
    TH: 'th',
    // 영어권은 기본 영어
    US: 'en',
    GB: 'en',
    AU: 'en',
    CA: 'en',
    // ... 기타 국가
  };
  
  return localeMap[country] || 'en';
}

// 브라우저 로케일 변환
function browserLocaleToLocale(browserLocale: string): Locale {
  const [lang, region] = browserLocale.split('-');
  
  // 중국어는 지역 구분
  if (lang === 'zh') {
    if (region === 'TW' || region === 'HK') return 'zh-TW';
    return 'zh-CN';
  }
  
  // 지원 로케일에 있으면 반환
  if (SUPPORTED_LOCALES.includes(lang as Locale)) {
    return lang as Locale;
  }
  
  return DEFAULT_LOCALE;
}

function getDefaultGeoData(): GeoData {
  return {
    country: 'KR',
    region: 'KR',
    locale: 'ko',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
  };
}

// React Hook
export function useGeoDetection() {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function detect() {
      // 저장된 설정 확인
      const saved = localStorage.getItem('zzik_geo');
      if (saved) {
        setGeoData(JSON.parse(saved));
        setLoading(false);
        return;
      }
      
      // 새로 감지
      const data = await detectGeoFromIP();
      setGeoData(data);
      localStorage.setItem('zzik_geo', JSON.stringify(data));
      setLoading(false);
    }
    
    detect();
  }, []);
  
  const updateRegion = (region: Region) => {
    if (geoData) {
      const newData = { ...geoData, region };
      setGeoData(newData);
      localStorage.setItem('zzik_geo', JSON.stringify(newData));
    }
  };
  
  return { geoData, loading, updateRegion };
}
```

### 4.2 K-Experience 컴포넌트

#### 파일: `src/components/k-experience/BentoGrid.tsx`

```tsx
// src/components/k-experience/BentoGrid.tsx

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface KExperienceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
  featured?: boolean;
}

const categories: KExperienceCategory[] = [
  { id: 'kpop', title: 'K-POP', icon: '🎤', color: 'from-pink-500 to-purple-600', count: 234, featured: true },
  { id: 'kdrama', title: 'K-Drama', icon: '🎬', color: 'from-blue-500 to-cyan-600', count: 156 },
  { id: 'kbeauty', title: 'K-Beauty', icon: '💄', color: 'from-rose-400 to-pink-500', count: 189 },
  { id: 'kfood', title: 'K-Food', icon: '🍜', color: 'from-orange-400 to-red-500', count: 312 },
  { id: 'kfashion', title: 'K-Fashion', icon: '👗', color: 'from-violet-500 to-purple-600', count: 98 },
];

export function KExperienceBentoGrid() {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-gradient-to-br',
            category.color,
            category.featured ? 'col-span-2 row-span-2' : 'col-span-1',
            // iOS 26 Liquid Glass
            'backdrop-blur-xl',
            'border border-white/20',
            'shadow-xl shadow-black/10',
          )}
        >
          {/* Liquid Glass Overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-saturate-150" />
          
          <div className="relative p-6 h-full flex flex-col justify-between">
            {/* Icon */}
            <span className={cn(
              'text-4xl',
              category.featured && 'text-6xl'
            )}>
              {category.icon}
            </span>
            
            {/* Content */}
            <div>
              <h3 className={cn(
                'font-bold text-white',
                category.featured ? 'text-2xl' : 'text-lg'
              )}>
                {t(`kexperience.categories.${category.id}`)}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {category.count} {t('kexperience.experiences')}
              </p>
            </div>
            
            {/* Badge */}
            {category.featured && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xs font-medium text-white">
                  {t('kexperience.featured')}
                </span>
              </div>
            )}
          </div>
          
          {/* Interactive Ripple Effect */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
```

### 4.3 글로벌 랜딩 페이지

#### 파일: `src/app/[locale]/landing/page.tsx`

```tsx
// src/app/[locale]/landing/page.tsx

import { Metadata } from 'next';
import { getTranslations } from '@/i18n/server';
import { KExperienceBentoGrid } from '@/components/k-experience/BentoGrid';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations(params.locale);
  
  return {
    title: t('landing.meta.title'),
    description: t('landing.meta.description'),
    openGraph: {
      title: t('landing.meta.og_title'),
      description: t('landing.meta.og_description'),
      images: ['/og-image-global.png'],
    },
  };
}

export default async function GlobalLandingPage({ params }: Props) {
  const t = await getTranslations(params.locale);
  
  return (
    <main className="min-h-screen bg-[var(--zzik-bg-primary)]">
      {/* Hero Section */}
      <HeroSection
        title={t('landing.hero.title')}
        subtitle={t('landing.hero.subtitle')}
        cta={t('landing.hero.cta')}
      />
      
      {/* K-Experience Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('landing.kexperience.title')}
          </h2>
          <KExperienceBentoGrid />
        </div>
      </section>
      
      {/* Features */}
      <FeaturesSection locale={params.locale} />
      
      {/* Testimonials */}
      <TestimonialsSection locale={params.locale} />
      
      {/* CTA */}
      <CTASection
        title={t('landing.cta.title')}
        subtitle={t('landing.cta.subtitle')}
        buttonText={t('landing.cta.button')}
      />
    </main>
  );
}
```

---

## 5. 데이터베이스 스키마

### 5.1 Supabase 테이블 추가

```sql
-- VIP 티켓 테이블
CREATE TABLE vip_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'silver', 'gold', 'platinum')),
  region VARCHAR(10) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 내역 테이블
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES vip_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 지역 설정 테이블
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  region VARCHAR(10) DEFAULT 'GLOBAL',
  locale VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- K-Experience 테이블
CREATE TABLE k_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('kpop', 'kdrama', 'kbeauty', 'kfood', 'kfashion')),
  title JSONB NOT NULL, -- { "ko": "...", "en": "...", "ja": "..." }
  description JSONB NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address JSONB,
  images TEXT[],
  tags TEXT[],
  verification_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE vip_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 사용자 본인만 조회 가능
CREATE POLICY "Users can view own tickets" ON vip_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_vip_tickets_user_id ON vip_tickets(user_id);
CREATE INDEX idx_vip_tickets_stripe_customer ON vip_tickets(stripe_customer_id);
CREATE INDEX idx_k_experiences_category ON k_experiences(category);
CREATE INDEX idx_k_experiences_location ON k_experiences USING GIST (
  ST_MakePoint(location_lng, location_lat)
);
```

---

## 6. 배포 체크리스트

### 6.1 환경 변수

```env
# .env.production

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Geo Detection
MAXMIND_LICENSE_KEY=xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-xxx
NEXT_PUBLIC_MIXPANEL_TOKEN=xxx

# CDN
NEXT_PUBLIC_CDN_URL=https://cdn.zzik.app
```

### 6.2 배포 단계

| 단계 | 작업 | 담당 | 기간 |
|------|------|------|------|
| 1 | 개발 환경 테스트 | 개발팀 | 1주 |
| 2 | Staging 배포 | DevOps | 2일 |
| 3 | QA 테스트 | QA팀 | 1주 |
| 4 | 보안 검토 | 보안팀 | 3일 |
| 5 | Production 배포 | DevOps | 1일 |
| 6 | 모니터링 | 전체 | 상시 |

### 6.3 롤백 계획

```bash
# Vercel 롤백
vercel rollback [deployment-url]

# 데이터베이스 롤백
supabase db reset --db-url $DATABASE_URL

# Feature Flag 비활성화
# 대시보드에서 글로벌 기능 플래그 OFF
```

---

## 7. 모니터링 및 알림

### 7.1 모니터링 대시보드

| 지표 | 도구 | 임계값 |
|------|------|--------|
| API 응답 시간 | Vercel Analytics | < 200ms (p95) |
| 에러율 | Sentry | < 0.1% |
| 결제 성공률 | Stripe Dashboard | > 95% |
| 서버 상태 | Uptime Robot | 99.9% |

### 7.2 알림 설정

| 이벤트 | 채널 | 담당 |
|--------|------|------|
| 서버 다운 | Slack + PagerDuty | DevOps |
| 결제 실패 급증 | Slack | 개발팀 |
| 에러 스파이크 | Slack | 개발팀 |
| 일일 리포트 | Email | 전체 |

---

## 8. 타임라인 요약

| 주차 | Phase | 주요 작업 | 산출물 |
|------|-------|----------|--------|
| W1-2 | Phase 1 | 글로벌 인프라 | global-pricing.ts, vip-ticket.ts, currency.ts |
| W3-4 | Phase 2 | 결제 시스템 | Stripe 연동, API, Webhook |
| W5-6 | Phase 3 | 글로벌 UX | 지역 감지, K-Experience, 랜딩 페이지 |
| W7 | QA | 통합 테스트 | 버그 수정 |
| W8 | 배포 | Production 배포 | 런칭 |

---

## 9. 결론

### 9.1 핵심 구현 항목

1. ✅ 글로벌 가격 시스템 설계
2. ✅ VIP 티켓 모듈 설계
3. ✅ Stripe 결제 연동 설계
4. ✅ 지역 감지 시스템 설계
5. ✅ K-Experience 컴포넌트 설계
6. ✅ 데이터베이스 스키마 설계

### 9.2 예상 리소스

| 역할 | 인원 | 기간 |
|------|------|------|
| Frontend | 2명 | 8주 |
| Backend | 2명 | 8주 |
| DevOps | 1명 | 4주 |
| QA | 1명 | 4주 |
| PM | 1명 | 8주 |

### 9.3 예상 비용

| 항목 | 월 비용 |
|------|--------|
| Vercel Pro | $20/member |
| Supabase Pro | $25 |
| Stripe | 2.9% + $0.30/건 |
| 기타 (CDN, 모니터링) | ~$100 |

---

**문서 종료**

*© 2025 ZZIK Inc. All Rights Reserved.*
