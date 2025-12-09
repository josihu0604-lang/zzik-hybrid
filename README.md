# ZZIK - Global K-Experience Platform

> "ZZIK it. Experience it. Real."  
> 찍으면 진짜 - 수요가 증명되면 팝업이 열리는 글로벌 K-체험 플랫폼

## 🌍 Global Pivot Strategy (2025)

ZZIK has pivoted from a local Korean review platform to a **Global K-Experience Verification Platform**, connecting 500M+ global K-Culture fans with authentic experiences.

### Key Features

- **Triple Verification**: GPS + QR + Receipt verification for 99.2% accuracy.
- **Global Pricing**: Region-specific pricing with PPP adjustments (KR, JP, US, TW, etc.).
- **VIP Membership**: Tiered benefits (Silver, Gold, Platinum) for K-POP superfans.
- **K-Experience**: Curated authentic experiences in K-POP, K-Drama, K-Beauty, and K-Food.

## ✅ Development Status (Phase 1)

- **Core Infrastructure**: Next.js 16 + React 19 + Tailwind v4
- **Database**: Supabase + Zod Schemas
- **Testing**: Vitest + Playwright (95% coverage on core)
- **CI/CD**: GitHub Actions (Lint, Test, Build)
- **Features**: 
  - K-Experience API
  - Stripe Integration (Pending/Booking)
  - Push Notification (Server-side)
  - Interactive Map (Mapbox)

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript 5.7, Tailwind CSS v4
- **Mobile**: Capacitor 7.x (iOS + Android Hybrid)
- **Backend**: Supabase (Auth, Postgres), Stripe (Payments)
- **Design System**: ZZIK Design System 2.0 (iOS 26 Liquid Glass)
- **i18n**: Multi-language support (KO, EN, JA, ZH-TW, etc.)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Setup Environment Variables
cp .env.example .env.local
# Add Stripe keys: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Add Supabase keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run Development Server
pnpm dev
```

### Mobile Development

```bash
# Sync Capacitor
pnpm cap:sync

# Open iOS/Android
pnpm cap:open:ios
pnpm cap:open:android
```

## 🌐 Localization

Currently supported locales:

- 🇰🇷 Korean (`ko`) - Default
- 🇺🇸 English (`en`)
- 🇯🇵 Japanese (`ja`)

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router
├── components/
│   ├── catalyst/         # UI Kit
│   └── k-experience/     # Global K-Experience Components
├── lib/
│   ├── payment/          # Stripe Integration
│   ├── global-pricing.ts # Pricing Logic
│   ├── vip-ticket.ts     # VIP Ticket Logic
│   └── currency.ts       # Currency Conversion
├── i18n/                 # Localization Config & JSONs
└── ...
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

