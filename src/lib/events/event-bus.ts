
import { logger } from '@/lib/logger';
import { saveToDLQ } from './dlq-repository';

/**
 * Tier 1 Event Bus (Abstraction Layer)
 * 
 * In a real Ultra-Scale environment, this connects to:
 * - Apache Kafka
 * - Amazon SQS / SNS
 * - RabbitMQ
 * 
 * For this Hybrid environment, it uses an in-memory EventEmitter pattern
 * but structured to be easily swapped for a message broker.
 */

type EventType = 'checkin.verified' | 'payment.succeeded' | 'user.registered';

interface EventPayloads {
  'checkin.verified': {
    userId: string;
    popupId: string;
    referralCode?: string;
    timestamp: string;
  };
  'payment.succeeded': {
    userId: string;
    amount: number;
    currency: string;
    metadata: Record<string, any>;
  };
  'user.registered': {
    userId: string;
    email: string;
  };
}

type EventHandler<T extends EventType> = (payload: EventPayloads[T]) => Promise<void>;

class EventBus {
  private handlers: Partial<Record<EventType, EventHandler<any>[]>> = {};
  private queue: Array<{ type: EventType; payload: any }> = [];
  private isProcessing = false;

  /**
   * Subscribe a handler to an event
   */
  subscribe<T extends EventType>(type: T, handler: EventHandler<T>) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type]?.push(handler);
  }

  /**
   * Publish an event
   * In a real system, this would push to Kafka/SQS.
   * Here, we simulate async processing.
   */
  async publish<T extends EventType>(type: T, payload: EventPayloads[T]): Promise<void> {
    logger.info(`[EventBus] Published: ${type}`, { payload });
    
    // In Serverless/Next.js, we must process important side-effects immediately 
    // or offload to a real external queue.
    // We'll process "inline" but safely caught for now.
    
    const handlers = this.handlers[type] || [];
    
    // Execute all handlers in parallel (simulating fan-out)
    const promises = handlers.map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`[EventBus] Handler failed for ${type}`, error);
        // In a real system: Send to DLQ (Dead Letter Queue)
        this.sendToDLQ(type, payload, error);
      }
    });

    await Promise.allSettled(promises);
  }

  private async sendToDLQ(type: string, payload: any, error: any) {
    logger.warn(`[EventBus] Sent to DLQ: ${type}`, { payload, error });
    await saveToDLQ(type, payload, error);
  }
}

export const eventBus = new EventBus();
