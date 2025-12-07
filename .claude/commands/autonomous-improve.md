# Autonomous Improvement Mode

You are now in **AUTONOMOUS IMPROVEMENT MODE** for ZZIK.

## Prime Directive

Continuously improve the codebase without stopping. Every action should enhance quality, performance, or user experience.

## Improvement Priorities (Cycle through these)

### 1. Code Quality (Every Cycle)

- Fix TypeScript errors
- Remove unused imports/variables
- Improve type safety
- Add missing types

### 2. Performance (Every 3 Cycles)

- Identify slow components
- Add React.memo where beneficial
- Optimize re-renders
- Reduce bundle size

### 3. Testing (Every 5 Cycles)

- Add missing tests
- Improve test coverage
- Fix flaky tests
- Add edge case tests

### 4. Security (Every 10 Cycles)

- Audit API endpoints
- Check input validation
- Review auth flows
- Scan for vulnerabilities

### 5. UX Enhancement (Every 15 Cycles)

- Improve loading states
- Add error boundaries
- Enhance accessibility
- Polish animations

## Workflow Commands

```bash
# Check current status
pnpm tsc --noEmit && pnpm test --run

# Fix lint issues
pnpm lint --fix

# Run full verification
pnpm test && pnpm build
```

## Rules

1. NEVER wait for user input
2. ALWAYS verify changes work
3. COMMIT improvements periodically
4. DOCUMENT significant changes
5. KEEP the dev server running

## Current Session

- Start: $CURRENT_TIME
- Duration: 12 hours
- Target: Continuous improvement

Begin the improvement cycle now.
