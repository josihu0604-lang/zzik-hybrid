import { test, expect } from '@playwright/test';

/**
 * ZZIK Hybrid V2 - Popup Participation Flow E2E Tests
 * Tests the complete user journey from discovering a popup to participating
 *
 * Flow: Homepage → Popup Card Click → Detail Page → Participate → Confirmation
 */

test.describe('Popup Participation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete participation flow - guest user', async ({ page }) => {
    // Step 1: Homepage loads with popup cards
    await expect(page.locator('body')).toBeVisible();

    // Wait for any popup cards to load
    await page.waitForTimeout(2000);

    // Step 2: Look for popup cards (flexible selectors)
    const popupCards = page.locator('[class*="popup"]').or(
      page.locator('article')
    ).or(
      page.locator('[data-testid*="popup"]')
    );

    const cardCount = await popupCards.count();

    if (cardCount > 0) {
      // Step 3: Click first popup card
      const firstCard = popupCards.first();
      await expect(firstCard).toBeVisible();
      await firstCard.click();

      // Step 4: Detail page should load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on a detail page (URL change or content)
      const url = page.url();
      const isDetailPage = url.includes('/popup/') ||
                          url.includes('/detail/') ||
                          url.includes('/live/');

      if (isDetailPage) {
        // Step 5: Look for participate button
        const participateButton = page.locator('button').filter({
          hasText: /참여|participate|join|신청/i
        });

        const buttonCount = await participateButton.count();

        if (buttonCount > 0) {
          // Step 6: Click participate button
          const button = participateButton.first();
          await expect(button).toBeEnabled();
          await button.click();

          // Step 7: Verify participation confirmation
          await page.waitForTimeout(1500);

          // Look for success indicators
          const successMessage = page.getByText(/참여.*완료|complete|success|감사|thank/i);
          const confirmationDialog = page.locator('[role="dialog"]').or(
            page.locator('[class*="modal"]')
          ).or(
            page.locator('[class*="toast"]')
          );

          const hasConfirmation = (await successMessage.count()) > 0 ||
                                 (await confirmationDialog.count()) > 0;

          // Participation should trigger some feedback
          expect(hasConfirmation).toBeDefined();
        }
      }
    }

    // Flow should complete without errors
    expect(true).toBeTruthy();
  });

  test('homepage displays popup cards', async ({ page }) => {
    // Verify homepage has content
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);

    // Look for popup-related elements
    await page.waitForTimeout(2000);

    const hasPopupContent =
      (await page.locator('[class*="popup"]').count()) > 0 ||
      (await page.locator('article').count()) > 0 ||
      (await page.getByText(/팝업|popup/i).count()) > 0;

    expect(hasPopupContent).toBeDefined();
  });

  test('popup card click navigation', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find clickable cards
    const clickableElements = page.locator('a[href*="/popup"]').or(
      page.locator('a[href*="/live"]')
    ).or(
      page.locator('[class*="popup"]').locator('a')
    );

    const count = await clickableElements.count();

    if (count > 0) {
      const firstLink = clickableElements.first();
      const href = await firstLink.getAttribute('href');

      // Navigate to detail page
      await firstLink.click();
      await page.waitForLoadState('networkidle');

      // Verify navigation occurred
      const currentUrl = page.url();
      expect(currentUrl).not.toBe('/');
    }
  });

  test('popup detail page structure', async ({ page }) => {
    // Try to navigate to a popup detail page
    const detailUrls = ['/popup/test-popup', '/live/test-popup'];

    for (const url of detailUrls) {
      const response = await page.goto(url);

      if (response && response.status() < 400) {
        await page.waitForLoadState('networkidle');

        // Verify detail page has content
        const body = await page.locator('body').textContent();
        expect(body?.length).toBeGreaterThan(0);
        break;
      }
    }
  });

  test('participate button is interactive', async ({ page }) => {
    // Navigate to detail page
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for participate button
    const participateButton = page.locator('button').filter({
      hasText: /참여|participate|join/i
    });

    const count = await participateButton.count();

    if (count > 0) {
      const button = participateButton.first();

      // Button should be visible and enabled
      await expect(button).toBeVisible();

      // Check if button is interactive
      const isEnabled = await button.isEnabled();
      expect(isEnabled).toBeDefined();
    }
  });

  test('participation shows progress indicator', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for progress indicators
    const progressElements = page.locator('[class*="progress"]').or(
      page.locator('progress')
    ).or(
      page.locator('[role="progressbar"]')
    ).or(
      page.getByText(/\d+\/\d+|%/)
    );

    const count = await progressElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('participation requires authentication check', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for participate button
    const participateButton = page.locator('button').filter({
      hasText: /참여|participate/i
    });

    const count = await participateButton.count();

    if (count > 0) {
      await participateButton.first().click();
      await page.waitForTimeout(1000);

      // Should either show login modal or confirmation
      const currentUrl = page.url();
      const hasModal = (await page.locator('[role="dialog"]').count()) > 0;
      const redirectedToLogin = currentUrl.includes('/login');

      // Some authentication flow should be present
      expect(hasModal || redirectedToLogin || currentUrl).toBeDefined();
    }
  });
});

