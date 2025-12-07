/**
 * ZZIK Application Configuration
 *
 * Centralized configuration for all app settings.
 * Environment variables take precedence over defaults.
 *
 * QUA-021: Production Environment Validation
 * - Validates critical environment variables in production
 * - Prevents deployment with default/placeholder values
 * - Ensures security-critical configurations are set
 */

import { logger } from '@/lib/logger';

// =============================================================================
// Environment Detection
// =============================================================================

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// =============================================================================
// QUA-021: Production Environment Variable Validation
// =============================================================================

/**
 * Validates critical environment variables in production.
 * Throws error if required variables are missing or have placeholder values.
 *
 * Critical Variables (Production Only):
 * - NEXT_PUBLIC_SUPABASE_URL: Database connection
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Database authentication
 * - SUPABASE_SERVICE_ROLE_KEY: Admin operations
 *
 * Security Notes:
 * - Prevents accidental deployment with demo/dev credentials
 * - Fails fast during build/startup rather than at runtime
 * - Does not validate in development to allow flexibility
 */
function validateProductionEnv(): void {
  // Allow skipping validation for build/deploy scenarios
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    logger.warn('[Config] Skipping production environment validation (SKIP_ENV_VALIDATION=true)');
    return;
  }

  if (!isProduction) return;

  const errors: string[] = [];

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    supabaseUrl === 'your-project.supabase.co'
  ) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be set to a valid Supabase URL in production');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key' || supabaseAnonKey.length < 32) {
    errors.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY must be set to a valid Supabase anon key in production'
    );
  }

  if (
    !supabaseServiceKey ||
    supabaseServiceKey === 'placeholder-key' ||
    supabaseServiceKey.length < 32
  ) {
    errors.push(
      'SUPABASE_SERVICE_ROLE_KEY must be set to a valid Supabase service role key in production'
    );
  }

  // Check critical security settings
  if (process.env.ENABLE_DEMO_MODE === 'true') {
    errors.push('ENABLE_DEMO_MODE should be disabled (false) in production');
  }

  if (process.env.DISABLE_CSRF === 'true') {
    errors.push('CSRF protection should NOT be disabled in production');
  }

  // Check internal API secret (used for push/notification APIs)
  const internalApiSecret = process.env.INTERNAL_API_SECRET;
  if (!internalApiSecret || internalApiSecret.length < 32) {
    errors.push(
      'INTERNAL_API_SECRET must be set (min 32 chars) for secure internal API communication'
    );
  }

  // Check base URL configuration
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl || baseUrl === 'http://localhost:3000' || baseUrl.includes('localhost')) {
    errors.push('NEXT_PUBLIC_BASE_URL must be set to the production domain (not localhost)');
  }

  // If any errors, throw to prevent deployment
  if (errors.length > 0) {
    throw new Error(
      `[QUA-021] Production Environment Validation Failed:\n\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n` +
        'Please set all required environment variables before deploying to production.\n' +
        'See .env.example for reference.'
    );
  }

  // Log successful validation
  logger.info('[Config] Production environment variables validated successfully');
}

// Run validation on module load (during build/startup)
try {
  validateProductionEnv();
} catch (error) {
  // In production, this will prevent the app from starting
  if (isProduction) {
    logger.error('[Config] Production environment validation failed', error);
    throw error;
  }
  // In development, just warn
  if (isDevelopment) {
    logger.warn('[Config] Skipping production validation in development mode');
  }
}

// =============================================================================
// App Settings
// =============================================================================

export const appConfig = {
  name: 'ZZIK',
  tagline: '참여하면 열린다',
  description: 'Popup Crowdfunding Platform',
  version: process.env.npm_package_version || '0.1.0',

  // URLs
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',

  // Features
  features: {
    demoMode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true',
    guestParticipation: process.env.ALLOW_GUEST_PARTICIPATION === 'true',
    analytics: process.env.NEXT_PUBLIC_GA_ID !== undefined,
    pushNotifications: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY !== undefined,
  },
} as const;

// =============================================================================
// Rate Limiting
// =============================================================================

export const rateLimitConfig = {
  // Default limits
  defaultLimit: parseInt(process.env.RATE_LIMIT_DEFAULT || '100', 10),
  defaultWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),

  // API-specific limits
  api: {
    popup: { limit: 120, windowMs: 60000 },
    checkin: { limit: 10, windowMs: 60000 },
    leader: { limit: 60, windowMs: 60000 },
    auth: { limit: 5, windowMs: 60000 },
  },

  // Redis (distributed rate limiting)
  redis: {
    enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
} as const;

