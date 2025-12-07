'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';

/**
 * ErrorBoundary - React Error Boundary
 *
 * Catches JavaScript errors in child component tree
 * and displays a fallback UI instead of crashing.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Reset error state on key change */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // SEC-021 FIX: Only log detailed errors in development
    // In production, stack traces may reveal sensitive implementation details
    if (process.env.NODE_ENV === 'development') {
      // Development: Full error details for debugging
      console.error('[ErrorBoundary] Error caught:', error);
      console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    } else {
      // Production: Minimal logging, no stack traces
      // Use error reporting service (Sentry, etc.) for production debugging
      console.error('[ErrorBoundary] Error caught:', error.message);
      // Note: Component stack is NOT logged in production to prevent
      // exposure of internal component structure
    }

    // Callback for error reporting (let caller decide what to log)
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error reporting service (Sentry, etc.)
    // Production error reporting should be done through a secure service
    // that properly sanitizes and stores error information
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    // }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when resetKey changes
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.handleReset();
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
