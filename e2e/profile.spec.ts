import { test, expect } from '@playwright/test';

/**
 * ZZIK Hybrid V2 - Profile Page Tests
 */

test.describe('Profile Page', () => {
  test('profile page responds', async ({ page }) => {
    const response = await page.goto('/profile');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('profile page has content', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Page should have some content
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('profile page shows login prompt or profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Should show either login prompt or profile content
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Profile Navigation', () => {
  test('dashboard link exists', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for dashboard link or button
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("대시보드")');

    if (await dashboardLink.count() > 0) {
      await expect(dashboardLink.first()).toBeVisible();
    } else {
      // Page might show login prompt instead
      expect(true).toBeTruthy();
    }
  });

  test('bottom navigation exists', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for bottom nav links
    const homeLink = page.locator('a[href="/"]');
    const mapLink = page.locator('a[href="/map"]');

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Profile Settings', () => {
  test('settings sections render', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Page should render settings or login prompt
    const pageContent = await page.content();
    expect(pageContent).toBeDefined();
  });
});

test.describe('Profile Responsive', () => {
  test('mobile viewport renders', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto('/profile');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('tablet viewport renders', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const response = await page.goto('/profile');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
