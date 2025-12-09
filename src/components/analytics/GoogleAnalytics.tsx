/**
 * Google Analytics Component
 *
 * Loads GA4 script and initializes tracking
 */

'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { initGA, trackPageView, trackPageLoadPerformance } from '@/lib/analytics';

// ============================================
// Configuration
// ============================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ============================================
// Security: GA ID Validation
// ============================================

/**
 * SEC-007 FIX: Validate Google Analytics Measurement ID format
 *
 * Valid formats:
 * - GA4: G-XXXXXXXXXX (10 alphanumeric characters after G-)
 * - UA: UA-XXXXXX-X (Universal Analytics, legacy)
 *
 * This prevents XSS attacks via malicious GA IDs.
 */
function isValidGaId(gaId: string | undefined): boolean {
  if (!gaId || typeof gaId !== 'string') {
    return false;
  }

  // GA4 format: G-XXXXXXXXXX
  const ga4Pattern = /^G-[A-Z0-9]{10,12}$/;

  // Universal Analytics format: UA-XXXXXX-X (legacy)
  const uaPattern = /^UA-\d{4,10}-\d{1,4}$/;

  // GTM format: GTM-XXXXXXX
  const gtmPattern = /^GTM-[A-Z0-9]{6,8}$/;

  return ga4Pattern.test(gaId) || uaPattern.test(gaId) || gtmPattern.test(gaId);
}

/**
 * SEC-007 FIX: Sanitize GA ID for safe use in script
 */
function sanitizeGaId(gaId: string): string {
  // Remove any characters that are not alphanumeric or dash
  return gaId.replace(/[^A-Za-z0-9-]/g, '');
}

// ============================================
// Page View Tracker
// ============================================

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (pathname) {
      const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

      // Track page view
      trackPageView(url, document.title);

      // Track page load performance (with delay to ensure metrics are available)
      setTimeout(trackPageLoadPerformance, 0);
    }
  }, [pathname, searchParams]);

  return null;
}

// ============================================
// Google Analytics Component
// ============================================

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || GA_MEASUREMENT_ID;

  // Initialize GA on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initGA();
  }, []);

  // Do not render script if no ID
  if (!gaId) {
    return (
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    );
  }

  // SEC-007 FIX: Validate GA ID format before using in script
  if (!isValidGaId(gaId)) {
    console.error(
      '[GoogleAnalytics] Invalid GA Measurement ID format:',
      gaId?.substring(0, 10) + '...'
    );
    return (
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    );
  }

  // SEC-007 FIX: Sanitize the GA ID
  const sanitizedGaId = sanitizeGaId(gaId);

  return (
    <>
      {/* GA4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${sanitizedGaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${sanitizedGaId}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
      {/* Page View Tracker */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// ============================================
// Analytics Provider (optional context)
// ============================================

export default GoogleAnalytics;
