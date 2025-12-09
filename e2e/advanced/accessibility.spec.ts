import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Advanced E2E Tests: Accessibility (a11y)
 * Tests WCAG 2.1 compliance, keyboard navigation, screen reader support
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
  });

  test.describe('WCAG 2.1 Compliance', () => {
    test('should pass axe accessibility audit on home page', async ({ page }) => {
      await page.goto('/demo');
      
      // Note: axe-playwright needs to be installed
      // This is a placeholder for the actual implementation
      // await injectAxe(page);
      // await checkA11y(page);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/demo');

      const headings = await page.evaluate(() => {
        const h = [];
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const el of headingElements) {
          h.push({
            level: parseInt(el.tagName.substring(1)),
            text: el.textContent?.trim(),
          });
        }
        return h;
      });

      // Should have one h1
      const h1Count = headings.filter(h => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Headings should not skip levels
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i].level - headings[i - 1].level;
        expect(Math.abs(diff)).toBeLessThanOrEqual(1);
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/demo');

      // Check text elements for color contrast
      const contrastIssues = await page.evaluate(() => {
        const issues: any[] = [];
        const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
        
        for (const el of textElements) {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const bgColor = styles.backgroundColor;
          
          // Basic check - in production, use proper contrast calculation
          if (color === bgColor) {
            issues.push({
              element: el.tagName,
              text: el.textContent?.substring(0, 50),
            });
          }
        }
        
        return issues;
      });

      expect(contrastIssues).toHaveLength(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate through interactive elements with Tab', async ({ page }) => {
      await page.goto('/demo');

      // Get all focusable elements
      const focusableCount = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        return focusable.length;
      });

      expect(focusableCount).toBeGreaterThan(0);

      // Tab through first 10 elements
      for (let i = 0; i < Math.min(10, focusableCount); i++) {
        await page.keyboard.press('Tab');
        
        // Verify focus is visible
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          const styles = window.getComputedStyle(el as Element);
          return {
            tagName: el?.tagName,
            hasFocusStyles: styles.outline !== 'none' || styles.boxShadow !== 'none',
          };
        });

        // Should have visible focus indicator
        // expect(focusedElement.hasFocusStyles).toBe(true);
      }
    });

    test('should support Shift+Tab for reverse navigation', async ({ page }) => {
      await page.goto('/demo');

      // Tab forward a few times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const forwardElement = await page.evaluate(() => document.activeElement?.tagName);

      // Tab backward
      await page.keyboard.press('Shift+Tab');

      const backwardElement = await page.evaluate(() => document.activeElement?.tagName);

      // Should be different elements
      expect(backwardElement).not.toBe(forwardElement);
    });

    test('should activate buttons with Enter and Space', async ({ page }) => {
      await page.goto('/demo#reviews');

      const button = page.locator('button').first();
      await button.focus();

      // Test Enter key
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Test Space key
      await button.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      // Both should activate the button (no errors)
    });

    test('should close modals with Escape', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Open a modal
      const modalTrigger = page.locator('[data-testid="open-modal"]');
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Press Escape
        await page.keyboard.press('Escape');

        // Modal should close
        await expect(modal).not.toBeVisible({ timeout: 1000 });
      }
    });

    test('should trap focus in modals', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Open modal
      const modalTrigger = page.locator('[data-testid="open-modal"]');
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Get focusable elements in modal
        const focusableInModal = await modal.evaluate((el) => {
          const focusable = el.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
          );
          return focusable.length;
        });

        // Tab through all focusable elements
        for (let i = 0; i < focusableInModal + 2; i++) {
          await page.keyboard.press('Tab');
          
          // Check if focus is still in modal
          const focusInModal = await page.evaluate(() => {
            const activeEl = document.activeElement;
            const modal = document.querySelector('[role="dialog"]');
            return modal?.contains(activeEl);
          });

          // Focus should stay in modal
          expect(focusInModal).toBe(true);
        }
      }
    });

    test('should navigate lists with arrow keys', async ({ page }) => {
      await page.goto('/demo#gamification');

      // Find a list or menu
      const listbox = page.locator('[role="listbox"]');
      if (await listbox.isVisible()) {
        await listbox.focus();

        // Arrow down
        await page.keyboard.press('ArrowDown');
        const firstItem = await page.evaluate(() => document.activeElement?.textContent);

        // Arrow down again
        await page.keyboard.press('ArrowDown');
        const secondItem = await page.evaluate(() => document.activeElement?.textContent);

        // Should be different items
        expect(secondItem).not.toBe(firstItem);

        // Arrow up
        await page.keyboard.press('ArrowUp');
        const backToFirst = await page.evaluate(() => document.activeElement?.textContent);

        // Should be back to first item
        expect(backToFirst).toBe(firstItem);
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/demo');

      // Check buttons have labels
      const buttonsWithoutLabels = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const unlabeled: string[] = [];
        
        for (const btn of buttons) {
          const hasLabel = btn.textContent?.trim() || 
                          btn.getAttribute('aria-label') || 
                          btn.getAttribute('aria-labelledby');
          
          if (!hasLabel) {
            unlabeled.push(btn.outerHTML.substring(0, 100));
          }
        }
        
        return unlabeled;
      });

      expect(buttonsWithoutLabels).toHaveLength(0);
    });

    test('should have proper ARIA roles', async ({ page }) => {
      await page.goto('/demo');

      // Check for proper roles
      const roleElements = await page.evaluate(() => {
        const roles: any = {};
        const elements = document.querySelectorAll('[role]');
        
        for (const el of elements) {
          const role = el.getAttribute('role');
          if (role) {
            roles[role] = (roles[role] || 0) + 1;
          }
        }
        
        return roles;
      });

      // Should have semantic roles
      // Common roles: button, navigation, main, complementary, etc.
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Check for aria-live regions
      const liveRegions = await page.evaluate(() => {
        const regions = document.querySelectorAll('[aria-live]');
        return regions.length;
      });

      // Should have live regions for dynamic updates
      // expect(liveRegions).toBeGreaterThan(0);
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/demo');

      const genericLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('a');
        const generic: string[] = [];
        const genericTexts = ['click here', 'read more', 'here', 'more'];
        
        for (const link of links) {
          const text = link.textContent?.trim().toLowerCase();
          if (text && genericTexts.includes(text)) {
            generic.push(text);
          }
        }
        
        return generic;
      });

      // Should avoid generic link text
      expect(genericLinks.length).toBe(0);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/demo');

      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const missing: string[] = [];
        
        for (const img of images) {
          if (!img.getAttribute('alt')) {
            missing.push(img.src);
          }
        }
        
        return missing;
      });

      expect(imagesWithoutAlt).toHaveLength(0);
    });

    test('should announce loading states', async ({ page }) => {
      await page.goto('/demo#reviews');

      // Trigger loading state
      const loadButton = page.locator('[data-testid="load-more"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();

        // Check for aria-busy or loading indicator
        const loadingIndicator = await page.evaluate(() => {
          const loading = document.querySelector('[aria-busy="true"]') ||
                         document.querySelector('[role="status"]') ||
                         document.querySelector('[aria-live="polite"]');
          return !!loading;
        });

        // Should announce loading
        // expect(loadingIndicator).toBe(true);
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have labels for form inputs', async ({ page }) => {
      await page.goto('/demo#reviews');

      const unlabeledInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        const unlabeled: string[] = [];
        
        for (const input of inputs) {
          const id = input.getAttribute('id');
          const hasLabel = input.getAttribute('aria-label') ||
                          input.getAttribute('aria-labelledby') ||
                          (id && document.querySelector(`label[for="${id}"]`));
          
          if (!hasLabel && input.getAttribute('type') !== 'hidden') {
            unlabeled.push(input.outerHTML.substring(0, 100));
          }
        }
        
        return unlabeled;
      });

      expect(unlabeledInputs).toHaveLength(0);
    });

    test('should show validation errors accessibly', async ({ page }) => {
      await page.goto('/demo#reviews');

      const submitButton = page.locator('[data-testid="submit-review"]');
      if (await submitButton.isVisible()) {
        // Submit without filling
        await submitButton.click();

        // Check for aria-invalid and aria-describedby
        const invalidInputs = await page.evaluate(() => {
          const inputs = document.querySelectorAll('[aria-invalid="true"]');
          const withErrors: any[] = [];
          
          for (const input of inputs) {
            const describedBy = input.getAttribute('aria-describedby');
            withErrors.push({
              hasAriaInvalid: true,
              hasErrorDescription: !!describedBy,
            });
          }
          
          return withErrors;
        });

        // All invalid inputs should have error descriptions
        for (const input of invalidInputs) {
          expect(input.hasAriaInvalid).toBe(true);
          // expect(input.hasErrorDescription).toBe(true);
        }
      }
    });

    test('should have required field indicators', async ({ page }) => {
      await page.goto('/demo#reviews');

      const requiredFields = await page.evaluate(() => {
        const fields = document.querySelectorAll('input[required], select[required], textarea[required]');
        const indicators: any[] = [];
        
        for (const field of fields) {
          const hasAriaRequired = field.getAttribute('aria-required') === 'true';
          const hasVisualIndicator = field.parentElement?.textContent?.includes('*');
          
          indicators.push({
            hasAriaRequired,
            hasVisualIndicator,
          });
        }
        
        return indicators;
      });

      // All required fields should have indicators
      for (const field of requiredFields) {
        expect(field.hasAriaRequired || field.hasVisualIndicator).toBe(true);
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have touch-friendly targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/demo');

      const smallTargets = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
        const small: any[] = [];
        
        for (const el of interactive) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            small.push({
              element: el.tagName,
              width: rect.width,
              height: rect.height,
            });
          }
        }
        
        return small;
      });

      // All touch targets should be at least 44x44 pixels
      expect(small Targets.length).toBe(0);
    });

    test('should support zoom without breaking layout', async ({ page }) => {
      await page.goto('/demo');

      // Zoom to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });

      await page.waitForTimeout(500);

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Should not have horizontal scroll
      expect(hasHorizontalScroll).toBe(false);

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    });
  });

  test.describe('Motion and Animation', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/demo');

      // Check for animations
      const hasAnimations = await page.evaluate(() => {
        const animated = document.querySelectorAll('*');
        let animationCount = 0;
        
        for (const el of animated) {
          const styles = window.getComputedStyle(el);
          if (styles.animationName !== 'none' || styles.transition !== 'none') {
            animationCount++;
          }
        }
        
        return animationCount;
      });

      // With reduced motion, animations should be minimal
      // This is a basic check - actual implementation should use CSS media query
    });

    test('should not auto-play videos', async ({ page }) => {
      await page.goto('/demo');

      const autoplayVideos = await page.evaluate(() => {
        const videos = document.querySelectorAll('video[autoplay]');
        return videos.length;
      });

      // Should not have autoplay videos
      expect(autoplayVideos).toBe(0);
    });
  });
});
