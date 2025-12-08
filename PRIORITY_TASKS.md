# ZZIK Global - Priority Task List

**Date**: 2025-12-08  
**Sprint**: 1 (Week 1-2)  

---

## Priority Legend

| Level | Description | Timeline |
|-------|-------------|----------|
| 🔴 P0 | Critical - Blocks launch | ASAP (This week) |
| 🟠 P1 | High - Required for MVP | This sprint |
| 🟡 P2 | Medium - Important but not blocking | Next sprint |
| 🟢 P3 | Low - Nice to have | Backlog |

---

## 🔴 P0 - Critical (Must Complete This Week)

### Infrastructure

- [ ] **DB-001**: Create Supabase migration for `vip_tickets` table
  - Includes RLS policies
  - Indexes for user_id, stripe_customer_id
  
- [ ] **DB-002**: Create migration for `payment_transactions` table
  - Foreign key to vip_tickets
  - Indexes for performance
  
- [ ] **DB-003**: Create migration for `user_preferences` table
  - Store region, locale, currency settings
  
- [ ] **DB-004**: Create migration for `k_experiences` table
  - JSONB for multilingual title/description
  - PostGIS extension for location queries

### VIP Ticket Module

- [ ] **VIP-001**: Implement `saveTicket()` with Supabase
  ```typescript
  // src/lib/vip-ticket.ts
  async function saveTicket(ticket: VIPTicket): Promise<void>
  ```
  
- [ ] **VIP-002**: Implement `getTicket()` with Supabase
  ```typescript
  async function getTicket(ticketId: string): Promise<VIPTicket | null>
  ```
  
- [ ] **VIP-003**: Implement `updateTicket()` with Supabase
  ```typescript
  async function updateTicket(ticket: VIPTicket): Promise<void>
  ```

### Stripe Configuration

- [ ] **STRIPE-001**: Create products in Stripe Dashboard
  - VIP Silver (KR, JP, US)
  - VIP Gold (KR, JP, US)
  - VIP Platinum (KR, JP, US)
  
- [ ] **STRIPE-002**: Create Price IDs for all tiers/regions
  - Monthly and yearly variants
  - Test mode first, then production
  
- [ ] **STRIPE-003**: Update `stripe.ts` with real Price IDs
  ```typescript
  const STRIPE_PRICES: Record<string, string> = {
    'silver_monthly_KR': 'price_xxxxx', // Real IDs
  };
  ```

### Environment Configuration

- [ ] **ENV-001**: Set up Stripe environment variables
  ```env
  STRIPE_SECRET_KEY=sk_test_xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  ```

---

## 🟠 P1 - High Priority (This Sprint)

### API Endpoints

- [ ] **API-001**: Create `/api/exchange-rates` endpoint
  - Fetch from external API (Open Exchange Rates / Fixer.io)
  - Cache for 1 hour
  - Return rates for all supported currencies

- [ ] **API-002**: Create `/api/geo-detect` endpoint
  - Use IP-API or MaxMind
  - Return country, region, locale, timezone

- [ ] **API-003**: Create `/api/pricing/tiers` endpoint
  - Accept region parameter
  - Return formatted prices for all tiers

- [ ] **API-004**: Create `/api/user/preferences` endpoint
  - GET: Return user preferences
  - PUT: Update user preferences

### Geo Detection Enhancement

- [ ] **GEO-001**: Integrate real IP geolocation
  ```typescript
  // src/lib/geo-detection.ts
  export async function detectGeoFromIP(): Promise<GeoData> {
    // Implement with ipapi.co or MaxMind
  }
  ```

### Payment Flow Testing

- [ ] **PAY-001**: Test checkout session creation end-to-end
- [ ] **PAY-002**: Test webhook signature verification
- [ ] **PAY-003**: Test full subscription lifecycle

### i18n Improvements

- [ ] **I18N-001**: Fix mock t() in BentoGrid
  ```tsx
  // Use proper useTranslation hook
  import { useTranslations } from '@/i18n';
  const t = useTranslations('kexperience');
  ```

