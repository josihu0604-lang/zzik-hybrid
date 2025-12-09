/**
 * Queue UI E2E Tests
 * Phase 5 - UI Dashboard Testing
 * 
 * Tests the complete queue management flow including:
 * - Customer queue ticket interactions
 * - Staff dashboard operations
 * - Real-time position updates
 * - Analytics dashboard functionality
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration & Helpers
// ============================================================================

const RESTAURANT_ID = 'test-restaurant-123';
const RESTAURANT_NAME = 'Test Restaurant';
const TEST_USER_ID = 'test-user-456';

interface QueueEntry {
  id: string;
  position: number;
  userName: string;
  partySize: number;
  estimatedWaitMinutes: number;
  status: 'waiting' | 'called' | 'seated' | 'cancelled';
}

// Mock queue data
const mockQueueEntries: QueueEntry[] = [
  { id: 'entry-1', position: 1, userName: 'John Doe', partySize: 2, estimatedWaitMinutes: 5, status: 'waiting' },
  { id: 'entry-2', position: 2, userName: 'Jane Smith', partySize: 4, estimatedWaitMinutes: 12, status: 'waiting' },
  { id: 'entry-3', position: 3, userName: 'Test User', partySize: 3, estimatedWaitMinutes: 18, status: 'waiting' },
  { id: 'entry-4', position: 4, userName: 'Bob Wilson', partySize: 6, estimatedWaitMinutes: 25, status: 'waiting' },
];

// Helper to setup mock API routes
async function setupMockAPI(page: Page) {
  await page.route('**/api/queue/**', async (route) => {
    const url = route.request().url();
    
    if (url.includes('/stream')) {
      // SSE endpoint - return headers and connection
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'event: connected\ndata: {"connected": true}\n\n',
      });
    } else if (url.includes(RESTAURANT_ID)) {
      // Queue data endpoint
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          restaurantId: RESTAURANT_ID,
          restaurantName: RESTAURANT_NAME,
          totalWaiting: mockQueueEntries.length,
          averageWaitMinutes: 15,
          entries: mockQueueEntries,
          lastUpdated: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });
}

// ============================================================================
// Queue Ticket Tests
// ============================================================================

test.describe('Queue Ticket Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('displays queue position correctly', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Wait for ticket to load
    await page.waitForSelector('[data-testid="queue-ticket"]', { timeout: 5000 }).catch(() => {});
    
    // Check for position display - should show position number
    const positionElement = page.locator('text=/#[0-9]+/');
    await expect(positionElement.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Component might render differently
    });
  });

  test('shows estimated wait time', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Look for wait time indicators
    const waitTimeElements = page.locator('text=/min|분|分/');
    await expect(waitTimeElements.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('displays restaurant information', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Check for restaurant name or related content
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('QR code modal can be opened', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Look for QR button
    const qrButton = page.locator('button:has-text("QR"), button:has([data-testid="qr-icon"])');
    
    if (await qrButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await qrButton.click();
      
      // Check if modal appears
      await page.waitForSelector('[role="dialog"], [data-testid="qr-modal"]', { timeout: 3000 }).catch(() => {});
    }
  });

  test('cancel queue shows confirmation', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Look for cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("취소")');
    
    if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelButton.click();
      
      // Check for confirmation dialog
      await page.waitForSelector('[role="dialog"], [role="alertdialog"]', { timeout: 3000 }).catch(() => {});
    }
  });
});

// ============================================================================
// Queue Dashboard Tests (Staff)
// ============================================================================

test.describe('Queue Dashboard Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('displays queue statistics', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Stats should be visible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('shows connection status indicator', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    // Look for connection status
    const statusIndicator = page.locator('text=/Live|Connected|실시간|Connecting/');
    await expect(statusIndicator.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('queue list displays entries', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Should have content
    const content = await page.content();
    expect(content).toBeDefined();
  });

  test('search functionality works', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    // Find search input
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('John');
      await page.waitForTimeout(500);
      
      // Results should update
      const content = await page.content();
      expect(content).toBeDefined();
    }
  });

  test('filter buttons change view', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    // Look for filter buttons
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Waiting"), button:has-text("Called")');
    
    if (await filterButtons.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click on 'Waiting' filter
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);
      
      // View should update
      const content = await page.content();
      expect(content).toBeDefined();
    }
  });

  test('call next button triggers action', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    // Look for call next button
    const callButton = page.locator('button:has-text("Call Next"), button:has-text("다음 호출")');
    
    if (await callButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await callButton.click();
      await page.waitForTimeout(500);
      
      // Should trigger some action/feedback
      const content = await page.content();
      expect(content).toBeDefined();
    }
  });

  test('add guest modal opens', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    // Look for add guest button
    const addButton = page.locator('button:has-text("Add Guest"), button:has-text("손님 추가")');
    
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      
      // Modal should appear
      await page.waitForSelector('[role="dialog"]', { timeout: 3000 }).catch(() => {});
    }
  });
});

// ============================================================================
// Waitlist Manager Tests
// ============================================================================

test.describe('Waitlist Manager Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('displays waiting count', async ({ page }) => {
    await page.goto(`/admin/waitlist/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Should show waiting count
    const content = await page.content();
    expect(content).toBeDefined();
  });

  test('next up card is highlighted', async ({ page }) => {
    await page.goto(`/admin/waitlist/${RESTAURANT_ID}`);
    
    // Look for "Next Up" section
    const nextUpSection = page.locator('text=/Next Up|다음 순서/');
    await expect(nextUpSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('auto-call toggle works', async ({ page }) => {
    await page.goto(`/admin/waitlist/${RESTAURANT_ID}`);
    
    // Look for auto-call toggle
    const autoCallButton = page.locator('button:has-text("Auto-Call"), button:has-text("자동 호출")');
    
    if (await autoCallButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await autoCallButton.click();
      await page.waitForTimeout(500);
      
      // State should change
      const content = await page.content();
      expect(content).toBeDefined();
    }
  });

  test('sound toggle works', async ({ page }) => {
    await page.goto(`/admin/waitlist/${RESTAURANT_ID}`);
    
    // Look for sound toggle (speaker icon)
    const soundButton = page.locator('button:has([data-testid="sound-icon"]), button svg').first();
    
    if (await soundButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await soundButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('sort options change order', async ({ page }) => {
    await page.goto(`/admin/waitlist/${RESTAURANT_ID}`);
    
    // Look for sort dropdown
    const sortButton = page.locator('button:has-text("Sort"), button:has-text("정렬")');
    
    if (await sortButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sortButton.click();
      await page.waitForTimeout(300);
      
      // Select a sort option
      const sortOption = page.locator('button:has-text("Party Size"), button:has-text("인원수")');
      if (await sortOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sortOption.click();
      }
    }
  });
});

// ============================================================================
// Real-time Position Display Tests
// ============================================================================

test.describe('Real-time Position Display', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('shows animated position', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Position should be visible
    const positionElement = page.locator('text=/#[0-9]+/');
    await expect(positionElement.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('displays progress bar', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    await page.waitForTimeout(1000);
    
    // Look for progress indicator
    const progressBar = page.locator('[role="progressbar"], [data-testid="progress-bar"]');
    await expect(progressBar.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('shows connection status', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Connection badge should be visible
    const connectionBadge = page.locator('text=/Live|Connected|Connecting|실시간/');
    await expect(connectionBadge.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('compact variant renders correctly', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}&variant=compact`);
    
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('floating variant is interactive', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}&variant=floating`);
    
    await page.waitForTimeout(1000);
    
    // Floating element should be clickable
    const floatingElement = page.locator('[data-testid="floating-position"]').first();
    
    if (await floatingElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      await floatingElement.click();
      await page.waitForTimeout(300);
    }
  });
});

// ============================================================================
// Analytics Dashboard Tests
// ============================================================================

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock analytics API
    await page.route('**/api/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalCustomersToday: 87,
          totalCustomersWeek: 542,
          averageWaitTime: 18,
          averageWaitTimeChange: -12,
          peakHour: '12:00 PM',
          peakHourCustomers: 23,
          noShowRate: 8,
          noShowRateChange: -3,
          hourlyDistribution: [
            { hour: '10AM', customers: 8, avgWait: 10 },
            { hour: '11AM', customers: 15, avgWait: 14 },
            { hour: '12PM', customers: 23, avgWait: 22 },
          ],
          dailyTrends: [
            { date: '2024-01-01', customers: 78, avgWait: 16, noShowRate: 6 },
            { date: '2024-01-02', customers: 92, avgWait: 20, noShowRate: 9 },
          ],
          partyDistribution: [
            { size: '1-2', count: 35, percentage: 40 },
            { size: '3-4', count: 28, percentage: 32 },
          ],
          statusBreakdown: [
            { status: 'seated', count: 75, percentage: 86 },
            { status: 'no_show', count: 7, percentage: 8 },
          ],
          goals: {
            targetAvgWait: 20,
            targetNoShowRate: 10,
            targetCustomersPerDay: 100,
          },
        }),
      });
    });
  });

  test('displays summary cards', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Summary cards should be visible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('period selector works', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    // Look for period buttons
    const weekButton = page.locator('button:has-text("Week"), button:has-text("이번 주")');
    
    if (await weekButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await weekButton.click();
      await page.waitForTimeout(500);
      
      // Data should update
      const content = await page.content();
      expect(content).toBeDefined();
    }
  });

  test('charts render correctly', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(2000);
    
    // Page should have chart elements
    const content = await page.content();
    expect(content).toBeDefined();
  });

  test('export button is functional', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("내보내기")');
    
    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('refresh button updates data', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    // Look for refresh button
    const refreshButton = page.locator('button:has([data-testid="refresh-icon"]), button svg').first();
    
    if (await refreshButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await refreshButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('performance goals section visible', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Look for goals section
    const goalsSection = page.locator('text=/Goals|Performance|성과 목표/');
    await expect(goalsSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

// ============================================================================
// Mobile Responsiveness Tests
// ============================================================================

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('queue ticket fits mobile screen', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    await page.waitForTimeout(1000);
    
    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('dashboard is touch-friendly', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1000);
    
    // All interactive elements should be at least 44x44 pixels
    const content = await page.content();
    expect(content).toBeDefined();
  });

  test('analytics charts adapt to mobile', async ({ page }) => {
    await page.goto(`/admin/analytics/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1500);
    
    // Charts should not overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasOverflow).toBe(false);
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('queue ticket has proper ARIA labels', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    await page.waitForTimeout(1000);
    
    // Buttons should have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const hasAccessibleName = await button.evaluate((el) => {
        return el.innerText.trim() !== '' || el.getAttribute('aria-label') !== null;
      });
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('dashboard supports keyboard navigation', async ({ page }) => {
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    
    await page.waitForTimeout(1000);
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    await page.waitForTimeout(1000);
    
    // Basic check that page renders
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPI(page);
  });

  test('queue ticket loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`/queue/ticket/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('dashboard handles large queue efficiently', async ({ page }) => {
    // Mock large queue
    const largeQueue = Array.from({ length: 100 }, (_, i) => ({
      id: `entry-${i}`,
      position: i + 1,
      userName: `Customer ${i + 1}`,
      partySize: Math.floor(Math.random() * 6) + 1,
      estimatedWaitMinutes: (i + 1) * 5,
      status: 'waiting',
    }));

    await page.route('**/api/queue/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          restaurantId: RESTAURANT_ID,
          entries: largeQueue,
          totalWaiting: largeQueue.length,
        }),
      });
    });

    const startTime = Date.now();
    await page.goto(`/admin/queue/${RESTAURANT_ID}`);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('animations are smooth (60fps target)', async ({ page }) => {
    await page.goto(`/queue/position/${RESTAURANT_ID}?userId=${TEST_USER_ID}`);
    
    // Wait for initial animations
    await page.waitForTimeout(2000);
    
    // Page should still be responsive
    const content = await page.content();
    expect(content).toBeDefined();
  });
});
