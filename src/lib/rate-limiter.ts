/**
 * Rate Limiter for AI API Calls
 * Prevents quota exhaustion and manages concurrent requests
 *
 * Supports:
 * - In-memory storage (development/single instance)
 * - Redis/Upstash (production/distributed)
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxConcurrent?: number;
}

export class RateLimiter {
  private requestTimes: number[] = [];
  private concurrentRequests = 0;
  private waitingQueue: Array<() => void> = [];
  private maxConcurrent: number;

  constructor(private config: RateLimitConfig) {
    this.maxConcurrent = config.maxConcurrent || 5;
  }

  /**
   * Acquire a slot for making a request
   * Blocks until a slot is available
   */
  async acquire(): Promise<void> {
    // Wait for concurrent slot
    while (this.concurrentRequests >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.waitingQueue.push(resolve);
      });
    }

    // Rate limit window check
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter((t) => now - t < this.config.windowMs);

    if (this.requestTimes.length >= this.config.maxRequests) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.config.windowMs - (now - oldestRequest);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.acquire();
    }

    this.requestTimes.push(now);
    this.concurrentRequests++;
  }

  /**
   * Release a slot after request completes
   */
  release(): void {
    this.concurrentRequests = Math.max(0, this.concurrentRequests - 1);

    // Wake up next waiting request
    const next = this.waitingQueue.shift();
    if (next) {
      next();
    }
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    currentRequests: number;
    maxRequests: number;
    concurrent: number;
    maxConcurrent: number;
    waiting: number;
  } {
    const now = Date.now();
    const currentRequests = this.requestTimes.filter((t) => now - t < this.config.windowMs).length;

    return {
      currentRequests,
      maxRequests: this.config.maxRequests,
      concurrent: this.concurrentRequests,
      maxConcurrent: this.maxConcurrent,
      waiting: this.waitingQueue.length,
    };
  }
}

// Global rate limiter instances
export const geminiVisionLimiter = new RateLimiter({
  maxRequests: 60, // 60 requests per minute
  windowMs: 60000,
  maxConcurrent: 5,
});

export const geminiEmbeddingLimiter = new RateLimiter({
  maxRequests: 1500, // 1500 requests per minute for embeddings
  windowMs: 60000,
  maxConcurrent: 10,
});

// ============================================================================
// DISTRIBUTED RATE LIMITER (Redis/Upstash)
// ============================================================================

/**
 * Redis client interface for rate limiting
 */
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

/**
 * Upstash Redis adapter
 * Uses REST API for serverless compatibility
 */
class UpstashRedisClient implements RedisClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async command(...args: (string | number)[]): Promise<unknown> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Upstash Redis error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async get(key: string): Promise<string | null> {
    const result = await this.command('GET', key);
    return result as string | null;
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
      await this.command('SET', key, value, 'EX', options.ex);
    } else {
      await this.command('SET', key, value);
    }
  }

  async incr(key: string): Promise<number> {
    const result = await this.command('INCR', key);
    return result as number;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.command('EXPIRE', key, seconds);
  }
}

/**
 * Get Redis client based on environment configuration
 * Returns null if Redis is not configured
 */
function getRedisClient(): RedisClient | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    return new UpstashRedisClient(upstashUrl, upstashToken);
  }

  // Could add support for other Redis clients here (ioredis, etc.)
  return null;
}

// Cached Redis client
let redisClient: RedisClient | null | undefined;

function getCachedRedisClient(): RedisClient | null {
  if (redisClient === undefined) {
    redisClient = getRedisClient();
    if (redisClient) {
      console.warn('[RateLimiter] Using distributed Redis rate limiting');
    } else {
      console.warn(
        '[RateLimiter] Using in-memory rate limiting (not suitable for distributed deployment)'
      );
    }
  }
  return redisClient;
}

// ============================================================================
// IP-BASED RATE LIMITER
// ============================================================================

/**
 * Simple IP-based Rate Limiter for API Routes
 * Automatically uses Redis if configured, falls back to in-memory
 */
interface IPRateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (fallback)
const ipRateLimitStore = new Map<string, IPRateLimitEntry>();

// SEC-019 FIX: Add MAX_ENTRIES limit to prevent memory leak
// In a DDoS scenario, attackers could exhaust memory by creating entries for many IPs
const MAX_RATE_LIMIT_ENTRIES = 100000; // Maximum unique IPs to track

// Track access order for LRU eviction
const accessOrder: string[] = [];

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

/**
 * SEC-019 FIX: LRU eviction when store is full
 * Removes least recently used entries when MAX_ENTRIES is reached
 */
function evictLRUEntries(): void {
  // Evict oldest 10% when at capacity
  const evictCount = Math.ceil(MAX_RATE_LIMIT_ENTRIES * 0.1);

  while (accessOrder.length > 0 && ipRateLimitStore.size > MAX_RATE_LIMIT_ENTRIES - evictCount) {
    const oldestKey = accessOrder.shift();
    if (oldestKey) {
      ipRateLimitStore.delete(oldestKey);
    }
  }
}

/**
 * Update access order for LRU tracking
 */
