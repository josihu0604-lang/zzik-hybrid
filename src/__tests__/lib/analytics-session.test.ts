/**
 * Analytics Session Tests (TST-018 continued)
 *
 * Tests for session tracking functionality:
 * - Session creation and management
 * - Activity tracking
 * - UTM parameter parsing
 * - Session timeout handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSession,
  updateSession,
  getSessionStats,
  SESSION_TIMEOUT,
} from '@/lib/analytics/session';

// ============================================================================
// SETUP & MOCKING
// ============================================================================

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  // Mock gtag and dataLayer
  window.gtag = vi.fn();
  window.dataLayer = [];

  // Mock document.referrer
  Object.defineProperty(document, 'referrer', {
    value: 'https://google.com',
    writable: true,
    configurable: true,
  });

  mockSessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// SESSION CREATION
// ============================================================================

describe('Session Creation', () => {
  it('should create new session', () => {
    const session = getSession();

    expect(session.sessionId).toBeTruthy();
    expect(session.startTime).toBeTypeOf('number');
    expect(session.pageViews).toBe(0);
    expect(session.events).toBe(0);
    expect(session.lastActivity).toBeTypeOf('number');
  });

  it('should generate unique session IDs', () => {
    mockSessionStorage.clear();
    const session1 = getSession();

    mockSessionStorage.clear();
    const session2 = getSession();

    expect(session1.sessionId).not.toBe(session2.sessionId);
  });

  it('should store session in sessionStorage', () => {
    getSession();

    const stored = mockSessionStorage.getItem('zzik_session');
    expect(stored).toBeTruthy();

    const sessionData = JSON.parse(stored!);
    expect(sessionData.sessionId).toBeTruthy();
  });

  it('should capture referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://facebook.com',
      writable: true,
    });

    const session = getSession();

    expect(session.referrer).toBe('https://facebook.com');
  });

  it('should track session start event', () => {
    getSession();

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'session_start',
      expect.objectContaining({
        event_category: 'session',
      })
    );
  });
});

// ============================================================================
// UTM PARAMETER PARSING
// ============================================================================

describe('UTM Parameter Parsing', () => {
  it('should parse UTM source', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=twitter&utm_medium=social&utm_campaign=spring2024',
      },
      writable: true,
    });

    const session = getSession();

    expect(session.source).toBe('twitter');
    expect(session.medium).toBe('social');
    expect(session.campaign).toBe('spring2024');
  });

  it('should handle missing UTM parameters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });

    const session = getSession();

    expect(session.source).toBeUndefined();
    expect(session.medium).toBeUndefined();
    expect(session.campaign).toBeUndefined();
  });

  it('should handle partial UTM parameters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=newsletter',
      },
      writable: true,
    });

    const session = getSession();

    expect(session.source).toBe('newsletter');
    expect(session.medium).toBeUndefined();
    expect(session.campaign).toBeUndefined();
  });

  it('should include UTM in session start event', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=instagram&utm_medium=story',
      },
      writable: true,
    });

    getSession();

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'session_start',
      expect.objectContaining({
        source: 'instagram',
        medium: 'story',
      })
    );
  });
});

// ============================================================================
// SESSION RETRIEVAL
// ============================================================================

describe('Session Retrieval', () => {
  it('should return existing session if valid', () => {
    const session1 = getSession();
    const session2 = getSession();

    expect(session1.sessionId).toBe(session2.sessionId);
  });

  it('should create new session if expired', () => {
    const session1 = getSession();

    // Modify stored session to be expired
    const stored = JSON.parse(mockSessionStorage.getItem('zzik_session')!);
    stored.lastActivity = Date.now() - SESSION_TIMEOUT - 1000;
    mockSessionStorage.setItem('zzik_session', JSON.stringify(stored));

    const session2 = getSession();

    expect(session1.sessionId).not.toBe(session2.sessionId);
  });

  it('should handle corrupted session data', () => {
    mockSessionStorage.setItem('zzik_session', 'invalid json');

    // Should create new session instead of throwing
    const session = getSession();
    expect(session.sessionId).toBeTruthy();
  });

  it('should work without document referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true,
      configurable: true,
    });

    const session = getSession();
    expect(session.sessionId).toBeTruthy();
  });
});

// ============================================================================
// SESSION UPDATES
// ============================================================================

describe('Session Updates', () => {
  it('should increment page views', () => {
    const session1 = getSession();
    expect(session1.pageViews).toBe(0);

    updateSession('pageview');

    const session2 = getSession();
    expect(session2.pageViews).toBe(1);
  });

  it('should increment events', () => {
    const session1 = getSession();
    expect(session1.events).toBe(0);

    updateSession('event');

    const session2 = getSession();
    expect(session2.events).toBe(1);
  });

  it('should update last activity timestamp', () => {
    const session1 = getSession();
    const firstActivity = session1.lastActivity;

    // Small delay
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait
    }

    updateSession('pageview');

    const session2 = getSession();
    expect(session2.lastActivity).toBeGreaterThan(firstActivity);
  });

  it('should track multiple page views', () => {
    getSession();

    updateSession('pageview');
    updateSession('pageview');
    updateSession('pageview');

    const session = getSession();
    expect(session.pageViews).toBe(3);
  });

  it('should track multiple events', () => {
    getSession();

    updateSession('event');
    updateSession('event');
    updateSession('event');
    updateSession('event');

    const session = getSession();
    expect(session.events).toBe(4);
  });

  it('should track mixed activity', () => {
    getSession();

    updateSession('pageview');
    updateSession('event');
    updateSession('pageview');
    updateSession('event');
    updateSession('event');

    const session = getSession();
    expect(session.pageViews).toBe(2);
    expect(session.events).toBe(3);
  });
});

// ============================================================================
// SESSION STATISTICS
// ============================================================================

describe('Session Statistics', () => {
  it('should return session duration', () => {
    getSession();

    // Small delay
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait
    }

    const stats = getSessionStats();

    expect(stats.duration).toBeGreaterThan(0);
    expect(stats.duration).toBeTypeOf('number');
  });

  it('should return page view count', () => {
    getSession();
    updateSession('pageview');
    updateSession('pageview');

    const stats = getSessionStats();

    expect(stats.pageViews).toBe(2);
  });

  it('should return event count', () => {
    getSession();
    updateSession('event');
    updateSession('event');
    updateSession('event');

    const stats = getSessionStats();

    expect(stats.events).toBe(3);
  });

  it('should return all stats', () => {
    getSession();
    updateSession('pageview');
    updateSession('event');

    const stats = getSessionStats();

    expect(stats).toHaveProperty('duration');
    expect(stats).toHaveProperty('pageViews');
    expect(stats).toHaveProperty('events');
    expect(stats.pageViews).toBe(1);
    expect(stats.events).toBe(1);
  });
});

// ============================================================================
// SESSION TIMEOUT
// ============================================================================

describe('Session Timeout', () => {
  it('should have 30 minute timeout', () => {
    expect(SESSION_TIMEOUT).toBe(30 * 60 * 1000);
  });

  it('should maintain session within timeout', () => {
    const session1 = getSession();

    // Update activity to prevent timeout
    updateSession('pageview');

    const session2 = getSession();
    expect(session1.sessionId).toBe(session2.sessionId);
  });

  it('should create new session after timeout', () => {
    const session1 = getSession();

    // Manually expire the session
    const stored = JSON.parse(mockSessionStorage.getItem('zzik_session')!);
    stored.lastActivity = Date.now() - SESSION_TIMEOUT - 1000;
    mockSessionStorage.setItem('zzik_session', JSON.stringify(stored));

    const session2 = getSession();

    expect(session1.sessionId).not.toBe(session2.sessionId);
  });
});

// ============================================================================
// INTEGRATION SCENARIOS
// ============================================================================

describe('Session Integration Scenarios', () => {
  it('should track complete user session', () => {
    // User arrives from campaign
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=email&utm_campaign=launch',
      },
      writable: true,
    });

    const session = getSession();

    // User views pages
    updateSession('pageview'); // Home
    updateSession('pageview'); // Popup detail
    updateSession('pageview'); // Map

    // User interacts
    updateSession('event'); // Click participate
    updateSession('event'); // Share

    const stats = getSessionStats();

    expect(session.source).toBe('email');
    expect(session.campaign).toBe('launch');
    expect(stats.pageViews).toBe(3);
    expect(stats.events).toBe(2);
    expect(stats.duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle session across multiple interactions', () => {
    getSession();

    // Simulate user activity over time
    for (let i = 0; i < 5; i++) {
      updateSession('pageview');
      updateSession('event');
    }

    const stats = getSessionStats();
    expect(stats.pageViews).toBe(5);
    expect(stats.events).toBe(5);
  });
});
