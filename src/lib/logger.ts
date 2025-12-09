/**
 * Production-ready Logger Utility
 * Features:
 * - JSON output in production (ELK/Datadog ready)
 * - Trace ID injection
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContextObject {
  module?: string;
  traceId?: string; // Distributed Tracing ID
  tags?: string[];
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogContext = LogContextObject | Record<string, any> | any;

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  // Production: Return JSON string for aggregation
  if (!isDevelopment) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    });
  }

  // Development: Human readable
  const timestamp = new Date().toISOString();
  const moduleName = context?.module ? `[${context.module}]` : '';
  const traceId = context?.traceId ? `(trace:${context.traceId})` : '';
  const tags = context?.tags?.length ? ` #${context.tags.join(' #')}` : '';

  return `${timestamp} ${level.toUpperCase()} ${moduleName}${traceId} ${message}${tags}`;
}

function getContextData(context?: LogContext): any {
  if (!context) return '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { module, traceId, tags, ...rest } = context as LogContextObject || {};
  return Object.keys(rest).length > 0 ? rest : '';
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (!isDevelopment) return;
    console.debug(formatMessage('debug', message, context), isDevelopment ? getContextData(context) : '');
  },

  info(message: string, context?: LogContext): void {
    // In production, info logs are valuable for tracing flow
    console.info(formatMessage('info', message, context), isDevelopment ? getContextData(context) : '');
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage('warn', message, context), isDevelopment ? getContextData(context) : '');
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    const fullContext = {
      ...context,
      error: errorDetails
    };

    console.error(formatMessage('error', message, fullContext));
  },
// ... scope implementation ...

  /**
   * Create a scoped logger for a specific module
   */
  scope(module: string) {
    return {
      debug: (message: string, context?: Omit<LogContext, 'module'>) =>
        logger.debug(message, { ...context, module }),
      info: (message: string, context?: Omit<LogContext, 'module'>) =>
        logger.info(message, { ...context, module }),
      warn: (message: string, context?: Omit<LogContext, 'module'>) =>
        logger.warn(message, { ...context, module }),
      error: (message: string, error?: unknown, context?: Omit<LogContext, 'module'>) =>
        logger.error(message, error, { ...context, module }),
    };
  },
};

export default logger;
