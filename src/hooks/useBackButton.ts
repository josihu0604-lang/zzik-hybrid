'use client';

import { useEffect, useCallback, useRef } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { isAndroid } from '@/lib/platform';

// PluginListenerHandle 타입 정의 (Capacitor v6+)
interface PluginListenerHandle {
  remove: () => Promise<void>;
}

/**
 * Back button handler callback
 * @returns true to prevent default behavior, false to allow it
 */
export type BackButtonHandler = () => boolean | Promise<boolean>;

interface UseBackButtonOptions {
  /**
   * Custom back button handler
   * Return true to prevent default behavior
   */
  onBackButton?: BackButtonHandler;

  /**
   * Enable back button handling
   * @default true
   */
  enabled?: boolean;

  /**
   * Priority of this handler (higher = earlier execution)
   * @default 0
   */
  priority?: number;

  /**
   * Toast callback for exit confirmation message
   * Call with message to show "press again to exit" toast
   */
  onExitToast?: (message: string) => void;
}

interface UseBackButtonReturn {
  /**
   * Whether back button handling is active
   */
  isActive: boolean;

  /**
   * Manually trigger app exit (with confirmation)
   */
  exitApp: () => Promise<void>;
}

/**
 * Android Hardware Back Button Hook
 *
 * Features:
 * - Handles Android hardware back button
 * - Supports modal/sheet dismissal
 * - Confirms app exit when no history
 * - iOS: No-op (uses swipe back gesture)
 * - Web: Fallback to browser history
 *
 * @example
 * ```tsx
 * // Basic usage with toast
 * const toast = useToast();
 * useBackButton({
 *   onExitToast: toast.info
 * });
 *
 * // Custom handler for modal
 * const [isOpen, setIsOpen] = useState(false);
 * useBackButton({
 *   onBackButton: () => {
 *     if (isOpen) {
 *       setIsOpen(false);
 *       return true; // Prevent default
 *     }
 *     return false; // Allow default
 *   },
 *   onExitToast: toast.info
 * });
 * ```
 */
export function useBackButton(options: UseBackButtonOptions = {}): UseBackButtonReturn {
  const { onBackButton, enabled = true, priority = 0, onExitToast } = options;

  const handlerRef = useRef(onBackButton);
  const toastRef = useRef(onExitToast);
  const exitTimestampRef = useRef<number>(0);
  const EXIT_CONFIRMATION_TIMEOUT = 2000; // 2 seconds

  // Update refs when values change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    handlerRef.current = onBackButton;
  }, [onBackButton]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    toastRef.current = onExitToast;
  }, [onExitToast]);

  /**
   * Exit app with confirmation
   */
  const exitApp = useCallback(async () => {
    if (!isAndroid()) return;

    const now = Date.now();
    const timeSinceLastPress = now - exitTimestampRef.current;

    if (timeSinceLastPress < EXIT_CONFIRMATION_TIMEOUT) {
      // Double press within timeout - exit app
      try {
        await App.exitApp();
      } catch (error) {
        console.error('[BackButton] Failed to exit app:', error);
      }
    } else {
      // First press - save timestamp and show toast
      exitTimestampRef.current = now;

      // Show exit confirmation toast if callback provided
      if (toastRef.current) {
        toastRef.current('한번 더 누르면 앱이 종료됩니다');
      }
    }
  }, []);

  /**
   * Default back button behavior
   */
  const handleDefaultBack = useCallback(async () => {
    // Check if we can go back in browser history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // No history - confirm exit
      await exitApp();
    }
  }, [exitApp]);

  /**
   * Main back button handler
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only activate on Android native app
    if (!isAndroid() || !Capacitor.isNativePlatform() || !enabled) {
      return;
    }

    let listenerHandle: PluginListenerHandle | null = null;

    // Register listener
    const registerListener = async () => {
      listenerHandle = await App.addListener('backButton', async () => {
        try {
          // Execute custom handler if provided
          if (handlerRef.current) {
            const shouldPreventDefault = await handlerRef.current();
            if (shouldPreventDefault) {
              return; // Custom handler handled it
            }
          }

          // Default behavior
          await handleDefaultBack();
        } catch (error) {
          console.error('[BackButton] Error in handler:', error);
        }
      });
    };

    registerListener();

    // Cleanup listener on unmount
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [enabled, priority, handleDefaultBack]);

  /**
   * Web fallback: Handle browser back button
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only for web environment
    if (Capacitor.isNativePlatform() || !enabled) {
      return;
    }

    const handlePopState = async () => {
      try {
        if (handlerRef.current) {
          const shouldPreventDefault = await handlerRef.current();
          if (shouldPreventDefault) {
            // Push state back to prevent navigation
            window.history.pushState(null, '', window.location.href);
          }
        }
      } catch (error) {
        console.error('[BackButton] Error in web handler:', error);
      }
    };

    // Listen to popstate event
    window.addEventListener('popstate', handlePopState);

    // Push initial state to enable back detection
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]);

  return {
    isActive: isAndroid() && Capacitor.isNativePlatform() && enabled,
    exitApp,
  };
}

/**
 * Hook for modal/sheet back button handling
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * useModalBackButton(isOpen, () => setIsOpen(false));
 *
 * return <Modal open={isOpen} onClose={() => setIsOpen(false)}>...</Modal>
 * ```
 */
export function useModalBackButton(
  isOpen: boolean,
  onClose: () => void,
  priority: number = 100 // Higher priority than default
) {
  useBackButton({
    onBackButton: useCallback(() => {
      if (isOpen) {
        onClose();
        return true; // Prevent default
      }
      return false;
    }, [isOpen, onClose]),
    enabled: isOpen,
    priority,
  });
}

/**
 * Hook for preventing back navigation (e.g., during form submission)
 *
 * @example
 * ```tsx
 * const [isSubmitting, setIsSubmitting] = useState(false);
 *
 * usePreventBackButton(isSubmitting);
 * ```
 */
export function usePreventBackButton(prevent: boolean) {
  useBackButton({
    onBackButton: useCallback(() => {
      if (prevent) {
        // Silently prevent back navigation
        return true;
      }
      return false;
    }, [prevent]),
    enabled: prevent,
    priority: 200, // Highest priority
  });
}

export default useBackButton;
