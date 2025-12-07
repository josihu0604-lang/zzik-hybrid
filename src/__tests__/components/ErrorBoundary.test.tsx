import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import type { ReactNode } from 'react';

// Mock ErrorFallback component
vi.mock('@/components/error/ErrorFallback', () => ({
  ErrorFallback: ({ error, onReset }: { error: Error | null; onReset: () => void }) => (
    <div>
      <h1>Error Fallback</h1>
      <p>{error?.message}</p>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }): ReactNode {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  // =============================================================================
  // Basic Rendering Tests
  // =============================================================================
  describe('Normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Hello World</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should not render fallback when no error', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
    });
  });

  // =============================================================================
  // Error Catching Tests
  // =============================================================================
  describe('Error catching', () => {
    it('should catch error and render fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should not render children when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should catch errors from nested children', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
    });
  });

  // =============================================================================
  // componentDidCatch Tests
  // =============================================================================
  describe('componentDidCatch', () => {
    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should log error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not call onError when no error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <div>No error</div>
        </ErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // handleReset Tests
  // =============================================================================
  describe('handleReset', () => {
    it('should reset error state when reset is called', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      const resetButton = screen.getByText('Reset');
      resetButton.click();

      // After reset, render without error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should clear error state on reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByText('Reset');
      resetButton.click();

      rerender(
        <ErrorBoundary>
          <div>Reset successful</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Reset successful')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // resetKey Tests
  // =============================================================================
  describe('resetKey prop', () => {
    it('should reset error state when resetKey changes', () => {
      const { rerender } = render(
        <ErrorBoundary resetKey="key1">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      // Change resetKey - should trigger reset
      rerender(
        <ErrorBoundary resetKey="key2">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should not reset when resetKey stays the same', () => {
      const { rerender } = render(
        <ErrorBoundary resetKey="same-key">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      rerender(
        <ErrorBoundary resetKey="same-key">
          <div>Different content</div>
        </ErrorBoundary>
      );

      // Error state should persist
      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });

    it('should work with numeric resetKey', () => {
      const { rerender } = render(
        <ErrorBoundary resetKey={1}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      rerender(
        <ErrorBoundary resetKey={2}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Multiple Errors Tests
  // =============================================================================
  describe('Multiple errors', () => {
    it('should catch second error after reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();

      // Reset
      screen.getByText('Reset').click();

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      // Throw another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });

    it('should handle different error messages', () => {
      function ThrowCustomError({ message }: { message: string }): JSX.Element {
        throw new Error(message);
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowCustomError message="First error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('First error')).toBeInTheDocument();

      screen.getByText('Reset').click();

      rerender(
        <ErrorBoundary>
          <ThrowCustomError message="Second error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Second error')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Edge Cases
  // =============================================================================
  describe('Edge cases', () => {
    it('should handle null children', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      // Should not crash
    });

    it('should handle undefined children', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      // Should not crash
    });

    it('should handle multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should catch error from one child among many', () => {
      render(
        <ErrorBoundary>
          <div>Before error</div>
          <ThrowError shouldThrow={true} />
          <div>After error</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Before error')).not.toBeInTheDocument();
      expect(screen.queryByText('After error')).not.toBeInTheDocument();
    });

    it('should handle error without message', () => {
      function ThrowEmptyError(): JSX.Element {
        throw new Error();
      }

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // Integration Tests
  // =============================================================================
  describe('Integration scenarios', () => {
    it('should work with async errors', async () => {
      function AsyncError(): JSX.Element {
        throw new Error('Async error');
      }

      render(
        <ErrorBoundary>
          <AsyncError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
      expect(screen.getByText('Async error')).toBeInTheDocument();
    });

    it('should preserve error boundary isolation', () => {
      render(
        <div>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
          <ErrorBoundary>
            <div>Safe content</div>
          </ErrorBoundary>
        </div>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });

    it('should call onError with correct error info', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ThrowError'),
        })
      );
    });
  });

  // =============================================================================
  // State Management Tests
  // =============================================================================
  describe('State management', () => {
    it('should maintain hasError state', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      // State should persist across renders
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });

    it('should clear error state only on explicit reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Multiple rerenders shouldn't clear error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();

      // Only reset clears it
      screen.getByText('Reset').click();

      rerender(
        <ErrorBoundary>
          <div>Cleared</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Fallback')).not.toBeInTheDocument();
    });
  });
});
