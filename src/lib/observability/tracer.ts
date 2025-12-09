
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Context for Observability
 * Stores trace ID and other metadata for the duration of the request.
 */

// In Next.js App Router, we pass traceId via headers/context
// This helper generates IDs consistent with OpenTelemetry W3C Trace Context

export function generateTraceId(): string {
  // Simple UUID for now, but should ideally match W3C format
  return uuidv4();
}

export function generateSpanId(): string {
  return uuidv4().split('-')[0]; // Short random string
}

export interface TraceContext {
  traceId: string;
  spanId: string;
}