// =============================================================================
// Session & Analytics
// =============================================================================

/**
 * SEC-016 SECURITY NOTE: Session Configuration
 *
 * IMPORTANT: These timeout values are used for client-side UI hints (e.g., "session about to expire").
 * Server-side session validation MUST be enforced independently:
 *
 * 1. Supabase Auth: Session tokens have built-in expiry managed by Supabase
 *    - Access tokens expire in 1 hour by default
 *    - Refresh tokens expire based on project settings
 *    - See: https://supabase.com/docs/guides/auth/sessions
 *
 * 2. Additional server-side checks:
 *    - Validate session on each API request (see api-middleware.ts)
 *    - Check session.expires_at from Supabase auth response
 *    - Implement idle timeout tracking if needed
 *
 * 3. Never trust client-side timeout enforcement for security-critical operations
 *    - Use these values only for UX (showing countdown, auto-redirect)
 *    - Server MUST reject expired sessions regardless of client state
 *
 * TODO: Implement server-side session activity tracking:
 *   - Track last_activity timestamp in database
 *   - Validate activity within timeout window on each request
 *   - Invalidate session if idle too long
 */
export const sessionConfig = {
  timeout: parseInt(process.env.SESSION_TIMEOUT_MS || '1800000', 10), // 30 minutes (client-side hint only)
  cookieName: 'zzik_session',
  maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400', 10), // 24 hours (client-side hint only)
  // Server-side session validation is handled by Supabase Auth
  // See createServerSupabaseClient() in src/lib/supabase/server.ts
} as const;

export const analyticsConfig = {
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  debug: process.env.DEBUG_ANALYTICS === 'true',
  sampleRate: parseInt(process.env.ANALYTICS_SAMPLE_RATE || '100', 10),
} as const;

// =============================================================================
// Verification System
// =============================================================================

export const verificationConfig = {
  // GPS Settings
  gps: {
    maxRange: parseInt(process.env.GPS_MAX_RANGE_METERS || '100', 10),
    timeout: parseInt(process.env.GPS_TIMEOUT_MS || '10000', 10),
    highAccuracy: process.env.GPS_HIGH_ACCURACY !== 'false',
    maxAge: parseInt(process.env.GPS_MAX_AGE_MS || '60000', 10),
  },

  // QR/TOTP Settings
  qr: {
    windowSeconds: parseInt(process.env.TOTP_WINDOW_SECONDS || '30', 10),
    allowPrevious: process.env.TOTP_ALLOW_PREVIOUS !== 'false',
  },

  // Scoring
  scoring: {
    gpsMaxScore: 40,
    qrMaxScore: 40,
    receiptMaxScore: 20,
    passThreshold: parseInt(process.env.VERIFICATION_PASS_THRESHOLD || '60', 10),
  },

  // Anti-fraud
  antiFraud: {
    maxSpeedKmh: parseInt(process.env.MAX_TRAVEL_SPEED_KMH || '200', 10),
    minTimeBetweenCheckins: parseInt(process.env.MIN_CHECKIN_INTERVAL_MS || '300000', 10), // 5 minutes
  },
} as const;

// =============================================================================
// Leader System
// =============================================================================

export const leaderConfig = {
  tiers: {
    bronze: { minReferrals: 0, commissionRate: 0.05, name: 'Bronze' },
    silver: { minReferrals: 10, commissionRate: 0.08, name: 'Silver' },
    gold: { minReferrals: 50, commissionRate: 0.1, name: 'Gold' },
    platinum: { minReferrals: 100, commissionRate: 0.12, name: 'Platinum' },
    diamond: { minReferrals: 500, commissionRate: 0.15, name: 'Diamond' },
  },

  referralCode: {
    length: parseInt(process.env.REFERRAL_CODE_LENGTH || '8', 10),
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  },

  payouts: {
    minAmount: parseInt(process.env.MIN_PAYOUT_AMOUNT || '10000', 10), // KRW
    processingDays: parseInt(process.env.PAYOUT_PROCESSING_DAYS || '7', 10),
  },
} as const;

// =============================================================================
// UI Settings
// =============================================================================

