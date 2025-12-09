/**
 * API Response Caching Utilities
 *
 * Performance optimization layer for API routes using Next.js caching primitives.
 * Reduces database load and improves response times for frequently accessed data.
 *
 * Usage:
 *   import { getCachedData, revalidateCache } from '@/lib/api-cache';
 *
 *   const stats = await getCachedData(
 *     ['leader-stats', userId, period],
 *     async () => computeExpensiveStats(),
 *     { revalidate: 300 }
 *   );
 */

import { unstable_cache } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
  /** Time in seconds before cache revalidation */
  revalidate?: number;
  /** Cache tags for on-demand revalidation */
  tags?: string[];
}

export interface CacheKey {
  /** Resource type (e.g., 'leader-stats', 'popup-list') */
  resource: string;
  /** Additional key parameters */
  params?: Record<string, string | number | boolean>;
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Default cache durations by resource type
 */
export const CACHE_DURATIONS = {
  // User-specific data (short TTL)
  'leader-stats': 300, // 5 minutes
  'user-profile': 600, // 10 minutes
  'participation-list': 180, // 3 minutes

  // Public data (longer TTL)
  'popup-list': 60, // 1 minute
  'popup-detail': 120, // 2 minutes
  'brand-campaigns': 300, // 5 minutes

  // Expensive computations (aggressive caching)
  analytics: 900, // 15 minutes
  leaderboard: 600, // 10 minutes
  recommendations: 1800, // 30 minutes

  // Static reference data (very long TTL)
  categories: 3600, // 1 hour
  tiers: 3600, // 1 hour
} as const;

// ============================================================================
// CORE CACHE FUNCTIONS
// ============================================================================

/**
 * Get cached data or compute if not cached
 *
 * @example
 * ```typescript
 * const stats = await getCachedData(
 *   ['leader-stats', userId, period],
 *   async () => {
 *     const supabase = createAdminClient();
 *     return await computeLeaderStats(supabase, userId, period);
 *   },
 *   { revalidate: 300, tags: [`leader-${userId}`] }
 * );
 * ```
 */
export async function getCachedData<T>(
  keyParts: (string | number | boolean)[],
  computeFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Determine revalidation time
  const resourceType = keyParts[0] as string;
  const defaultRevalidate = CACHE_DURATIONS[resourceType as keyof typeof CACHE_DURATIONS] || 60;
  const revalidate = options?.revalidate ?? defaultRevalidate;

  // Create cached function
  const cachedFn = unstable_cache(computeFn, keyParts.map(String), {
    revalidate,
    tags: options?.tags || [resourceType],
  });

  return cachedFn();
}

/**
 * Wrapper for Next.js unstable_cache with sensible defaults
 *
 * @example
 * ```typescript
 * export const GET = async (request: Request) => {
 *   const cached = createCachedFunction(
 *     async () => getPopups(),
 *     ['popup-list', category],
 *     { revalidate: 60 }
 *   );
 *   return Response.json(await cached());
 * };
 * ```
 */
export function createCachedFunction<T>(
  fn: () => Promise<T>,
  keyParts: (string | number)[],
  options?: CacheOptions
): () => Promise<T> {
  const resourceType = keyParts[0] as string;
  const defaultRevalidate = CACHE_DURATIONS[resourceType as keyof typeof CACHE_DURATIONS] || 60;

  return unstable_cache(fn, keyParts.map(String), {
    revalidate: options?.revalidate ?? defaultRevalidate,
    tags: options?.tags || [resourceType],
  });
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Revalidate cache by tag
 *
 * Use this to invalidate cache when data changes.
 *
 * @example
 * ```typescript
 * // After user updates profile
 * await revalidateCacheByTag(`user-${userId}`);
 *
 * // After popup is created
 * await revalidateCacheByTag('popup-list');
 * ```
 */
export async function revalidateCacheByTag(tag: string): Promise<void> {
  try {
    const { revalidateTag } = await import('next/cache');
    // Next.js 16 requires a profile argument (second parameter)
    revalidateTag(tag, 'default');
  } catch (error) {
    console.error(`[Cache] Failed to revalidate tag: ${tag}`, error);
  }
}

/**
 * Revalidate cache by path
 *
 * Use for page-level cache invalidation.
 * Note: In Next.js 16, only 'page' and 'layout' types are supported.
 *
 * @example
 * ```typescript
 * await revalidateCacheByPath('/popup/[id]', 'page');
 * await revalidateCacheByPath('/layout', 'layout');
 * ```
 */
export async function revalidateCacheByPath(
  path: string,
  type: 'page' | 'layout' = 'page'
): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath(path, type);
  } catch (error) {
    console.error(`[Cache] Failed to revalidate path: ${path}`, error);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Invalidate all caches for a specific user
 *
 * @example
 * ```typescript
 * // After user updates settings or participates in popup
 * await invalidateUserCache(userId);
 * ```
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    revalidateCacheByTag(`user-${userId}`),
    revalidateCacheByTag(`leader-${userId}`),
    revalidateCacheByTag('user-profile'),
  ]);
}

