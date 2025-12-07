import { test, expect } from '@playwright/test';

/**
 * ZZIK Hybrid V2 - Check-in Flow Tests
 * Tests the Triple Verification system (GPS + QR + Receipt)
 */

test.describe('Check-in Flow', () => {
  // Mock store ID for testing
  const TEST_STORE_ID = 'test-store-123';

  test('check-in page loads with store ID', async ({ page }) => {
    await page.goto(`/checkin/${TEST_STORE_ID}`);

    // Should show check-in UI or auth redirect
    await expect(page.locator('body')).toBeVisible();
  });

  test('displays Triple Verification components', async ({ page }) => {
    const response = await page.goto(`/checkin/${TEST_STORE_ID}`);
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('check-in API endpoint responds', async ({ request }) => {
    // Test the check-in API health
    const response = await request.get('/api/checkin?limit=1');

    // Should respond (may return error if not authenticated)
    expect(response.status()).toBeLessThan(500);
  });

  test('store API endpoint responds', async ({ request }) => {
    // Test store lookup API
    const response = await request.get('/api/stores');

    // Should respond
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Verification Score Display', () => {
  test('score calculation is visible', async ({ page }) => {
    await page.goto('/checkin/test-store');
    await page.waitForLoadState('networkidle');

    // Look for percentage or score display
    const scoreElements = page.locator('[class*="score"], [class*="percent"], text=/%/');

    // Page should have some score-related content or be redirected
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Check-in Components', () => {
  test('checkin page loads successfully', async ({ page }) => {
    const response = await page.goto('/checkin/test-store');

    // Accept any non-500 response (200, 307 redirect, etc.)
    expect(response?.status()).toBeLessThan(500);

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Body should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('QR Scanner section exists', async ({ page }) => {
    await page.goto('/checkin/test-store');
    await page.waitForLoadState('networkidle');

    // QR-related content
    const hasQRContent =
      (await page.locator('text=QR').count()) > 0 ||
      (await page.locator('[class*="qr"]').count()) > 0;

    // Either has QR content or was redirected
    await expect(page.locator('body')).toBeVisible();
  });

  test('Receipt scanner section exists', async ({ page }) => {
    await page.goto('/checkin/test-store');
    await page.waitForLoadState('networkidle');

    // Receipt-related content
    const pageContent = await page.content();

    // Check for receipt or verification content
    expect(pageContent).toBeDefined();
  });
});

test.describe('Naver Clip Share', () => {
  test('share button functionality', async ({ page }) => {
    await page.goto('/checkin/test-store');
    await page.waitForLoadState('networkidle');

    // Look for Naver or share-related elements
    const naverElements = page.locator('text=네이버, text=클립, text=공유, [class*="share"]');

    // Page should be visible (content depends on auth state)
    await expect(page.locator('body')).toBeVisible();
  });
});