function updateAccessOrder(key: string): void {
  // Remove existing entry if present
  const existingIndex = accessOrder.indexOf(key);
  if (existingIndex !== -1) {
    accessOrder.splice(existingIndex, 1);
  }
  // Add to end (most recently used)
  accessOrder.push(key);
}

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;

  // Remove expired entries
  for (const [key, entry] of ipRateLimitStore.entries()) {
    if (entry.resetTime < now) {
      ipRateLimitStore.delete(key);
      // Also remove from access order
      const idx = accessOrder.indexOf(key);
      if (idx !== -1) {
        accessOrder.splice(idx, 1);
      }
    }
  }

  // SEC-019 FIX: Also check if we need LRU eviction after cleanup
  if (ipRateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
    evictLRUEntries();
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit using Redis (distributed)
 */
async function checkRateLimitRedis(
  redis: RedisClient,
  ip: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `ratelimit:api:${ip}`;
  const windowSec = Math.ceil(windowMs / 1000);

  try {
    // Get current count
    const currentStr = await redis.get(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current >= limit) {
      // Get TTL for reset time (approximation)
      return {
        success: false,
        remaining: 0,
        resetIn: windowMs, // Approximate
      };
    }

    // Increment counter
    const newCount = await redis.incr(key);

    // Set expiry on first request
    if (newCount === 1) {
      await redis.expire(key, windowSec);
    }

    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      resetIn: windowMs,
    };
  } catch (error) {
    console.error('[RateLimiter] Redis error, falling back to in-memory:', error);
    // Fall back to in-memory on Redis error
    return checkRateLimitMemory(ip, limit, windowMs);
  }
}

/**
 * Check rate limit using in-memory store (single instance)
 */
function checkRateLimitMemory(ip: string, limit: number, windowMs: number): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const key = `api:${ip}`;
  const entry = ipRateLimitStore.get(key);

  // No existing entry or expired
  if (!entry || entry.resetTime < now) {
    // SEC-019 FIX: Check capacity before adding new entry
    if (ipRateLimitStore.size >= MAX_RATE_LIMIT_ENTRIES) {
      evictLRUEntries();
    }

    ipRateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    updateAccessOrder(key);
    return { success: true, remaining: limit - 1, resetIn: windowMs };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    updateAccessOrder(key);
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  updateAccessOrder(key);
  return {
    success: true,
    remaining: limit - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Check rate limit for an IP address
 * Automatically uses Redis if configured, falls back to in-memory
 *
 * @param ip - Client IP address
 * @param limit - Max requests per window (default: 100)
 * @param windowMs - Time window in ms (default: 60000 = 1 minute)
 */
export async function checkRateLimitAsync(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redis = getCachedRedisClient();

  if (redis) {
    return checkRateLimitRedis(redis, ip, limit, windowMs);
  }

  return checkRateLimitMemory(ip, limit, windowMs);
}

/**
 * Synchronous rate limit check (in-memory only)
 * @deprecated Use checkRateLimitAsync for distributed support
 */
export function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  return checkRateLimitMemory(ip, limit, windowMs);
}

/**
 * Get client IP from Next.js request
 */
export function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Cloudflare specific
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback
  return 'unknown';
}

// Rate limit presets for different endpoints
export const RATE_LIMITS = {
  // Strict: 체크인, OCR 등 리소스 intensive 작업
  strict: { limit: 10, windowMs: 60000 }, // 10/min
  // Normal: 일반 API
  normal: { limit: 60, windowMs: 60000 }, // 60/min
  // Relaxed: 조회 API
  relaxed: { limit: 120, windowMs: 60000 }, // 120/min
} as const;

/**
 * Rate limiter configuration status
 */
export function getRateLimiterStatus(): {
  type: 'redis' | 'memory';
  configured: boolean;
  provider?: string;
} {
  const redis = getCachedRedisClient();

  if (redis) {
    return {
      type: 'redis',
      configured: true,
      provider: process.env.UPSTASH_REDIS_REST_URL ? 'upstash' : 'redis',
    };
  }

  return {
    type: 'memory',
    configured: true,
  };
}

// ============================================================================
// PRODUCTION ENVIRONMENT VALIDATION (SEC-020)
// ============================================================================

/**
 * SEC-020: Validate rate limiting configuration for production
 *
 * In production, in-memory rate limiting is vulnerable to:
 * - Instance restarts clearing rate limit counters
 * - Multiple instances not sharing rate limit state
 * - DDoS attacks exhausting memory
 *
 * This function logs a warning and optionally throws in production
 * if Redis is not configured.
 */
export function validateProductionRateLimiting(): {
  valid: boolean;
  warnings: string[];
} {
  const status = getRateLimiterStatus();
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  if (status.type === 'memory') {
    warnings.push(
      '[SEC-020] Rate limiting is using in-memory storage. ' +
        'This is not suitable for production deployments with multiple instances.'
    );

    if (isProduction) {
      warnings.push(
        '[SEC-020] CRITICAL: Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN ' +
          'for distributed rate limiting in production.'
      );

      // Log critical warning
      console.error(
        '\n' +
          '╔════════════════════════════════════════════════════════════════╗\n' +
          '║ ⚠️  SECURITY WARNING: Rate Limiting Configuration              ║\n' +
          '╠════════════════════════════════════════════════════════════════╣\n' +
          '║ In-memory rate limiting detected in production environment.    ║\n' +
          '║                                                                 ║\n' +
          '║ RISKS:                                                          ║\n' +
          '║ - Rate limits reset on server restart                           ║\n' +
          '║ - No rate limit sharing across instances                        ║\n' +
          '║ - Vulnerable to distributed attacks                             ║\n' +
          '║                                                                 ║\n' +
          '║ ACTION REQUIRED:                                                ║\n' +
          '║ Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN        ║\n' +
          '║ environment variables for production deployments.               ║\n' +
          '╚════════════════════════════════════════════════════════════════╝\n'
      );
    }
  }

  return {
    valid: status.type === 'redis' || !isProduction,
    warnings,
  };
}

// Auto-validate on module load in production
if (typeof window === 'undefined') {
  // Server-side only
  setTimeout(() => {
    validateProductionRateLimiting();
  }, 1000); // Delay to allow env vars to be loaded
}
