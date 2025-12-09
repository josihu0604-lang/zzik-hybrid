# ZZIK - K-POP VIP Experience Platform

> **Your K-POP VIP Experience** | Hightough - Soundcheck - Backstage

---

## Quick Start

```bash
cd /home/ubuntu/zzik-hybrid
pnpm install
pnpm dev
# http://localhost:3000
```

---

## Project Identity

```yaml
Name: ZZIK (찍)
Tagline: 'Your K-POP VIP Experience'
Concept: K-POP VIP Experience 3-Way Marketplace
Core Value: Book exclusive K-POP experiences worldwide

Target Markets (11 Countries):
  Tier 1A: Thailand, Indonesia, Philippines
  Tier 1B: Kazakhstan (CIS gateway)
  Tier 2: Taiwan, Singapore, Malaysia
  Tier 3: Japan, South Korea, USA
  Tier 4: China (future)

Target Users:
  - Consumers: K-POP fans booking VIP experiences
  - Artists/Agencies: List and manage experiences
  - Leaders: Influencers earning 10% commission

Stack:
  - Next.js 15 + TypeScript 5.6
  - Supabase (Auth, DB with RLS, Storage)
  - Capacitor (iOS/Android hybrid apps)
  - i18n (EN/KO/RU + more)

Design: ZZIK Design System 2.0
Philosophy: 'Linear restraint + iOS Liquid Glass + VIP Premium'

Brand Identity:
  Primary: #FF6B5B (Flame Coral)
  Secondary: #CC4A3A (Deep Ember)
  Accent: #FFD93D (Electric Yellow - Leader/Premium)
```

---

## Experience Types

```yaml
Hightough ($150 base):
  - Meet & Greet with artists
  - Photo opportunity
  - Personal interaction

Soundcheck ($300 base):
  - Watch exclusive soundcheck sessions
  - Behind-the-scenes access
  - Early venue entry

Backstage ($1,500 base):
  - Full backstage access
  - Artist dressing room visit
  - Exclusive merchandise

Popup Event ($5 base):
  - Brand popup experiences
  - Limited-time events
  - Fan gatherings
```

---

## Core Flow

```
1. User discovers K-POP VIP experience
2. Select country → View PPP-adjusted price
3. "Book Now" → Secure booking
4. Attend event → Triple Verification (QR + GPS + NFC)
5. Check-in complete → Earn badges
6. Leader: Share referral link → Earn 10% commission
```

---

## Business Model

```yaml
3-Way Marketplace:
  Consumer: Book VIP experiences with favorite artists
  Artist/Agency: List experiences, manage bookings
  Leader: Refer fans, earn 10-15% commission

Revenue:
  - Booking fees: 15-20% per transaction
  - Leader commission: 10-15% of booking value
  - Premium features: subscription

Pricing Strategy:
  - Base prices in USD
  - PPP adjustment per country (40-110% of US price)
  - Dynamic pricing (urgency + scarcity + demand)
```

---

## Page Structure

| Route              | Purpose                     |
| ------------------ | --------------------------- |
| `/`                | Homepage with GlobalHero    |
| `/experiences`     | Browse all experiences      |
| `/experience/[id]` | Experience detail + booking |
| `/artists`         | Browse artists              |
| `/map`             | Experience locations map    |
| `/me`              | My bookings + Profile       |
| `/leader`          | Leader dashboard            |
| `/onboarding`      | Country selection + intro   |

---

## Key Files

| Purpose         | Path                                           |
| --------------- | ---------------------------------------------- |
| Homepage        | `src/app/(home)/page.tsx`                      |
| Global Hero     | `src/components/home/GlobalHero.tsx`           |
| Experience Card | `src/components/experience/ExperienceCard.tsx` |
| Currency System | `src/lib/currency.ts`                          |
| i18n Config     | `src/i18n/config.ts`                           |
| Locales         | `src/i18n/locales/[lang].json`                 |
| Supabase Client | `src/lib/supabase/`                            |
| Backend Plan    | `BACKEND_DEVELOPMENT_PLAN.md`                  |

---

## Multi-Currency System

```typescript
// 11 supported currencies with PPP adjustment
const PPP_INDEX = {
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

// Usage
import { getLocalizedPrice } from '@/lib/currency';
const price = getLocalizedPrice(150, 'TH');
// → { amount: 3150, currency: 'THB', formatted: '฿3,150' }
```

---

## i18n System

```typescript
// Supported locales
const LOCALES = ['en', 'ko', 'ru'] as const;

// Usage in components
import { useTranslation } from '@/i18n';
const { t, locale, setLocale } = useTranslation();

// Example
t('experience.book'); // → "Book Now" (en) / "예약하기" (ko)
```

---

## Design System 2.0

```yaml
Philosophy: 'Linear restraint + iOS Liquid Glass + VIP Premium'

Colors:
  Base (90%):
    bg: '#08090a'
    surface: '#121314'
    elevated: '#1a1c1f'
    text-primary: '#f5f5f5'
    text-secondary: '#a8a8a8'
    border: '#262626'

  Accent (10%):
    flame: '#FF6B5B' # Primary action
    ember: '#CC4A3A' # Secondary action
    spark: '#FFD93D' # Leader/Premium

Effects:
  Liquid Glass:
    background: 'rgba(18, 19, 20, 0.75)'
    backdrop-filter: 'blur(24px) saturate(180%)'
    border: '1px solid rgba(255, 255, 255, 0.12)'
```

---

## Commands

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm type-check   # TypeScript check
pnpm lint         # ESLint
pnpm test:run     # Run tests
pnpm cap:sync     # Sync Capacitor
```

---

## API Integrations

| Service   | Purpose            | Status     |
| --------- | ------------------ | ---------- |
| Supabase  | Auth, DB, Storage  | Production |
| Capacitor | iOS/Android hybrid | Configured |
| Mapbox    | Map visualization  | Configured |
| Sentry    | Error monitoring   | Configured |

---

## Critical Rules

1. **Global First**: All text via i18n, prices via PPP adjustment
2. **Dark Mode Only**: Linear Deep Space theme
3. **Type Safety**: No `any`, strict TypeScript
4. **RLS Always**: Row Level Security on all tables
5. **Mobile Ready**: Capacitor hybrid for iOS/Android
6. **Spark Yellow for Leaders**: Premium differentiation

---

## Leader Tiers

| Tier     | Referrals | Commission |
| -------- | --------- | ---------- |
| Bronze   | 0-9       | 10%        |
| Silver   | 10-49     | 11%        |
| Gold     | 50-199    | 13%        |
| Platinum | 200+      | 15%        |

---

_ZZIK | Your K-POP VIP Experience | 11 Countries_
