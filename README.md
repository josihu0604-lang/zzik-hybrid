# ZZIK - K-POP VIP Experience Platform

> **Your K-POP VIP Experience** | Hightough - Soundcheck - Backstage

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Type check
pnpm type-check
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## What is ZZIK?

ZZIK is a **K-POP VIP Experience Platform** - a 3-way marketplace connecting:

- **Fans**: Book exclusive VIP experiences with K-POP artists
- **Artists/Agencies**: List and manage VIP experiences
- **Leaders**: Refer fans, earn 10-15% commission

---

## Experience Types

| Type        | Base Price | Description                         |
| ----------- | ---------- | ----------------------------------- |
| Hightough   | $150       | Meet & Greet with artists           |
| Soundcheck  | $300       | Watch exclusive soundcheck sessions |
| Backstage   | $1,500     | Full backstage access               |
| Popup Event | $5         | Brand popup experiences             |

---

## Target Markets (11 Countries)

```
Tier 1A: Thailand, Indonesia, Philippines
Tier 1B: Kazakhstan (CIS gateway)
Tier 2:  Taiwan, Singapore, Malaysia
Tier 3:  Japan, South Korea, USA
Tier 4:  China (future)
```

All prices are PPP-adjusted for local purchasing power.

---

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Next.js 15 + TypeScript 5.6          |
| Styling   | Tailwind CSS (Dark Mode)             |
| Animation | Framer Motion                        |
| Database  | Supabase PostgreSQL + RLS            |
| Auth      | Supabase Auth (Kakao, Google, Apple) |
| Mobile    | Capacitor (iOS/Android)              |
| i18n      | EN, KO, RU (+ more)                  |

---

## Design System

**Linear Deep Space + Flame Coral Accent**

```css
/* Background */
--bg: #08090a;
--surface: #121314;
--elevated: #1a1c1f;

/* Accent Colors */
--flame: #ff6b5b; /* Primary CTA */
--ember: #cc4a3a; /* Secondary */
--spark: #ffd93d; /* Leader Premium */
```

---

## Project Structure

```
src/
├── app/
│   ├── (home)/        # Homepage
│   ├── api/           # API routes
│   ├── experience/    # Experience details
│   ├── artists/       # Artist listings
│   ├── map/           # Map view
│   ├── me/            # User profile
│   └── leader/        # Leader dashboard
├── components/
│   ├── home/          # GlobalHero, etc.
│   ├── experience/    # ExperienceCard
│   └── layout/        # Navigation
├── lib/
│   ├── currency.ts    # Multi-currency system
│   └── supabase/      # Database client
├── i18n/
│   └── locales/       # EN, KO, RU translations
└── hooks/
    └── useCurrency.tsx
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

---

## Leader Program

Earn commission by referring fans:

| Tier     | Referrals | Commission |
| -------- | --------- | ---------- |
| Bronze   | 0-9       | 10%        |
| Silver   | 10-49     | 11%        |
| Gold     | 50-199    | 13%        |
| Platinum | 200+      | 15%        |

---

## Mobile Apps

Built with Capacitor for iOS and Android:

```bash
# Sync web build to native projects
pnpm cap:sync

# Open iOS project
npx cap open ios

# Open Android project
npx cap open android
```

---

## License

Private - All rights reserved

---

_ZZIK | Your K-POP VIP Experience | 11 Countries_
