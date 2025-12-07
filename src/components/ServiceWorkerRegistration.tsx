'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered', { data: { scope: registration.scope } });
        })
        .catch((error) => {
          logger.error(
            'Service Worker registration failed',
            error instanceof Error ? error : new Error(String(error))
          );
        });
    }
  }, []);

  return null;
}
