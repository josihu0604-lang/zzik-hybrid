/**
 * useReferral Hook
 *
 * Handles referral tracking from URL parameters
 * - Captures ?ref=CODE from URL
 * - Stores referral info for attribution
 * - Tracks referral on participation
 *
 * Flow:
 * 1. User clicks referral link (zzik.kr/popup/xxx?ref=ZK8X4M2P)
 * 2. Hook captures the code and stores it
 * 3. When user participates, code is sent to API
 * 4. API records referral and attributes to leader
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Constants
const REFERRAL_STORAGE_KEY = 'zzik_referral';
const REFERRAL_EXPIRY_DAYS = 30;

export interface ReferralData {
  code: string;
  popupId?: string;
  capturedAt: number;
  source?: string;
}

export interface UseReferralOptions {
  /** Popup ID for context */
  popupId?: string;
  /** Auto-track referral to API */
  autoTrack?: boolean;
  /** Callback when referral is captured */
  onCapture?: (data: ReferralData) => void;
}

export interface UseReferralReturn {
  /** Current referral code */
  referralCode: string | null;
  /** Full referral data */
  referralData: ReferralData | null;
  /** Whether a referral code is present */
  hasReferral: boolean;
  /** Track referral to API (for participation) */
  trackReferral: (popupId: string) => Promise<boolean>;
  /** Clear stored referral */
  clearReferral: () => void;
  /** Generate referral link for sharing */
  generateReferralLink: (code: string, popupId?: string) => string;
}

/**
 * Validate referral code format
 * Format: 8 uppercase alphanumeric characters
 */
function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z0-9]{8}$/i.test(code.trim());
}

/**
 * Get stored referral data from localStorage
 */
function getStoredReferral(): ReferralData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!stored) return null;

    const data: ReferralData = JSON.parse(stored);

    // Check expiry
    const expiryMs = REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - data.capturedAt > expiryMs) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Store referral data to localStorage
 */
function storeReferral(data: ReferralData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[useReferral] Failed to store referral:', error);
  }
}

/**
 * Clear stored referral data
 */
function clearStoredReferral(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Custom hook for referral tracking
 */
export function useReferral(options: UseReferralOptions = {}): UseReferralReturn {
  const { popupId, autoTrack = false, onCapture } = options;

  const searchParams = useSearchParams();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);

  // Extract referral code from URL on mount
  useEffect(() => {
    // Check URL parameter first
    const urlCode = searchParams.get('ref');

    if (urlCode && isValidReferralCode(urlCode)) {
      const data: ReferralData = {
        code: urlCode.toUpperCase(),
        popupId,
        capturedAt: Date.now(),
        source: 'url',
      };

      storeReferral(data);
      setReferralData(data);
      onCapture?.(data);

      // Auto-track if enabled
      if (autoTrack && popupId) {
        trackReferralToAPI(data.code, popupId);
      }

      return;
    }

    // Fall back to stored referral
    const stored = getStoredReferral();
    if (stored) {
      setReferralData(stored);
    }
  }, [searchParams, popupId, autoTrack, onCapture]);

  /**
   * Track referral to API
   */
  const trackReferralToAPI = async (code: string, targetPopupId: string): Promise<boolean> => {
    try {
      // Get CSRF token
      const csrfToken = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('csrf_token='))
        ?.split('=')[1];

      const response = await fetch('/api/leader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({
          action: 'track',
          referralCode: code,
          popupId: targetPopupId,
        }),
      });

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('[useReferral] Track failed:', error);
      return false;
    }
  };

  /**
   * Manual track referral
   */
  const trackReferral = useCallback(
    async (targetPopupId: string): Promise<boolean> => {
      if (!referralData?.code) return false;
      return trackReferralToAPI(referralData.code, targetPopupId);
    },
    [referralData]
  );

  /**
   * Clear stored referral
   */
  const clearReferral = useCallback(() => {
    clearStoredReferral();
    setReferralData(null);
  }, []);

  /**
   * Generate referral link
   */
  const generateReferralLink = useCallback((code: string, targetPopupId?: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zzik.kr';

    if (targetPopupId) {
      return `${baseUrl}/popup/${targetPopupId}?ref=${code}`;
    }

    return `${baseUrl}?ref=${code}`;
  }, []);

  return {
    referralCode: referralData?.code || null,
    referralData,
    hasReferral: !!referralData?.code,
    trackReferral,
    clearReferral,
    generateReferralLink,
  };
}

export default useReferral;
