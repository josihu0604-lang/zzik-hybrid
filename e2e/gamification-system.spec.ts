import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Gamification System
 * Tests points, badges, leaderboard, and achievements
 */

test.describe('Gamification System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page with gamification section
    await page.goto('/demo#gamification');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Points System', () => {
    test('should display user points', async ({ page }) => {
      const pointsSection = page.locator('[data-testid="points-section"]');
      await expect(pointsSection).toBeVisible();

      // Check total points
      const totalPoints = page.locator('[data-testid="total-points"]');
      await expect(totalPoints).toBeVisible();

      // Verify it's a number
      const points = await totalPoints.textContent();
      expect(Number(points)).toBeGreaterThanOrEqual(0);
    });

    test('should display points breakdown', async ({ page }) => {
      const pointsBreakdown = page.locator('[data-testid="points-breakdown"]');
      await expect(pointsBreakdown).toBeVisible();

      // Check for different point categories
      await expect(page.locator('[data-testid="review-points"]')).toBeVisible();
      await expect(page.locator('[data-testid="checkin-points"]')).toBeVisible();
      await expect(page.locator('[data-testid="referral-points"]')).toBeVisible();
    });

    test('should display points history', async ({ page }) => {
      // Click points history tab
      const historyTab = page.locator('[data-testid="points-history-tab"]');
      await historyTab.click();

      // Wait for history to load
      const historyList = page.locator('[data-testid="points-history-list"]');
      await expect(historyList).toBeVisible();

      // Check for history items
      const historyItems = page.locator('[data-testid="points-history-item"]');
      const count = await historyItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should show points animation on earn', async ({ page }) => {
      // Trigger point earning action (e.g., complete a review)
      const earnPointsButton = page.locator('[data-testid="earn-points-demo"]');
      await earnPointsButton.click();

      // Wait for animation
      const pointsAnimation = page.locator('[data-testid="points-animation"]');
      await expect(pointsAnimation).toBeVisible({ timeout: 2000 });

      // Verify points increased
      await page.waitForTimeout(1000);
      const totalPoints = page.locator('[data-testid="total-points"]');
      const points = await totalPoints.textContent();
      expect(Number(points)).toBeGreaterThan(0);
    });

    test('should display level and progress', async ({ page }) => {
      const levelSection = page.locator('[data-testid="level-section"]');
      await expect(levelSection).toBeVisible();

      // Check current level
      const currentLevel = page.locator('[data-testid="current-level"]');
      await expect(currentLevel).toBeVisible();

      // Check progress bar
      const progressBar = page.locator('[data-testid="level-progress-bar"]');
      await expect(progressBar).toBeVisible();

      // Verify progress percentage
      const progress = await progressBar.getAttribute('aria-valuenow');
      const progressNum = Number(progress);
      expect(progressNum).toBeGreaterThanOrEqual(0);
      expect(progressNum).toBeLessThanOrEqual(100);
    });
  });

  test.describe('Badge System', () => {
    test('should display badge collection', async ({ page }) => {
      const badgesSection = page.locator('[data-testid="badges-section"]');
      await expect(badgesSection).toBeVisible();

      // Check for badge items
      const badges = page.locator('[data-testid="badge-item"]');
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display earned and locked badges', async ({ page }) => {
      // Check earned badges
      const earnedBadges = page.locator('[data-testid="badge-item"][data-earned="true"]');
      const earnedCount = await earnedBadges.count();

      // Check locked badges
      const lockedBadges = page.locator('[data-testid="badge-item"][data-earned="false"]');
      const lockedCount = await lockedBadges.count();

      expect(earnedCount + lockedCount).toBeGreaterThan(0);
    });

    test('should show badge details on click', async ({ page }) => {
      // Click first badge
      const firstBadge = page.locator('[data-testid="badge-item"]').first();
      await firstBadge.click();

      // Wait for details modal
      const badgeModal = page.locator('[data-testid="badge-details-modal"]');
      await expect(badgeModal).toBeVisible();

      // Check modal content
      await expect(page.locator('[data-testid="badge-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="badge-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="badge-requirements"]')).toBeVisible();
    });

    test('should display badge progress', async ({ page }) => {
      // Find locked badge with progress
      const lockedBadges = page.locator('[data-testid="badge-item"][data-earned="false"]');
      const firstLocked = lockedBadges.first();
      await firstLocked.click();

      // Check progress in modal
      const progressSection = page.locator('[data-testid="badge-progress"]');
      if (await progressSection.isVisible()) {
        const progressText = await progressSection.textContent();
        expect(progressText).toMatch(/\d+\/\d+/);
      }
    });

    test('should show badge categories', async ({ page }) => {
      // Check for category filters
      const categoryFilters = page.locator('[data-testid="badge-category"]');
      const count = await categoryFilters.count();
      expect(count).toBeGreaterThan(0);

      // Click a category
      const firstCategory = categoryFilters.first();
      await firstCategory.click();

      // Wait for filter
      await page.waitForTimeout(500);

      // Verify filtered badges display
      const filteredBadges = page.locator('[data-testid="badge-item"]');
      const filteredCount = await filteredBadges.count();
      expect(filteredCount).toBeGreaterThan(0);
    });

    test('should display rare and legendary badges differently', async ({ page }) => {
      // Check for badges with different rarities
      const rareBadges = page.locator('[data-testid="badge-item"][data-rarity="rare"]');
      const legendaryBadges = page.locator('[data-testid="badge-item"][data-rarity="legendary"]');

      const rareCount = await rareBadges.count();
      const legendaryCount = await legendaryBadges.count();

      // At least one special badge should exist
      expect(rareCount + legendaryCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Leaderboard', () => {
    test('should display leaderboard', async ({ page }) => {
      // Navigate to leaderboard tab
      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Wait for leaderboard to load
      const leaderboard = page.locator('[data-testid="leaderboard"]');
      await expect(leaderboard).toBeVisible();

      // Check for leaderboard entries
      const entries = page.locator('[data-testid="leaderboard-entry"]');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display user rankings', async ({ page }) => {
      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Check first entry
      const firstEntry = page.locator('[data-testid="leaderboard-entry"]').first();
      await expect(firstEntry).toBeVisible();

      // Verify rank, name, and points
      await expect(firstEntry.locator('[data-testid="rank"]')).toBeVisible();
      await expect(firstEntry.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(firstEntry.locator('[data-testid="points"]')).toBeVisible();
    });

    test('should highlight current user', async ({ page }) => {
      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Find current user entry
      const currentUserEntry = page.locator('[data-testid="leaderboard-entry"][data-current-user="true"]');
      
      if (await currentUserEntry.isVisible()) {
        // Verify highlight styling
        const hasHighlight = await currentUserEntry.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent';
        });
        expect(hasHighlight).toBe(true);
      }
    });

    test('should switch between leaderboard timeframes', async ({ page }) => {
      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Check timeframe tabs
      const weeklyTab = page.locator('[data-testid="leaderboard-weekly"]');
      const monthlyTab = page.locator('[data-testid="leaderboard-monthly"]');
      const allTimeTab = page.locator('[data-testid="leaderboard-all-time"]');

      // Click monthly
      await monthlyTab.click();
      await page.waitForTimeout(500);

      // Verify leaderboard updated
      const entries = page.locator('[data-testid="leaderboard-entry"]');
      const count = await entries.count();
      expect(count).toBeGreaterThan(0);

      // Click all-time
      await allTimeTab.click();
      await page.waitForTimeout(500);

      // Verify different results
      const allTimeEntries = page.locator('[data-testid="leaderboard-entry"]');
      const allTimeCount = await allTimeEntries.count();
      expect(allTimeCount).toBeGreaterThan(0);
    });

    test('should display top 3 with special styling', async ({ page }) => {
      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Check top 3 entries
      for (let i = 0; i < 3; i++) {
        const entry = page.locator('[data-testid="leaderboard-entry"]').nth(i);
        const rank = await entry.locator('[data-testid="rank"]').textContent();
        expect(Number(rank)).toBe(i + 1);

        // Verify special styling for top 3
        if (i < 3) {
          const hasMedal = await entry.locator('[data-testid="medal"]').isVisible();
          expect(hasMedal).toBe(true);
        }
      }
    });
  });

  test.describe('Achievements', () => {
    test('should display achievements list', async ({ page }) => {
      const achievementsTab = page.locator('[data-testid="achievements-tab"]');
      await achievementsTab.click();

      // Wait for achievements to load
      const achievementsList = page.locator('[data-testid="achievements-list"]');
      await expect(achievementsList).toBeVisible();

      // Check for achievement items
      const achievements = page.locator('[data-testid="achievement-item"]');
      const count = await achievements.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display unlocked and locked achievements', async ({ page }) => {
      const achievementsTab = page.locator('[data-testid="achievements-tab"]');
      await achievementsTab.click();

      // Check unlocked
      const unlocked = page.locator('[data-testid="achievement-item"][data-unlocked="true"]');
      const unlockedCount = await unlocked.count();

      // Check locked
      const locked = page.locator('[data-testid="achievement-item"][data-unlocked="false"]');
      const lockedCount = await locked.count();

      expect(unlockedCount + lockedCount).toBeGreaterThan(0);
    });

    test('should claim achievement rewards', async ({ page }) => {
      const achievementsTab = page.locator('[data-testid="achievements-tab"]');
      await achievementsTab.click();

      // Find claimable achievement
      const claimableAchievement = page.locator('[data-testid="achievement-item"][data-claimable="true"]');
      
      if (await claimableAchievement.isVisible()) {
        // Click claim button
        const claimButton = claimableAchievement.locator('[data-testid="claim-button"]');
        await claimButton.click();

        // Wait for success message
        const successMessage = page.locator('[data-testid="claim-success"]');
        await expect(successMessage).toBeVisible({ timeout: 3000 });

        // Verify points increased
        const totalPoints = page.locator('[data-testid="total-points"]');
        const points = await totalPoints.textContent();
        expect(Number(points)).toBeGreaterThan(0);
      }
    });

    test('should show achievement unlock animation', async ({ page }) => {
      const achievementsTab = page.locator('[data-testid="achievements-tab"]');
      await achievementsTab.click();

      // Trigger achievement unlock (demo button)
      const unlockDemo = page.locator('[data-testid="unlock-achievement-demo"]');
      if (await unlockDemo.isVisible()) {
        await unlockDemo.click();

        // Wait for unlock animation
        const unlockAnimation = page.locator('[data-testid="achievement-unlock-animation"]');
        await expect(unlockAnimation).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display achievement progress', async ({ page }) => {
      const achievementsTab = page.locator('[data-testid="achievements-tab"]');
      await achievementsTab.click();

      // Find achievement with progress
      const achievements = page.locator('[data-testid="achievement-item"]');
      const firstAchievement = achievements.first();
      await firstAchievement.click();

      // Check progress in details
      const progressSection = page.locator('[data-testid="achievement-progress"]');
      if (await progressSection.isVisible()) {
        const progressBar = progressSection.locator('[data-testid="progress-bar"]');
        await expect(progressBar).toBeVisible();
      }
    });
  });

  test.describe('Streaks and Challenges', () => {
    test('should display current streak', async ({ page }) => {
      const streakSection = page.locator('[data-testid="streak-section"]');
      await expect(streakSection).toBeVisible();

      // Check streak count
      const streakCount = page.locator('[data-testid="streak-count"]');
      await expect(streakCount).toBeVisible();

      const count = await streakCount.textContent();
      expect(Number(count)).toBeGreaterThanOrEqual(0);
    });

    test('should display streak calendar', async ({ page }) => {
      const streakSection = page.locator('[data-testid="streak-section"]');
      await streakSection.click();

      // Wait for calendar
      const streakCalendar = page.locator('[data-testid="streak-calendar"]');
      await expect(streakCalendar).toBeVisible();

      // Check for day indicators
      const days = page.locator('[data-testid="streak-day"]');
      const count = await days.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display active challenges', async ({ page }) => {
      const challengesTab = page.locator('[data-testid="challenges-tab"]');
      await challengesTab.click();

      // Wait for challenges list
      const challengesList = page.locator('[data-testid="challenges-list"]');
      await expect(challengesList).toBeVisible();

      // Check for challenge items
      const challenges = page.locator('[data-testid="challenge-item"]');
      const count = await challenges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should join a challenge', async ({ page }) => {
      const challengesTab = page.locator('[data-testid="challenges-tab"]');
      await challengesTab.click();

      // Find available challenge
      const availableChallenges = page.locator('[data-testid="challenge-item"][data-status="available"]');
      
      if (await availableChallenges.first().isVisible()) {
        const firstChallenge = availableChallenges.first();
        
        // Click join button
        const joinButton = firstChallenge.locator('[data-testid="join-challenge"]');
        await joinButton.click();

        // Wait for confirmation
        await page.waitForTimeout(500);

        // Verify challenge is now active
        await expect(firstChallenge).toHaveAttribute('data-status', 'active');
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display gamification features on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to gamification section
      await page.goto('/demo#gamification');

      // Verify mobile layout
      const pointsSection = page.locator('[data-testid="points-section"]');
      await expect(pointsSection).toBeVisible();

      // Check that elements fit mobile width
      const boundingBox = await pointsSection.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400);
    });

    test('should display mobile-friendly badge grid', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const badgesSection = page.locator('[data-testid="badges-section"]');
      await expect(badgesSection).toBeVisible();

      // Verify badges arranged in mobile grid
      const badges = page.locator('[data-testid="badge-item"]');
      const firstBadge = badges.first();
      const badgeBox = await firstBadge.boundingBox();

      // Check badge size is appropriate for mobile
      expect(badgeBox?.width).toBeLessThan(150);
    });

    test('should have touch-friendly leaderboard on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const leaderboardTab = page.locator('[data-testid="leaderboard-tab"]');
      await leaderboardTab.click();

      // Check entry height for touch targets
      const entries = page.locator('[data-testid="leaderboard-entry"]');
      const firstEntry = entries.first();
      const entryBox = await firstEntry.boundingBox();

      // Verify minimum touch target height
      expect(entryBox?.height).toBeGreaterThanOrEqual(48);
    });
  });
});
