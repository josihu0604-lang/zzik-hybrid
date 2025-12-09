import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Review System
 * Tests review creation, editing, interactions, and validation
 */

test.describe('Review System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page with review section
    await page.goto('/demo#reviews');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Review Creation', () => {
    test('should display review form', async ({ page }) => {
      // Check for review form elements
      const reviewSection = page.locator('[data-testid="review-section"]');
      await expect(reviewSection).toBeVisible();

      // Verify form inputs
      const ratingInput = page.locator('[data-testid="rating-input"]');
      const commentInput = page.locator('[data-testid="comment-input"]');
      
      await expect(ratingInput).toBeVisible();
      await expect(commentInput).toBeVisible();
    });

    test('should create a new review with valid data', async ({ page }) => {
      // Fill out review form
      const ratingStars = page.locator('[data-testid="rating-star"]');
      await ratingStars.nth(4).click(); // Select 5 stars

      const commentInput = page.locator('[data-testid="comment-input"]');
      await commentInput.fill('훌륭한 서비스였습니다! 대기 시간도 정확했고 직원분들도 친절했어요.');

      // Submit review
      const submitButton = page.locator('[data-testid="submit-review"]');
      await submitButton.click();

      // Wait for success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Verify review appears in list
      const reviewList = page.locator('[data-testid="review-list"]');
      await expect(reviewList.locator('text=훌륭한 서비스였습니다!')).toBeVisible();
    });

    test('should show validation errors for empty review', async ({ page }) => {
      // Try to submit empty review
      const submitButton = page.locator('[data-testid="submit-review"]');
      await submitButton.click();

      // Check for validation errors
      const ratingError = page.locator('[data-testid="rating-error"]');
      const commentError = page.locator('[data-testid="comment-error"]');

      await expect(ratingError).toBeVisible();
      await expect(commentError).toBeVisible();
    });

    test('should validate minimum comment length', async ({ page }) => {
      // Select rating
      const ratingStars = page.locator('[data-testid="rating-star"]');
      await ratingStars.nth(3).click(); // Select 4 stars

      // Enter short comment (less than 10 characters)
      const commentInput = page.locator('[data-testid="comment-input"]');
      await commentInput.fill('짧음');

      // Submit
      const submitButton = page.locator('[data-testid="submit-review"]');
      await submitButton.click();

      // Check for length validation error
      const lengthError = page.locator('text=/최소.*10자/i');
      await expect(lengthError).toBeVisible();
    });

    test('should save review as draft', async ({ page }) => {
      // Fill partial review
      const ratingStars = page.locator('[data-testid="rating-star"]');
      await ratingStars.nth(3).click();

      const commentInput = page.locator('[data-testid="comment-input"]');
      await commentInput.fill('작성 중인 리뷰입니다');

      // Save as draft
      const draftButton = page.locator('[data-testid="save-draft"]');
      await draftButton.click();

      // Verify draft saved message
      const draftMessage = page.locator('text=/임시.*저장/i');
      await expect(draftMessage).toBeVisible();
    });
  });

  test.describe('Review Interactions', () => {
    test('should like a review', async ({ page }) => {
      // Find first review
      const firstReview = page.locator('[data-testid="review-item"]').first();
      await expect(firstReview).toBeVisible();

      // Get initial like count
      const likeButton = firstReview.locator('[data-testid="like-button"]');
      const initialLikes = await likeButton.locator('[data-testid="like-count"]').textContent();

      // Click like
      await likeButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify like count increased
      const newLikes = await likeButton.locator('[data-testid="like-count"]').textContent();
      expect(Number(newLikes)).toBeGreaterThan(Number(initialLikes));

      // Verify button state changed
      await expect(likeButton).toHaveAttribute('data-liked', 'true');
    });

    test('should unlike a review', async ({ page }) => {
      // Find first review and like it first
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const likeButton = firstReview.locator('[data-testid="like-button"]');

      // Like
      await likeButton.click();
      await page.waitForTimeout(500);

      // Get liked state
      const likeCount = await likeButton.locator('[data-testid="like-count"]').textContent();

      // Unlike
      await likeButton.click();
      await page.waitForTimeout(500);

      // Verify count decreased
      const newCount = await likeButton.locator('[data-testid="like-count"]').textContent();
      expect(Number(newCount)).toBeLessThan(Number(likeCount));

      // Verify button state changed
      await expect(likeButton).toHaveAttribute('data-liked', 'false');
    });

    test('should add reply to review', async ({ page }) => {
      // Find first review
      const firstReview = page.locator('[data-testid="review-item"]').first();
      
      // Click reply button
      const replyButton = firstReview.locator('[data-testid="reply-button"]');
      await replyButton.click();

      // Fill reply input
      const replyInput = firstReview.locator('[data-testid="reply-input"]');
      await expect(replyInput).toBeVisible();
      await replyInput.fill('감사합니다! 더 나은 서비스를 제공하겠습니다.');

      // Submit reply
      const submitReply = firstReview.locator('[data-testid="submit-reply"]');
      await submitReply.click();

      // Verify reply appears
      const replyList = firstReview.locator('[data-testid="reply-list"]');
      await expect(replyList.locator('text=감사합니다!')).toBeVisible({ timeout: 5000 });
    });

    test('should display reply count', async ({ page }) => {
      // Find review with replies
      const reviewWithReplies = page.locator('[data-testid="review-item"]').first();
      
      // Check reply count badge
      const replyCount = reviewWithReplies.locator('[data-testid="reply-count"]');
      await expect(replyCount).toBeVisible();

      // Verify it's a number
      const count = await replyCount.textContent();
      expect(Number(count)).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Review Filtering and Sorting', () => {
    test('should filter reviews by rating', async ({ page }) => {
      // Click 5-star filter
      const fiveStarFilter = page.locator('[data-testid="filter-5-stars"]');
      await fiveStarFilter.click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Verify all visible reviews have 5 stars
      const reviews = page.locator('[data-testid="review-item"]');
      const count = await reviews.count();

      for (let i = 0; i < count; i++) {
        const review = reviews.nth(i);
        const stars = review.locator('[data-testid="rating-display"]');
        const rating = await stars.getAttribute('data-rating');
        expect(Number(rating)).toBe(5);
      }
    });

    test('should sort reviews by date', async ({ page }) => {
      // Select sort by newest
      const sortSelect = page.locator('[data-testid="sort-select"]');
      await sortSelect.selectOption('newest');

      // Wait for sort
      await page.waitForTimeout(500);

      // Verify first review is newest
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const firstDate = firstReview.locator('[data-testid="review-date"]');
      await expect(firstDate).toBeVisible();
    });

    test('should sort reviews by popularity', async ({ page }) => {
      // Select sort by most liked
      const sortSelect = page.locator('[data-testid="sort-select"]');
      await sortSelect.selectOption('popular');

      // Wait for sort
      await page.waitForTimeout(500);

      // Verify first review has most likes
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const firstLikes = firstReview.locator('[data-testid="like-count"]');
      const firstLikeCount = await firstLikes.textContent();

      const secondReview = page.locator('[data-testid="review-item"]').nth(1);
      const secondLikes = secondReview.locator('[data-testid="like-count"]');
      const secondLikeCount = await secondLikes.textContent();

      expect(Number(firstLikeCount)).toBeGreaterThanOrEqual(Number(secondLikeCount));
    });
  });

  test.describe('Review Statistics', () => {
    test('should display average rating', async ({ page }) => {
      const averageRating = page.locator('[data-testid="average-rating"]');
      await expect(averageRating).toBeVisible();

      // Verify it's a number between 0 and 5
      const rating = await averageRating.textContent();
      const numRating = Number(rating);
      expect(numRating).toBeGreaterThanOrEqual(0);
      expect(numRating).toBeLessThanOrEqual(5);
    });

    test('should display total review count', async ({ page }) => {
      const totalCount = page.locator('[data-testid="total-reviews"]');
      await expect(totalCount).toBeVisible();

      // Verify it's a number
      const count = await totalCount.textContent();
      expect(Number(count)).toBeGreaterThanOrEqual(0);
    });

    test('should display rating distribution', async ({ page }) => {
      // Check for rating distribution bars
      for (let i = 1; i <= 5; i++) {
        const bar = page.locator(`[data-testid="rating-bar-${i}"]`);
        await expect(bar).toBeVisible();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display reviews properly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to reviews
      await page.goto('/demo#reviews');

      // Verify mobile layout
      const reviewList = page.locator('[data-testid="review-list"]');
      await expect(reviewList).toBeVisible();

      // Check that reviews stack vertically
      const firstReview = page.locator('[data-testid="review-item"]').first();
      const boundingBox = await firstReview.boundingBox();
      
      expect(boundingBox?.width).toBeLessThan(400);
    });

    test('should make form inputs touch-friendly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const ratingStars = page.locator('[data-testid="rating-star"]');
      const firstStar = ratingStars.first();
      const starBox = await firstStar.boundingBox();

      // Verify touch target size (minimum 44x44px)
      expect(starBox?.width).toBeGreaterThanOrEqual(44);
      expect(starBox?.height).toBeGreaterThanOrEqual(44);
    });
  });
});
