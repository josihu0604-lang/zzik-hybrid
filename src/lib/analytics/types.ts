/**
 * Analytics Types
 *
 * Type definitions for the analytics module
 */

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  params?: Record<string, unknown>;
}

export interface FunnelStep {
  step: number;
  name: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  pageViews: number;
  events: number;
  lastActivity: number;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

export interface ParticipationItem {
  popup_id: string;
  popup_name: string;
  brand: string;
  category: string;
}

// GA4 gtag types
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}
