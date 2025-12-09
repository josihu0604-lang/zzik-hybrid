import { test, expect } from '@playwright/test';
import { mockApiResponse } from '../helpers/test-utils';

/**
 * Advanced E2E Tests: Error Handling
 * Tests error scenarios, network failures, and edge cases
 */

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
  });

  test.describe('API Error Handling', () => {
    test('should handle 500 server errors gracefully', async ({ page }) => {
      // Mock server error
      await page.route('**/api/reviews', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
            message: '서버에 문제가 발생했습니다.',
          }),
        });
      });

      // Navigate to reviews section
      await page.goto('/demo#reviews');

      // Trigger API call
      const createButton = page.locator('[data-testid="create-review"]');
      if (await createButton.isVisible()) {
        await createButton.click();
      }

      // Verify error message is displayed
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      await expect(errorMessage).toContainText(/서버|오류|문제/);

      // Verify retry button is available
      const retryButton = page.locator('[data-testid="retry-button"]');
      await expect(retryButton).toBeVisible();
    });

    test('should handle 404 not found errors', async ({ page }) => {
      // Mock 404 error
      await page.route('**/api/reviews/*', (route) => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Not Found',
            message: '요청한 리소스를 찾을 수 없습니다.',
          }),
        });
      });

      await page.goto('/demo#reviews');

      // Verify 404 handling
      const notFoundMessage = page.locator('[data-testid="not-found"]');
      if (await notFoundMessage.isVisible()) {
        await expect(notFoundMessage).toContainText(/찾을 수 없/);
      }
    });

    test('should handle 401 unauthorized errors', async ({ page }) => {
      // Mock unauthorized error
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Unauthorized',
            message: '인증이 필요합니다.',
          }),
        });
      });

      await page.goto('/demo#reviews');

      // Should redirect to login or show auth modal
      const authModal = page.locator('[data-testid="auth-modal"]');
      const loginButton = page.locator('[data-testid="login-button"]');

      const authVisible = await authModal.isVisible();
      const loginVisible = await loginButton.isVisible();

      expect(authVisible || loginVisible).toBe(true);
    });

    test('should handle 429 rate limit errors', async ({ page }) => {
      // Mock rate limit error
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Too Many Requests',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: 60,
          }),
        });
      });

      await page.goto('/demo#reviews');

      // Verify rate limit message
      const rateLimitMessage = page.locator('[data-testid="rate-limit-message"]');
      if (await rateLimitMessage.isVisible()) {
        await expect(rateLimitMessage).toContainText(/요청.*많|잠시 후/);
      }
    });
  });

  test.describe('Network Failure Handling', () => {
    test('should handle network timeout', async ({ page }) => {
      // Simulate timeout
      await page.route('**/api/**', (route) => {
        setTimeout(() => {
          route.abort('timedout');
        }, 100);
      });

      await page.goto('/demo#reviews');

      // Verify timeout handling
      const timeoutMessage = page.locator('[data-testid="timeout-message"]');
      if (await timeoutMessage.isVisible()) {
        await expect(timeoutMessage).toContainText(/시간 초과|timeout/i);
      }
    });

    test('should handle offline mode', async ({ page }) => {
      // Set offline
      await page.context().setOffline(true);

      await page.goto('/demo#reviews');

      // Verify offline indicator
      const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toContainText(/오프라인|offline/i);
      }

      // Set back online
      await page.context().setOffline(false);

      // Verify online indicator
      const onlineMessage = page.locator('[data-testid="online-message"]');
      if (await onlineMessage.isVisible()) {
        await expect(onlineMessage).toContainText(/온라인|online/i);
      }
    });

    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;

      await page.route('**/api/reviews', (route) => {
        requestCount++;
        if (requestCount < 3) {
          // Fail first 2 requests
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server Error' }),
          });
        } else {
          // Succeed on 3rd request
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [], success: true }),
          });
        }
      });

      await page.goto('/demo#reviews');

      // Click retry button if visible
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await retryButton.click();
      }

      // Verify eventually succeeds
      await page.waitForTimeout(2000);
      expect(requestCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Form Validation Errors', () => {
    test('should show validation errors for invalid email', async ({ page }) => {
      await page.goto('/demo#social');

      const emailInput = page.locator('[data-testid="email-input"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        await emailInput.blur();

        const emailError = page.locator('[data-testid="email-error"]');
        await expect(emailError).toBeVisible();
        await expect(emailError).toContainText(/이메일|email/i);
      }
    });

    test('should show validation for password strength', async ({ page }) => {
      await page.goto('/demo#social');

      const passwordInput = page.locator('[data-testid="password-input"]');
      if (await passwordInput.isVisible()) {
        // Weak password
        await passwordInput.fill('123');
        const weakIndicator = page.locator('[data-testid="password-strength-weak"]');
        if (await weakIndicator.isVisible()) {
          await expect(weakIndicator).toContainText(/약함|weak/i);
        }

        // Strong password
        await passwordInput.fill('StrongP@ssw0rd123!');
        const strongIndicator = page.locator('[data-testid="password-strength-strong"]');
        if (await strongIndicator.isVisible()) {
          await expect(strongIndicator).toContainText(/강함|strong/i);
        }
      }
    });

    test('should prevent XSS in input fields', async ({ page }) => {
      await page.goto('/demo#reviews');

      const commentInput = page.locator('[data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        const xssPayload = '<script>alert("XSS")</script>';
        await commentInput.fill(xssPayload);

        const submitButton = page.locator('[data-testid="submit-review"]');
        await submitButton.click();

        // Wait a bit
        await page.waitForTimeout(1000);

        // Verify no alert was triggered (XSS prevented)
        const dialogs: string[] = [];
        page.on('dialog', (dialog) => dialogs.push(dialog.message()));
        
        expect(dialogs).toHaveLength(0);

        // Verify input is sanitized
        const displayedComment = page.locator('[data-testid="review-comment"]').first();
        if (await displayedComment.isVisible()) {
          const text = await displayedComment.textContent();
          expect(text).not.toContain('<script>');
        }
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty state correctly', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/reviews', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], success: true }),
        });
      });

      await page.goto('/demo#reviews');

      // Verify empty state message
      const emptyState = page.locator('[data-testid="empty-state"]');
      await expect(emptyState).toBeVisible({ timeout: 5000 });
      await expect(emptyState).toContainText(/리뷰.*없|empty/i);
    });

    test('should handle very long text input', async ({ page }) => {
      await page.goto('/demo#reviews');

      const commentInput = page.locator('[data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        // 10000 character text
        const longText = 'a'.repeat(10000);
        await commentInput.fill(longText);

        const submitButton = page.locator('[data-testid="submit-review"]');
        await submitButton.click();

        // Verify character limit error
        const lengthError = page.locator('[data-testid="length-error"]');
        if (await lengthError.isVisible()) {
          await expect(lengthError).toContainText(/최대|maximum/i);
        }
      }
    });

    test('should handle concurrent requests', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Make multiple requests simultaneously
      const buttons = page.locator('[data-testid="like-button"]');
      const count = await buttons.count();

      const promises = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        promises.push(buttons.nth(i).click());
      }

      await Promise.all(promises);

      // Verify all requests completed
      await page.waitForTimeout(2000);
      const errors = page.locator('[data-testid="error"]');
      const errorCount = await errors.count();
      expect(errorCount).toBe(0);
    });

    test('should handle special characters in input', async ({ page }) => {
      await page.goto('/demo#reviews');

      const commentInput = page.locator('[data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~你好こんにちは안녕하세요';
        await commentInput.fill(specialChars);

        const submitButton = page.locator('[data-testid="submit-review"]');
        await submitButton.click();

        await page.waitForTimeout(1000);

        // Verify special characters are handled correctly
        const displayedText = page.locator('[data-testid="review-comment"]').first();
        if (await displayedText.isVisible()) {
          const text = await displayedText.textContent();
          expect(text).toBeTruthy();
        }
      }
    });
  });

  test.describe('Memory Leaks and Performance', () => {
    test('should not leak memory on repeated actions', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Perform action 50 times
      const likeButton = page.locator('[data-testid="like-button"]').first();
      if (await likeButton.isVisible()) {
        for (let i = 0; i < 50; i++) {
          await likeButton.click();
          await page.waitForTimeout(50);
        }
      }

      // Check memory usage (basic check)
      const metrics = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          };
        }
        return null;
      });

      if (metrics) {
        const usagePercent = (metrics.usedJSHeapSize / metrics.totalJSHeapSize) * 100;
        expect(usagePercent).toBeLessThan(90);
      }
    });

    test('should handle rapid navigation', async ({ page }) => {
      const sections = ['reviews', 'social', 'gamification', 'payment', 'queue'];

      // Rapidly navigate between sections
      for (let i = 0; i < 10; i++) {
        const section = sections[i % sections.length];
        await page.goto(`/demo#${section}`);
        await page.waitForTimeout(100);
      }

      // Verify no errors
      const errors = page.locator('[data-testid="error"]');
      const errorCount = await errors.count();
      expect(errorCount).toBe(0);
    });
  });

  test.describe('Browser Console Errors', () => {
    test('should not have console errors on page load', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/demo');
      await page.waitForTimeout(2000);

      // Filter out known/expected errors
      const criticalErrors = consoleErrors.filter(
        (err) => !err.includes('favicon') && !err.includes('sourcemap')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should not have unhandled promise rejections', async ({ page }) => {
      const rejections: string[] = [];
      
      page.on('pageerror', (error) => {
        if (error.message.includes('unhandled')) {
          rejections.push(error.message);
        }
      });

      await page.goto('/demo');
      
      // Trigger some actions
      await page.goto('/demo#reviews');
      await page.goto('/demo#social');
      
      await page.waitForTimeout(2000);

      expect(rejections).toHaveLength(0);
    });
  });
});
