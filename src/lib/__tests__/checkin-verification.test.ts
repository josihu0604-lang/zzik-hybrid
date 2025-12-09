import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performVerification, PASS_THRESHOLD } from '../verification';
import * as geo from '../geo';
import * as security from '../security';

// Mock dependencies
vi.mock('../geo', () => ({
  verifyGpsLocation: vi.fn(),
  Coordinates: {},
}));

vi.mock('../security', () => ({
  generateSecureTOTP: vi.fn(),
  verifySecureTOTP: vi.fn(),
}));

describe('Check-In Verification Logic', () => {
  const mockPopupId = 'popup-123';
  const mockUserId = 'user-123';
  const mockPopupLocation = { latitude: 37.5, longitude: 127.0 };
  const mockBrandName = 'ZZIK Coffee';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass if GPS score is sufficient (40/40) and QR score is sufficient (40/40) -> Total 80 > 60', async () => {
    // Mock GPS success
    (geo.verifyGpsLocation as any).mockReturnValue({
      score: 40,
      distance: 10,
      accuracy: 5,
    });

    // Mock QR success
    (security.verifySecureTOTP as any).mockResolvedValue({ valid: true });

    const result = await performVerification({
      popupId: mockPopupId,
      userId: mockUserId,
      popupLocation: mockPopupLocation,
      brandName: mockBrandName,
      gpsData: {
        userLocation: { latitude: 37.5001, longitude: 127.0001 },
      },
      qrData: {
        inputCode: '123456',
        validCode: '123456',
        generatedAt: new Date(),
      },
    });

    expect(result.passed).toBe(true);
    expect(result.totalScore).toBe(80);
    expect(result.gps?.score).toBe(40);
    expect(result.qr?.score).toBe(40);
  });

  it('should fail if only GPS provided (40 < 60)', async () => {
    // Mock GPS success
    (geo.verifyGpsLocation as any).mockReturnValue({
      score: 40,
      distance: 10,
      accuracy: 5,
    });

    const result = await performVerification({
      popupId: mockPopupId,
      userId: mockUserId,
      popupLocation: mockPopupLocation,
      brandName: mockBrandName,
      gpsData: {
        userLocation: { latitude: 37.5001, longitude: 127.0001 },
      },
      // No QR data
    });

    expect(result.passed).toBe(false);
    expect(result.totalScore).toBe(40);
  });

  it('should pass if QR (40) + Receipt (20) = 60', async () => {
    // Mock Receipt Verification API (fetch)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        verified: true,
        score: 20,
        brandMatched: true,
        dateValid: true,
      }),
    });

    // Mock QR success
    (security.verifySecureTOTP as any).mockResolvedValue({ valid: true });

    const result = await performVerification({
      popupId: mockPopupId,
      userId: mockUserId,
      popupLocation: mockPopupLocation,
      brandName: mockBrandName,
      qrData: {
        inputCode: '123456',
        validCode: '123456',
        generatedAt: new Date(),
      },
      receiptData: {
        imageBase64: 'base64image',
        purchaseDate: new Date(),
      },
    });

    expect(result.passed).toBe(true);
    expect(result.totalScore).toBe(60); // 40 (QR) + 20 (Receipt)
    expect(result.qr?.score).toBe(40);
    expect(result.receipt?.score).toBe(20);
  });
});
