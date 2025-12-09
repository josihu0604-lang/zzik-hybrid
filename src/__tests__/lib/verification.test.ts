import { describe, it, expect } from 'vitest';
import {
  generateTotpCode,
  verifyQrCode,
  performVerification,
  generateQrCodeData,
  getVerificationSummary,
  getMethodStatus,
  PASS_THRESHOLD,
  MAX_SCORES,
  QR_VALIDITY_SECONDS,
  TOTP_CODE_LENGTH,
  type VerificationOptions,
  type VerificationResult,
} from '@/lib/verification';
import type { Coordinates } from '@/lib/geo';

describe('verification.ts - TOTP Generation', () => {
  it('should generate 6-digit TOTP code', () => {
    const popupId = 'test-popup-001';
    const code = generateTotpCode(popupId);

    expect(code).toHaveLength(TOTP_CODE_LENGTH);
    expect(code).toMatch(/^\d{6}$/);
  });

  it('should generate same code for same time slot', () => {
    const popupId = 'test-popup-001';
    // Use a fixed timestamp at the start of a 30-second window
    const windowStart = Math.floor(Date.now() / 30000) * 30000;
    const timestamp = windowStart + 5000; // 5 seconds into the window

    const code1 = generateTotpCode(popupId, timestamp);
    const code2 = generateTotpCode(popupId, timestamp + 1000); // +1초, still same window

    expect(code1).toBe(code2);
  });

  it('should generate different code after 30 seconds', () => {
    const popupId = 'test-popup-001';
    const timestamp = Date.now();

    const code1 = generateTotpCode(popupId, timestamp);
    const code2 = generateTotpCode(popupId, timestamp + QR_VALIDITY_SECONDS * 1000);

    expect(code1).not.toBe(code2);
  });

  it('should generate different code for different popup IDs', () => {
    const timestamp = Date.now();

    const code1 = generateTotpCode('popup-001', timestamp);
    const code2 = generateTotpCode('popup-002', timestamp);

    expect(code1).not.toBe(code2);
  });

  it('should pad code with leading zeros', () => {
    const popupId = 'test-zero-padding';
    const code = generateTotpCode(popupId);

    // Should always be 6 digits even if number is small
    expect(code).toHaveLength(6);
    expect(parseInt(code, 10)).toBeGreaterThanOrEqual(0);
    expect(parseInt(code, 10)).toBeLessThan(1000000);
  });
});

describe('verification.ts - QR Code Verification', () => {
  it('should verify current valid code', () => {
    const popupId = 'test-popup-001';
    const timestamp = Date.now();
    const currentCode = generateTotpCode(popupId, timestamp);

    const result = verifyQrCode(currentCode, popupId, timestamp);

    expect(result.matched).toBe(true);
    expect(result.score).toBe(MAX_SCORES.qr);
    expect(result.expired).toBe(false);
  });

  it('should verify previous valid code (within window)', () => {
    const popupId = 'test-popup-001';
    const timestamp = Date.now();
    const previousCode = generateTotpCode(popupId, timestamp - QR_VALIDITY_SECONDS * 1000);

    const result = verifyQrCode(previousCode, popupId, timestamp);

    expect(result.matched).toBe(true);
    expect(result.score).toBe(MAX_SCORES.qr);
  });

  it('should reject invalid code', () => {
    const popupId = 'test-popup-001';
    const invalidCode = '000000';

    const result = verifyQrCode(invalidCode, popupId);

    expect(result.matched).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should reject expired code (2 windows old)', () => {
    const popupId = 'test-popup-001';
    const timestamp = Date.now();
    const oldCode = generateTotpCode(popupId, timestamp - QR_VALIDITY_SECONDS * 2 * 1000);

    const result = verifyQrCode(oldCode, popupId, timestamp);

    expect(result.matched).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should return remaining seconds until expiry', () => {
    const popupId = 'test-popup-001';
    const result = verifyQrCode(generateTotpCode(popupId), popupId);

    expect(result.remainingSeconds).toBeDefined();
    expect(result.remainingSeconds).toBeGreaterThan(0);
    expect(result.remainingSeconds).toBeLessThanOrEqual(QR_VALIDITY_SECONDS);
  });
});

