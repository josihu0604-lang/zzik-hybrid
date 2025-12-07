# ZZIK Browser Audit Tools

Native Playwright-based browser audit tools that replace the non-existent `@agentdeskai/browser-tools-mcp` and `@agentdeskai/browser-tools-server` packages.

## Overview

This implementation provides all the functionality promised by the hypothetical `@agentdeskai` packages using standard, well-maintained open-source tools:

- **Playwright** - Browser automation (already in the tech stack)
- **axe-playwright** - WCAG accessibility audits
- **playwright-lighthouse** - Performance and SEO audits

## Features

### 1. Console Logging
Capture all console messages (log, warn, error, info, debug) from a page.

```typescript
import { getConsoleLogs } from '@/lib/browser-tools';

const logs = await getConsoleLogs('http://localhost:3000');
console.log(logs); // [{ type: 'log', text: '...' }, ...]
```

### 2. Network Monitoring
Monitor all network requests including failed requests.

```typescript
import { getNetworkLogs } from '@/lib/browser-tools';

const requests = await getNetworkLogs('http://localhost:3000');
const failed = requests.filter(r => r.error);
console.log(`Failed requests: ${failed.length}`);
```

### 3. Screenshots
Capture full-page or viewport screenshots.

```typescript
import { takeScreenshot } from '@/lib/browser-tools';

await takeScreenshot('http://localhost:3000', 'screenshot.png', true);
```

### 4. Accessibility Audits (WCAG)
Run axe-core accessibility audits to check for WCAG compliance.

```typescript
import { runAccessibilityAudit } from '@/lib/browser-tools';

const results = await runAccessibilityAudit('http://localhost:3000');
console.log(`Violations: ${results.violations.length}`);
console.log(`Passes: ${results.passes.length}`);
```

### 5. Comprehensive Browser Audit
Run all audits together including performance and SEO via Lighthouse.

```typescript
import { runBrowserAudit } from '@/lib/browser-tools';

const result = await runBrowserAudit({
  url: 'http://localhost:3000',
  thresholds: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
  },
  runPerformance: true,
  runAccessibility: true,
  takeScreenshot: true,
});

console.log('Console Errors:', result.consoleLogs.filter(l => l.type === 'error'));
console.log('Failed Requests:', result.failedRequests);
console.log('Accessibility Violations:', result.accessibility?.violations);
console.log('Performance Score:', result.performance?.score);
```

## CLI Commands

### Run Browser Audits

```bash
# Run all browser audits
pnpm audit:browser

# Run specific audits
pnpm audit:accessibility  # WCAG compliance only
pnpm audit:console       # Console logs only
pnpm audit:network       # Network requests only

# Get audit workflow information
pnpm audit:info
```

### E2E Tests

The browser audit tools are tested in `e2e/browser-audit.spec.ts`:

```bash
# Run audit tests
pnpm test:e2e e2e/browser-audit.spec.ts

# Run in UI mode for debugging
pnpm test:e2e:ui e2e/browser-audit.spec.ts
```

## Verification Standards

### Accessibility (WCAG 2.1 AA)
- Color contrast: 4.5:1 minimum
- Touch targets: 44x44px minimum
- Alt text: All images must have descriptive alt text
- Keyboard navigation: All interactive elements must be keyboard accessible
- Focus indicators: Clear focus indicators on all focusable elements

### Performance (Lighthouse)
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3.8s

### SEO
- Meta title and description present
- Open Graph tags configured
- Structured data (JSON-LD) where applicable

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "axe-playwright": "^2.2.2",
    "lighthouse": "^12.8.2",
    "playwright-lighthouse": "^4.0.0"
  }
}
```

## Migration from @agentdeskai

The non-existent `@agentdeskai/browser-tools-mcp` and `@agentdeskai/browser-tools-server` packages have been replaced with:

| @agentdeskai Feature | ZZIK Implementation |
|---------------------|---------------------|
| `getConsoleLogs` | `getConsoleLogs()` from `@/lib/browser-tools` |
| `getNetworkLogs` | `getNetworkLogs()` from `@/lib/browser-tools` |
| `takeScreenshot` | `takeScreenshot()` from `@/lib/browser-tools` |
| `runAccessibilityAudit` | `runAccessibilityAudit()` from `@/lib/browser-tools` |
| `runPerformanceAudit` | Included in `runBrowserAudit()` |
| `runSEOAudit` | Included in `runBrowserAudit()` |
| `runBestPracticesAudit` | Included in `runBrowserAudit()` |
| `runDebuggerMode` | Use `runBrowserAudit()` with debugging options |
| `runAuditMode` | Use `runBrowserAudit()` with all options enabled |

## Benefits

1. **No External Dependencies**: Uses existing Playwright infrastructure
2. **Better Maintained**: All dependencies are popular, actively maintained projects
3. **Type Safety**: Full TypeScript support with proper types
4. **Flexibility**: Easy to customize and extend
5. **No Network Issues**: No reliance on packages that don't exist on NPM
6. **Better Documentation**: Standard tools with extensive documentation

## Examples

See the test file `e2e/browser-audit.spec.ts` for comprehensive usage examples.

## Support

For issues or questions, refer to:
- [Playwright Documentation](https://playwright.dev/)
- [axe-playwright Documentation](https://github.com/abhinaba-ghosh/axe-playwright)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)
