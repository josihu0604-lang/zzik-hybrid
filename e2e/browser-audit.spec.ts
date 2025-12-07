import { test, expect } from '@playwright/test';
import {
  runBrowserAudit,
  getConsoleLogs,
  getNetworkLogs,
  takeScreenshot,
  runAccessibilityAudit,
} from '../src/lib/browser-tools';
import fs from 'fs';
import path from 'path';

/**
 * ZZIK Browser Audit Tools - E2E Tests
 * 
 * Tests for Playwright-based browser audit capabilities that replace
 * the non-existent @agentdeskai/browser-tools-mcp packages.
 */

test.describe('Browser Audit Tools', () => {
  const testUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const screenshotDir = path.join(process.cwd(), 'tmp', 'test-screenshots');

  test.beforeAll(() => {
    // Ensure screenshot directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test.afterAll(() => {
    // Cleanup test screenshots
    if (fs.existsSync(screenshotDir)) {
      fs.rmSync(screenshotDir, { recursive: true, force: true });
    }
  });

  test('getConsoleLogs captures console messages', async () => {
    const logs = await getConsoleLogs(testUrl);
    
    expect(Array.isArray(logs)).toBe(true);
    logs.forEach((log) => {
      expect(log).toHaveProperty('type');
      expect(log).toHaveProperty('text');
      expect(typeof log.type).toBe('string');
      expect(typeof log.text).toBe('string');
    });
  });

  test('getNetworkLogs captures network requests', async () => {
    const requests = await getNetworkLogs(testUrl);
    
    expect(Array.isArray(requests)).toBe(true);
    expect(requests.length).toBeGreaterThan(0);
    
    requests.forEach((req) => {
      expect(req).toHaveProperty('url');
      expect(req).toHaveProperty('method');
      expect(typeof req.url).toBe('string');
      expect(typeof req.method).toBe('string');
    });
  });

  test('takeScreenshot creates screenshot file', async () => {
    const screenshotPath = path.join(screenshotDir, 'test-screenshot.png');
    const resultPath = await takeScreenshot(testUrl, screenshotPath);
    
    expect(resultPath).toBe(screenshotPath);
    expect(fs.existsSync(screenshotPath)).toBe(true);
    
    const stats = fs.statSync(screenshotPath);
    expect(stats.size).toBeGreaterThan(0);
  });

  test('runAccessibilityAudit returns axe results', async () => {
    const results = await runAccessibilityAudit(testUrl);
    
    expect(results).toBeDefined();
    expect(results).toHaveProperty('violations');
    expect(results).toHaveProperty('passes');
    expect(Array.isArray(results.violations)).toBe(true);
    expect(Array.isArray(results.passes)).toBe(true);
  });

  test('runBrowserAudit performs comprehensive audit without performance', async () => {
    const screenshotPath = path.join(screenshotDir, 'audit-screenshot.png');
    
    const result = await runBrowserAudit({
      url: testUrl,
      runPerformance: false, // Skip performance for faster test
      screenshotPath,
      thresholds: {
        accessibility: 80,
      },
    });

    // Validate result structure
    expect(result).toBeDefined();
    expect(result.url).toBe(testUrl);
    expect(result.timestamp).toBeDefined();
    expect(Array.isArray(result.consoleLogs)).toBe(true);
    expect(Array.isArray(result.failedRequests)).toBe(true);
    
    // Validate screenshot was created
    expect(result.screenshotPath).toBe(screenshotPath);
    expect(fs.existsSync(screenshotPath)).toBe(true);
    
    // Validate accessibility results
    expect(result.accessibility).toBeDefined();
    expect(typeof result.accessibility!.violations).toBe('number');
    expect(typeof result.accessibility!.passes).toBe('number');
    expect(result.accessibility!.results).toBeDefined();
  });

  test('runBrowserAudit logs console errors if present', async () => {
    const result = await runBrowserAudit({
      url: testUrl,
      runPerformance: false,
      runAccessibility: false,
      takeScreenshot: false,
    });

    expect(result.consoleLogs).toBeDefined();
    
    // Check if there are any error logs
    const errorLogs = result.consoleLogs.filter(
      (log) => log.type === 'error'
    );
    
    // This is informational - we don't fail if there are errors,
    // but we verify they're being captured
    if (errorLogs.length > 0) {
      console.log(`Found ${errorLogs.length} console errors:`, errorLogs);
    }
  });

  test('runBrowserAudit captures failed network requests', async () => {
    const result = await runBrowserAudit({
      url: testUrl,
      runPerformance: false,
      runAccessibility: false,
      takeScreenshot: false,
    });

    expect(result.failedRequests).toBeDefined();
    
    // Check if there are any failed requests
    if (result.failedRequests.length > 0) {
      console.log(
        `Found ${result.failedRequests.length} failed requests:`,
        result.failedRequests
      );
      
      result.failedRequests.forEach((req) => {
        expect(req).toHaveProperty('url');
        expect(req).toHaveProperty('error');
      });
    }
  });
});

test.describe('Browser Audit Tools - Integration', () => {
  const testUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('accessibility audit identifies common issues', async () => {
    const results = await runAccessibilityAudit(testUrl);
    
    // Log accessibility summary
    console.log('Accessibility Audit Summary:');
    console.log(`- Passes: ${results.passes?.length || 0}`);
    console.log(`- Violations: ${results.violations?.length || 0}`);
    
    if (results.violations && results.violations.length > 0) {
      console.log('\nTop Violations:');
      results.violations.slice(0, 5).forEach((violation: any) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Affected nodes: ${violation.nodes.length}`);
      });
    }
    
    // We don't fail on violations - this is informational
    // In a real audit, you'd set thresholds
    expect(results.passes?.length).toBeGreaterThan(0);
  });
});
