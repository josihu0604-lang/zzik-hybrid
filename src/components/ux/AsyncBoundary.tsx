'use client';

import { Suspense, ReactNode, Component, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { colors, typography } from '@/lib/design-tokens';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * AsyncBoundary - 비동기 경계 컴포넌트
 *
 * Nielsen's Heuristics #1: Visibility of System Status
 * - 로딩, 에러 상태를 명확하게 표시
 *
 * React 18 Suspense + Error Boundary 통합
 * - 데이터 페칭 시 스켈레톤/로더 자동 표시
 * - 에러 발생 시 복구 UI 자동 표시
 */

// FallbackProps type for error fallback components
export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface AsyncBoundaryProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 로딩 폴백 */
  loadingFallback?: ReactNode;
  /** 에러 폴백 (렌더 함수) */
  errorFallback?: (props: FallbackProps) => ReactNode;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 에러 리셋 키 */
  resetKeys?: unknown[];
}

// ============================================================================
// Default Error Fallback
// ============================================================================

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${colors.error}15`,
          border: `1px solid ${colors.error}30`,
        }}
      >
        <AlertTriangle size={24} style={{ color: colors.error }} />
      </div>

      <h3
        className="font-semibold mb-2"
        style={{ color: colors.text.primary, fontSize: typography.fontSize.lg.size }}
      >
        문제가 발생했어요
      </h3>

      <p
        className="mb-4 max-w-xs"
        style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm.size }}
      >
        {error.message || '일시적인 오류가 발생했습니다.'}
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
        style={{
          background: `linear-gradient(135deg, ${colors.flame[500]} 0%, ${colors.ember[500]} 100%)`,
          color: 'white',
          fontSize: typography.fontSize.sm.size,
        }}
      >
        <RefreshCw size={16} />
        다시 시도
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// Simple Error Boundary (Class Component)
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface InternalErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: FallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

class InternalErrorBoundary extends Component<InternalErrorBoundaryProps, ErrorBoundaryState> {
  private prevResetKeys: unknown[] = [];

  constructor(props: InternalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.prevResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(): void {
    const { resetKeys = [] } = this.props;

    // Reset if any resetKey changed
    if (this.state.hasError) {
      const hasKeyChanged = resetKeys.some((key, index) => key !== this.prevResetKeys[index]);

      if (hasKeyChanged) {
        this.reset();
      }
    }

    this.prevResetKeys = resetKeys;
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback({ error, resetErrorBoundary: this.reset });
      }
      return <DefaultErrorFallback error={error} resetErrorBoundary={this.reset} />;
    }

    return children;
  }
}

// ============================================================================
// Default Loading Fallback
// ============================================================================

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size={32} accentColor={colors.flame[500]} />
    </div>
  );
}

// ============================================================================
// AsyncBoundary Component
// ============================================================================

export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  onError,
  resetKeys,
}: AsyncBoundaryProps) {
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('AsyncBoundary caught error:', error, info);
    onError?.(error, info);
  };

  return (
    <InternalErrorBoundary fallback={errorFallback} onError={handleError} resetKeys={resetKeys}>
      <Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>{children}</Suspense>
    </InternalErrorBoundary>
  );
}

// ============================================================================
// Suspenseful - Suspense 래퍼
// ============================================================================

interface SuspensefulProps {
  /** 자식 요소 */
  children: ReactNode;
  /** 폴백 */
  fallback?: ReactNode;
}

export function Suspenseful({ children, fallback }: SuspensefulProps) {
  return <Suspense fallback={fallback || <DefaultLoadingFallback />}>{children}</Suspense>;
}

// ============================================================================
// withAsyncBoundary HOC
// ============================================================================

interface WithAsyncBoundaryOptions {
  loadingFallback?: ReactNode;
  errorFallback?: (props: FallbackProps) => ReactNode;
}

export function withAsyncBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAsyncBoundaryOptions = {}
) {
  return function WithAsyncBoundaryWrapper(props: P) {
    return (
      <AsyncBoundary
        loadingFallback={options.loadingFallback}
        errorFallback={options.errorFallback}
      >
        <WrappedComponent {...props} />
      </AsyncBoundary>
    );
  };
}

// ============================================================================
// DataBoundary - 데이터 페칭 경계
// ============================================================================

interface DataBoundaryProps<T> {
  /** 데이터 */
  data: T | null | undefined;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 재시도 핸들러 */
  onRetry?: () => void;
  /** 로딩 폴백 */
  loadingFallback?: ReactNode;
  /** 빈 상태 폴백 */
  emptyFallback?: ReactNode;
  /** 에러 폴백 */
  errorFallback?: ReactNode;
  /** 자식 렌더 함수 */
  children: (data: NonNullable<T>) => ReactNode;
}

export function DataBoundary<T>({
  data,
  isLoading,
  error,
  onRetry,
  loadingFallback,
  emptyFallback,
  errorFallback,
  children,
}: DataBoundaryProps<T>) {
  // Loading state
  if (isLoading) {
    return <>{loadingFallback || <DefaultLoadingFallback />}</>;
  }

  // Error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <DefaultErrorFallback
        error={error}
        resetErrorBoundary={onRetry || (() => window.location.reload())}
      />
    );
  }

  // Empty state
  if (data === null || data === undefined) {
    if (emptyFallback) {
      return <>{emptyFallback}</>;
    }

    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm.size }}>
          데이터가 없습니다.
        </p>
      </div>
    );
  }

  // Render children with data
  return <>{children(data as NonNullable<T>)}</>;
}

// ============================================================================
// LoadingOverlay - 로딩 오버레이
// ============================================================================

interface LoadingOverlayProps {
  /** 표시 여부 */
  isLoading: boolean;
  /** 메시지 */
  message?: string;
  /** 배경 투명도 */
  opacity?: number;
  /** 전체 화면 */
  fullScreen?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message,
  opacity = 0.8,
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center ${
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
      }`}
      style={{ background: `rgba(8, 9, 10, ${opacity})` }}
    >
      <LoadingSpinner size={40} accentColor={colors.flame[500]} />
      {message && (
        <p
          className="mt-4"
          style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm.size }}
        >
          {message}
        </p>
      )}
    </motion.div>
  );
}

export default AsyncBoundary;