- [ ] **I18N-002**: Add K-Experience translation keys to all locales
  ```json
  {
    "kexperience": {
      "categories": {
        "kpop": "K-POP",
        "kdrama": "K-Drama"
      }
    }
  }
  ```

---

## 🟡 P2 - Medium Priority (Next Sprint)

### Testing

- [ ] **TEST-001**: Unit tests for `global-pricing.ts`
  - Test getTierPrice for all regions
  - Test psychological pricing rounding
  - Test currency formatting

- [ ] **TEST-002**: Unit tests for `vip-ticket.ts`
  - Test createVIPTicket
  - Test upgradeTicket pricing calculation
  - Test hasAccess permission checks

- [ ] **TEST-003**: Unit tests for `currency.ts`
  - Test convertCurrency
  - Test cache expiration

- [ ] **TEST-004**: E2E tests for payment checkout
  - Test redirect to Stripe
  - Test success/cancel callbacks

### Localization

- [ ] **I18N-003**: Add `zh-TW` locale
  - Create `/src/i18n/locales/zh-TW.json`
  - Traditional Chinese translations

- [ ] **I18N-004**: Add `th` locale
  - Create `/src/i18n/locales/th.json`
  - Thai translations

### K-Experience Components

- [ ] **KX-001**: Create experience card component
  ```tsx
  // src/components/k-experience/ExperienceCard.tsx
  ```

- [ ] **KX-002**: Create category page template
  ```tsx
  // src/app/[locale]/k-experience/[category]/page.tsx
  ```

### Documentation

- [ ] **DOC-001**: API documentation for payment endpoints
- [ ] **DOC-002**: Deployment guide update

---

## 🟢 P3 - Low Priority (Backlog)

### Performance

- [ ] **PERF-001**: Optimize bundle size analysis
- [ ] **PERF-002**: Implement image optimization for K-experiences
- [ ] **PERF-003**: Add service worker for offline support

### Monitoring

- [ ] **MON-001**: Set up Sentry error tracking
- [ ] **MON-002**: Configure GA4 events
- [ ] **MON-003**: Set up Mixpanel funnels

### Admin Features

- [ ] **ADMIN-001**: Create admin dashboard
- [ ] **ADMIN-002**: Add K-experience management
- [ ] **ADMIN-003**: Add verification approval flow

### Partner Features

- [ ] **PARTNER-001**: Partner registration flow
- [ ] **PARTNER-002**: Partner analytics dashboard
- [ ] **PARTNER-003**: Campaign management

---

## Quick Start Commands

```bash
# 1. Install dependencies
cd /home/user/webapp && pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run database migration (after creating migration file)
cd /home/user/webapp && npx supabase db push

# 4. Start development server
cd /home/user/webapp && pnpm dev

# 5. Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/payment/webhook

# 6. Run type check
cd /home/user/webapp && pnpm type-check

# 7. Run linting
cd /home/user/webapp && pnpm lint
```

---

## Daily Standup Checklist

### Morning
- [ ] Review P0 blockers
- [ ] Check Stripe Dashboard for issues
- [ ] Review error logs (Sentry when configured)

### Evening
- [ ] Commit all changes
- [ ] Update task status
- [ ] Document blockers

---

## This Week's Focus

**Week 1**: Infrastructure
```
Mon: DB migrations (DB-001 to DB-004)
Tue: VIP module Supabase integration (VIP-001 to VIP-003)
Wed: Stripe configuration (STRIPE-001 to STRIPE-003)
Thu: Environment setup, testing (ENV-001, PAY-001)
Fri: Buffer / review / fixes
```

**Week 2**: APIs & Testing
```
Mon: API endpoints (API-001 to API-004)
Tue: Geo detection enhancement (GEO-001)
Wed: Payment flow testing (PAY-002, PAY-003)
Thu: i18n improvements (I18N-001, I18N-002)
Fri: Integration testing / review
```

---

**Last Updated**: 2025-12-08  
**Owner**: Development Team

*ZZIK Inc.*
