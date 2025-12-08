
import { logger } from '@/lib/logger';

interface RetryConfig {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
};

/**
 * Executes a promise with Exponential Backoff retry strategy.
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > finalConfig.retries) {
        throw error;
      }

      const delay = Math.min(
        finalConfig.minTimeout * Math.pow(finalConfig.factor, attempt - 1),
        finalConfig.maxTimeout
      );
      
      // Add jitter to prevent Thundering Herd problem
      const jitter = Math.random() * 0.1 * delay; 
      const finalDelay = delay + jitter;

      if (finalConfig.onRetry) {
        finalConfig.onRetry(attempt, error);
      } else {
        logger.warn(`[Retry] Attempt ${attempt} failed, retrying in ${Math.round(finalDelay)}ms...`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }
}
