/**
 * Production-ready Logger Utility
 *
 * Features:
 * - Environment-aware logging (dev vs prod)
 * - Structured log format
 * - Log levels (debug, info, warn, error)
 * - Optional context/tags
 *
 * In production:
 * - Suppresses debug and info logs
 * - Only shows warn and error
 * - Structured format for log aggregation
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContextObject {
  /** Module or component name */
  module?: string;
  /** Additional tags for filtering */
  tags?: string[];
  /** Extra data to include */
  data?: Record<string, unknown>;
  /** Allow any additional properties for flexibility */
  [key: string]: unknown;
}

// Allow any type for context to support various use cases
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogContext = LogContextObject | Record<string, any> | any;

/**
 * Format log message with context
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const moduleName =
    context && typeof context === 'object' && 'module' in context ? `[${context.module}]` : '';
  const tags =
    context &&
    typeof context === 'object' &&
    'tags' in context &&
    Array.isArray(context.tags) &&
    context.tags.length
      ? ` #${context.tags.join(' #')}`
      : '';

  return `${timestamp} ${level.toUpperCase()} ${moduleName} ${message}${tags}`;
}

/**
 * Logger object with level-specific methods
 */
/**
 * Helper to extract data from context
 */
function getContextData(context?: LogContext): unknown {
  if (!context) return '';
  if (typeof context !== 'object') return context;
  if ('data' in context) return context.data;
  return context;
}

export const logger = {
  /**
   * Debug level - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (!isDevelopment) return;
    // eslint-disable-next-line no-console
    console.debug(formatMessage('debug', message, context), getContextData(context));
  },

  /**
   * Info level - only in development
   */
  info(message: string, context?: LogContext): void {
    if (!isDevelopment) return;
    // eslint-disable-next-line no-console
    console.info(formatMessage('info', message, context), getContextData(context));
  },

  /**
   * Warning level - always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage('warn', message, context), getContextData(context));
  },

  /**
   * Error level - always logged with full context
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    const contextData =
      context && typeof context === 'object' && 'data' in context ? context.data : {};

    console.error(formatMessage('error', message, context), {
      error: errorDetails,
      ...contextData,
    });
  },

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