export const uiConfig = {
  // Notifications
  notifications: {
    maxCount: parseInt(process.env.MAX_NOTIFICATIONS || '50', 10),
    autoHideMs: parseInt(process.env.NOTIFICATION_AUTO_HIDE_MS || '5000', 10),
  },

  // Animations
  animations: {
    enabled: process.env.DISABLE_ANIMATIONS !== 'true',
    reducedMotion: false, // Set dynamically based on user preference
  },

  // Haptics
  haptics: {
    enabled: process.env.DISABLE_HAPTICS !== 'true',
    patterns: {
      tap: 10,
      success: 20,
      warning: [30, 50, 30],
      error: [50, 100, 50],
      celebrate: [10, 20, 10, 20, 40],
    },
  },

  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
} as const;

// =============================================================================
// API Client
// =============================================================================

export const apiClientConfig = {
  timeout: parseInt(process.env.API_TIMEOUT_MS || '30000', 10),
  retries: parseInt(process.env.API_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.API_RETRY_DELAY_MS || '1000', 10),

  cache: {
    enabled: process.env.DISABLE_API_CACHE !== 'true',
    defaultTTL: parseInt(process.env.API_CACHE_TTL_MS || '60000', 10),
  },
} as const;

// =============================================================================
// Security
// =============================================================================

export const securityConfig = {
  csrf: {
    enabled: process.env.DISABLE_CSRF !== 'true',
    cookieName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    tokenLength: 32,
  },

  captcha: {
    enabled: !!process.env.CAPTCHA_SECRET_KEY,
    provider: process.env.CAPTCHA_PROVIDER || 'recaptcha',
    minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'),
  },

  kiosk: {
    enabled: !!process.env.KIOSK_API_KEY,
  },

  /**
   * Internal API Secret for server-to-server communication
   * Used by: push/subscribe, push/unsubscribe, notifications/schedule APIs
   */
  internalApi: {
    enabled: !!process.env.INTERNAL_API_SECRET,
    headerName: 'X-Internal-Secret',
  },

  /**
   * SEC-017: Concurrent Session Limit Configuration
   *
   * TODO: Implement concurrent session limiting to prevent:
   *   - Account sharing abuse
   *   - Session hijacking going undetected
   *   - Resource abuse from many simultaneous sessions
   *
   * Implementation approach:
   *   1. Track active sessions per user in database/Redis:
   *      - session_id, user_id, created_at, last_activity, device_info, ip_address
   *
   *   2. On login, check session count:
   *      - If count >= maxConcurrentSessions, either:
   *        a) Reject new login (strict mode)
   *        b) Invalidate oldest session (FIFO mode)
   *        c) Prompt user to choose which session to end
   *
   *   3. On each request, update last_activity timestamp
   *
   *   4. Periodic cleanup of stale sessions (last_activity > timeout)
   *
   * Database schema suggestion:
   *   CREATE TABLE user_sessions (
   *     id UUID PRIMARY KEY,
   *     user_id UUID REFERENCES auth.users(id),
   *     session_token_hash TEXT NOT NULL,
   *     device_info JSONB,
   *     ip_address INET,
   *     created_at TIMESTAMPTZ DEFAULT NOW(),
   *     last_activity TIMESTAMPTZ DEFAULT NOW(),
   *     expires_at TIMESTAMPTZ
   *   );
   */
  session: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10),
    // Not enforced yet - see TODO above
    enforceLimit: false,
  },
} as const;

// =============================================================================
// Debug Settings
// =============================================================================

export const debugConfig = {
  analytics: process.env.DEBUG_ANALYTICS === 'true',
  gemini: process.env.DEBUG_GEMINI === 'true',
  offline: process.env.DEBUG_OFFLINE === 'true',
  performance: process.env.DEBUG_PERFORMANCE === 'true',
  csrf: process.env.DEBUG_CSRF === 'true',
  verification: process.env.DEBUG_VERIFICATION === 'true',

  // Log levels
  logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'error'),
} as const;

// =============================================================================
// Type exports
// =============================================================================

export type AppConfig = typeof appConfig;
export type RateLimitConfig = typeof rateLimitConfig;
export type SessionConfig = typeof sessionConfig;
export type AnalyticsConfig = typeof analyticsConfig;
export type VerificationConfig = typeof verificationConfig;
export type LeaderConfig = typeof leaderConfig;
export type UIConfig = typeof uiConfig;
export type ApiClientConfig = typeof apiClientConfig;
export type SecurityConfig = typeof securityConfig;
export type DebugConfig = typeof debugConfig;
