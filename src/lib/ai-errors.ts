/**
 * AI Error Handling Framework
 * Centralized error classification and retry logic for Gemini API
 */

export class GeminiError extends Error {
  constructor(
    public code: GeminiErrorCode,
    public statusCode?: number,
    message?: string
  ) {
    super(message || code);
    this.name = 'GeminiError';
  }
}

export enum GeminiErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  INVALID_IMAGE = 'INVALID_IMAGE',
  PARSE_ERROR = 'PARSE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Classify error from Gemini API response
 */
export function classifyGeminiError(error: unknown): GeminiErrorCode {
  const err = error as Record<string, unknown>;
  const message = String(err?.message || '').toLowerCase();
  const statusCode = err?.statusCode as number | undefined;

  if (message.includes('api key') || message.includes('api_key')) {
    return GeminiErrorCode.INVALID_API_KEY;
  }
  if (message.includes('quota') || statusCode === 429) {
    return GeminiErrorCode.QUOTA_EXCEEDED;
  }
  if (statusCode === 429) {
    return GeminiErrorCode.RATE_LIMIT;
  }
  if (message.includes('timeout') || statusCode === 504) {
    return GeminiErrorCode.TIMEOUT;
  }
  if (message.includes('invalid image') || message.includes('image format')) {
    return GeminiErrorCode.INVALID_IMAGE;
  }
  if (message.includes('parse') || message.includes('json')) {
    return GeminiErrorCode.PARSE_ERROR;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return GeminiErrorCode.NETWORK_ERROR;
  }

  return GeminiErrorCode.UNKNOWN;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(code: GeminiErrorCode): boolean {
  return [
    GeminiErrorCode.RATE_LIMIT,
    GeminiErrorCode.TIMEOUT,
    GeminiErrorCode.NETWORK_ERROR,
  ].includes(code);
}

/**
 * Execute function with exponential backoff retry
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 1000, maxDelayMs = 10000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const errorCode = classifyGeminiError(error);

      // Don't retry non-retryable errors
      if (!isRetryableError(errorCode)) {
        throw new GeminiError(errorCode, undefined, lastError.message);
      }

      // Don't retry on last attempt
      if (attempt >= maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = initialDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * baseDelay;
      const delay = Math.min(baseDelay + jitter, maxDelayMs);

      onRetry?.(attempt, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error after retries');
}

/**
 * User-friendly error messages in Korean
 */
export function getErrorMessage(code: GeminiErrorCode): string {
  const messages: Record<GeminiErrorCode, string> = {
    [GeminiErrorCode.INVALID_API_KEY]: 'API 인증 오류가 발생했습니다.',
    [GeminiErrorCode.QUOTA_EXCEEDED]: 'API 사용량 한도를 초과했습니다.',
    [GeminiErrorCode.RATE_LIMIT]: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    [GeminiErrorCode.TIMEOUT]: '요청 시간이 초과되었습니다.',
    [GeminiErrorCode.INVALID_IMAGE]: '이미지 형식이 올바르지 않습니다.',
    [GeminiErrorCode.PARSE_ERROR]: '응답 처리 중 오류가 발생했습니다.',
    [GeminiErrorCode.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
    [GeminiErrorCode.UNKNOWN]: '알 수 없는 오류가 발생했습니다.',
  };

  return messages[code];
}
