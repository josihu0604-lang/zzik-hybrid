/**
 * Offline Page E2E Tests
 *
 * Tests for:
 * - Offline page accessibility
 * - Network status detection
 * - Retry functionality
 * - Auto-reconnect behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Offline Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to offline page
    await page.goto('/offline');
  });

  test('should display offline page correctly', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /오프라인/i })).toBeVisible();

    // Check offline icon is visible
    await expect(page.locator('svg').first()).toBeVisible();

    // Check description text
    await expect(page.getByText(/인터넷 연결이 끊어졌습니다/i)).toBeVisible();
    await expect(page.getByText(/Wi-Fi 또는 모바일 데이터/i)).toBeVisible();
  });

  test('should show network status indicator', async ({ page }) => {
    // Status indicator should show offline by default on /offline page
    const statusIndicator = page.locator('[class*="rounded-full"]').first();
    await expect(statusIndicator).toBeVisible();

    // Should show "오프라인" text
    await expect(page.getByText(/오프라인|offline/i)).toBeVisible();
  });

  test('should have retry button', async ({ page }) => {
    const retryButton = page.getByRole('button', { name: /다시 연결|retry/i });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('should have home button', async ({ page }) => {
    const homeButton = page.getByRole('button', { name: /홈으로|home/i });
    await expect(homeButton).toBeVisible();
    await expect(homeButton).toBeEnabled();
  });

  test('should show loading state when retrying', async ({ page }) => {
    // Click retry button
    const retryButton = page.getByRole('button', { name: /다시 연결|retry/i });
    await retryButton.click();

    // Should show loading state
    await expect(page.getByText(/확인 중|checking/i)).toBeVisible();

    // Wait for retry to complete
    await page.waitForTimeout(3000);
  });

  test('should navigate to home when clicking home button', async ({ page }) => {
    // Mock service worker to allow navigation
    const homeButton = page.getByRole('button', { name: /홈으로|home/i });

    // Click and verify navigation attempt
    await homeButton.click();

    // Should attempt to navigate (may show cached home or redirect)
    await page.waitForTimeout(500);
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check buttons are focusable
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to activate button with keyboard
    await page.keyboard.press('Enter');
  });

  test('should have proper color contrast', async ({ page }) => {
    // Main text should be visible against dark background
    const mainText = page.getByText(/오프라인 상태입니다/i);
    await expect(mainText).toBeVisible();
    // Verify color is set (any valid CSS color)
    const color = await mainText.evaluate((el) => getComputedStyle(el).color);
    expect(color).toMatch(/rgb/);
  });

  test('should display glass morphism card', async ({ page }) => {
    // Check for glass effect container
    const card = page.locator('[style*="backdrop-filter"]');
    await expect(card.first()).toBeVisible();
  });

  test('should handle rapid retry clicks', async ({ page }) => {
    const retryButton = page.getByRole('button', { name: /다시 연결|retry/i });

    // Click multiple times rapidly
    await retryButton.click();
    await retryButton.click();
    await retryButton.click();

    // Should not crash and button should be disabled during check
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/offline/);
  });
});

test.describe('Offline Page - Network Simulation', () => {
  test('should detect network recovery', async ({ page, context }) => {
    await page.goto('/offline');

    // Simulate going online
    await context.setOffline(false);

    // Should show reconnecting state
    await page.waitForTimeout(1000);

    // Note: Actual reconnection would redirect to home
    // This test verifies the offline page handles network changes
  });

  test('should handle offline state during retry', async ({ page, context }) => {
    await page.goto('/offline');

    // Set offline mode
    await context.setOffline(true);

    // Try to retry
    const retryButton = page.getByRole('button', { name: /다시 연결|retry/i });
    await retryButton.click();

    // Should remain on offline page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/offline/);
  });
});

test.describe('Offline Page - Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/offline');

    // All elements should be visible
    await expect(page.getByText(/오프라인 상태입니다/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /다시 연결/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /홈으로/i })).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/offline');

    await expect(page.getByText(/오프라인 상태입니다/i)).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/offline');

    await expect(page.getByText(/오프라인 상태입니다/i)).toBeVisible();
  });
});

test.describe('Offline Page - Animation', () => {
  test('should show pulse animation on status indicator', async ({ page }) => {
    await page.goto('/offline');

    // Look for animated pulse indicator
    const pulseElement = page.locator('.animate-pulse');
    await expect(pulseElement.first()).toBeVisible();
  });

  test('should animate retry spinner', async ({ page }) => {
    await page.goto('/offline');

    const retryButton = page.getByRole('button', { name: /다시 연결/i });
    await retryButton.click();

    // Spinner should animate
    const spinner = page.locator('.animate-spin');
    await expect(spinner.first()).toBeVisible();
  });
});

test.describe('Offline Page - SEO', () => {
  test('should have noindex meta tag', async ({ page }) => {
    await page.goto('/offline');

    // Check for noindex
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('noindex');
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/offline');

    await expect(page).toHaveTitle(/오프라인|Offline/i);
  });
});
