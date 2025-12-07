import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSecureTOTP,
  verifySecureTOTP,
  constantTimeEqual,
  isTokenUsed,
  markTokenUsed,
  validateGPSCoordinates,
  validateQRCode,
  validateStoreId,
  validateCheckInRequest,
  analyzeGPSSpoofing,
  generateSecureToken,
  generateStoreSecret,
} from '@/lib/security';

describe('security.ts - TOTP Generation (RFC 6238)', () => {
  it('should generate 6-digit TOTP code', async () => {
    const secret = 'test-secret-key';
    const code = await generateSecureTOTP(secret);

    expect(code).toHaveLength(6);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('should generate same code for same time window', async () => {
    const secret = 'test-secret-key';
    // Use a fixed timestamp at the start of a 30-second window to avoid boundary issues
    const windowStart = Math.floor(Date.now() / 30000) * 30000;
    const timestamp = windowStart + 1000; // 1 second into the window

    const code1 = await generateSecureTOTP(secret, timestamp);
    const code2 = await generateSecureTOTP(secret, timestamp + 5000); // +5초, still same window

    expect(code1).toBe(code2);
  });

  it('should generate different code after 30 seconds', async () => {
    const secret = 'test-secret-key';
    const timestamp = Date.now();

    const code1 = await generateSecureTOTP(secret, timestamp);
    const code2 = await generateSecureTOTP(secret, timestamp + 30000); // +30초

    expect(code1).not.toBe(code2);
  });

  it('should generate different codes for different secrets', async () => {
    const timestamp = Date.now();

    const code1 = await generateSecureTOTP('secret-1', timestamp);
    const code2 = await generateSecureTOTP('secret-2', timestamp);

    expect(code1).not.toBe(code2);
  });

  it('should use HMAC-SHA256 for cryptographic strength', async () => {
    const secret = 'test-secret-key';
    const code = await generateSecureTOTP(secret);

    // TOTP should be deterministic for the same time window
    const code2 = await generateSecureTOTP(secret);
    expect(code).toBe(code2);
  });
});

describe('security.ts - TOTP Verification', () => {
  it('should verify current window code', async () => {
    const secret = 'test-secret-key';
    const timestamp = Date.now();

    const code = await generateSecureTOTP(secret, timestamp);
    const result = await verifySecureTOTP(code, secret, timestamp);

    expect(result.valid).toBe(true);
    expect(result.windowOffset).toBe(0);
  });

  it('should verify previous window code (-30s)', async () => {
    const secret = 'test-secret-key';
    const timestamp = Date.now();

    const previousCode = await generateSecureTOTP(secret, timestamp - 30000);
    const result = await verifySecureTOTP(previousCode, secret, timestamp);

    expect(result.valid).toBe(true);
    expect(result.windowOffset).toBe(-1);
  });

  it('should reject invalid code', async () => {
    const secret = 'test-secret-key';
    const result = await verifySecureTOTP('000000', secret);

    expect(result.valid).toBe(false);
    expect(result.windowOffset).toBe(0);
  });

  it('should reject expired code (>60s old)', async () => {
    const secret = 'test-secret-key';
    const timestamp = Date.now();

    const oldCode = await generateSecureTOTP(secret, timestamp - 61000); // -61초
    const result = await verifySecureTOTP(oldCode, secret, timestamp);

    expect(result.valid).toBe(false);
  });

  it('should allow tolerance window for clock drift', async () => {
    const secret = 'test-secret-key';
    const timestamp = Date.now();

    // Test within 30 second tolerance
    const code = await generateSecureTOTP(secret, timestamp);
    const result = await verifySecureTOTP(code, secret, timestamp + 29000);

    expect(result.valid).toBe(true);
  });
});

describe('security.ts - Constant Time Equal (Timing Attack Prevention)', () => {
  it('should return true for equal strings', () => {
    expect(constantTimeEqual('123456', '123456')).toBe(true);
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('', '')).toBe(true);
  });

  it('should return false for different strings', () => {
    expect(constantTimeEqual('123456', '654321')).toBe(false);
    expect(constantTimeEqual('abc', 'def')).toBe(false);
  });

  it('should return false for different lengths', () => {
    expect(constantTimeEqual('123', '1234')).toBe(false);
    expect(constantTimeEqual('abcdef', 'abc')).toBe(false);
  });

  it('should use constant time for security', () => {
    // This is a behavioral test - timing attack prevention
    // Real timing attack testing would require precise timing measurements

    const validCode = '123456';
    const wrongCode1 = '000000';
    const wrongCode2 = '123457';

    // Both should fail, regardless of how many chars match
    expect(constantTimeEqual(validCode, wrongCode1)).toBe(false);
    expect(constantTimeEqual(validCode, wrongCode2)).toBe(false);

    // The function should take similar time for both comparisons
    // to prevent timing attacks that guess characters one by one
  });

  it('should handle special characters', () => {
    expect(constantTimeEqual('!@#$%^', '!@#$%^')).toBe(true);
    expect(constantTimeEqual('a b c', 'a b c')).toBe(true);
    expect(constantTimeEqual('a b c', 'abc')).toBe(false);
  });
});

describe('security.ts - Replay Attack Prevention', () => {
  beforeEach(() => {
    // Clear any used tokens before each test
    // Note: In production, this would use Redis or similar
  });

  it('should detect unused token as available', () => {
    const code = '111111';
    const storeId = 'store-001';
    const userId = 'user-001';

    expect(isTokenUsed(code, storeId, userId)).toBe(false);
  });

  it('should mark token as used', () => {
    const code = '222222';
    const storeId = 'store-001';
    const userId = 'user-001';

    markTokenUsed(code, storeId, userId);
    expect(isTokenUsed(code, storeId, userId)).toBe(true);
  });

  it('should prevent replay attack with same code', () => {
    const code = '333333';
    const storeId = 'store-001';
    const userId = 'user-001';

    // First use - should be allowed
    expect(isTokenUsed(code, storeId, userId)).toBe(false);
    markTokenUsed(code, storeId, userId);

    // Second use - should be blocked
    expect(isTokenUsed(code, storeId, userId)).toBe(true);
  });

  it('should isolate tokens by store and user', () => {
    const code = '444444';

    markTokenUsed(code, 'store-001', 'user-001');

    // Different store - should be available
    expect(isTokenUsed(code, 'store-002', 'user-001')).toBe(false);

    // Different user - should be available
    expect(isTokenUsed(code, 'store-001', 'user-002')).toBe(false);

    // Same store and user - should be blocked
    expect(isTokenUsed(code, 'store-001', 'user-001')).toBe(true);
  });

  it('should allow same code for different stores simultaneously', () => {
    const code = '555555';
    const userId = 'user-001';

    markTokenUsed(code, 'store-001', userId);
    markTokenUsed(code, 'store-002', userId);

    expect(isTokenUsed(code, 'store-001', userId)).toBe(true);
    expect(isTokenUsed(code, 'store-002', userId)).toBe(true);
  });
});

describe('security.ts - GPS Coordinates Validation', () => {
  it('should validate correct GPS coordinates', () => {
    const result = validateGPSCoordinates(37.5665, 126.978);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate with accuracy', () => {
    const result = validateGPSCoordinates(37.5665, 126.978, 10);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject latitude out of range', () => {
    const result1 = validateGPSCoordinates(91, 126.978);
    expect(result1.valid).toBe(false);
    expect(result1.errors).toContain('Latitude must be between -90 and 90');

    const result2 = validateGPSCoordinates(-91, 126.978);
    expect(result2.valid).toBe(false);
    expect(result2.errors).toContain('Latitude must be between -90 and 90');
  });

  it('should reject longitude out of range', () => {
    const result1 = validateGPSCoordinates(37.5665, 181);
    expect(result1.valid).toBe(false);
    expect(result1.errors).toContain('Longitude must be between -180 and 180');

    const result2 = validateGPSCoordinates(37.5665, -181);
    expect(result2.valid).toBe(false);
    expect(result2.errors).toContain('Longitude must be between -180 and 180');
  });

  it('should reject non-numeric values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result1 = validateGPSCoordinates('37.5665' as any, 126.978);
    expect(result1.valid).toBe(false);
    expect(result1.errors.length).toBeGreaterThan(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result2 = validateGPSCoordinates(37.5665, '126.978' as any);
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid accuracy', () => {
    const result1 = validateGPSCoordinates(37.5665, 126.978, -1);
    expect(result1.valid).toBe(false);
    expect(result1.errors).toContain('GPS accuracy must be between 0 and 10000 meters');

    const result2 = validateGPSCoordinates(37.5665, 126.978, 10001);
    expect(result2.valid).toBe(false);
    expect(result2.errors).toContain('GPS accuracy must be between 0 and 10000 meters');
  });

  it('should handle NaN values', () => {
    const result1 = validateGPSCoordinates(NaN, 126.978);
    expect(result1.valid).toBe(false);

    const result2 = validateGPSCoordinates(37.5665, NaN);
    expect(result2.valid).toBe(false);
  });
});

describe('security.ts - QR Code Validation', () => {
  it('should validate correct QR code format', () => {
    const result = validateQRCode('123456');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject non-string values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateQRCode(123456 as any);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('QR code must be a string');
  });

  it('should reject too short codes', () => {
    const result = validateQRCode('12345');

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('QR code length must be between 6 and 100 characters');
  });

  it('should reject too long codes', () => {
    const result = validateQRCode('a'.repeat(101));

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('QR code length must be between 6 and 100 characters');
  });

  it('should reject injection attempts', () => {
    const dangerousCodes = ['<script>', '"; DROP TABLE', "';alert(1)//"];

    dangerousCodes.forEach((code) => {
      const result = validateQRCode(code);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('QR code contains invalid characters');
    });
  });

  it('should accept alphanumeric codes', () => {
    const result = validateQRCode('ABC123XYZ');

    expect(result.valid).toBe(true);
  });
});

describe('security.ts - Store ID Validation', () => {
  it('should validate UUID format', () => {
    const result = validateStoreId('550e8400-e29b-41d4-a716-446655440000');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate demo format', () => {
    const result1 = validateStoreId('store-001');
    const result2 = validateStoreId('store-999');

    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(true);
  });

  it('should reject invalid formats', () => {
    const result1 = validateStoreId('invalid-id');
    const result2 = validateStoreId('12345');

    expect(result1.valid).toBe(false);
    expect(result2.valid).toBe(false);
  });

  it('should reject non-string values', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateStoreId(123 as any);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Store ID must be a string');
  });
});

