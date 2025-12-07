/**
 * Funnel Tracking
 *
 * Track user journey through multi-step funnels
 */

import type { FunnelStep } from './types';
import { trackEvent } from './ga4';
import { logAnalytics } from './ga4';

const FUNNEL_KEY = 'zzik_funnel';

interface FunnelData {
  name: string;
  startTime: number;
  steps: FunnelStep[];
}

/**
 * Start a funnel
 */
export function startFunnel(funnelName: string): void {
  const funnelData: FunnelData = {
    name: funnelName,
    startTime: Date.now(),
    steps: [],
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`${FUNNEL_KEY}_${funnelName}`, JSON.stringify(funnelData));
  }

  logAnalytics('funnel_start', { funnel: funnelName });

  trackEvent({
    action: 'funnel_start',
    category: 'funnel',
    label: funnelName,
  });
}

/**
 * Record funnel step
 */
export function recordFunnelStep(
  funnelName: string,
  stepNumber: number,
  stepName: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(`${FUNNEL_KEY}_${funnelName}`);
  if (!stored) {
    // Auto-start funnel if not started
    startFunnel(funnelName);
  }

  const funnelData: FunnelData = stored
    ? JSON.parse(stored)
    : { name: funnelName, startTime: Date.now(), steps: [] };

  const step: FunnelStep = {
    step: stepNumber,
    name: stepName,
    timestamp: Date.now(),
    metadata,
  };

  funnelData.steps.push(step);

  sessionStorage.setItem(`${FUNNEL_KEY}_${funnelName}`, JSON.stringify(funnelData));

  logAnalytics('funnel_step', { funnel: funnelName, step: stepNumber, name: stepName });

  trackEvent({
    action: 'funnel_step',
    category: 'funnel',
    label: `${funnelName}_${stepName}`,
    value: stepNumber,
    params: { funnel_name: funnelName, step_name: stepName, ...metadata },
  });
}

/**
 * Complete funnel
 */
export function completeFunnel(funnelName: string): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(`${FUNNEL_KEY}_${funnelName}`);
  if (!stored) return;

  const funnelData: FunnelData = JSON.parse(stored);
  const duration = Date.now() - funnelData.startTime;
  const stepsCompleted = funnelData.steps.length;

  logAnalytics('funnel_complete', {
    funnel: funnelName,
    duration,
    steps: stepsCompleted,
  });

  trackEvent({
    action: 'funnel_complete',
    category: 'funnel',
    label: funnelName,
    value: stepsCompleted,
    params: {
      funnel_name: funnelName,
      duration_ms: duration,
      steps_completed: stepsCompleted,
    },
  });

  // Cleanup
  sessionStorage.removeItem(`${FUNNEL_KEY}_${funnelName}`);
}

/**
 * Abandon funnel
 */
export function abandonFunnel(funnelName: string, reason?: string): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(`${FUNNEL_KEY}_${funnelName}`);
  if (!stored) return;

  const funnelData: FunnelData = JSON.parse(stored);
  const lastStep = funnelData.steps[funnelData.steps.length - 1];

  logAnalytics('funnel_abandon', {
    funnel: funnelName,
    lastStep: lastStep?.name,
    reason,
  });

  trackEvent({
    action: 'funnel_abandon',
    category: 'funnel',
    label: funnelName,
    value: lastStep?.step || 0,
    params: {
      funnel_name: funnelName,
      last_step: lastStep?.name,
      abandon_reason: reason,
    },
  });

  // Cleanup
  sessionStorage.removeItem(`${FUNNEL_KEY}_${funnelName}`);
}
