/**
 * useOnlineStatus Hook
 *
 * Detects and tracks user's online/offline status.
 * Useful for showing connection status and preventing API calls when offline.
 */

import { useState, useEffect } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
}

/**
 * Custom hook to detect online/offline status
 *
 * @returns Object with isOnline and isOffline flags
 *
 * @example
 * ```tsx
 * const { isOnline, isOffline } = useOnlineStatus();
 *
 * if (isOffline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Handler for online event
    const handleOnline = () => {
      setIsOnline(true);
      // Network restored - can add toast notification here if needed
    };

    // Handler for offline event
    const handleOffline = () => {
      setIsOnline(false);
      console.warn('🔴 Network connection lost');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

export default useOnlineStatus;
