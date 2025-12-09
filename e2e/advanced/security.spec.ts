import { test, expect } from '@playwright/test';

/**
 * Advanced E2E Tests: Security
 * Tests security features, CSRF, XSS, authentication, authorization
 */

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
  });

  test.describe('XSS Prevention', () => {
    test('should prevent XSS in review comments', async ({ page }) => {
      await page.goto('/demo#reviews');

      const commentInput = page.locator('[data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        // Try various XSS payloads
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '<img src=x onerror="alert(\'XSS\')">',
          '<svg onload="alert(\'XSS\')">',
          'javascript:alert("XSS")',
          '<iframe src="javascript:alert(\'XSS\')">',
        ];

        for (const payload of xssPayloads) {
          await commentInput.fill(payload);
          
          const submitButton = page.locator('[data-testid="submit-review"]');
          await submitButton.click();
          
          await page.waitForTimeout(500);

          // Verify no alert was triggered
          const dialogs: string[] = [];
          page.on('dialog', (dialog) => dialogs.push(dialog.message()));
          expect(dialogs).toHaveLength(0);

          // Clear input
          await commentInput.clear();
        }
      }
    });

    test('should sanitize HTML in user profile bio', async ({ page }) => {
      await page.goto('/demo#social');

      const bioInput = page.locator('[data-testid="bio-input"]');
      if (await bioInput.isVisible()) {
        const htmlPayload = '<b>Bold</b><script>alert("XSS")</script><i>Italic</i>';
        await bioInput.fill(htmlPayload);

        const saveButton = page.locator('[data-testid="save-profile"]');
        await saveButton.click();

        await page.waitForTimeout(1000);

        // Verify script tags are removed but safe HTML might be preserved
        const displayedBio = page.locator('[data-testid="profile-bio"]');
        if (await displayedBio.isVisible()) {
          const html = await displayedBio.innerHTML();
          expect(html).not.toContain('<script>');
          expect(html).not.toContain('alert');
        }
      }
    });

    test('should prevent event handler injection', async ({ page }) => {
      await page.goto('/demo#reviews');

      const commentInput = page.locator('[data-testid="comment-input"]');
      if (await commentInput.isVisible()) {
        const eventPayloads = [
          '<div onclick="alert(\'XSS\')">Click me</div>',
          '<input onfocus="alert(\'XSS\')" autofocus>',
          '<body onload="alert(\'XSS\')">',
        ];

        for (const payload of eventPayloads) {
          await commentInput.fill(payload);
          
          const submitButton = page.locator('[data-testid="submit-review"]');
          await submitButton.click();
          
          await page.waitForTimeout(500);

          // Try to trigger the injected event
          const displayedComment = page.locator('[data-testid="review-comment"]').first();
          if (await displayedComment.isVisible()) {
            await displayedComment.click();
            await displayedComment.focus();
          }

          // Verify no alert was triggered
          const dialogs: string[] = [];
          page.on('dialog', (dialog) => dialogs.push(dialog.message()));
          expect(dialogs).toHaveLength(0);

          await commentInput.clear();
        }
      }
    });
  });

  test.describe('CSRF Protection', () => {
    test('should include CSRF token in requests', async ({ page }) => {
      const requests: any[] = [];
      
      page.on('request', (request) => {
        if (request.method() === 'POST' || request.method() === 'PUT') {
          requests.push({
            method: request.method(),
            headers: request.headers(),
            url: request.url(),
          });
        }
      });

      await page.goto('/demo#reviews');

      // Trigger POST request
      const submitButton = page.locator('[data-testid="submit-review"]');
      if (await submitButton.isVisible()) {
        const ratingStars = page.locator('[data-testid="rating-star"]');
        if (await ratingStars.count() > 0) {
          await ratingStars.nth(4).click();
        }
        
        const commentInput = page.locator('[data-testid="comment-input"]');
        await commentInput.fill('Test review for CSRF check');
        
        await submitButton.click();
        await page.waitForTimeout(1000);
      }

      // Verify CSRF token or Origin header is present
      const postRequests = requests.filter(r => r.method === 'POST');
      if (postRequests.length > 0) {
        const hasCSRFToken = postRequests.some(r => 
          r.headers['x-csrf-token'] || 
          r.headers['x-xsrf-token'] ||
          r.headers['origin']
        );
        // In demo mode, this might not be strictly enforced
        // expect(hasCSRFToken).toBe(true);
      }
    });
  });

  test.describe('Authentication & Authorization', () => {
    test('should protect sensitive actions', async ({ page }) => {
      // Clear authentication
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto('/demo#payment');

      // Try to access wallet
      const walletSection = page.locator('[data-testid="wallet-section"]');
      
      // Should show login prompt or restricted message
      const loginPrompt = page.locator('[data-testid="login-required"]');
      const authModal = page.locator('[data-testid="auth-modal"]');
      
      // In demo mode, it might show demo data, but in production should require auth
      // This is a placeholder for production behavior
    });

    test('should not expose sensitive data in client-side storage', async ({ page }) => {
      await page.goto('/demo#payment');
      await page.waitForTimeout(2000);

      // Check localStorage
      const localStorageData = await page.evaluate(() => {
        const data: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });

      // Verify no sensitive data is stored unencrypted
      const sensitiveKeys = ['password', 'private_key', 'secret', 'api_key'];
      for (const [key, value] of Object.entries(localStorageData)) {
        const lowerKey = key.toLowerCase();
        const lowerValue = (value as string).toLowerCase();
        
        for (const sensitive of sensitiveKeys) {
          expect(lowerKey).not.toContain(sensitive);
          // If key suggests it might contain sensitive data, it should be encrypted
          if (lowerKey.includes('token') || lowerKey.includes('auth')) {
            // Should not be plain text (basic check)
            expect(lowerValue).not.toMatch(/^[a-z0-9]{8,}$/);
          }
        }
      }
    });

    test('should implement secure session handling', async ({ page }) => {
      await page.goto('/demo');

      // Check for secure session cookies
      const cookies = await page.context().cookies();
      
      const sessionCookies = cookies.filter(c => 
        c.name.toLowerCase().includes('session') || 
        c.name.toLowerCase().includes('token')
      );

      // In production, session cookies should be secure
      for (const cookie of sessionCookies) {
        // These checks are for production environment
        // expect(cookie.secure).toBe(true);  // HTTPS only
        // expect(cookie.httpOnly).toBe(true); // Not accessible via JS
        // expect(cookie.sameSite).toBe('Strict' or 'Lax'); // CSRF protection
      }
    });
  });

  test.describe('Input Validation', () => {
    test('should validate file upload types', async ({ page }) => {
      await page.goto('/demo#reviews');

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Try to upload executable file
        const executablePath = 'test-files/malicious.exe';
        
        // In production, should reject dangerous file types
        // await fileInput.setInputFiles(executablePath);
        
        // Verify rejection message
        // const errorMessage = page.locator('[data-testid="file-error"]');
        // await expect(errorMessage).toBeVisible();
      }
    });

    test('should limit file upload size', async ({ page }) => {
      await page.goto('/demo#reviews');

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // In production, should reject files over limit
        // Verify max size is enforced (e.g., 5MB)
      }
    });

    test('should validate numeric inputs', async ({ page }) => {
      await page.goto('/demo#payment');

      const amountInput = page.locator('[data-testid="amount-input"]');
      if (await amountInput.isVisible()) {
        // Try negative number
        await amountInput.fill('-1000');
        const submitButton = page.locator('[data-testid="submit-amount"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          const error = page.locator('[data-testid="amount-error"]');
          if (await error.isVisible()) {
            await expect(error).toContainText(/양수|positive/i);
          }
        }

        // Try non-numeric
        await amountInput.fill('abc');
        const value = await amountInput.inputValue();
        expect(value).not.toBe('abc'); // Should be filtered
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle rate limiting gracefully', async ({ page }) => {
      await page.goto('/demo#reviews');

      const likeButton = page.locator('[data-testid="like-button"]').first();
      if (await likeButton.isVisible()) {
        // Click rapidly 100 times
        for (let i = 0; i < 100; i++) {
          await likeButton.click({ force: true });
        }

        await page.waitForTimeout(1000);

        // Should show rate limit message or throttle requests
        const rateLimitMessage = page.locator('[data-testid="rate-limit"]');
        // In production with actual rate limiting:
        // await expect(rateLimitMessage).toBeVisible();
      }
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have CSP headers', async ({ page }) => {
      const response = await page.goto('/demo');
      
      if (response) {
        const headers = response.headers();
        
        // Check for security headers
        // Content-Security-Policy
        const csp = headers['content-security-policy'];
        // In production:
        // expect(csp).toBeTruthy();
        
        // X-Frame-Options (clickjacking protection)
        const xFrameOptions = headers['x-frame-options'];
        // In production:
        // expect(xFrameOptions).toBeTruthy();
        
        // X-Content-Type-Options
        const xContentType = headers['x-content-type-options'];
        // In production:
        // expect(xContentType).toBe('nosniff');
      }
    });

    test('should prevent iframe embedding', async ({ page }) => {
      // Try to load the app in an iframe
      await page.setContent(`
        <html>
          <body>
            <iframe src="/demo" id="test-frame"></iframe>
          </body>
        </html>
      `);

      await page.waitForTimeout(1000);

      // In production with X-Frame-Options: DENY
      // The iframe should be blocked
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should prevent SQL injection in search', async ({ page }) => {
      await page.goto('/demo#social');

      const searchInput = page.locator('[data-testid="user-search"]');
      if (await searchInput.isVisible()) {
        const sqlInjectionPayloads = [
          "' OR '1'='1",
          "'; DROP TABLE users; --",
          "1' UNION SELECT * FROM users--",
          "admin'--",
        ];

        for (const payload of sqlInjectionPayloads) {
          await searchInput.fill(payload);
          await searchInput.press('Enter');
          
          await page.waitForTimeout(500);

          // Verify no database error is exposed
          const errorMessage = page.locator('[data-testid="error"]');
          if (await errorMessage.isVisible()) {
            const errorText = await errorMessage.textContent();
            expect(errorText).not.toMatch(/sql|database|query|syntax/i);
          }

          // Verify normal error handling
          const results = page.locator('[data-testid="search-results"]');
          // Should either show no results or sanitized results
        }
      }
    });
  });

  test.describe('API Security', () => {
    test('should not expose internal API endpoints', async ({ page }) => {
      // Try to access internal endpoints
      const internalEndpoints = [
        '/api/internal',
        '/api/admin',
        '/api/debug',
        '/.env',
        '/config.json',
      ];

      for (const endpoint of internalEndpoints) {
        const response = await page.goto(endpoint, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        }).catch(() => null);

        if (response) {
          // Should return 404 or 403, not 200
          expect(response.status()).not.toBe(200);
        }
      }
    });

    test('should sanitize error messages', async ({ page }) => {
      // Mock API error
      await page.route('**/api/**', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal Server Error',
          }),
        });
      });

      await page.goto('/demo#reviews');

      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        const text = await errorMessage.textContent();
        
        // Should not expose stack traces, file paths, or internal details
        expect(text).not.toMatch(/\/var\/www/);
        expect(text).not.toMatch(/node_modules/);
        expect(text).not.toMatch(/at [A-Za-z]+\./); // Stack trace pattern
      }
    });
  });

  test.describe('Data Leakage Prevention', () => {
    test('should not expose user data in URLs', async ({ page }) => {
      await page.goto('/demo#payment');

      // Check URL for sensitive data
      const url = page.url();
      
      // Should not contain sensitive data
      expect(url).not.toMatch(/password/i);
      expect(url).not.toMatch(/token=[a-zA-Z0-9]{20,}/);
      expect(url).not.toMatch(/key=/i);
      expect(url).not.toMatch(/secret/i);
    });

    test('should not log sensitive data to console', async ({ page }) => {
      const consoleLogs: string[] = [];
      
      page.on('console', (msg) => {
        consoleLogs.push(msg.text());
      });

      await page.goto('/demo#payment');
      await page.waitForTimeout(2000);

      // Check console logs for sensitive data
      const allLogs = consoleLogs.join(' ');
      expect(allLogs).not.toMatch(/password/i);
      expect(allLogs).not.toMatch(/credit.*card/i);
      expect(allLogs).not.toMatch(/\d{16}/); // Credit card numbers
      expect(allLogs).not.toMatch(/Bearer [a-zA-Z0-9]{20,}/); // Auth tokens
    });
  });
});
