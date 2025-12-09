import { Page, expect } from '@playwright/test';

/**
 * E2E Test Helper Utilities
 * Common functions for Playwright tests
 */

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000
) {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * Fill form field and verify
 */
export async function fillFormField(
  page: Page,
  selector: string,
  value: string
) {
  const input = page.locator(selector);
  await input.fill(value);
  const actualValue = await input.inputValue();
  expect(actualValue).toBe(value);
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string
) {
  await Promise.all([
    page.waitForNavigation(),
    page.locator(selector).click(),
  ]);
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 5000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Get text content safely
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  const element = page.locator(selector);
  return (await element.textContent()) || '';
}

/**
 * Get numeric value from text
 */
export async function getNumericValue(
  page: Page,
  selector: string
): Promise<number> {
  const text = await getTextContent(page, selector);
  const numericText = text.replace(/[^\d.-]/g, '');
  return Number(numericText) || 0;
}

/**
 * Wait for loading to finish
 */
export async function waitForLoadingToFinish(
  page: Page,
  loadingSelector = '[data-testid="loading"]',
  timeout = 10000
) {
  const loading = page.locator(loadingSelector);
  try {
    await loading.waitFor({ state: 'hidden', timeout });
  } catch {
    // Loading might not appear, that's okay
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status = 200
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Clear all localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: string
) {
  await page.evaluate(
    ({ k, v }) => {
      localStorage.setItem(k, v);
    },
    { k: key, v: value }
  );
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return page.evaluate((k) => {
    return localStorage.getItem(k);
  }, key);
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(page: Page, duration = 500) {
  await page.waitForTimeout(duration);
}

/**
 * Check if element has class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  const element = page.locator(selector);
  const classes = await element.getAttribute('class');
  return classes?.includes(className) || false;
}

/**
 * Get element count
 */
export async function getElementCount(
  page: Page,
  selector: string
): Promise<number> {
  const elements = page.locator(selector);
  return elements.count();
}

/**
 * Click nth element
 */
export async function clickNthElement(
  page: Page,
  selector: string,
  index: number
) {
  const elements = page.locator(selector);
  await elements.nth(index).click();
}

/**
 * Verify toast message
 */
export async function verifyToast(
  page: Page,
  message: string,
  type: 'success' | 'error' | 'info' = 'success'
) {
  const toast = page.locator(`[data-testid="toast-${type}"]`);
  await expect(toast).toBeVisible({ timeout: 3000 });
  await expect(toast).toContainText(message);
}

/**
 * Fill rating stars
 */
export async function fillRating(
  page: Page,
  rating: number,
  starSelector = '[data-testid="rating-star"]'
) {
  const stars = page.locator(starSelector);
  await stars.nth(rating - 1).click();
}

/**
 * Verify form validation error
 */
export async function verifyValidationError(
  page: Page,
  fieldSelector: string,
  errorMessage: string
) {
  const errorElement = page.locator(`${fieldSelector}-error`);
  await expect(errorElement).toBeVisible();
  await expect(errorElement).toContainText(errorMessage);
}

/**
 * Select dropdown option by value
 */
export async function selectDropdownOption(
  page: Page,
  selector: string,
  value: string
) {
  const select = page.locator(selector);
  await select.selectOption(value);
}

/**
 * Upload file
 */
export async function uploadFile(
  page: Page,
  inputSelector: string,
  filePath: string
) {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Check checkbox
 */
export async function checkCheckbox(
  page: Page,
  selector: string,
  shouldCheck = true
) {
  const checkbox = page.locator(selector);
  const isChecked = await checkbox.isChecked();
  
  if (shouldCheck && !isChecked) {
    await checkbox.check();
  } else if (!shouldCheck && isChecked) {
    await checkbox.uncheck();
  }
}

/**
 * Get CSS property value
 */
export async function getCssProperty(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return page.locator(selector).evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Simulate mobile device
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * Simulate tablet device
 */
export async function setTabletViewport(page: Page) {
  await page.setViewportSize({ width: 768, height: 1024 });
}

/**
 * Simulate desktop device
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
}

/**
 * Press keyboard shortcut
 */
export async function pressShortcut(
  page: Page,
  shortcut: string
) {
  await page.keyboard.press(shortcut);
}

/**
 * Drag and drop element
 */
export async function dragAndDrop(
  page: Page,
  sourceSelector: string,
  targetSelector: string
) {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  
  await source.dragTo(target);
}

/**
 * Verify element is in viewport
 */
export async function isInViewport(
  page: Page,
  selector: string
): Promise<boolean> {
  return page.locator(selector).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}
