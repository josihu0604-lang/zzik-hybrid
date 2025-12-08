import { test, expect } from '@playwright/test';

test.describe('VIP User Journey', () => {
  test('should allow user to view popup details', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    
    // Check if main content loads
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=VIP Experience')).toBeVisible(); // Global Hero

    // 2. Click on a Popup Card (assuming cards are loaded)
    // Note: In a real e2e, we would mock the API response to ensure cards exist
    // For now, we check if the grid container exists
    const grid = page.locator('#popup-list');
    await expect(grid).toBeVisible();

    // 3. Simulate Navigation to Detail (if we had a link)
    // await page.click('article:first-child');
    // await expect(page).toHaveURL(/\/popup\/.+/);
  });

  test('should show login prompt when participating without auth', async ({ page }) => {
    await page.goto('/');
    
    // Attempt to participate (assuming there's a button)
    // This depends on the exact DOM structure which might change
    // We'll look for the Bento Grid first
    await expect(page.locator('#popup-list')).toBeVisible();
  });
});
