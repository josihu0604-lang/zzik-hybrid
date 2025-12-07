---
name: quality
description: ZZIK 코드 품질, 보안, 테스트 전문. TypeScript strict, ESLint, Vitest. Triggers - "review", "audit", "test", "security", "quality"
model: sonnet
triggers:
  - review
  - audit
  - test
  - security
  - quality
  - 코드리뷰
  - 품질
  - 테스트
---

# Quality Agent - Code Quality & Security

## Quick Commands

```bash
pnpm type-check   # TypeScript strict check
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm build        # Production build (최종 검증)
```

## Security Checklist

### OWASP Top 10

- [ ] **Injection**: Zod validation on all inputs
- [ ] **Broken Auth**: Supabase RLS enabled
- [ ] **XSS**: No dangerouslySetInnerHTML
- [ ] **CSRF**: SameSite cookies
- [ ] **Security Misconfiguration**: No debug mode in prod

### Environment Security

```bash
# .env 파일 검증
git check-ignore .env .env.local .env.production

# 하드코딩된 시크릿 검색
grep -rn "sk-\|api_key\|password" src --include="*.ts" --include="*.tsx"
```

### API Security

```typescript
// 모든 API route에 적용
import { z } from 'zod';

const schema = z.object({
  popupId: z.string().uuid(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = schema.parse(body); // Throws on invalid
}
```

## Code Quality Standards

### TypeScript Rules

```typescript
// GOOD: Explicit types
function getTemperature(progress: number): 'cold' | 'warm' | 'hot' | 'done' { }

// BAD: Any type
function process(data: any) { }  // ❌

// GOOD: Proper error handling
try {
  const result = await api.call();
} catch (error) {
  if (error instanceof ApiError) { ... }
}
```

### Component Guidelines

- Max 200 lines per file
- One component per file
- Custom hooks for logic > 30 lines
- Memoize expensive calculations

### Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { motion } from 'framer-motion';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 3. Relative imports
import { PopupCard } from './PopupCard';

// 4. Types
import type { Popup } from '@/types';
```

## Test Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { PopupCard } from './PopupCard';

describe('PopupCard', () => {
  it('shows progress temperature', () => {
    render(<PopupCard progress={75} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({
      backgroundColor: expect.stringContaining('FF6B5B')
    });
  });
});
```

### API Test

```typescript
describe('POST /api/popup/participate', () => {
  it('increments participation count', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

## Performance Checklist

- [ ] Images use Next/Image
- [ ] Large lists use virtualization
- [ ] Heavy components are lazy loaded
- [ ] No blocking API calls in render
- [ ] Bundle analyzed (< 500KB first load)

## Common Issues

### Unused Exports

```bash
# Find potentially unused exports
grep -rn "export " src --include="*.ts" | head -20
```

### Type Errors

```bash
# Detailed type errors
pnpm tsc --noEmit --pretty
```

### Circular Dependencies

```bash
# Check for circular imports
npx madge --circular src/
```
