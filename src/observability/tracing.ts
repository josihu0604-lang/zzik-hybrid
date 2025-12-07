/**
 * Observability Infrastructure for Agent System
 * Implements tracing and metrics using OpenTelemetry patterns
 */

/**
 * Tracer for distributed tracing
 * In production, use @opentelemetry/api
 */
export class AgentTracer {
  private spans: Map<string, Span> = new Map();

  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: Record<string, any>): Span {
    const span = new Span(name, attributes);
    this.spans.set(span.id, span);
    return span;
  }

  /**
   * Get active spans
   */
  getActiveSpans(): Span[] {
    return Array.from(this.spans.values()).filter((s) => !s.ended);
  }

  /**
   * Get completed spans
   */
  getCompletedSpans(): Span[] {
    return Array.from(this.spans.values()).filter((s) => s.ended);
  }
}

/**
 * Span for tracing
 */
export class Span {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  status: { code: number; message?: string };
  ended: boolean = false;

  constructor(name: string, attributes?: Record<string, any>) {
    this.id = `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.startTime = Date.now();
    this.attributes = attributes || {};
    this.status = { code: 0 }; // UNSET
  }

  /**
   * Set span attributes
   */
  setAttributes(attributes: Record<string, any>): void {
    Object.assign(this.attributes, attributes);
  }

  /**
   * Set span status
   */
  setStatus(code: number, message?: string): void {
    this.status = { code, message };
  }

  /**
   * End the span
   */
  end(): void {
    this.endTime = Date.now();
    this.ended = true;
  }

  /**
   * Get span duration
   */
  getDuration(): number | undefined {
    return this.endTime ? this.endTime - this.startTime : undefined;
  }
}

/**
 * Trace agent execution with automatic span management
 */
export async function traceAgentExecution<T>(
  name: string,
  fn: () => Promise<T>,
  tracer: AgentTracer = new AgentTracer()
): Promise<T> {
  const span = tracer.startSpan(name);

  try {
    const result = await fn();
    span.setStatus(1); // OK
    return result;
  } catch (error) {
    span.setStatus(2, String(error)); // ERROR
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Metrics collector
 */
export class AgentMetrics {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Increment a counter
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Record histogram value
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  /**
   * Get counter value
   */
  getCounter(name: string, labels?: Record<string, string>): number {
    const key = this.getMetricKey(name, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(
    name: string,
    labels?: Record<string, string>
  ): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key);

    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): {
    counters: Record<string, number>;
    histograms: Record<string, number[]>;
  } {
    return {
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
    };
  }

  /**
   * Create metric key from name and labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
  }
}

/**
 * Global metrics instance
 */
export const agentMetrics = new AgentMetrics();

/**
 * Metric names for common agent operations
 */
export const METRIC_NAMES = {
  TASKS_TOTAL: 'agent.tasks.total',
  TASKS_DURATION: 'agent.tasks.duration',
  TASKS_FAILED: 'agent.tasks.failed',
  TOKENS_USED: 'agent.tokens.used',
  TOOLS_EXECUTED: 'agent.tools.executed',
  TOOLS_FAILED: 'agent.tools.failed',
  API_CALLS: 'agent.api.calls',
  API_ERRORS: 'agent.api.errors',
};

/**
 * Helper to track task execution with metrics
 */
export async function trackTaskExecution<T>(taskType: string, fn: () => Promise<T>): Promise<T> {
  const startTime = Date.now();

  agentMetrics.incrementCounter(METRIC_NAMES.TASKS_TOTAL, 1, { type: taskType });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    agentMetrics.recordHistogram(METRIC_NAMES.TASKS_DURATION, duration, { type: taskType });

    return result;
  } catch (error) {
    agentMetrics.incrementCounter(METRIC_NAMES.TASKS_FAILED, 1, { type: taskType });
    throw error;
  }
}

/**
 * Helper to track tool execution with metrics
 */
export async function trackToolExecution<T>(toolName: string, fn: () => Promise<T>): Promise<T> {
  agentMetrics.incrementCounter(METRIC_NAMES.TOOLS_EXECUTED, 1, { tool: toolName });

  try {
    return await fn();
  } catch (error) {
    agentMetrics.incrementCounter(METRIC_NAMES.TOOLS_FAILED, 1, { tool: toolName });
    throw error;
  }
}
