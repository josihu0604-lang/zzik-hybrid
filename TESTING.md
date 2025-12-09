# 🧪 Complete Testing Guide - ZZIK Hybrid V2

Comprehensive testing documentation for E2E, Unit, Integration, Accessibility, and Performance tests.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [E2E Tests](#e2e-tests)
- [Unit Tests](#unit-tests)
- [Advanced Tests](#advanced-tests)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)

---

## 🎯 Overview

### Test Coverage Summary

| Test Type | Files | Scenarios | Coverage |
|-----------|-------|-----------|----------|
| **E2E Tests** | 8 | 120+ | Core user flows |
| **Unit Tests** | 3 | 80+ | Stores & Hooks |
| **Accessibility** | 1 | 30+ | WCAG 2.1 AA |
| **Security** | 1 | 25+ | XSS, CSRF, Auth |
| **Performance** | 1 | 20+ | Load, Render, Memory |
| **Error Handling** | 1 | 20+ | API, Network, Edge cases |
| **Total** | **15** | **295+** | **Comprehensive** |

---

## 📁 Test Structure

```
├── e2e/                           # E2E Tests (Playwright)
│   ├── advanced/                  # Advanced E2E Tests
│   │   ├── accessibility.spec.ts  # A11y & WCAG compliance
│   │   ├── error-handling.spec.ts # Error scenarios
│   │   ├── performance.spec.ts    # Performance benchmarks
│   │   └── security.spec.ts       # Security tests
│   ├── helpers/                   # Test utilities
│   │   ├── mock-data.ts          # Test data generators
│   │   └── test-utils.ts         # Helper functions (50+)
│   ├── review-system.spec.ts     # Review CRUD & interactions
│   ├── social-features.spec.ts   # Social & follow system
│   ├── gamification-system.spec.ts # Points, badges, leaderboard
│   ├── payment-integration.spec.ts # Z-Point wallet & payments
│   └── README.md                  # E2E documentation
│
└── src/__tests__/                 # Unit & Integration Tests
    ├── stores/                    # Store tests
    │   ├── review-store.test.ts
    │   └── gamification-store.test.ts
    └── hooks/                     # Hook tests
        └── useReview.test.ts
```

---

## 🎭 E2E Tests (Playwright)

### Basic E2E Tests (90+ scenarios)

#### Review System (`review-system.spec.ts`)
- ✅ Review creation with validation
- ✅ Like/unlike functionality  
- ✅ Reply system
- ✅ Filtering by rating
- ✅ Sorting (newest, popular)
- ✅ Draft management
- ✅ Statistics (average rating, count)
- ✅ Mobile responsiveness

#### Social Features (`social-features.spec.ts`)
- ✅ User profiles & statistics
- ✅ Follow/unfollow system
- ✅ Followers & following lists
- ✅ Activity feed
- ✅ Feed interactions (likes, comments)
- ✅ User search
- ✅ Recommended users
- ✅ Notifications

#### Gamification (`gamification-system.spec.ts`)
- ✅ Points display & breakdown
- ✅ Points history
- ✅ Level & tier progression
- ✅ Badge collection
- ✅ Badge categories & rarities
- ✅ Leaderboard (weekly, monthly, all-time)
- ✅ User rankings
- ✅ Achievements & rewards
- ✅ Streak tracking
- ✅ Challenges

#### Payment Integration (`payment-integration.spec.ts`)
- ✅ Wallet balance & address
- ✅ Z-Point charging flow
- ✅ Amount validation
- ✅ Payment method selection
- ✅ Transaction history
- ✅ Transaction filtering & search
- ✅ Receipt display
- ✅ Saved payment methods
- ✅ Spending limits

### Advanced E2E Tests (95+ scenarios)

#### Error Handling (`error-handling.spec.ts`)
- ✅ API errors (500, 404, 401, 429)
- ✅ Network timeouts
- ✅ Offline mode handling
- ✅ Request retry logic
- ✅ Form validation errors
- ✅ XSS prevention
- ✅ Empty state handling
- ✅ Long text handling
- ✅ Concurrent requests
- ✅ Special characters
- ✅ Memory leak prevention
- ✅ Console error detection

#### Security (`security.spec.ts`)
- ✅ XSS prevention (multiple vectors)
- ✅ HTML sanitization
- ✅ Event handler injection prevention
- ✅ CSRF token validation
- ✅ Authentication & authorization
- ✅ Secure session handling
- ✅ Input validation
- ✅ File upload validation
- ✅ Rate limiting
- ✅ Content Security Policy
- ✅ SQL injection prevention
- ✅ API endpoint protection
- ✅ Data leakage prevention

#### Accessibility (`accessibility.spec.ts`)
- ✅ WCAG 2.1 compliance
- ✅ Proper heading hierarchy
- ✅ Color contrast ratios
- ✅ Keyboard navigation (Tab, Shift+Tab)
- ✅ Button activation (Enter, Space)
- ✅ Modal accessibility (Escape, focus trap)
- ✅ Arrow key navigation
- ✅ ARIA labels & roles
- ✅ Screen reader support
- ✅ Form accessibility
- ✅ Required field indicators
- ✅ Touch-friendly targets (44x44px)
- ✅ Zoom support without breaking layout
- ✅ Reduced motion support

#### Performance (`performance.spec.ts`)
- ✅ Page load times (< 3s)
- ✅ First Contentful Paint (< 1.8s)
- ✅ Largest Contentful Paint (< 2.5s)
- ✅ Time to Interactive (< 3.8s)
- ✅ Cumulative Layout Shift (< 0.1)
- ✅ JavaScript bundle size (< 1MB)
- ✅ Image optimization (< 500KB each)
- ✅ Compression (gzip/brotli)
- ✅ Browser caching
- ✅ Rendering performance
- ✅ Scroll performance (60 FPS)
- ✅ Animation smoothness (60 FPS)
- ✅ API response times (< 500ms avg)
- ✅ Memory usage monitoring
- ✅ Memory leak detection
- ✅ Request minimization (< 50 requests)

---

## 🧪 Unit Tests (Vitest + Testing Library)

### Store Tests (80+ scenarios)

#### Review Store (`review-store.test.ts`)
- ✅ State initialization
- ✅ Loading & error states
- ✅ Adding/updating/deleting reviews
- ✅ Review retrieval by target
- ✅ Like toggling
- ✅ Draft management (save, load, clear)
- ✅ Reply management
- ✅ Selectors (count, average rating)
- ✅ User review check
- ✅ Async actions (fetch, error handling)
- ✅ Filtering & sorting

#### Gamification Store (`gamification-store.test.ts`)
- ✅ Points initialization
- ✅ Adding points by category
- ✅ Points history tracking
- ✅ Tier progression (bronze → silver → gold)
- ✅ Tier progress calculation
- ✅ Points by category retrieval
- ✅ Badge earning
- ✅ Duplicate badge prevention
- ✅ Badge progress tracking
- ✅ Badge filtering (category, rarity)
- ✅ Leaderboard management
- ✅ User ranking
- ✅ Achievement unlocking
- ✅ Notification system
- ✅ Complex scenarios

### Hook Tests

#### useReview Hook (`useReview.test.ts`)
- ✅ Fetching reviews
- ✅ Error handling
- ✅ Average rating calculation
- ✅ Review count
- ✅ Refetching
- ✅ Form initialization
- ✅ Rating & comment updates
- ✅ Photo management
- ✅ Form validation
- ✅ Comment length validation
- ✅ Draft save/load
- ✅ Form submission
- ✅ Form reset
- ✅ Draft clearing
- ✅ Like toggling
- ✅ Reply management

---

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers (E2E only)
npx playwright install chromium
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (recommended for debugging)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Run specific test file
npx playwright test review-system.spec.ts

# Run specific test suite
npx playwright test --grep "Review System"

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome

# Run in debug mode
npx playwright test --debug

# Run with trace
npx playwright test --trace on
```

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test review-store.test.ts

# Run tests matching pattern
npm run test -- --grep "Points Management"
```

### Advanced Tests

```bash
# Run accessibility tests
npx playwright test accessibility.spec.ts

# Run security tests
npx playwright test security.spec.ts

# Run performance tests
npx playwright test performance.spec.ts

# Run error handling tests
npx playwright test error-handling.spec.ts
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 Coverage Reports

### Generating Coverage

```bash
# Unit test coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Goals

| Area | Target |
|------|--------|
| Lines | > 80% |
| Branches | > 75% |
| Functions | > 80% |
| Statements | > 80% |

---

## 📝 Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="element"]');
    
    // Act
    await element.click();
    
    // Assert
    await expect(element).toHaveText('Expected Text');
  });
});
```

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

---

## 🔍 Debugging Tips

### E2E Tests

1. **Use UI Mode**: `npm run test:e2e:ui`
2. **Use Debug Mode**: `npx playwright test --debug`
3. **Take Screenshots**: `await page.screenshot({ path: 'debug.png' })`
4. **Check Console**: `page.on('console', msg => console.log(msg))`
5. **Slow Down**: `test.slow()` or `--headed --slow-mo=1000`

### Unit Tests

1. **Use Vitest UI**: `npm run test:ui`
2. **Use `console.log`**: Debug state changes
3. **Use `test.only`**: Run single test
4. **Use Debugger**: Add `debugger` statement

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Best Practices](https://web.dev/performance/)

---

## 🎯 Best Practices

### General
- ✅ Write tests first (TDD)
- ✅ Keep tests independent
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange-Act-Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases
- ✅ Keep tests fast

### E2E
- ✅ Use `data-testid` attributes
- ✅ Wait for network idle
- ✅ Use explicit waits
- ✅ Test user flows, not implementation
- ✅ Take screenshots on failure

### Unit
- ✅ Test public APIs only
- ✅ Mock external dependencies
- ✅ Use factories for test data
- ✅ Test error conditions
- ✅ Aim for high coverage

---

**Happy Testing! 🧪**
