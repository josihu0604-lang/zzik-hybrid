/**
 * Analytics Funnel Tests (TST-018 continued)
 *
 * Tests for funnel tracking functionality:
 * - Funnel start/complete/abandon
 * - Step recording
 * - Session storage management
 * - Metadata handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startFunnel,
  recordFunnelStep,
  completeFunnel,
  abandonFunnel,
} from '@/lib/analytics/funnel';

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

  // Mock gtag
  window.gtag = vi.fn();
  window.dataLayer = [];

  mockSessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// FUNNEL START
// ============================================================================

describe('Funnel Start', () => {
  it('should start a funnel', () => {
    startFunnel('onboarding');

    const stored = mockSessionStorage.getItem('zzik_funnel_onboarding');
    expect(stored).toBeTruthy();

    const funnelData = JSON.parse(stored!);
    expect(funnelData.name).toBe('onboarding');
    expect(funnelData.startTime).toBeTypeOf('number');
    expect(funnelData.steps).toEqual([]);
  });

  it('should track funnel start event', () => {
    startFunnel('checkout');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_start',
      expect.objectContaining({
        event_category: 'funnel',
        event_label: 'checkout',
      })
    );
  });

  it('should allow multiple funnels', () => {
    startFunnel('funnel_a');
    startFunnel('funnel_b');

    expect(mockSessionStorage.getItem('zzik_funnel_funnel_a')).toBeTruthy();
    expect(mockSessionStorage.getItem('zzik_funnel_funnel_b')).toBeTruthy();
  });
});

// ============================================================================
// FUNNEL STEP RECORDING
// ============================================================================

describe('Funnel Step Recording', () => {
  it('should record funnel step', () => {
    startFunnel('participation');
    recordFunnelStep('participation', 1, 'view_popup');

    const stored = mockSessionStorage.getItem('zzik_funnel_participation');
    const funnelData = JSON.parse(stored!);

    expect(funnelData.steps).toHaveLength(1);
    expect(funnelData.steps[0]).toMatchObject({
      step: 1,
      name: 'view_popup',
    });
    expect(funnelData.steps[0].timestamp).toBeTypeOf('number');
  });

  it('should record multiple steps', () => {
    startFunnel('signup');
    recordFunnelStep('signup', 1, 'enter_email');
    recordFunnelStep('signup', 2, 'verify_email');
    recordFunnelStep('signup', 3, 'complete_profile');

    const stored = mockSessionStorage.getItem('zzik_funnel_signup');
    const funnelData = JSON.parse(stored!);

    expect(funnelData.steps).toHaveLength(3);
    expect(funnelData.steps[0].name).toBe('enter_email');
    expect(funnelData.steps[1].name).toBe('verify_email');
    expect(funnelData.steps[2].name).toBe('complete_profile');
  });

  it('should auto-start funnel if not started', () => {
    recordFunnelStep('auto_start', 1, 'first_step');

    const stored = mockSessionStorage.getItem('zzik_funnel_auto_start');
    expect(stored).toBeTruthy();

    const funnelData = JSON.parse(stored!);
    expect(funnelData.name).toBe('auto_start');
    expect(funnelData.steps).toHaveLength(1);
  });

  it('should record step with metadata', () => {
    startFunnel('purchase');
    recordFunnelStep('purchase', 1, 'add_to_cart', {
      product_id: '123',
      price: 99.99,
    });

    const stored = mockSessionStorage.getItem('zzik_funnel_purchase');
    const funnelData = JSON.parse(stored!);

    expect(funnelData.steps[0].metadata).toEqual({
      product_id: '123',
      price: 99.99,
    });
  });

  it('should track funnel step event', () => {
    startFunnel('test');
    recordFunnelStep('test', 2, 'second_step');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_step',
      expect.objectContaining({
        event_category: 'funnel',
        event_label: 'test_second_step',
        value: 2,
      })
    );
  });

  it('should include metadata in event params', () => {
    startFunnel('test');
    recordFunnelStep('test', 1, 'step_one', { custom: 'data' });

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_step',
      expect.objectContaining({
        funnel_name: 'test',
        step_name: 'step_one',
        custom: 'data',
      })
    );
  });
});

// ============================================================================
// FUNNEL COMPLETION
// ============================================================================

describe('Funnel Completion', () => {
  it('should complete funnel and remove from storage', () => {
    startFunnel('complete_test');
    recordFunnelStep('complete_test', 1, 'step_1');
    recordFunnelStep('complete_test', 2, 'step_2');

    completeFunnel('complete_test');

    const stored = mockSessionStorage.getItem('zzik_funnel_complete_test');
    expect(stored).toBeNull();
  });

  it('should track completion event with duration', () => {
    startFunnel('duration_test');

    // Small delay to ensure duration > 0
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait
    }

    completeFunnel('duration_test');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_complete',
      expect.objectContaining({
        event_category: 'funnel',
        event_label: 'duration_test',
        duration_ms: expect.any(Number),
      })
    );
  });

  it('should track steps completed', () => {
    startFunnel('steps_test');
    recordFunnelStep('steps_test', 1, 'one');
    recordFunnelStep('steps_test', 2, 'two');
    recordFunnelStep('steps_test', 3, 'three');

    completeFunnel('steps_test');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_complete',
      expect.objectContaining({
        value: 3,
        steps_completed: 3,
      })
    );
  });

  it('should handle completion of non-existent funnel', () => {
    expect(() => completeFunnel('non_existent')).not.toThrow();
  });
});

// ============================================================================
// FUNNEL ABANDONMENT
// ============================================================================

describe('Funnel Abandonment', () => {
  it('should abandon funnel and remove from storage', () => {
    startFunnel('abandon_test');
    recordFunnelStep('abandon_test', 1, 'step_1');

    abandonFunnel('abandon_test');

    const stored = mockSessionStorage.getItem('zzik_funnel_abandon_test');
    expect(stored).toBeNull();
  });

  it('should track abandonment event with last step', () => {
    startFunnel('last_step_test');
    recordFunnelStep('last_step_test', 1, 'first');
    recordFunnelStep('last_step_test', 2, 'second');

    abandonFunnel('last_step_test');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_abandon',
      expect.objectContaining({
        event_category: 'funnel',
        event_label: 'last_step_test',
        value: 2,
        last_step: 'second',
      })
    );
  });

  it('should track abandonment with reason', () => {
    startFunnel('reason_test');
    recordFunnelStep('reason_test', 1, 'start');

    abandonFunnel('reason_test', 'user_timeout');

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'funnel_abandon',
      expect.objectContaining({
        abandon_reason: 'user_timeout',
      })
    );
  });

  it('should handle abandonment with no steps', () => {
    startFunnel('no_steps');

    expect(() => abandonFunnel('no_steps')).not.toThrow();
  });

  it('should handle abandonment of non-existent funnel', () => {
    expect(() => abandonFunnel('non_existent')).not.toThrow();
  });
});

// ============================================================================
// INTEGRATION SCENARIOS
// ============================================================================

describe('Funnel Integration Scenarios', () => {
  it('should track complete onboarding funnel', () => {
    startFunnel('onboarding');
    recordFunnelStep('onboarding', 1, 'welcome');
    recordFunnelStep('onboarding', 2, 'profile_setup');
    recordFunnelStep('onboarding', 3, 'preferences');
    completeFunnel('onboarding');

    // Should have called gtag 5 times: start + 3 steps + complete
    expect(window.gtag).toHaveBeenCalledTimes(5);
  });

  it('should track abandoned participation funnel', () => {
    startFunnel('participation');
    recordFunnelStep('participation', 1, 'view_popup', { popup_id: '123' });
    recordFunnelStep('participation', 2, 'click_participate');
    abandonFunnel('participation', 'auth_required');

    const calls = (window.gtag as ReturnType<typeof vi.fn>).mock.calls;
    const abandonCall = calls.find((call) => call[1] === 'funnel_abandon');

    expect(abandonCall).toBeTruthy();
    expect(abandonCall![2]).toMatchObject({
      abandon_reason: 'auth_required',
      last_step: 'click_participate',
    });
  });

  it('should handle multiple concurrent funnels', () => {
    startFunnel('funnel_a');
    startFunnel('funnel_b');

    recordFunnelStep('funnel_a', 1, 'a_step_1');
    recordFunnelStep('funnel_b', 1, 'b_step_1');

    recordFunnelStep('funnel_a', 2, 'a_step_2');
    recordFunnelStep('funnel_b', 2, 'b_step_2');

    completeFunnel('funnel_a');
    abandonFunnel('funnel_b');

    expect(mockSessionStorage.getItem('zzik_funnel_funnel_a')).toBeNull();
    expect(mockSessionStorage.getItem('zzik_funnel_funnel_b')).toBeNull();
  });
});
