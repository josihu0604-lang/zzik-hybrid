/**
 * Session Tracking
 *
 * Track user sessions and activity
 */

import type { SessionData } from './types';
import { trackEvent } from './ga4';

const SESSION_KEY = 'zzik_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create new session
 */
function createNewSession(): SessionData {
  const session: SessionData = {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    pageViews: 0,
    events: 0,
    lastActivity: Date.now(),
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  };

  // Parse UTM parameters
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    session.source = params.get('utm_source') || undefined;
    session.medium = params.get('utm_medium') || undefined;
    session.campaign = params.get('utm_campaign') || undefined;
  }

  saveSession(session);

  // Track session start
  trackEvent({
    action: 'session_start',
    category: 'session',
    params: {
      source: session.source,
      medium: session.medium,
      campaign: session.campaign,
    },
  });

  return session;
}

/**
 * Save session to storage
 */
function saveSession(session: SessionData): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get or create session
 */
export function getSession(): SessionData {
  if (typeof window === 'undefined') {
    return createNewSession();
  }

  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      const session: SessionData = JSON.parse(stored);

      // Check if session is still valid
      if (Date.now() - session.lastActivity < SESSION_TIMEOUT) {
        return session;
      }
    } catch (error) {
      // Invalid JSON, create new session
      console.error('[Session] Failed to parse session data:', error);
    }
  }

  // Create new session
  return createNewSession();
}

/**
 * Update session activity
 */
export function updateSession(type: 'pageview' | 'event'): void {
  const session = getSession();

  if (type === 'pageview') {
    session.pageViews++;
  } else {
    session.events++;
  }

  session.lastActivity = Date.now();
  saveSession(session);
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  duration: number;
  pageViews: number;
  events: number;
} {
  const session = getSession();
  return {
    duration: Date.now() - session.startTime,
    pageViews: session.pageViews,
    events: session.events,
  };
}

export { SESSION_TIMEOUT };
