/**
 * Push Notification Permission Prompt
 *
 * A beautiful, non-intrusive prompt for requesting push notification permissions
 * Follows ZZIK Design System 2.0 (Linear + iOS 26 Liquid Glass)
 */

'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from '@/lib/motion';
import { Bell, X } from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
} from '@/lib/push-notifications';
import { savePreference, getPreference } from '@/lib/indexed-db';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'push-prompt-dismissed';
const COOLDOWN_DAYS = 7;

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const checkShouldShow = async () => {
      // Check if push is supported
      if (!isPushSupported()) {
        return;
      }

      // Check current permission
      const permission = getNotificationPermission();
      if (permission !== 'default') {
        // Already granted or denied
        return;
      }

      // Check if dismissed recently
      const dismissed = await getPreference<{ timestamp: number }>(STORAGE_KEY);
      if (dismissed) {
        const daysSinceDismiss = (Date.now() - dismissed.timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceDismiss < COOLDOWN_DAYS) {
          return;
        }
      }

      // Show prompt after 10 seconds
      const timer = setTimeout(() => {
        setVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    };

    checkShouldShow();
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);

    try {
      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        // Subscribe to push
        const subscription = await subscribeToPush();

        if (subscription) {
          // Send subscription to server
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });

          logger.info('Push notification subscribed successfully');
        }
      }

      setVisible(false);
    } catch (error) {
      logger.error(
        'Push notification enable failed',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = async () => {
    await savePreference(STORAGE_KEY, { timestamp: Date.now() });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          {/* Liquid Glass Card */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10"
            style={{
              background: 'rgba(18, 19, 20, 0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            {/* Content */}
            <div className="p-6 pt-5">
              {/* Icon */}
              <div
                className="inline-flex p-3 rounded-xl mb-4"
                style={{
                  background: 'rgba(255, 107, 91, 0.1)',
                  border: '1px solid rgba(255, 107, 91, 0.2)',
                }}
              >
                <Bell className="w-6 h-6 text-flame-500" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-2">알림 받기</h3>

              {/* Description */}
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                참여한 팝업 오픈 확정, 마감 임박 등<br />
                중요한 소식을 놓치지 마세요
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-white/70 hover:text-white transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  나중에
                </button>
                <button
                  onClick={handleEnable}
                  disabled={isRequesting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{
                    background: isRequesting
                      ? 'rgba(255, 107, 91, 0.5)'
                      : 'linear-gradient(135deg, #FF6B5B 0%, #CC4A3A 100%)',
                    boxShadow: isRequesting
                      ? 'none'
                      : '0 4px 12px rgba(255, 107, 91, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {isRequesting ? '요청 중...' : '알림 켜기'}
                </button>
              </div>
            </div>

            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 107, 91, 0.03) 0%, rgba(204, 74, 58, 0.03) 100%)',
              }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