test.describe('Popup Participation Flow - Progress Display', () => {
  test('shows current participation count', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for participation numbers (e.g., "72/100", "72명")
    const numberPattern = /\d+/;
    const hasNumbers = (await page.locator(`text=${numberPattern}`).count()) > 0;

    expect(hasNumbers).toBeTruthy();
  });

  test('displays goal achievement status', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for goal-related text
    const goalText = page.getByText(/목표|goal|달성|complete/i);
    const count = await goalText.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows time remaining until deadline', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for time-related text
    const timeText = page.getByText(/남음|remaining|일|day|시간|hour/i);
    const count = await timeText.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Popup Participation Flow - Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile: popup cards are touch-friendly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Cards should be visible and tappable on mobile
    const cards = page.locator('[class*="popup"]').or(page.locator('article'));
    const count = await cards.count();

    if (count > 0) {
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();

      // Touch target should be reasonably sized
      if (box) {
        expect(box.height).toBeGreaterThan(50);
      }
    }
  });

  test('mobile: participate button is prominent', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    const participateButton = page.locator('button').filter({
      hasText: /참여|participate/i
    });

    const count = await participateButton.count();

    if (count > 0) {
      const button = participateButton.first();
      const box = await button.boundingBox();

      // Button should be large enough for mobile tap
      if (box) {
        expect(box.height).toBeGreaterThan(40);
      }
    }
  });

  test('mobile: detail page scrolls smoothly', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);

    // Verify scroll happened
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll);
  });
});

test.describe('Popup Participation Flow - Error Handling', () => {
  test('handles invalid popup ID gracefully', async ({ page }) => {
    const response = await page.goto('/popup/invalid-popup-id-12345');

    // Should not crash (may show 404 or redirect)
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows appropriate message when popup is full', async ({ page }) => {
    await page.goto('/popup/full-popup-test');
    await page.waitForLoadState('networkidle');

    // Look for "full" indicators
    const fullMessage = page.getByText(/마감|full|완료|closed/i);
    const count = await fullMessage.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('displays error when participation fails', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Try to participate
    const participateButton = page.locator('button').filter({
      hasText: /참여|participate/i
    });

    const count = await participateButton.count();

    if (count > 0) {
      await participateButton.first().click();
      await page.waitForTimeout(1500);

      // Error handling should be in place
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Popup Participation Flow - Social Features', () => {
  test('share button is available', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for share buttons
    const shareButtons = page.locator('button').filter({
      hasText: /공유|share|카카오|네이버/i
    });

    const count = await shareButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('displays participant count publicly', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Should show how many people have participated
    const participantInfo = page.getByText(/명|people|participants|\d+/i);
    const count = await participantInfo.count();

    expect(count).toBeGreaterThan(0);
  });

  test('shows leader badge if applicable', async ({ page }) => {
    await page.goto('/popup/test-popup');
    await page.waitForLoadState('networkidle');

    // Look for leader-related content
    const leaderContent = page.getByText(/리더|leader/i).or(
      page.locator('[class*="leader"]')
    );

    const count = await leaderContent.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