describe('verification.ts - QR Code Data Generation', () => {
  it('should generate QR code data with valid until time', () => {
    const popupId = 'test-popup-001';
    const data = generateQrCodeData(popupId);

    expect(data.code).toHaveLength(TOTP_CODE_LENGTH);
    expect(data.validUntil).toBeInstanceOf(Date);
    expect(data.refreshIn).toBeGreaterThan(0);
    expect(data.refreshIn).toBeLessThanOrEqual(QR_VALIDITY_SECONDS);
  });

  it('should have validUntil in the future', () => {
    const popupId = 'test-popup-001';
    const data = generateQrCodeData(popupId);

    expect(data.validUntil.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('verification.ts - Triple Verification', () => {
  const mockPopupLocation: Coordinates = {
    latitude: 37.5665,
    longitude: 126.978,
  };

  const createOptions = (overrides: Partial<VerificationOptions> = {}): VerificationOptions => ({
    popupId: 'test-popup-001',
    userId: 'test-user-001',
    popupLocation: mockPopupLocation,
    brandName: 'Test Brand',
    ...overrides,
  });

  it('should pass with GPS + QR (80 points)', async () => {
    const options = createOptions({
      gpsData: {
        userLocation: mockPopupLocation, // Same location = exact match
        maxRange: 100,
      },
      qrData: {
        inputCode: '123456',
        validCode: '123456',
        generatedAt: new Date(),
      },
    });

    const result = await performVerification(options);

    expect(result.totalScore).toBe(80); // 40 (GPS) + 40 (QR)
    expect(result.passed).toBe(true);
    expect(result.methods).toContain('gps');
    expect(result.methods).toContain('qr');
  });

  it('should pass with 60+ points (threshold)', async () => {
    // GPS only (40 points) won't pass
    const gpsOnly = createOptions({
      gpsData: {
        userLocation: mockPopupLocation,
      },
    });

    const gpsResult = await performVerification(gpsOnly);
    expect(gpsResult.passed).toBe(false);
    expect(gpsResult.totalScore).toBe(40);

    // QR only (40 points) won't pass
    const qrOnly = createOptions({
      qrData: {
        inputCode: '123456',
        validCode: '123456',
        generatedAt: new Date(),
      },
    });

    const qrResult = await performVerification(qrOnly);
    expect(qrResult.passed).toBe(false);
    expect(qrResult.totalScore).toBe(40);
  });

  it('should fail with invalid QR code', async () => {
    const options = createOptions({
      gpsData: {
        userLocation: mockPopupLocation,
      },
      qrData: {
        inputCode: '000000',
        validCode: '123456',
        generatedAt: new Date(),
      },
    });

    const result = await performVerification(options);

    expect(result.qr?.matched).toBe(false);
    expect(result.qr?.score).toBe(0);
    expect(result.totalScore).toBe(40); // GPS only
    expect(result.passed).toBe(false);
  });

  it('should fail with expired QR code', async () => {
    const options = createOptions({
      gpsData: {
        userLocation: mockPopupLocation,
      },
      qrData: {
        inputCode: '123456',
        validCode: '123456',
        generatedAt: new Date(Date.now() - QR_VALIDITY_SECONDS * 3 * 1000), // 3x window (expired)
      },
    });

    const result = await performVerification(options);

    expect(result.qr?.expired).toBe(true);
    expect(result.qr?.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('should include verification timestamp', async () => {
    const options = createOptions({
      gpsData: {
        userLocation: mockPopupLocation,
      },
    });

    const before = Date.now();
    const result = await performVerification(options);
    const after = Date.now();

    expect(result.verifiedAt).toBeInstanceOf(Date);
    expect(result.verifiedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.verifiedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it('should include popup and user IDs', async () => {
    const options = createOptions({
      popupId: 'popup-123',
      userId: 'user-456',
    });

    const result = await performVerification(options);

    expect(result.popupId).toBe('popup-123');
    expect(result.userId).toBe('user-456');
  });
});

describe('verification.ts - Verification Summary', () => {
  const mockResult = (score: number): VerificationResult => ({
    popupId: 'test-popup',
    userId: 'test-user',
    verifiedAt: new Date(),
    gps: null,
    qr: null,
    receipt: null,
    totalScore: score,
    passed: score >= PASS_THRESHOLD,
    methods: [],
  });

  it('should return success badge for 70+ points', () => {
    const result = mockResult(80);
    const summary = getVerificationSummary(result);

    expect(summary.badge).toBe('success');
    expect(summary.title).toContain('찍음 완료');
    expect(summary.message).toContain('80점');
  });

  it('should return partial badge for 60-69 points', () => {
    const result = mockResult(65);
    const summary = getVerificationSummary(result);

    expect(summary.badge).toBe('partial');
    expect(summary.title).toContain('찍음 성공');
    expect(summary.message).toContain('65점');
  });

  it('should return fail badge for <60 points', () => {
    const result = mockResult(40);
    const summary = getVerificationSummary(result);

    expect(summary.badge).toBe('fail');
    expect(summary.title).toContain('인증 실패');
    expect(summary.message).toContain('40점');
  });
});

describe('verification.ts - Method Status', () => {
  const mockResult: VerificationResult = {
    popupId: 'test-popup',
    userId: 'test-user',
    verifiedAt: new Date(),
    gps: {
      distance: 15,
      withinRange: true,
      score: 40,
      accuracy: 'exact',
    },
    qr: {
      matched: true,
      score: 40,
      expired: false,
    },
    receipt: null,
    totalScore: 80,
    passed: true,
    methods: ['gps', 'qr'],
  };

  it('should return GPS status', () => {
    const status = getMethodStatus('gps', mockResult);

    expect(status.label).toBe('GPS 위치');
    expect(status.score).toBe(40);
    expect(status.maxScore).toBe(MAX_SCORES.gps);
    expect(status.status).toBe('success');
  });

  it('should return QR status', () => {
    const status = getMethodStatus('qr', mockResult);

    expect(status.label).toBe('QR 코드');
    expect(status.score).toBe(40);
    expect(status.maxScore).toBe(MAX_SCORES.qr);
    expect(status.status).toBe('success');
  });

  it('should return pending status when method not used', () => {
    const status = getMethodStatus('receipt', mockResult);

    expect(status.label).toBe('영수증');
    expect(status.score).toBe(0);
    expect(status.maxScore).toBe(MAX_SCORES.receipt);
    expect(status.status).toBe('pending');
  });

  it('should return fail status when verification failed', () => {
    const failedResult: VerificationResult = {
      ...mockResult,
      gps: {
        distance: 500,
        withinRange: false,
        score: 0,
        accuracy: 'far',
      },
    };

    const status = getMethodStatus('gps', failedResult);

    expect(status.status).toBe('fail');
    expect(status.score).toBe(0);
  });
});

describe('verification.ts - Constants', () => {
  it('should have correct pass threshold', () => {
    expect(PASS_THRESHOLD).toBe(60);
  });

  it('should have correct max scores totaling 100', () => {
    const total = MAX_SCORES.gps + MAX_SCORES.qr + MAX_SCORES.receipt;
    expect(total).toBe(100);
    expect(MAX_SCORES.gps).toBe(40);
    expect(MAX_SCORES.qr).toBe(40);
    expect(MAX_SCORES.receipt).toBe(20);
  });

  it('should have 30 second QR validity', () => {
    expect(QR_VALIDITY_SECONDS).toBe(30);
  });

  it('should have 6-digit TOTP length', () => {
    expect(TOTP_CODE_LENGTH).toBe(6);
  });
});
