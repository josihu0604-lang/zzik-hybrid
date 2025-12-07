/**
 * API Client
 *
 * Type-safe API client with caching, retry, and error handling
 */

import { apiClientConfig } from '@/config/app.config';
import { reportApiError } from './error-reporter';

// ============================================
// Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Error details from API response
 */
export interface ApiErrorDetails {
  /** Validation errors by field */
  fieldErrors?: Record<string, string[]>;
  /** Stack trace (development only) */
  stack?: string;
  /** Original error message */
  originalError?: string;
  /** Additional context */
  context?: Record<string, string | number | boolean>;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: ApiErrorDetails | Record<string, unknown>;
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body (will be JSON stringified) */
  data?: unknown;
  /** Request timeout in ms */
  timeout?: number;
  /** Number of retry attempts */
  retries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Cache key (for caching responses) */
  cacheKey?: string;
  /** Cache TTL in ms */
  cacheTTL?: number;
}

// ============================================
// Cache
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function clearCache(keyPattern?: string): void {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
}

// ============================================
// Error Handling
// ============================================

export class ApiException extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor({ message, status, code, details }: ApiError) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

// ============================================
// API Client
// ============================================

const DEFAULT_TIMEOUT = apiClientConfig.timeout;
const DEFAULT_RETRIES = apiClientConfig.retries;
const DEFAULT_RETRY_DELAY = apiClientConfig.retryDelay;
const DEFAULT_CACHE_TTL = apiClientConfig.cache.defaultTTL;

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Set authorization token
   *
   * SEC-008 SECURITY NOTE: Token stored in memory is vulnerable to XSS attacks.
   * In case of XSS, an attacker could access this.defaultHeaders["Authorization"].
   *
   * MIGRATION PLAN: For enhanced security, consider migrating to httpOnly cookies:
   * 1. Store token in httpOnly cookie on server-side during auth
   * 2. Use cookie-based authentication instead of Authorization header
   * 3. Implement CSRF protection (already in place via csrf.ts)
   *
   * Current mitigation: Strong CSP headers and XSS prevention measures.
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, this.baseUrl || window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Execute request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async fetchWithRetry(
    url: string,
    config: RequestInit,
    timeout: number,
    retries: number,
    retryDelay: number
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, config, timeout);

        // Only retry on server errors or network issues
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort
        if ((error as Error).name === 'AbortError') {
          throw new ApiException({
            message: 'Request timeout',
            status: 0,
            code: 'TIMEOUT',
          });
        }
      }

      // Wait before retry
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    const networkError = new ApiException({
      message: lastError?.message || 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
    });

    // Report network errors
    reportApiError(networkError, {
      context: 'ApiClient',
      action: 'fetchWithRetry',
      metadata: { retries, url },
    });

    throw networkError;
  }

  /**
   * Make API request
   */
  async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      params,
      data,
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY,
      cacheKey,
      cacheTTL = DEFAULT_CACHE_TTL,
      headers,
      ...fetchConfig
    } = config;

    // Check cache for GET requests
    if (cacheKey && (!fetchConfig.method || fetchConfig.method === 'GET')) {
      const cached = getCached<T>(cacheKey);
      if (cached) {
        return {
          data: cached,
          status: 200,
          headers: new Headers(),
        };
      }
    }

    const url = this.buildUrl(path, params);

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await this.fetchWithRetry(url, requestConfig, timeout, retries, retryDelay);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: { message?: string; code?: string } | null = null;
      try {
        const parsedError = await response.json();
        if (typeof parsedError === 'object' && parsedError !== null) {
          errorData = parsedError as { message?: string; code?: string };
        }
      } catch {
        // Ignore JSON parse errors - response may not be JSON
      }

      const apiError = new ApiException({
        message: errorData?.message || response.statusText,
        status: response.status,
        code: errorData?.code,
        details: errorData as ApiErrorDetails | Record<string, unknown> | undefined,
      });

      // Report to error monitoring service
      reportApiError(apiError, {
        context: 'ApiClient',
        action: `${requestConfig.method || 'GET'} ${path}`,
      });

      throw apiError;
    }

    // Parse response
    let responseData: T;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = (await response.text()) as unknown as T;
    }

    // Cache response
    if (cacheKey) {
      setCache(cacheKey, responseData, cacheTTL);
    }

    return {
      data: responseData,
      status: response.status,
      headers: response.headers,
    };
  }

  // Convenience methods
  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'POST', data });
  }

  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PUT', data });
  }

  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PATCH', data });
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

// ============================================
// Default Client Instance
// ============================================

export const apiClient = new ApiClient('/api');

export default ApiClient;
