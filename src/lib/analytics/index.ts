/**
 * Analytics Library
 *
 * Comprehensive analytics tracking with:
 * - Google Analytics 4 integration
 * - Custom event tracking
 * - Funnel analysis
 * - Session tracking
 * - Performance monitoring
 *
 * Barrel export for the analytics module
 */

// Types
export type { GAEvent, FunnelStep, SessionData, ParticipationItem } from './types';

// GA4 Core
export {
  initGA,
  trackPageView,
  trackEvent,
  trackTiming,
  trackException,
  trackPopupView,
  trackParticipation,
  trackCheckin,
  setUserId,
  getUserId,
  setUserProperties,
  logAnalytics,
} from './ga4';

// Funnel Tracking
export { startFunnel, recordFunnelStep, completeFunnel, abandonFunnel } from './funnel';

// Session Tracking
export { getSession, updateSession, getSessionStats } from './session';

// Performance Analytics
export {
  trackWebVital,
  trackPageLoadPerformance,
  trackResourceTiming,
  trackCustomTiming,
  startMark,
  endMark,
  trackApiTiming,
  getApiTimingStats,
  createTrackedFetch,
} from './performance';

// Import for Analytics object
import {
  trackPageView,
  trackEvent,
  trackPopupView,
  trackParticipation,
  trackCheckin,
  trackException,
} from './ga4';
import { startFunnel, recordFunnelStep, completeFunnel, abandonFunnel } from './funnel';
import {
  trackWebVital,
  trackPageLoadPerformance,
  trackApiTiming,
  getApiTimingStats,
} from './performance';
import type { ParticipationItem } from './types';

// ============================================
// Predefined Events
// ============================================

export const Analytics = {
  // Navigation
  pageView: (path: string, title?: string) => trackPageView(path, title),

  // Popup interaction
  popupView: (item: ParticipationItem) => trackPopupView(item),
  participate: (item: ParticipationItem) => trackParticipation(item),
  checkin: (item: ParticipationItem, score: number) => trackCheckin(item, score),

  // User engagement
  share: (method: string, popupId?: string) =>
    trackEvent({
      action: 'share',
      category: 'engagement',
      label: method,
      params: { popup_id: popupId },
    }),

  bookmark: (popupId: string, isAdding: boolean) =>
    trackEvent({
      action: isAdding ? 'bookmark_add' : 'bookmark_remove',
      category: 'engagement',
      params: { popup_id: popupId },
    }),

  search: (query: string, resultCount: number) =>
    trackEvent({
      action: 'search',
      category: 'engagement',
      label: query,
      value: resultCount,
    }),

  filter: (filterType: string, filterValue: string) =>
    trackEvent({
      action: 'filter',
      category: 'engagement',
      label: `${filterType}:${filterValue}`,
    }),

  // Auth events
  login: (method: string) =>
    trackEvent({
      action: 'login',
      category: 'auth',
      label: method,
    }),

  signup: (method: string) =>
    trackEvent({
      action: 'sign_up',
      category: 'auth',
      label: method,
    }),

  logout: () =>
    trackEvent({
      action: 'logout',
      category: 'auth',
    }),

  // Error tracking
  error: (errorType: string, message: string) => trackException(`${errorType}: ${message}`),

  // Funnel helpers
  funnel: {
    start: startFunnel,
    step: recordFunnelStep,
    complete: completeFunnel,
    abandon: abandonFunnel,
  },

  // Performance
  webVital: trackWebVital,
  pageLoad: trackPageLoadPerformance,
  apiTiming: trackApiTiming,
  apiStats: getApiTimingStats,
};

export default Analytics;
