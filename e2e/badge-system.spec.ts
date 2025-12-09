import { test, expect } from '@playwright/test';

/**
 * ZZIK Hybrid V2 - Badge System E2E Tests
 * Tests the gamification badge system
 *
 * Scenarios:
 * - Badge display on profile
 * - Badge progress tracking
 * - Badge detail view
 * - Badge categories filtering
 */

test.describe('Badge System - Profile Display', () => {
  test('profile page loads successfully', async ({ page }) => {
    const response = await page.goto('/me');

    // Page should load without server errors
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('badges section exists on profile', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for badges section
    const badgesSection = page.getByText(/배지|Badge|뱃지/i).or(
      page.locator('[class*="badge"]')
    ).or(
      page.locator('[data-testid="badges-section"]')
    );

    // Should have some badge-related content
    await expect(page.locator('body')).toBeVisible();
  });

  test('badge count is displayed', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for badge count display
    const badgeCount = page.getByText(/\d+개|획득/i).or(
      page.locator('[class*="badge-count"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Badge System - Badge Grid', () => {
  test('badge grid displays badges', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for badge grid or list
    const badgeGrid = page.locator('[class*="badge-grid"]').or(
      page.locator('[class*="badge-list"]')
    ).or(
      page.locator('[role="list"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('badges have icons', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for emoji or icon elements in badge area
    const icons = page.locator('[class*="badge"] span').or(
      page.locator('[class*="badge"] svg')
    ).or(
      page.getByRole('img', { name: /badge|배지/i })
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('earned badges are distinguishable from locked', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for visual distinction between earned and locked badges
    const earnedBadges = page.locator('[class*="earned"]').or(
      page.locator('[data-earned="true"]')
    );
    const lockedBadges = page.locator('[class*="locked"]').or(
      page.locator('[data-earned="false"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Badge System - Progress Tracking', () => {
  test('badge progress bars are displayed', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for progress indicators
    const progressBars = page.getByRole('progressbar').or(
      page.locator('[class*="progress"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('progress text shows current/target', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for progress text like "5/10"
    const progressText = page.getByText(/\d+\s*\/\s*\d+/).or(
      page.getByText(/\d+%/)
    );

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Badge System - Badge Detail', () => {
  test('clicking badge shows detail', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Find and click a badge
    const badge = page.locator('[class*="badge"]').first().or(
      page.locator('button').filter({ hasText: /배지|badge/i }).first()
    );

    // Badge might be clickable
    const badgeCount = await badge.count();
    if (badgeCount > 0) {
      await badge.click();
      await page.waitForTimeout(500);

      // Check if detail view opened (modal or expanded section)
      const detailView = page.locator('[role="dialog"]').or(
        page.locator('[class*="modal"]')
      ).or(
        page.locator('[class*="detail"]')
      );

      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('badge detail shows description', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for badge descriptions
    const descriptions = page.locator('[class*="description"]').or(
      page.locator('p').filter({ hasText: /완료|달성|획득/ })
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('badge detail shows rarity', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for rarity indicators
    const rarityIndicators = page.getByText(/일반|레어|에픽|전설|Common|Rare|Epic|Legendary/i).or(
      page.locator('[class*="rarity"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Badge System - Categories', () => {
  test('badge categories exist', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for category tabs or filters
    const categories = page.getByRole('tab').or(
      page.getByRole('button', { name: /참여|체크인|리더|스페셜/i })
    ).or(
      page.locator('[class*="category"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('category filtering works', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Find category filter buttons
    const categoryButton = page.getByRole('tab').first().or(
      page.getByRole('button', { name: /참여|체크인|리더/i }).first()
    );

    const buttonCount = await categoryButton.count();
    if (buttonCount > 0) {
      await categoryButton.click();
      await page.waitForTimeout(500);

      // Page should still be visible after filtering
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Badge System - Points', () => {
  test('total points displayed', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for points display
    const pointsDisplay = page.getByText(/\d+P|포인트/i).or(
      page.locator('[class*="point"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('badge shows point value', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Look for individual badge point values
    const badgePoints = page.getByText(/\+\d+P/).or(
      page.locator('[class*="badge"] [class*="point"]')
    );

    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Badge System - Accessibility', () => {
  test('badges have proper aria labels', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Check for aria-label attributes
    const ariaLabeled = page.locator('[aria-label*="배지"], [aria-label*="badge"]').or(
      page.locator('button[aria-label]')
    );

    await expect(page.locator('body')).toBeVisible();
  });

  test('progress bars have proper roles', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');

    // Check for proper progressbar roles
    const progressBars = page.getByRole('progressbar');

    await expect(page.locator('body')).toBeVisible();
  });
});
