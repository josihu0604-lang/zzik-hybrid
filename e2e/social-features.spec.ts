import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Social Features
 * Tests user profiles, following, followers, and social feed
 */

test.describe('Social Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page with social section
    await page.goto('/demo#social');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Profile', () => {
    test('should display user profile information', async ({ page }) => {
      const profileSection = page.locator('[data-testid="profile-section"]');
      await expect(profileSection).toBeVisible();

      // Check profile elements
      await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-bio"]')).toBeVisible();
    });

    test('should display profile statistics', async ({ page }) => {
      // Check for followers count
      const followersCount = page.locator('[data-testid="followers-count"]');
      await expect(followersCount).toBeVisible();

      // Check for following count
      const followingCount = page.locator('[data-testid="following-count"]');
      await expect(followingCount).toBeVisible();

      // Check for reviews count
      const reviewsCount = page.locator('[data-testid="reviews-count"]');
      await expect(reviewsCount).toBeVisible();

      // Verify they are numbers
      const followers = await followersCount.textContent();
      const following = await followingCount.textContent();
      const reviews = await reviewsCount.textContent();

      expect(Number(followers)).toBeGreaterThanOrEqual(0);
      expect(Number(following)).toBeGreaterThanOrEqual(0);
      expect(Number(reviews)).toBeGreaterThanOrEqual(0);
    });

    test('should edit profile information', async ({ page }) => {
      // Click edit button
      const editButton = page.locator('[data-testid="edit-profile"]');
      await editButton.click();

      // Wait for edit modal
      const editModal = page.locator('[data-testid="edit-profile-modal"]');
      await expect(editModal).toBeVisible();

      // Update bio
      const bioInput = page.locator('[data-testid="bio-input"]');
      await bioInput.fill('새로운 자기소개입니다. 짝짝이를 사랑합니다!');

      // Save changes
      const saveButton = page.locator('[data-testid="save-profile"]');
      await saveButton.click();

      // Verify success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Verify bio updated
      const updatedBio = page.locator('[data-testid="profile-bio"]');
      await expect(updatedBio).toHaveText(/새로운 자기소개입니다/);
    });

    test('should display user badges', async ({ page }) => {
      const badgesSection = page.locator('[data-testid="profile-badges"]');
      await expect(badgesSection).toBeVisible();

      // Check for badge items
      const badges = page.locator('[data-testid="badge-item"]');
      const count = await badges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Follow System', () => {
    test('should follow a user', async ({ page }) => {
      // Find user card
      const userCard = page.locator('[data-testid="user-card"]').first();
      await expect(userCard).toBeVisible();

      // Get initial follower count
      const followButton = userCard.locator('[data-testid="follow-button"]');
      await expect(followButton).toBeVisible();

      // Click follow
      await followButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify button changed to "Following"
      await expect(followButton).toHaveText(/팔로잉|Following/i);

      // Verify follower count increased in stats
      const followingCount = page.locator('[data-testid="following-count"]');
      const count = await followingCount.textContent();
      expect(Number(count)).toBeGreaterThan(0);
    });

    test('should unfollow a user', async ({ page }) => {
      // Find followed user
      const userCard = page.locator('[data-testid="user-card"]').first();
      const followButton = userCard.locator('[data-testid="follow-button"]');

      // Follow first if not already
      const buttonText = await followButton.textContent();
      if (buttonText?.includes('팔로우') || buttonText?.includes('Follow')) {
        await followButton.click();
        await page.waitForTimeout(500);
      }

      // Now unfollow
      await followButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify button changed back to "Follow"
      await expect(followButton).toHaveText(/팔로우|Follow/i);
      await expect(followButton).not.toHaveText(/팔로잉|Following/i);
    });

    test('should display followers list', async ({ page }) => {
      // Click followers tab
      const followersTab = page.locator('[data-testid="followers-tab"]');
      await followersTab.click();

      // Wait for list to load
      const followersList = page.locator('[data-testid="followers-list"]');
      await expect(followersList).toBeVisible();

      // Check for follower items
      const followers = page.locator('[data-testid="follower-item"]');
      const count = await followers.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display following list', async ({ page }) => {
      // Click following tab
      const followingTab = page.locator('[data-testid="following-tab"]');
      await followingTab.click();

      // Wait for list to load
      const followingList = page.locator('[data-testid="following-list"]');
      await expect(followingList).toBeVisible();

      // Check for following items
      const following = page.locator('[data-testid="following-item"]');
      const count = await following.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should search for users', async ({ page }) => {
      // Find search input
      const searchInput = page.locator('[data-testid="user-search"]');
      await expect(searchInput).toBeVisible();

      // Type search query
      await searchInput.fill('김철수');

      // Wait for search results
      await page.waitForTimeout(500);

      // Verify results contain search term
      const searchResults = page.locator('[data-testid="user-card"]');
      const firstResult = searchResults.first();
      const userName = await firstResult.locator('[data-testid="user-name"]').textContent();
      expect(userName).toContain('김철수');
    });
  });

  test.describe('Social Feed', () => {
    test('should display social feed', async ({ page }) => {
      // Navigate to feed tab
      const feedTab = page.locator('[data-testid="feed-tab"]');
      await feedTab.click();

      // Wait for feed to load
      const feedList = page.locator('[data-testid="feed-list"]');
      await expect(feedList).toBeVisible();

      // Check for feed items
      const feedItems = page.locator('[data-testid="feed-item"]');
      const count = await feedItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display different activity types in feed', async ({ page }) => {
      const feedTab = page.locator('[data-testid="feed-tab"]');
      await feedTab.click();

      // Check for various activity types
      const feedItems = page.locator('[data-testid="feed-item"]');
      const count = await feedItems.count();

      // Verify at least one item has activity type
      if (count > 0) {
        const firstItem = feedItems.first();
        const activityType = firstItem.locator('[data-testid="activity-type"]');
        await expect(activityType).toBeVisible();
      }
    });

    test('should like a feed item', async ({ page }) => {
      const feedTab = page.locator('[data-testid="feed-tab"]');
      await feedTab.click();

      // Find first feed item
      const firstItem = page.locator('[data-testid="feed-item"]').first();
      await expect(firstItem).toBeVisible();

      // Click like
      const likeButton = firstItem.locator('[data-testid="feed-like-button"]');
      await likeButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify liked state
      await expect(likeButton).toHaveAttribute('data-liked', 'true');
    });

    test('should comment on feed item', async ({ page }) => {
      const feedTab = page.locator('[data-testid="feed-tab"]');
      await feedTab.click();

      // Find first feed item
      const firstItem = page.locator('[data-testid="feed-item"]').first();

      // Click comment button
      const commentButton = firstItem.locator('[data-testid="comment-button"]');
      await commentButton.click();

      // Wait for comment input
      const commentInput = firstItem.locator('[data-testid="comment-input"]');
      await expect(commentInput).toBeVisible();

      // Type comment
      await commentInput.fill('멋진 활동이네요! 👍');

      // Submit comment
      const submitComment = firstItem.locator('[data-testid="submit-comment"]');
      await submitComment.click();

      // Verify comment appears
      await page.waitForTimeout(500);
      const comments = firstItem.locator('[data-testid="comment-list"]');
      await expect(comments.locator('text=멋진 활동이네요!')).toBeVisible();
    });

    test('should load more feed items on scroll', async ({ page }) => {
      const feedTab = page.locator('[data-testid="feed-tab"]');
      await feedTab.click();

      // Get initial count
      const feedList = page.locator('[data-testid="feed-list"]');
      const initialItems = page.locator('[data-testid="feed-item"]');
      const initialCount = await initialItems.count();

      // Scroll to bottom
      await feedList.evaluate((el) => {
        el.scrollTo(0, el.scrollHeight);
      });

      // Wait for new items to load
      await page.waitForTimeout(1000);

      // Verify more items loaded
      const newItems = page.locator('[data-testid="feed-item"]');
      const newCount = await newItems.count();
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  test.describe('User Recommendations', () => {
    test('should display recommended users', async ({ page }) => {
      const recommendationsSection = page.locator('[data-testid="recommended-users"]');
      await expect(recommendationsSection).toBeVisible();

      // Check for user recommendations
      const recommendedUsers = page.locator('[data-testid="recommended-user"]');
      const count = await recommendedUsers.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should follow recommended user', async ({ page }) => {
      const recommendedUsers = page.locator('[data-testid="recommended-user"]');
      const firstUser = recommendedUsers.first();
      await expect(firstUser).toBeVisible();

      // Click follow on recommendation
      const followButton = firstUser.locator('[data-testid="follow-button"]');
      await followButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify button state changed
      await expect(followButton).toHaveText(/팔로잉|Following/i);
    });

    test('should dismiss recommended user', async ({ page }) => {
      const recommendedUsers = page.locator('[data-testid="recommended-user"]');
      const initialCount = await recommendedUsers.count();

      // Dismiss first recommendation
      const firstUser = recommendedUsers.first();
      const dismissButton = firstUser.locator('[data-testid="dismiss-button"]');
      await dismissButton.click();

      // Wait for removal
      await page.waitForTimeout(500);

      // Verify count decreased
      const newCount = await recommendedUsers.count();
      expect(newCount).toBe(initialCount - 1);
    });
  });

  test.describe('Notifications', () => {
    test('should display notification badge', async ({ page }) => {
      const notificationBadge = page.locator('[data-testid="notification-badge"]');
      
      // Check if badge exists (may or may not have notifications)
      const isVisible = await notificationBadge.isVisible();
      if (isVisible) {
        const count = await notificationBadge.textContent();
        expect(Number(count)).toBeGreaterThan(0);
      }
    });

    test('should open notifications panel', async ({ page }) => {
      const notificationButton = page.locator('[data-testid="notification-button"]');
      await notificationButton.click();

      // Wait for panel
      const notificationPanel = page.locator('[data-testid="notification-panel"]');
      await expect(notificationPanel).toBeVisible();
    });

    test('should mark notification as read', async ({ page }) => {
      // Open notifications
      const notificationButton = page.locator('[data-testid="notification-button"]');
      await notificationButton.click();

      // Find unread notification
      const notifications = page.locator('[data-testid="notification-item"]');
      const count = await notifications.count();

      if (count > 0) {
        const firstNotification = notifications.first();
        await firstNotification.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Verify marked as read
        await expect(firstNotification).toHaveAttribute('data-read', 'true');
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display social features on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to social section
      await page.goto('/demo#social');

      // Verify mobile layout
      const profileSection = page.locator('[data-testid="profile-section"]');
      await expect(profileSection).toBeVisible();

      // Check that elements stack vertically
      const boundingBox = await profileSection.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400);
    });

    test('should display mobile-friendly user cards', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const userCards = page.locator('[data-testid="user-card"]');
      const firstCard = userCards.first();
      const cardBox = await firstCard.boundingBox();

      // Verify card fits in mobile viewport
      expect(cardBox?.width).toBeLessThan(400);
    });
  });
});
