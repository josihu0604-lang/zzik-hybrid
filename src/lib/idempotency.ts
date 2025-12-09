
import { createClient } from '@supabase/supabase-js';

// Simple in-memory store for dev/testing if Redis is not available
const idempotencyStore = new Map<string, { response: any; timestamp: number }>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validates and stores idempotency keys to prevent duplicate operations.
 * 
 * In a real Tier 1 architecture, this would use Redis with persistent storage (AOF).
 * 
 * Flow:
 * 1. Check if key exists.
 * 2. If exists, return stored response (STOP processing).
 * 3. If not, proceed.
 * 4. After processing, store the response associated with the key.
 */
export async function checkIdempotency(key: string): Promise<any | null> {
  // 1. Clean up expired keys
  const now = Date.now();
  for (const [k, v] of idempotencyStore.entries()) {
    if (now - v.timestamp > TTL_MS) {
      idempotencyStore.delete(k);
    }
  }

  // 2. Check store
  if (idempotencyStore.has(key)) {
    console.log(`[Idempotency] Hit for key: ${key}`);
    return idempotencyStore.get(key)?.response;
  }

  // 3. In production with Redis:
  // const cached = await redis.get(`idempotency:${key}`);
  // if (cached) return JSON.parse(cached);

  return null;
}

export async function saveIdempotencyResponse(key: string, response: any): Promise<void> {
  idempotencyStore.set(key, {
    response,
    timestamp: Date.now()
  });
  
  // In production with Redis:
  // await redis.set(`idempotency:${key}`, JSON.stringify(response), { ex: 86400 });
}

/**
 * Wraps an API handler with idempotency logic
 */
export async function withIdempotency(
  key: string | undefined, 
  handler: () => Promise<Response>
): Promise<Response> {
  if (!key) {
    return handler();
  }

  const cachedResponse = await checkIdempotency(key);
  if (cachedResponse) {
    // Return cached response with a header indicating it's a replay
    // We need to reconstruct the Response object
    const { body, status, headers } = cachedResponse;
    const newHeaders = new Headers(headers);
    newHeaders.set('X-Idempotency-Replay', 'true');
    
    return new Response(body, {
      status,
      statusText: 'OK',
      headers: newHeaders
    });
  }

  const response = await handler();
  
  // Clone response to read body
  const cloned = response.clone();
  const body = await cloned.text();
  
  // Convert headers to object
  const headersObj: Record<string, string> = {};
  response.headers.forEach((val, key) => {
    headersObj[key] = val;
  });

  await saveIdempotencyResponse(key, {
    body,
    status: response.status,
    headers: headersObj
  });

  return response;
}
