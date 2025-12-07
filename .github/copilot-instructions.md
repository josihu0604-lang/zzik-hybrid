# GitHub Copilot Instructions for ZZIK

## Project Context

ZZIK is a K-POP VIP Experience Platform - a 3-way marketplace connecting:
- **Consumers**: Book VIP experiences (Hightough, Soundcheck, Backstage)
- **Artists/Agencies**: List and manage experiences
- **Leaders**: Refer users, earn 10% commission

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript 5.6 (strict mode)
- **Database**: Supabase PostgreSQL + RLS
- **Auth**: Supabase Auth (Kakao, Google, Apple)
- **Styling**: Tailwind CSS + Design Tokens
- **State**: React Query + Zustand
- **Testing**: Vitest + Playwright

## Code Style

### TypeScript
```typescript
// Always use explicit types, avoid `any`
interface BookingData {
  experienceId: string;
  userId: string;
  price: {
    amount: number;
    currency: string;
  };
}

// Use const assertions for enums
const EXPERIENCE_TYPES = ['hightough', 'soundcheck', 'backstage', 'popup'] as const;
type ExperienceType = typeof EXPERIENCE_TYPES[number];

// Prefer async/await over .then()
async function createBooking(data: BookingData): Promise<Booking> {
  const result = await supabase.from('bookings').insert(data).single();
  return result.data;
}
```

### API Routes
```typescript
// File: src/app/api/[resource]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Always validate auth for protected routes
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use proper error handling
  try {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[API] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database Queries
```typescript
// Always use RLS-aware queries
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    experience:experiences(id, title, artist:artists(name)),
    user:users(id, name)
  `)
  .eq('status', 'confirmed')
  .order('created_at', { ascending: false })
  .limit(20);

// Use transactions for atomic operations
const { data, error } = await supabase.rpc('create_booking_with_referral', {
  p_user_id: userId,
  p_experience_id: experienceId,
  p_referrer_id: referrerId,
});
```

### Components
```typescript
// File: src/components/[Component]/[Component].tsx
'use client';

import { memo } from 'react';
import { useTranslation } from '@/i18n';

interface Props {
  experienceId: string;
  onBook?: (id: string) => void;
}

function ExperienceCardComponent({ experienceId, onBook }: Props) {
  const { t } = useTranslation();

  return (
    <article className="rounded-2xl bg-space-850 p-4">
      {/* Content */}
    </article>
  );
}

export const ExperienceCard = memo(ExperienceCardComponent);
```

## Key Files

| Purpose | Path |
|---------|------|
| API Routes | `src/app/api/` |
| Database Types | `src/types/database.ts` |
| Supabase Client | `src/lib/supabase/` |
| Currency Utils | `src/lib/currency.ts` |
| i18n | `src/i18n/` |
| Design Tokens | `src/lib/design-tokens.ts` |

## Common Patterns

### Multi-Currency Pricing
```typescript
import { getLocalizedPrice } from '@/lib/currency';

const price = getLocalizedPrice(baseUsdPrice, userCountryCode);
// Returns: { amount: 1750, currency: 'THB', formatted: '฿1,750' }
```

### Referral Tracking
```typescript
// Always check for referral code in booking flow
const referralCode = searchParams.get('ref');
if (referralCode) {
  const leader = await getLeaderByCode(referralCode);
  if (leader && leader.user_id !== currentUser.id) {
    await createBookingWithReferral(bookingData, leader.id);
  }
}
```

### Check-in Verification
```typescript
// Triple verification: QR + GPS + NFC
const result = await verifyCheckin({
  bookingId,
  method: 'gps',
  latitude: coords.lat,
  longitude: coords.lng,
});
// Confidence score: 0-100
if (result.confidence >= 50) {
  // Allow check-in
}
```

## Do's and Don'ts

### DO
- Use TypeScript strict mode
- Implement RLS policies for all tables
- Use optimistic updates for better UX
- Add proper error boundaries
- Use i18n for all user-facing text
- Implement proper loading states

### DON'T
- Use `any` type
- Store secrets in client code
- Skip validation on API routes
- Use `console.log` in production (use proper logging)
- Make breaking changes to public APIs
- Ignore TypeScript errors

## Testing

```typescript
// Unit test example
describe('calculateDynamicPrice', () => {
  it('applies PPP adjustment', () => {
    const result = calculateDynamicPrice({
      basePrice: 100,
      countryCode: 'TH',
      // ...
    });
    expect(result.finalPrice).toBeLessThan(3500); // Less than 100 USD * 35 THB
  });
});

// Integration test example
describe('Booking API', () => {
  it('creates booking with referral', async () => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ experienceId, referralCode }),
    });
    expect(response.status).toBe(201);
  });
});
```

## Environment

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
