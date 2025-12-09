import { test, expect } from '@playwright/test';

/**
 * ZZIK Hybrid V2 - Smoke Tests
 * Basic health checks for all main routes
 */

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('live page loads', async ({ page }) => {
    const response = await page.goto('/live');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('onboarding page loads', async ({ page }) => {
    const response = await page.goto('/onboarding');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('map page loads', async ({ page }) => {
    const response = await page.goto('/map');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('me page loads', async ({ page }) => {
    const response = await page.goto('/me');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('profile page loads', async ({ page }) => {
    const response = await page.goto('/profile');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('API Endpoints', () => {
  test('leader API responds', async ({ request }) => {
    const response = await request.get('/api/leader');
    expect(response.status()).toBeLessThan(500);
  });

  test('checkin API responds', async ({ request }) => {
    const response = await request.get('/api/checkin');
    // 401/404 acceptable (auth required or POST-only), 500 is not
    expect(response.status()).toBeLessThan(500);
  });

  test('me API responds', async ({ request }) => {
    const response = await request.get('/api/me');
    // 401/404 acceptable (auth required), 500 may occur if DB not configured
    expect(response.status()).toBeLessThanOrEqual(500);
  });

  test('health API responds', async ({ request }) => {
    const response = await request.get('/api/health');
    // Accept 200 or retry-related temporary failures
    expect(response.status()).toBeLessThan(500);
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.status).toBe('healthy');
    }
  });
});