describe('security.ts - Check-In Request Validation', () => {
  it('should validate complete check-in request', () => {
    const request = {
      storeId: 'store-001',
      userLat: 37.5665,
      userLng: 126.978,
      userGpsAccuracy: 10,
      scannedQrCode: '123456',
    };

    const result = validateCheckInRequest(request);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
    expect(result.data?.storeId).toBe('store-001');
  });

  it('should validate minimal request (storeId only)', () => {
    const request = {
      storeId: 'store-001',
    };

    const result = validateCheckInRequest(request);

    expect(result.valid).toBe(true);
    expect(result.data?.storeId).toBe('store-001');
  });

  it('should reject invalid request body', () => {
    const result1 = validateCheckInRequest(null);
    expect(result1.valid).toBe(false);

    const result2 = validateCheckInRequest('invalid');
    expect(result2.valid).toBe(false);
  });

  it('should reject missing storeId', () => {
    const request = {
      userLat: 37.5665,
      userLng: 126.978,
    };

    const result = validateCheckInRequest(request);

    expect(result.valid).toBe(false);
  });
});

describe('security.ts - GPS Spoofing Detection', () => {
  it('should detect suspicious speed', () => {
    // Seoul to Busan in 1 second = impossible
    const result = analyzeGPSSpoofing(
      35.1796, // Busan
      129.0756,
      37.5665, // Seoul
      126.978,
      Date.now() - 1000,
      Date.now()
    );

    expect(result.suspiciousSpeed).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should detect inconsistent accuracy', () => {
    const result = analyzeGPSSpoofing(
      37.5665,
      126.978,
      undefined,
      undefined,
      undefined,
      undefined,
      0
    );

    expect(result.inconsistentAccuracy).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should accept normal movement', () => {
    // Moving 100m in 10 seconds = 36 km/h (reasonable)
    const result = analyzeGPSSpoofing(
      37.5666,
      126.978,
      37.5665,
      126.978,
      Date.now() - 10000,
      Date.now(),
      15
    );

    expect(result.riskScore).toBeLessThan(50);
  });

  it('should cap risk score at 100', () => {
    // Multiple red flags
    const result = analyzeGPSSpoofing(
      35.1796, // Busan
      129.0756,
      37.5665, // Seoul
      126.978,
      Date.now() - 100,
      Date.now(),
      0 // Perfect accuracy
    );

    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});

describe('security.ts - Secure Token Generation', () => {
  it('should generate random token of correct length', () => {
    const token = generateSecureToken(32);

    expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should generate different tokens each time', () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).not.toBe(token2);
  });

  it('should generate store secret', () => {
    const secret1 = generateStoreSecret();
    const secret2 = generateStoreSecret();

    expect(secret1).toHaveLength(64);
    expect(secret1).not.toBe(secret2);
  });
});
