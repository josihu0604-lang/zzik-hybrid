---
name: devops
description: ZZIK CI/CD, 배포, 인프라. Vercel (Seoul), Supabase, GitHub Actions.
model: sonnet
triggers:
  - deploy
  - build
  - docker
  - ci
  - cd
  - 배포
  - vercel
  - supabase
---

# DevOps Agent - Deployment & Infrastructure

## Tech Stack

```yaml
Hosting: Vercel (Seoul Region - icn1)
Database: Supabase (PostgreSQL + pgvector)
CDN: Vercel Edge
Maps: Mapbox GL
AI: Google Gemini API
```

## Quick Commands

```bash
# Development
pnpm dev          # http://localhost:3000

# Quality Gates
pnpm type-check   # TypeScript
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm build        # Production build

# Deploy
vercel --prod     # Deploy to production
```

## Vercel Configuration

### vercel.json

```json
{
  "regions": ["icn1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# Kakao (Social Login)
NEXT_PUBLIC_KAKAO_JS_KEY=
KAKAO_REST_API_KEY=
KAKAO_NATIVE_APP_KEY=
KAKAO_ADMIN_KEY=
```

### Deploy Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# Pull env vars to local
vercel env pull .env.local

# Check deployment status
vercel ls
```

## Supabase

### CLI Commands

```bash
# Link project
supabase link --project-ref xcbxhqsxnzhmegsrzymg

# Generate types
supabase gen types typescript --project-id xcbxhqsxnzhmegsrzymg > src/types/database.ts

# Run migrations
supabase db push

# Reset database (caution!)
supabase db reset
```

### Database Health

```sql
-- Check RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';

-- Check vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## CI/CD Pipeline

### Pre-Deploy Checklist

```bash
#!/bin/bash
set -e

echo "1. Type checking..."
pnpm type-check

echo "2. Linting..."
pnpm lint

echo "3. Testing..."
pnpm test

echo "4. Building..."
pnpm build

echo "✅ All checks passed!"
```

### GitHub Actions (Optional)

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

## Troubleshooting

### Port Conflicts

```bash
# Find process using port 3000
lsof -i:3000

# Kill zombie Next.js processes
pkill -f "next dev"
pkill -f "node.*next"
```

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Supabase Connection

```bash
# Test connection
curl -H "apikey: $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/popups?limit=1"
```

## Monitoring

### Vercel Analytics

- Core Web Vitals (LCP, FID, CLS)
- Function execution time
- Error rates

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    gemini: await checkGemini(),
    timestamp: new Date().toISOString(),
  };

  return Response.json(checks);
}
```

## Production URLs

```yaml
App: https://zzik-hybrid.vercel.app
API: https://zzik-hybrid.vercel.app/api
Supabase: https://xcbxhqsxnzhmegsrzymg.supabase.co
```
