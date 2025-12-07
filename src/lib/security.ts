/**
 * ZZIK Security Utilities V1
 *
 * Provides cryptographic functions and security utilities for:
 * - RFC 6238 compliant TOTP generation (Time-Based One-Time Password)
 * - RFC 4226 compliant HOTP algorithm (HMAC-Based One-Time Password)
 * - Replay attack prevention using token hashing
 * - Input validation schemas
 * - Secure logging with PII redaction
 * - GPS spoofing detection hints
 *
 * Standards Compliance:
 * - RFC 6238: TOTP: Time-Based One-Time Password Algorithm
 *   https://tools.ietf.org/html/rfc6238
 * - RFC 4226: HOTP: An HMAC-Based One-Time Password Algorithm
 *   https://tools.ietf.org/html/rfc4226
 * - OWASP Secure Coding Practices
 *   https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/
 */

import * as nodeCrypto from 'crypto';

// ============================================================================
// TOTP (Time-based One-Time Password) - RFC 6238 Compliant
// ============================================================================

const TOTP_WINDOW_SECONDS = 30;
const TOTP_DIGITS = 6;

/**
 * Convert string to Uint8Array
 */
function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Generate HMAC-SHA256 signature
 * Uses Web Crypto API for cryptographic strength
 *
 * @description
 * Implements HMAC (Hash-based Message Authentication Code) using SHA-256.
 * HMAC is defined in RFC 2104: https://tools.ietf.org/html/rfc2104
 *
 * Algorithm (simplified):
 * 1. HMAC(K, m) = H((K ⊕ opad) || H((K ⊕ ipad) || m))
 * 2. Where H is SHA-256, K is key, m is message
 * 3. opad = 0x5c repeated, ipad = 0x36 repeated
 *
 * Web Crypto API handles the implementation details securely.
 *
 * @param key - Secret key as byte array
 * @param message - Message to authenticate as byte array
 * @returns HMAC-SHA256 signature (32 bytes)
 */
async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message as unknown as ArrayBuffer);
  return new Uint8Array(signature);
}

/**
 * RFC 6238 compliant TOTP generation
 * Uses HMAC-SHA256 for cryptographic strength
 *
 * @description
 * Generates Time-Based One-Time Password according to RFC 6238.
 * TOTP is an extension of HOTP (RFC 4226) that uses time as the moving factor.
 *
 * Algorithm Steps (RFC 6238 Section 4):
 * 1. T = (Current Unix time - T0) / Time Step
 *    - T0 = 0 (Unix epoch)
 *    - Time Step = 30 seconds
 * 2. TOTP = HOTP(K, T) where K is the secret key
 * 3. HOTP uses HMAC-SHA256 with dynamic truncation
 *
 * Dynamic Truncation (RFC 4226 Section 5.3):
 * 1. Get offset from last 4 bits of HMAC result
 * 2. Extract 4 bytes starting at offset
 * 3. Convert to 31-bit integer (MSB masked for positive value)
 * 4. Apply modulo 10^digits to get final OTP
 *
 * Security Notes:
 * - Uses 30-second time windows for better usability
 * - SHA-256 provides stronger security than SHA-1 (RFC 6238 allows this)
 * - 6-digit codes provide 10^6 = 1,000,000 possible values per window
 *
 * @param secret - Shared secret key (should be high-entropy random string)
 * @param timestamp - Unix timestamp in milliseconds (defaults to now)
 * @returns 6-digit OTP as zero-padded string (e.g., "012345")
 *
 * @see RFC 6238: https://tools.ietf.org/html/rfc6238
 * @see RFC 4226: https://tools.ietf.org/html/rfc4226
 */
