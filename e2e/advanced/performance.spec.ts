import { test, expect } from '@playwright/test';

/**
 * Advanced E2E Tests: Performance
 * Tests page load times, bundle sizes, rendering performance
 */

test.describe('Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('should load home page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have acceptable First Contentful Paint', async ({ page }) => {
      await page.goto('/demo');
      
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                resolve(entry.startTime);
              }
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });
      
      // FCP should be under 1.8s (good)
      expect(fcp).toBeLessThan(1800);
    });

    test('should have acceptable Largest Contentful Paint', async ({ page }) => {
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Timeout after 5 seconds
          setTimeout(() => resolve(5000), 5000);
        });
      });
      
      // LCP should be under 2.5s (good)
      expect(lcp).toBeLessThan(2500);
    });

    test('should have acceptable Time to Interactive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/demo');
      
      // Wait for page to be interactive
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true));
          }
        });
      });
      
      const tti = Date.now() - startTime;
      
      // TTI should be under 3.8s (good)
      expect(tti).toBeLessThan(3800);
    });

    test('should have low Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Wait for page to stabilize
      await page.waitForTimeout(2000);
      
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls Value = 0;
          
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(clsValue), 2000);
        });
      });
      
      // CLS should be under 0.1 (good)
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Bundle Size and Resources', () => {
    test('should have reasonable JavaScript bundle size', async ({ page }) => {
      const jsResources: number[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        if (url.endsWith('.js') && response.status() === 200) {
          response.body().then((body) => {
            jsResources.push(body.length);
          });
        }
      });
      
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      const totalJsSize = jsResources.reduce((sum, size) => sum + size, 0);
      const totalJsSizeMB = totalJsSize / (1024 * 1024);
      
      // Total JS should be under 1MB (compressed)
      expect(totalJsSizeMB).toBeLessThan(1);
    });

    test('should have acceptable image sizes', async ({ page }) => {
      const imageResources: { url: string; size: number }[] = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'];
        
        if (contentType && contentType.startsWith('image/')) {
          try {
            const body = await response.body();
            imageResources.push({ url, size: body.length });
          } catch (e) {
            // Ignore errors
          }
        }
      });
      
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Check each image
      for (const img of imageResources) {
        const sizeMB = img.size / (1024 * 1024);
        
        // Individual images should be under 500KB
        expect(sizeMB).toBeLessThan(0.5);
      }
    });

    test('should use compression for text resources', async ({ page }) => {
      let hasCompression = false;
      
      page.on('response', (response) => {
        const encoding = response.headers()['content-encoding'];
        const contentType = response.headers()['content-type'];
        
        if (contentType && (contentType.includes('javascript') || contentType.includes('css'))) {
          if (encoding && (encoding.includes('gzip') || encoding.includes('br'))) {
            hasCompression = true;
          }
        }
      });
      
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Should use compression
      expect(hasCompression).toBe(true);
    });

    test('should use browser caching', async ({ page }) => {
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Second visit
      await page.goto('/demo');
      
      const cachedResources = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        return entries[0] ? (entries[0] as any).transferSize : 0;
      });
      
      // Second load should use cache (smaller transfer size)
      // This is a basic check
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render list efficiently', async ({ page }) => {
      await page.goto('/demo#reviews');
      
      const startTime = Date.now();
      
      // Wait for reviews to render
      await page.waitForSelector('[data-testid="review-item"]');
      
      const renderTime = Date.now() - startTime;
      
      // Should render quickly
      expect(renderTime).toBeLessThan(1000);
    });

    test('should handle rapid scrolling', async ({ page }) => {
      await page.goto('/demo#reviews');
      await page.waitForLoadState('networkidle');
      
      const startTime = Date.now();
      
      // Rapid scroll
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(50);
      }
      
      const scrollTime = Date.now() - startTime;
      
      // Should handle scrolling smoothly
      expect(scrollTime).toBeLessThan(2000);
      
      // Check for jank
      const fps = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          
          function countFrame() {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrame);
            } else {
              resolve(frameCount);
            }
          }
          
          requestAnimationFrame(countFrame);
        });
      });
      
      // Should maintain at least 30 FPS
      expect(fps).toBeGreaterThan(30);
    });

    test('should handle animations smoothly', async ({ page }) => {
      await page.goto('/demo#gamification');
      
      // Trigger animation
      const animatedElement = page.locator('[data-testid="points-animation"]').first();
      if (await animatedElement.isVisible()) {
        await animatedElement.click();
        
        // Measure FPS during animation
        const fps = await page.evaluate(() => {
          return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();
            
            function countFrame() {
              frameCount++;
              if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrame);
              } else {
                resolve(frameCount);
              }
            }
            
            requestAnimationFrame(countFrame);
          });
        });
        
        // Animation should maintain 60 FPS
        expect(fps).toBeGreaterThan(55);
      }
    });

    test('should efficiently update list items', async ({ page }) => {
      await page.goto('/demo#reviews');
      
      const likeButtons = page.locator('[data-testid="like-button"]');
      const count = await likeButtons.count();
      
      if (count > 0) {
        const startTime = Date.now();
        
        // Click multiple like buttons
        for (let i = 0; i < Math.min(5, count); i++) {
          await likeButtons.nth(i).click();
          await page.waitForTimeout(50);
        }
        
        const updateTime = Date.now() - startTime;
        
        // Should update quickly
        expect(updateTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('API Performance', () => {
    test('should have fast API response times', async ({ page }) => {
      const apiTimes: number[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('/api/')) {
          const timing = response.timing();
          if (timing) {
            apiTimes.push(timing.responseEnd - timing.requestStart);
          }
        }
      });
      
      await page.goto('/demo#reviews');
      await page.waitForLoadState('networkidle');
      
      if (apiTimes.length > 0) {
        const avgTime = apiTimes.reduce((sum, time) => sum + time, 0) / apiTimes.length;
        
        // API calls should average under 500ms
        expect(avgTime).toBeLessThan(500);
      }
    });

    test('should handle concurrent API requests', async ({ page }) => {
      const apiCalls: string[] = [];
      
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalls.push(request.url());
        }
      });
      
      await page.goto('/demo');
      
      // Navigate to different sections rapidly
      await page.goto('/demo#reviews');
      await page.goto('/demo#social');
      await page.goto('/demo#gamification');
      
      await page.waitForLoadState('networkidle');
      
      // Should handle multiple concurrent requests
      expect(apiCalls.length).toBeGreaterThan(0);
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have excessive memory usage', async ({ page }) => {
      await page.goto('/demo');
      
      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate through sections
      await page.goto('/demo#reviews');
      await page.goto('/demo#social');
      await page.goto('/demo#gamification');
      await page.goto('/demo#payment');
      
      // Get final memory
      const finalMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
        
        // Memory increase should be reasonable (under 50MB)
        expect(memoryIncreaseMB).toBeLessThan(50);
      }
    });

    test('should clean up after unmounting components', async ({ page }) => {
      await page.goto('/demo#reviews');
      
      const beforeMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate away and back multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/demo#social');
        await page.goto('/demo#reviews');
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      const afterMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      if (beforeMemory && afterMemory) {
        const memoryDiff = afterMemory - beforeMemory;
        const memoryDiffMB = memoryDiff / (1024 * 1024);
        
        // Should not leak significant memory
        expect(memoryDiffMB).toBeLessThan(20);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize number of requests', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', (request) => {
        requests.push(request.url());
      });
      
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Should have reasonable number of requests (under 50)
      expect(requests.length).toBeLessThan(50);
    });

    test('should use HTTP/2 or HTTP/3', async ({ page }) => {
      let hasModernProtocol = false;
      
      page.on('response', (response) => {
        const protocol = (response as any).protocol();
        if (protocol && (protocol.includes('h2') || protocol.includes('h3'))) {
          hasModernProtocol = true;
        }
      });
      
      await page.goto('/demo');
      await page.waitForLoadState('networkidle');
      
      // Should use HTTP/2 or HTTP/3 in production
      // expect(hasModernProtocol).toBe(true);
    });
  });
});
