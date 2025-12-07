---
name: tech-stack
description: ZZIK 기술 스택 - Next.js 15, Supabase, TypeScript 5.6
---

# ZZIK Tech Stack

## Core

```yaml
Runtime: Node.js 20+
Framework: Next.js 15 (App Router)
Language: TypeScript 5.6 (Strict Mode)
Package Manager: pnpm 9+
```

## Frontend

```yaml
UI: Tailwind CSS + Custom Design System
Animation: Framer Motion
Maps: Mapbox GL JS + Kakao Maps SDK
State: React Context + Server Components
```

## Backend

```yaml
Database: Supabase (PostgreSQL 15)
Vector: pgvector (768 dimensions)
Auth: Supabase Auth + Kakao OAuth
Storage: Supabase Storage
Realtime: Supabase Realtime (participation updates)
```

## AI/ML

```yaml
Vision: Gemini 1.5 Flash (Receipt OCR)
Embedding: text-embedding-004 (768-dim)
Use Cases:
  - Receipt verification
  - Popup image analysis (optional)
  - User recommendations
```

## Deployment

```yaml
Hosting: Vercel (Seoul Region - icn1)
Domain: zzik-hybrid.vercel.app
CI/CD: Vercel Git Integration
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── popup/         # Popup CRUD
│   │   ├── checkin/       # Triple Verification
│   │   └── leader/        # Leader System
│   ├── popup/[id]/        # Popup detail
│   ├── map/               # Map view
│   └── me/                # User dashboard
├── components/
│   ├── popup/             # PopupCard, ProgressBar
│   ├── checkin/           # Verification UI
│   └── ui/                # Base components
├── lib/
│   ├── supabase/          # DB client
│   ├── verification.ts    # Triple Verification
│   ├── participation.ts   # Popup logic
│   └── gemini.ts          # AI client
└── types/
    └── database.ts        # Supabase types
```

## Code Patterns

### Server Component (Default)

```typescript
export default async function Page() {
  const data = await getData();
  return <div>{data}</div>;
}
```

### Client Component

```typescript
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### API Route

```typescript
import { z } from 'zod';

const schema = z.object({
  popupId: z.string().uuid(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { popupId } = schema.parse(body);
  // ...
}
```

### Supabase Query

```typescript
const { data, error } = await supabase
  .from('popups')
  .select('*')
  .eq('state', 'funding')
  .order('deadline', { ascending: true });
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=

# AI
GEMINI_API_KEY=

# Kakao
NEXT_PUBLIC_KAKAO_JS_KEY=
KAKAO_REST_API_KEY=
```

## Commands

```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm type-check   # TypeScript check
pnpm lint         # ESLint
pnpm test         # Run tests
```
