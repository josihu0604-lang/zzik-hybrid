
import { logger } from '@/lib/logger';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN',     // Failing, reject requests immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number;  // Time (ms) to wait before trying HALF_OPEN
  requestTimeout: number;   // Max time (ms) for a request before considering it a failure
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30s
  requestTimeout: 5000,
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.transition(CircuitState.HALF_OPEN);
      } else {
        throw new Error(`[CircuitBreaker:${this.name}] Circuit is OPEN`);
      }
    }

    try {
      const result = await this.executeWithTimeout(action);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private async executeWithTimeout<T>(action: () => Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`[CircuitBreaker:${this.name}] Request timed out`));
      }, this.config.requestTimeout);
    });

    try {
      const result = await Promise.race([action(), timeoutPromise]);
      return result;
    } finally {
      // @ts-ignore
      clearTimeout(timer);
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.transition(CircuitState.CLOSED);
    }
  }

  private onFailure(error: any) {
    this.failures++;
    this.lastFailureTime = Date.now();
    logger.warn(`[CircuitBreaker:${this.name}] Failure recorded (${this.failures}/${this.config.failureThreshold})`, error);

    if (this.failures >= this.config.failureThreshold) {
      this.transition(CircuitState.OPEN);
    }
  }

  private transition(newState: CircuitState) {
    logger.info(`[CircuitBreaker:${this.name}] State change: ${this.state} -> ${newState}`);
    this.state = newState;
  }
}

// Global registry for circuit breakers
export const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, config));
  }
  return circuitBreakers.get(name)!;
}
