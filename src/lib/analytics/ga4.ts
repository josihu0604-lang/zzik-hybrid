/**
 * Google Analytics 4 Integration
 *
 * Core GA4 initialization and tracking functions
 */

import type { GAEvent, ParticipationItem } from './types';

// ============================================
// Configuration
// ============================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const DEBUG_ANALYTICS = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true';

// ============================================
// Initialization
// ============================================

let isInitialized = false;

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  if (!GA_MEASUREMENT_ID) {
    if (DEBUG_ANALYTICS) {
      // eslint-disable-next-line no-console
      console.log('[Analytics] No GA_MEASUREMENT_ID, skipping GA init');
    }
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag as typeof window.gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    send_page_view: false, // Manual page view tracking
    debug_mode: DEBUG_ANALYTICS,
  });

  isInitialized = true;

  if (DEBUG_ANALYTICS) {
    // eslint-disable-next-line no-console
    console.log('[Analytics] GA4 initialized:', GA_MEASUREMENT_ID);
  }
}

/**
 * Log analytics event (development mode)
 */
export function logAnalytics(type: string, data: unknown): void {
  if (DEBUG_ANALYTICS || process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Analytics] ${type}:`, data);
  }
}

// ============================================
// Core Tracking Functions
// ============================================

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  logAnalytics('page_view', { path, title });

  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track custom event
 */
export function trackEvent({ action, category, label, value, params }: GAEvent): void {
  const eventData = {
    event_category: category,
    event_label: label,
    value,
    ...params,
  };

  logAnalytics('event', { action, ...eventData });

  if (window.gtag) {
    window.gtag('event', action, eventData);
  }
}

/**
 * Track user timing (performance)
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  const timingData = {
    event_category: category,
    name: variable,
    value: Math.round(value),
    event_label: label,
  };

  logAnalytics('timing', timingData);

  if (window.gtag) {
    window.gtag('event', 'timing_complete', timingData);
  }
}

/**
 * Track exception/error
 */
export function trackException(description: string, fatal = false): void {
  logAnalytics('exception', { description, fatal });

  if (window.gtag) {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  }
}

// ============================================
// E-commerce Tracking (for popup participation)
// ============================================

/**
 * Track popup view (like product view)
 */
export function trackPopupView(item: ParticipationItem): void {
  logAnalytics('view_item', item);

  if (window.gtag) {
    window.gtag('event', 'view_item', {
      items: [
        {
          item_id: item.popup_id,
          item_name: item.popup_name,
          item_brand: item.brand,
          item_category: item.category,
        },
      ],
    });
  }
}

/**
 * Track participation (like add to cart)
 */
export function trackParticipation(item: ParticipationItem): void {
  logAnalytics('participate', item);

  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'KRW',
      value: 0,
      items: [
        {
          item_id: item.popup_id,
          item_name: item.popup_name,
          item_brand: item.brand,
          item_category: item.category,
          quantity: 1,
        },
      ],
    });
  }

  // Also track as custom event
  trackEvent({
    action: 'participate',
    category: 'conversion',
    label: item.popup_name,
    params: { ...item },
  });
}

/**
 * Track check-in (like purchase)
 */
export function trackCheckin(item: ParticipationItem, verificationScore: number): void {
  logAnalytics('checkin', { ...item, score: verificationScore });

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `checkin_${item.popup_id}_${Date.now()}`,
      currency: 'KRW',
      value: verificationScore,
      items: [
        {
          item_id: item.popup_id,
          item_name: item.popup_name,
          item_brand: item.brand,
          item_category: item.category,
          quantity: 1,
        },
      ],
    });
  }

  // Also track as custom event
  trackEvent({
    action: 'checkin',
    category: 'conversion',
    value: verificationScore,
    params: { ...item },
  });
}

// ============================================
// User Identification
// ============================================

const USER_ID_KEY = 'zzik_user_id';

/**
 * Set user ID for tracking
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, userId);
  }

  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
    });
  }

  logAnalytics('user_id_set', { userId });
}

/**
 * Get stored user ID
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }

  logAnalytics('user_properties', properties);
}

export { GA_MEASUREMENT_ID, DEBUG_ANALYTICS };
