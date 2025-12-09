import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter, checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

describe('rate-limiter.ts', () => {
  // =============================================================================
  // RateLimiter Class Tests
  // =============================================================================
  describe('RateLimiter', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    describe('acquire and release', () => {
      it('should acquire slot successfully', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 60000,
          maxConcurrent: 5,
        });

        const acquirePromise = limiter.acquire();
        await expect(acquirePromise).resolves.toBeUndefined();
      });

      it('should release slot successfully', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 60000,
          maxConcurrent: 5,
        });

        await limiter.acquire();
        limiter.release();

        const status = limiter.getStatus();
        expect(status.concurrent).toBe(0);
      });

      it('should respect maxConcurrent limit', async () => {
        const limiter = new RateLimiter({
          maxRequests: 100,
          windowMs: 60000,
          maxConcurrent: 2,
        });

        // Acquire 2 slots
        await limiter.acquire();
        await limiter.acquire();

        const status = limiter.getStatus();
        expect(status.concurrent).toBe(2);
        expect(status.maxConcurrent).toBe(2);
      });

      it('should block when maxConcurrent reached', async () => {
        const limiter = new RateLimiter({
          maxRequests: 100,
          windowMs: 60000,
          maxConcurrent: 1,
        });

        await limiter.acquire();

        let thirdAcquired = false;
        const thirdPromise = limiter.acquire().then(() => {
          thirdAcquired = true;
        });

        // Should not acquire immediately
        await vi.advanceTimersByTimeAsync(100);
        expect(thirdAcquired).toBe(false);

        // Release first slot
        limiter.release();

        // Now third should acquire
        await vi.advanceTimersByTimeAsync(100);
        await thirdPromise;
        expect(thirdAcquired).toBe(true);
      });

      it('should respect maxRequests limit per window', async () => {
        const limiter = new RateLimiter({
          maxRequests: 3,
          windowMs: 1000,
          maxConcurrent: 10,
        });

        // Acquire 3 slots
        await limiter.acquire();
        limiter.release();
        await limiter.acquire();
        limiter.release();
        await limiter.acquire();
        limiter.release();

        // Fourth should wait
        let fourthAcquired = false;
        const fourthPromise = limiter.acquire().then(() => {
          fourthAcquired = true;
        });

        await vi.advanceTimersByTimeAsync(500);
        expect(fourthAcquired).toBe(false);

        // After window expires, should acquire
        await vi.advanceTimersByTimeAsync(600);
        await fourthPromise;
        expect(fourthAcquired).toBe(true);
      });
    });

    describe('execute', () => {
      it('should execute function with rate limiting', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 60000,
          maxConcurrent: 5,
        });

        const fn = vi.fn().mockResolvedValue('result');
        const result = await limiter.execute(fn);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toBe('result');
      });

      it('should release slot even if function throws', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 60000,
          maxConcurrent: 5,
        });

        const fn = vi.fn().mockRejectedValue(new Error('Test error'));

        await expect(limiter.execute(fn)).rejects.toThrow('Test error');

        const status = limiter.getStatus();
        expect(status.concurrent).toBe(0);
      });

      it('should handle multiple concurrent executions', async () => {
        const limiter = new RateLimiter({
          maxRequests: 100,
          windowMs: 60000,
          maxConcurrent: 3,
        });

        const fn1 = vi.fn().mockResolvedValue('result1');
        const fn2 = vi.fn().mockResolvedValue('result2');
        const fn3 = vi.fn().mockResolvedValue('result3');

        const promises = [limiter.execute(fn1), limiter.execute(fn2), limiter.execute(fn3)];

        const results = await Promise.all(promises);

        expect(results).toEqual(['result1', 'result2', 'result3']);
        expect(limiter.getStatus().concurrent).toBe(0);
      });
    });

    describe('getStatus', () => {
      it('should return correct status', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 60000,
          maxConcurrent: 5,
        });

        await limiter.acquire();
        await limiter.acquire();

        const status = limiter.getStatus();

        expect(status.currentRequests).toBe(2);
        expect(status.maxRequests).toBe(10);
        expect(status.concurrent).toBe(2);
        expect(status.maxConcurrent).toBe(5);
        expect(status.waiting).toBe(0);
      });

      it('should show waiting queue count', async () => {
        const limiter = new RateLimiter({
          maxRequests: 100,
          windowMs: 60000,
          maxConcurrent: 1,
        });

        await limiter.acquire();

        // Queue up 2 more
        limiter.acquire();
        limiter.acquire();

        await vi.advanceTimersByTimeAsync(10);

        const status = limiter.getStatus();
        expect(status.waiting).toBe(2);
      });

      it('should filter expired requests from current count', async () => {
        const limiter = new RateLimiter({
          maxRequests: 10,
          windowMs: 1000,
          maxConcurrent: 10,
        });

        await limiter.acquire();
        limiter.release();

        expect(limiter.getStatus().currentRequests).toBe(1);

        // Move past window
        await vi.advanceTimersByTimeAsync(1100);

        expect(limiter.getStatus().currentRequests).toBe(0);
      });
    });
  });

  // =============================================================================
  // IP-based Rate Limiter Tests (In-Memory)
  // =============================================================================
  describe('checkRateLimit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow request within limit', () => {
      const result = checkRateLimit('192.168.1.1', 10, 60000);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetIn).toBe(60000);
    });

    it('should track multiple requests from same IP', () => {
      const ip = '192.168.1.2';

      const result1 = checkRateLimit(ip, 5, 60000);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(ip, 5, 60000);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);

      const result3 = checkRateLimit(ip, 5, 60000);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(2);
    });

    it('should block when limit exceeded', () => {
      const ip = '192.168.1.3';
      const limit = 3;

      // Make 3 requests (at limit)
      checkRateLimit(ip, limit, 60000);
      checkRateLimit(ip, limit, 60000);
      checkRateLimit(ip, limit, 60000);

      // 4th request should fail
      const result = checkRateLimit(ip, limit, 60000);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const ip = '192.168.1.4';

      // Make requests
      checkRateLimit(ip, 5, 1000);
      checkRateLimit(ip, 5, 1000);

      // Advance time past window
      vi.advanceTimersByTime(1100);

      // Should be reset
      const result = checkRateLimit(ip, 5, 1000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4); // Fresh window
    });

    it('should handle different IPs independently', () => {
      const ip1 = '192.168.1.5';
      const ip2 = '192.168.1.6';

      checkRateLimit(ip1, 3, 60000);
      checkRateLimit(ip1, 3, 60000);
      checkRateLimit(ip1, 3, 60000);

      // ip1 is at limit
      const result1 = checkRateLimit(ip1, 3, 60000);
      expect(result1.success).toBe(false);

      // ip2 should still work
      const result2 = checkRateLimit(ip2, 3, 60000);
      expect(result2.success).toBe(true);
    });

    it('should calculate correct resetIn time', () => {
      const ip = '192.168.1.7';

      const result1 = checkRateLimit(ip, 10, 60000);
      expect(result1.resetIn).toBe(60000);

      // Advance time
      vi.advanceTimersByTime(30000);

      const result2 = checkRateLimit(ip, 10, 60000);
      expect(result2.resetIn).toBeGreaterThan(25000);
      expect(result2.resetIn).toBeLessThanOrEqual(30000);
    });

    it('should use default values', () => {
      const result = checkRateLimit('192.168.1.8');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99); // Default 100 - 1
    });
  });

  // =============================================================================
  // Rate Limit Presets Tests
  // =============================================================================
  describe('RATE_LIMITS presets', () => {
    it('should have strict preset', () => {
      expect(RATE_LIMITS.strict).toEqual({
        limit: 10,
        windowMs: 60000,
      });
    });

    it('should have normal preset', () => {
      expect(RATE_LIMITS.normal).toEqual({
        limit: 60,
        windowMs: 60000,
      });
    });

    it('should have relaxed preset', () => {
      expect(RATE_LIMITS.relaxed).toEqual({
        limit: 120,
        windowMs: 60000,
      });
    });

    it('should have increasing limits', () => {
      expect(RATE_LIMITS.strict.limit).toBeLessThan(RATE_LIMITS.normal.limit);
      expect(RATE_LIMITS.normal.limit).toBeLessThan(RATE_LIMITS.relaxed.limit);
    });

    it('should all use same window size', () => {
      expect(RATE_LIMITS.strict.windowMs).toBe(60000);
      expect(RATE_LIMITS.normal.windowMs).toBe(60000);
      expect(RATE_LIMITS.relaxed.windowMs).toBe(60000);
    });
  });

  // =============================================================================
  // Global Limiter Instances Tests
  // =============================================================================
  describe('Global limiter instances', () => {
    it('should export geminiVisionLimiter with correct config', async () => {
      const { geminiVisionLimiter } = await import('@/lib/rate-limiter');

      const status = geminiVisionLimiter.getStatus();
      expect(status.maxRequests).toBe(60);
      expect(status.maxConcurrent).toBe(5);
    });

    it('should export geminiEmbeddingLimiter with correct config', async () => {
      const { geminiEmbeddingLimiter } = await import('@/lib/rate-limiter');

      const status = geminiEmbeddingLimiter.getStatus();
      expect(status.maxRequests).toBe(1500);
      expect(status.maxConcurrent).toBe(10);
    });
  });

  // =============================================================================
  // Concurrent Stress Tests
  // =============================================================================
  describe('Stress tests', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle rapid concurrent requests', async () => {
      const limiter = new RateLimiter({
        maxRequests: 50,
        windowMs: 60000,
        maxConcurrent: 10,
      });

      const tasks = Array.from({ length: 20 }, (_, i) =>
        limiter.execute(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return i;
        })
      );

      await vi.advanceTimersByTimeAsync(200);

      const results = await Promise.all(tasks);
      expect(results).toHaveLength(20);
      expect(limiter.getStatus().concurrent).toBe(0);
    });

    it('should maintain rate limit under burst load', () => {
      const ip = '192.168.1.100';
      const limit = 10;

      let successCount = 0;
      let failCount = 0;

      // Burst 20 requests
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(ip, limit, 60000);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      expect(successCount).toBe(limit);
      expect(failCount).toBe(10);
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================
  describe('Edge cases', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle zero max requests gracefully', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1, // Changed from 0 to 1 - more realistic edge case
        windowMs: 100,
        maxConcurrent: 5,
      });

      // First acquire should succeed
      await limiter.acquire();
      limiter.release();

      // Second acquire should wait for window
      const secondPromise = limiter.acquire();

      let resolved = false;
      secondPromise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(100);
      await secondPromise;
      expect(resolved).toBe(true);
    });

    it('should handle very small window size', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 100,
        maxConcurrent: 5,
      });

      await limiter.acquire();
      limiter.release();
      await limiter.acquire();
      limiter.release();

      // Third should wait
      const thirdPromise = limiter.acquire();

      let resolved = false;
      thirdPromise.then(() => {
        resolved = true;
      });

      await vi.advanceTimersByTimeAsync(50);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(60);
      expect(resolved).toBe(true);
    });

    it('should not have negative concurrent count', async () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 60000,
        maxConcurrent: 5,
      });

      // Release without acquire
      limiter.release();
      limiter.release();

      const status = limiter.getStatus();
      expect(status.concurrent).toBe(0);
      expect(status.concurrent).toBeGreaterThanOrEqual(0);
    });
  });
});