/**
 * Invalidate popup-related caches
 *
 * @example
 * ```typescript
 * // After popup reaches goal or status changes
 * await invalidatePopupCache(popupId);
 * ```
 */
export async function invalidatePopupCache(popupId?: string): Promise<void> {
  const promises: Promise<void>[] = [revalidateCacheByTag('popup-list')];

  if (popupId) {
    promises.push(
      revalidateCacheByTag(`popup-${popupId}`),
      revalidateCacheByPath(`/popup/${popupId}`, 'page')
    );
  }

  await Promise.all(promises);
}

/**
 * Invalidate leader-related caches
 *
 * @example
 * ```typescript
 * // After referral check-in or payout
 * await invalidateLeaderCache(leaderId);
 * ```
 */
export async function invalidateLeaderCache(leaderId: string): Promise<void> {
  await Promise.all([
    revalidateCacheByTag(`leader-${leaderId}`),
    revalidateCacheByTag('leader-stats'),
    revalidateCacheByTag('leaderboard'),
  ]);
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Pre-warm cache for critical data
 *
 * Call this on deployment or via cron to ensure cache is populated.
 *
 * @example
 * ```typescript
 * // In API route or cron job
 * await warmCache();
 * ```
 */
export async function warmCache(): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Cache] Warming cache...');
  }

  try {
    // Warm critical endpoints
    const warmTasks = [
      // Popular popups
      fetch('/api/popup?limit=20'),
      // Categories (static data)
      fetch('/api/categories'),
      // Top leaders (for leaderboard)
      fetch('/api/leaderboard?limit=10'),
    ];

    await Promise.allSettled(warmTasks);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Cache] Cache warmed successfully');
    }
  } catch (error) {
    console.error('[Cache] Failed to warm cache:', error);
  }
}

// ============================================================================
// CACHE ANALYTICS
// ============================================================================

/**
 * Simple in-memory cache hit/miss tracking
 * (For development/debugging - use APM tools in production)
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
};

/**
 * Track cache hit
 */
export function trackCacheHit(resource: string): void {
  cacheStats.hits++;
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Cache HIT] ${resource} (${cacheStats.hits} total hits)`);
  }
}

/**
 * Track cache miss
 */
export function trackCacheMiss(resource: string): void {
  cacheStats.misses++;
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Cache MISS] ${resource} (${cacheStats.misses} total misses)`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? ((cacheStats.hits / total) * 100).toFixed(2) : '0';

  return {
    ...cacheStats,
    total,
    hitRate: `${hitRate}%`,
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.errors = 0;
}

// ============================================================================
// EXAMPLE USAGE IN API ROUTES
// ============================================================================

/**
 * Example: Cached leader stats endpoint
 *
 * ```typescript
 * // /app/api/leader/stats/route.ts
 * import { getCachedData, invalidateLeaderCache } from '@/lib/api-cache';
 *
 * export const GET = withMiddleware(async (request, context) => {
 *   const userId = context.userId!;
 *   const period = '30d';
 *
 *   const stats = await getCachedData(
 *     ['leader-stats', userId, period],
 *     async () => {
 *       // Expensive computation
 *       const supabase = createAdminClient();
 *       return await computeLeaderStats(supabase, userId, period);
 *     },
 *     {
 *       revalidate: 300, // 5 minutes
 *       tags: [`leader-${userId}`],
 *     }
 *   );
 *
 *   return apiSuccess(stats);
 * });
 *
 * export const POST = withMiddleware(async (request, context) => {
 *   // ... update leader data ...
 *
 *   // Invalidate cache after mutation
 *   await invalidateLeaderCache(context.userId!);
 *
 *   return apiSuccess({ message: 'Updated' });
 * });
 * ```
 */

/**
 * Example: Cached popup list with ISR
 *
 * ```typescript
 * // /app/page.tsx
 * import { getCachedData } from '@/lib/api-cache';
 *
 * async function getPopups(category: string) {
 *   return getCachedData(
 *     ['popup-list', category],
 *     async () => {
 *       const supabase = createServerSupabaseClient();
 *       const { data } = await supabase
 *         .from('popups')
 *         .select('*')
 *         .eq('category', category);
 *       return data;
 *     },
 *     { revalidate: 60 } // 1 minute ISR
 *   );
 * }
 *
 * export default async function HomePage() {
 *   const popups = await getPopups('all');
 *   return <PopupList popups={popups} />;
 * }
 * ```
 */

export default {
  getCachedData,
  createCachedFunction,
  revalidateCacheByTag,
  revalidateCacheByPath,
  invalidateUserCache,
  invalidatePopupCache,
  invalidateLeaderCache,
  warmCache,
  getCacheStats,
  resetCacheStats,
};
