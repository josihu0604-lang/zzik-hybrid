/**
 * ZZIK Browser Audit Tools
 * 
 * Playwright-based browser audit capabilities replacing @agentdeskai packages.
 * Provides console logging, network monitoring, screenshots, accessibility audits,
 * and performance/SEO audits using standard Playwright + Lighthouse + Axe tools.
 */

import { chromium, type Browser, type Page } from 'playwright';
import { injectAxe, getAxeResults } from 'axe-playwright';
import type { AxeResults } from 'axe-core';
import { playAudit, type playwrightLighthouseConfig } from 'playwright-lighthouse';

export interface BrowserAuditOptions {
  url: string;
  /**
   * Port for Lighthouse to use (required for performance audits)
   * @default 9222
   */
  lighthousePort?: number;
  /**
   * Thresholds for Lighthouse audits (0-100)
   */
  thresholds?: {
    performance?: number;
    accessibility?: number;
    'best-practices'?: number;
    seo?: number;
  };
  /**
   * Whether to run accessibility audit
   * @default true
   */
  runAccessibility?: boolean;
  /**
   * Whether to run performance/SEO audit
   * @default true
   */
  runPerformance?: boolean;
  /**
   * Whether to take screenshot
   * @default true
   */
  takeScreenshot?: boolean;
  /**
   * Screenshot path
   * @default 'audit-screenshot.png'
   */
  screenshotPath?: string;
}

export interface BrowserAuditResult {
  url: string;
  timestamp: string;
  consoleLogs: Array<{ type: string; text: string }>;
  failedRequests: Array<{ url: string; error: string }>;
  screenshotPath?: string;
  accessibility?: {
    violations: number;
    passes: number;
    results: AxeResults;
  };
  performance?: {
    score: number;
    metrics: Record<string, number>;
  };
}

/**
 * Run comprehensive browser audit on a URL
 * 
 * @example
 * ```typescript
 * const result = await runBrowserAudit({
 *   url: 'http://localhost:3000',
 *   thresholds: {
 *     performance: 90,
 *     accessibility: 90,
 *     'best-practices': 90,
 *     seo: 90,
 *   }
 * });
 * console.log('Console logs:', result.consoleLogs);
 * console.log('Failed requests:', result.failedRequests);
 * console.log('Accessibility violations:', result.accessibility?.violations);
 * ```
 */
export async function runBrowserAudit(
  options: BrowserAuditOptions
): Promise<BrowserAuditResult> {
  const {
    url,
    lighthousePort = 9222,
    thresholds = {
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 90,
    },
    runAccessibility = true,
    runPerformance = true,
    takeScreenshot = true,
    screenshotPath = 'audit-screenshot.png',
  } = options;

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser with remote debugging for Lighthouse
    browser = await chromium.launch({
      args: runPerformance ? [`--remote-debugging-port=${lighthousePort}`] : undefined,
    });

    page = await browser.newPage();

    // 1. Capture Console Logs
    const consoleLogs: Array<{ type: string; text: string }> = [];
    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    // 2. Capture Network Errors
    const failedRequests: Array<{ url: string; error: string }> = [];
    page.on('requestfailed', (req) => {
      failedRequests.push({
        url: req.url(),
        error: req.failure()?.errorText || 'Unknown error',
      });
    });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle' });

    const result: BrowserAuditResult = {
      url,
      timestamp: new Date().toISOString(),
      consoleLogs,
      failedRequests,
    };

    // 3. Take Screenshot
    if (takeScreenshot) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = screenshotPath;
    }

    // 4. Run Accessibility Audit (WCAG)
    if (runAccessibility) {
      await injectAxe(page);
      const accessibilityResults = await getAxeResults(page);

      result.accessibility = {
        violations: accessibilityResults.violations?.length || 0,
        passes: accessibilityResults.passes?.length || 0,
        results: accessibilityResults,
      };
    }

    // 5. Run Performance/SEO Audit (Lighthouse)
    if (runPerformance) {
      try {
        const lighthouseOptions: playwrightLighthouseConfig = {
          page,
          thresholds,
          port: lighthousePort,
          reports: {
            formats: {
              json: false,
              html: false,
            },
          },
        };

        const lighthouseResults = await playAudit(lighthouseOptions);

        if (lighthouseResults) {
          result.performance = {
            score: lighthouseResults.lhr?.categories?.performance?.score
              ? lighthouseResults.lhr.categories.performance.score * 100
              : 0,
            metrics: {
              'first-contentful-paint':
                lighthouseResults.lhr?.audits?.['first-contentful-paint']
                  ?.numericValue || 0,
              'largest-contentful-paint':
                lighthouseResults.lhr?.audits?.['largest-contentful-paint']
                  ?.numericValue || 0,
              'cumulative-layout-shift':
                lighthouseResults.lhr?.audits?.['cumulative-layout-shift']
                  ?.numericValue || 0,
              'total-blocking-time':
                lighthouseResults.lhr?.audits?.['total-blocking-time']
                  ?.numericValue || 0,
            },
          };
        }
      } catch (error) {
        console.warn('Lighthouse audit failed:', error);
        // Continue without performance metrics
      }
    }

    return result;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * Get console logs from a page
 */
export async function getConsoleLogs(
  url: string
): Promise<Array<{ type: string; text: string }>> {
  const browser = await chromium.launch();
  
  try {
    const page = await browser.newPage();

    const logs: Array<{ type: string; text: string }> = [];
    page.on('console', (msg) => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    return logs;
  } finally {
    await browser.close();
  }
}

/**
 * Get network logs and failed requests from a page
 */
export async function getNetworkLogs(url: string): Promise<
  Array<{
    url: string;
    status: number | null;
    method: string;
    error?: string;
  }>
> {
  const browser = await chromium.launch();
  
  try {
    const page = await browser.newPage();

    const requests: Array<{
      url: string;
      status: number | null;
      method: string;
      error?: string;
    }> = [];

    page.on('response', (response) => {
      const request = response.request();
      requests.push({
        url: request.url(),
        status: response.status(),
        method: request.method(),
      });
    });

    page.on('requestfailed', (req) => {
      requests.push({
        url: req.url(),
        status: null,
        method: req.method(),
        error: req.failure()?.errorText || 'Unknown error',
      });
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    return requests;
  } finally {
    await browser.close();
  }
}

/**
 * Take a screenshot of a page
 */
export async function takeScreenshot(
  url: string,
  path: string = 'screenshot.png',
  fullPage: boolean = true
): Promise<string> {
  const browser = await chromium.launch();
  
  try {
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path, fullPage });

    return path;
  } finally {
    await browser.close();
  }
}

/**
 * Run accessibility audit only
 */
export async function runAccessibilityAudit(
  url: string
): Promise<AxeResults> {
  const browser = await chromium.launch();
  
  try {
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle' });
    await injectAxe(page);
    const results = await getAxeResults(page);

    return results;
  } finally {
    await browser.close();
  }
}