export async function generateSecureTOTP(
  secret: string,
  timestamp: number = Date.now()
): Promise<string> {
  // Calculate time counter (30-second windows)
  const counter = Math.floor(timestamp / 1000 / TOTP_WINDOW_SECONDS);

  // Convert counter to 8-byte big-endian (RFC 4226 requires this format)
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  // Generate HMAC
  const secretBytes = stringToBytes(secret);
  const hmac = await hmacSha256(secretBytes, counterBytes);

  // Dynamic truncation (RFC 4226 Section 5.3)
  // Extract offset from last 4 bits of HMAC
  const offset = hmac[hmac.length - 1] & 0x0f;
  // Extract 4 bytes at offset and convert to 31-bit integer
  // MSB is masked (& 0x7f) to ensure positive number
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  // Generate 6-digit OTP by taking modulo 10^6
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verify TOTP with timing tolerance
 * Allows current window + 1 previous window (60 seconds total)
 */
export async function verifySecureTOTP(
  submittedCode: string,
  secret: string,
  timestamp: number = Date.now()
): Promise<{ valid: boolean; windowOffset: number }> {
  // Check current window
  const currentOTP = await generateSecureTOTP(secret, timestamp);
  if (constantTimeEqual(submittedCode, currentOTP)) {
    return { valid: true, windowOffset: 0 };
  }

  // Check previous window (-30s)
  const prevOTP = await generateSecureTOTP(secret, timestamp - TOTP_WINDOW_SECONDS * 1000);
  if (constantTimeEqual(submittedCode, prevOTP)) {
    return { valid: true, windowOffset: -1 };
  }

  return { valid: false, windowOffset: 0 };
}

// ============================================================================
// Replay Attack Prevention
// ============================================================================

interface UsedToken {
  // SEC-014 FIX: Store hashed token instead of plaintext
  // Tokens are hashed before storage to prevent memory dump attacks
  hashedKey: string;
  usedAt: number;
}

// In-memory store for used tokens (production should use Redis)
const usedTokensStore = new Map<string, UsedToken>();
const TOKEN_EXPIRY_MS = 120000; // 2 minutes (covers 2 TOTP windows + buffer)

/**
 * SEC-014 FIX: Hash token key for secure storage
 * Uses SHA-256 hash to prevent plaintext token exposure in memory
 */
async function hashTokenKey(code: string, storeId: string, userId: string): Promise<string> {
  const key = `${storeId}:${userId}:${code}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash for backward compatibility (less secure, uses simple hash)
 * Used when async is not available
 */
function hashTokenKeySync(code: string, storeId: string, userId: string): string {
  const key = `${storeId}:${userId}:${code}`;
  // Simple hash for sync operations (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i);
  }
  return `sync_${(hash >>> 0).toString(16)}`;
}

/**
 * Check if a TOTP code has already been used
 * Prevents replay attacks by tracking used codes per user/store
 */
export function isTokenUsed(code: string, storeId: string, userId: string): boolean {
  cleanupExpiredTokens();

  // Use sync hash for backward compatibility
  const hashedKey = hashTokenKeySync(code, storeId, userId);
  return usedTokensStore.has(hashedKey);
}

/**
 * Check if a TOTP code has already been used (async version with secure hash)
 */
export async function isTokenUsedAsync(
  code: string,
  storeId: string,
  userId: string
): Promise<boolean> {
  cleanupExpiredTokens();

  const hashedKey = await hashTokenKey(code, storeId, userId);
  return usedTokensStore.has(hashedKey);
}

/**
 * Mark a TOTP code as used
 */
export function markTokenUsed(code: string, storeId: string, userId: string): void {
  // Use sync hash for backward compatibility
  const hashedKey = hashTokenKeySync(code, storeId, userId);
  usedTokensStore.set(hashedKey, {
    hashedKey,
    usedAt: Date.now(),
  });
}

/**
 * Mark a TOTP code as used (async version with secure hash)
 */
export async function markTokenUsedAsync(
  code: string,
  storeId: string,
  userId: string
): Promise<void> {
  const hashedKey = await hashTokenKey(code, storeId, userId);
  usedTokensStore.set(hashedKey, {
    hashedKey,
    usedAt: Date.now(),
  });
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [key, token] of usedTokensStore.entries()) {
    if (now - token.usedAt > TOKEN_EXPIRY_MS) {
      usedTokensStore.delete(key);
    }
  }
}

// ============================================================================
// Constant-Time Comparison
// ============================================================================

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * @description
 * Implements constant-time comparison to prevent timing side-channel attacks.
 * Critical for comparing security tokens, passwords, and other secrets.
 *
 * Timing Attack Vulnerability:
 * - Standard string comparison (===) returns early on first mismatch
 * - Attacker can measure response time to guess characters one by one
 * - Example: "abc123" vs "xyz789" fails immediately (fast)
 *            "abc123" vs "abc789" fails at 4th char (slower)
 *
 * Constant-Time Algorithm:
 * 1. Always perform same number of operations regardless of input
 * 2. Use bitwise XOR to compare each character
 * 3. Accumulate differences using bitwise OR
 * 4. Return true only if accumulated result is zero
 *
 * Security Notes:
 * - Length check still performs dummy work to maintain timing
 * - Uses XOR (^) and OR (|) which have constant time on modern CPUs
 * - Prevents compiler optimization that could break constant-time property
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 *
 * @see OWASP: https://owasp.org/www-community/vulnerabilities/Timing_attack
 * @see CWE-208: Observable Timing Discrepancy
 */
export function constantTimeEqual(a: string, b: string): boolean {
  // Length mismatch - still do work to maintain constant time
  if (a.length !== b.length) {
    // Compare against self to maintain similar timing
    let dummy = 0;
    for (let i = 0; i < a.length; i++) {
      dummy |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    // Use dummy to prevent optimization
    return dummy !== dummy; // Always false
  }

  // Constant-time comparison using bitwise operations
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================================================
// Input Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate GPS coordinates
 */
export function validateGPSCoordinates(
  lat: unknown,
  lng: unknown,
  accuracy?: unknown
): ValidationResult {
  const errors: string[] = [];

  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a valid number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push('Longitude must be a valid number');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (accuracy !== undefined) {
    if (typeof accuracy !== 'number' || isNaN(accuracy)) {
      errors.push('GPS accuracy must be a valid number');
    } else if (accuracy < 0 || accuracy > 10000) {
      errors.push('GPS accuracy must be between 0 and 10000 meters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate QR code format
 */
export function validateQRCode(code: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof code !== 'string') {
    errors.push('QR code must be a string');
    return { valid: false, errors };
  }

  // Check length (6-digit TOTP or store QR format)
  if (code.length < 6 || code.length > 100) {
    errors.push('QR code length must be between 6 and 100 characters');
  }

  // Check for injection attempts
  if (/[<>"';]/.test(code)) {
    errors.push('QR code contains invalid characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate store ID format
 */
export function validateStoreId(storeId: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof storeId !== 'string') {
    errors.push('Store ID must be a string');
    return { valid: false, errors };
  }

  // UUID or demo format
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const demoPattern = /^store-\d{3}$/;

  if (!uuidPattern.test(storeId) && !demoPattern.test(storeId)) {
    errors.push('Store ID must be a valid UUID or demo format (store-XXX)');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate check-in request body
 */
export interface CheckInValidation {
  storeId: string;
  userLat?: number;
  userLng?: number;
  userGpsAccuracy?: number;
  scannedQrCode?: string;
  receiptText?: string;
  receiptAmount?: number;
}

export function validateCheckInRequest(
  body: unknown
): ValidationResult & { data?: CheckInValidation } {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const data = body as Record<string, unknown>;

  // Required: storeId
  const storeIdValidation = validateStoreId(data.storeId);
  if (!storeIdValidation.valid) {
    errors.push(...storeIdValidation.errors);
  }

  // Optional: GPS coordinates
  if (data.userLat !== undefined || data.userLng !== undefined) {
    const gpsValidation = validateGPSCoordinates(data.userLat, data.userLng, data.userGpsAccuracy);
    if (!gpsValidation.valid) {
      errors.push(...gpsValidation.errors);
    }
  }

  // Optional: QR code
  if (data.scannedQrCode !== undefined) {
    const qrValidation = validateQRCode(data.scannedQrCode);
    if (!qrValidation.valid) {
      errors.push(...qrValidation.errors);
    }
  }

  // Optional: Receipt amount
  if (data.receiptAmount !== undefined) {
    if (typeof data.receiptAmount !== 'number' || data.receiptAmount < 0) {
      errors.push('Receipt amount must be a positive number');
    }
  }

  // Optional: Receipt text (sanitize for logging)
  if (data.receiptText !== undefined && typeof data.receiptText !== 'string') {
    errors.push('Receipt text must be a string');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      storeId: data.storeId as string,
      userLat: data.userLat as number | undefined,
      userLng: data.userLng as number | undefined,
      userGpsAccuracy: data.userGpsAccuracy as number | undefined,
      scannedQrCode: data.scannedQrCode as string | undefined,
      receiptText: data.receiptText as string | undefined,
      receiptAmount: data.receiptAmount as number | undefined,
    },
  };
}

// ============================================================================
// GPS Spoofing Detection Hints
// ============================================================================

export interface GPSSpoofingHints {
  suspiciousSpeed: boolean;
  inconsistentAccuracy: boolean;
  mockLocationDetected: boolean;
  riskScore: number; // 0-100
}

/**
 * Analyze GPS data for potential spoofing indicators
 * NOTE: Client-side mock location detection is more reliable
 * This is a secondary server-side check
 */
export function analyzeGPSSpoofing(
  currentLat: number,
  currentLng: number,
  previousLat?: number,
  previousLng?: number,
  previousTimestamp?: number,
  currentTimestamp?: number,
  reportedAccuracy?: number
): GPSSpoofingHints {
  let riskScore = 0;
  const hints: GPSSpoofingHints = {
    suspiciousSpeed: false,
    inconsistentAccuracy: false,
    mockLocationDetected: false,
    riskScore: 0,
  };

  // Check 1: Suspiciously perfect coordinates (too many decimal places often faked)
  const latStr = currentLat.toString();
  const lngStr = currentLng.toString();
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;

  // Real GPS typically has 6-8 decimal places
  if (latDecimals > 10 || lngDecimals > 10) {
    riskScore += 20;
  }

  // Check 2: Speed analysis (if previous location available)
  if (previousLat && previousLng && previousTimestamp && currentTimestamp) {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(currentLat - previousLat);
    const dLng = toRad(currentLng - previousLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(previousLat)) * Math.cos(toRad(currentLat)) * Math.sin(dLng / 2) ** 2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const timeDiffSeconds = (currentTimestamp - previousTimestamp) / 1000;
    if (timeDiffSeconds > 0) {
      const speedMs = distance / timeDiffSeconds;
      const speedKmh = speedMs * 3.6;

      // Suspiciously high speed (>200 km/h for walking check-in)
      if (speedKmh > 200) {
        hints.suspiciousSpeed = true;
        riskScore += 40;
      } else if (speedKmh > 50) {
        riskScore += 10;
      }
    }
  }

  // Check 3: Accuracy consistency
  if (reportedAccuracy !== undefined) {
    // Suspiciously perfect accuracy
    if (reportedAccuracy === 0 || reportedAccuracy < 1) {
      hints.inconsistentAccuracy = true;
      riskScore += 30;
    }
    // Or way too high accuracy for indoor
    if (reportedAccuracy > 500) {
      riskScore += 10;
    }
  }

  hints.riskScore = Math.min(100, riskScore);

  return hints;
}

// ============================================================================
// Secure Logging
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface SecureLogOptions {
  level: LogLevel;
  action: string;
  userId?: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Secure logging that redacts sensitive data
 */
export function secureLog(options: SecureLogOptions): void {
  const { level, action, userId, storeId, metadata } = options;

  // Only log in development or for errors
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && level === 'debug') {
    return; // Skip debug logs in production
  }

  // Redact sensitive data
  const redactedUserId = userId ? userId.substring(0, 8) + '...' : undefined;
  const redactedMetadata = metadata ? redactSensitiveData(metadata) : undefined;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    userId: redactedUserId,
    storeId,
    ...redactedMetadata,
  };

  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(JSON.stringify(logEntry));
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
  }
}

/**
 * Redact sensitive data from objects
 */
function redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'cookie', 'session'];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// Secure Random Token Generation
// ============================================================================

/**
 * Generate cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure store secret for TOTP
 */
export function generateStoreSecret(): string {
  return generateSecureToken(32); // 256-bit secret
}

// ============================================================================
// SEC-019: Timing-Safe String Comparison
// ============================================================================

/**
 * Constant-time string comparison to prevent timing attacks
 *
 * Uses Node.js crypto.timingSafeEqual for true constant-time comparison.
 * This prevents attackers from inferring secret values by measuring response times.
 *
 * @param a - First string to compare (e.g., provided API secret)
 * @param b - Second string to compare (e.g., expected API secret)
 * @returns true if strings are equal, false otherwise
 *
 * @see https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
 */
export function timingSafeCompare(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  // Early return for null/undefined - no timing leak since both cases are fast
  if (!a || !b) {
    return false;
  }

  try {
    // Use Node.js crypto for true constant-time comparison
    const aBuffer = Buffer.from(a, 'utf-8');
    const bBuffer = Buffer.from(b, 'utf-8');

    // Handle different lengths by padding to prevent timing leak
    if (aBuffer.length !== bBuffer.length) {
      const maxLen = Math.max(aBuffer.length, bBuffer.length);
      const paddedA = Buffer.alloc(maxLen, 0);
      const paddedB = Buffer.alloc(maxLen, 0);
      aBuffer.copy(paddedA);
      bBuffer.copy(paddedB);

      // Compare padded buffers AND check original lengths match
      return nodeCrypto.timingSafeEqual(paddedA, paddedB) && aBuffer.length === bBuffer.length;
    }

    return nodeCrypto.timingSafeEqual(aBuffer, bBuffer);
  } catch {
    // Fallback: If crypto is unavailable, perform manual constant-time comparison
    if (a.length !== b.length) {
      // Perform dummy comparison to ensure constant time
      let result = a.length ^ b.length;
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        result |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
      }
      // result will be non-zero, so return false
      return result === 0;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Verify internal API secret header
 *
 * @param request - Request object with headers
 * @returns true if the X-API-Secret header matches INTERNAL_API_SECRET
 */
export function verifyInternalApiSecret(request: Request): boolean {
  const apiSecret = request.headers.get('X-API-Secret');
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  return timingSafeCompare(apiSecret, expectedSecret);
}
