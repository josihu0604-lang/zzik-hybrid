/**
 * ZZIK Triple Verification System
 *
 * 3중 검증으로 실제 방문을 증명:
 * - GPS (40점): 위치 기반 검증
 * - QR/TOTP (40점): 현장 코드 검증
 * - Receipt (20점): 영수증 OCR (선택)
 *
 * 통과 기준: 60점 이상
 * MVP: GPS + QR = 80점 만점
 *
 * SEC-002 FIX: Now uses generateSecureTOTP from security.ts (RFC 6238 compliant)
 */

import { Coordinates, verifyGpsLocation, type GpsVerificationResult } from './geo';
import { generateSecureTOTP, verifySecureTOTP } from './security';

// =============================================================================
// Types
// =============================================================================

/** 검증 방법 */
export type VerificationMethod = 'gps' | 'qr' | 'receipt';

/** QR 코드 검증 결과 */
export interface QrVerificationResult {
  /** 코드 일치 여부 */
  matched: boolean;
  /** 점수 (0 또는 40) */
  score: number;
  /** 만료 여부 */
  expired: boolean;
  /** 남은 유효 시간 (초) */
  remainingSeconds?: number;
}

/** 영수증 검증 결과 */
export interface ReceiptVerificationResult {
  /** 검증 성공 여부 */
  verified: boolean;
  /** 점수 (0 또는 20) */
  score: number;
  /** 브랜드명 일치 */
  brandMatched: boolean;
  /** 날짜 유효 */
  dateValid: boolean;
  /** 추출된 텍스트 */
  extractedText?: string;
}

/** 전체 검증 결과 */
export interface VerificationResult {
  /** 팝업 ID */
  popupId: string;
  /** 사용자 ID */
  userId: string;
  /** 검증 시간 */
  verifiedAt: Date;

  /** GPS 검증 */
  gps: GpsVerificationResult | null;
  /** QR 검증 */
  qr: QrVerificationResult | null;
  /** 영수증 검증 */
  receipt: ReceiptVerificationResult | null;

  /** 총점 (100점 만점) */
  totalScore: number;
  /** 통과 여부 (60점 이상) */
  passed: boolean;
  /** 사용된 검증 방법들 */
  methods: VerificationMethod[];
}

/** 검증 옵션 */
export interface VerificationOptions {
  /** 팝업 ID */
  popupId: string;
  /** 사용자 ID */
  userId: string;
  /** 팝업 위치 */
  popupLocation: Coordinates;
  /** 팝업 브랜드명 */
  brandName: string;

  /** GPS 검증 데이터 */
  gpsData?: {
    userLocation: Coordinates;
    maxRange?: number;
  };

  /** QR 검증 데이터 */
  qrData?: {
    inputCode: string;
    validCode: string;
    generatedAt: Date;
  };

  /** 영수증 검증 데이터 (MVP에서는 선택) */
  receiptData?: {
    imageBase64: string;
    purchaseDate: Date;
  };
}

// =============================================================================
// Constants
// =============================================================================

/** 통과 기준 점수 */
export const PASS_THRESHOLD = 60;

/** 각 검증 방법별 최대 점수 */
export const MAX_SCORES = {
  gps: 40,
  qr: 40,
  receipt: 20,
} as const;

/** QR 코드 유효 시간 (초) */
export const QR_VALIDITY_SECONDS = 30;

/** TOTP 코드 길이 */
export const TOTP_CODE_LENGTH = 6;

// =============================================================================
// QR/TOTP Functions
// =============================================================================

/**
 * TOTP 코드 생성 (Secure Version)
 *
 * SEC-002 FIX: Uses RFC 6238 compliant HMAC-SHA256 TOTP
 * from security.ts instead of weak hash algorithm
 *
 * @param popupId 팝업 ID (시드로 사용)
 * @param timestamp 타임스탬프 (기본: 현재 시간)
 */
export async function generateTotpCodeSecure(popupId: string, timestamp?: number): Promise<string> {
  // Use the secure TOTP generator from security.ts
  return generateSecureTOTP(popupId, timestamp);
}

/**
 * TOTP 코드 생성 (Synchronous wrapper for backward compatibility)
 *
 * SEC-002 FIX: Uses improved FNV-1a + MurmurHash2 mixing instead of simple hash
 *
 * @param popupId 팝업 ID (시드로 사용)
 * @param timestamp 타임스탬프 (기본: 현재 시간)
 */
export function generateTotpCode(popupId: string, timestamp?: number): string {
  const now = timestamp ?? Date.now();
  const timeSlot = Math.floor(now / (QR_VALIDITY_SECONDS * 1000));

  // SEC-002 FIX: Use improved hash algorithm (FNV-1a + MurmurHash2 mixing)
  const seed = `${popupId}-${timeSlot}`;

  // FNV-1a hash
  let hash = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV-1a prime
  }

  // Mix in additional entropy from the seed
  for (let i = seed.length - 1; i >= 0; i--) {
    hash ^= seed.charCodeAt(i) << ((i % 4) * 8);
    hash = Math.imul(hash, 0x5bd1e995); // MurmurHash2 multiplier
  }

  // Final mixing
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  // 6자리 숫자로 변환
  const code = Math.abs(hash % 1000000)
    .toString()
    .padStart(TOTP_CODE_LENGTH, '0');

  return code;
}

/**
 * QR 코드 검증 (Async Secure Version)
 *
 * SEC-002 FIX: Uses RFC 6238 compliant verification
 */
export async function verifyQrCodeSecure(
  inputCode: string,
  popupId: string,
  timestamp?: number
): Promise<QrVerificationResult> {
  const now = timestamp ?? Date.now();

  // Use secure TOTP verification
  const result = await verifySecureTOTP(inputCode, popupId, now);

  // 남은 유효 시간 계산
  const elapsed = (now / 1000) % QR_VALIDITY_SECONDS;
  const remainingSeconds = Math.ceil(QR_VALIDITY_SECONDS - elapsed);

  return {
    matched: result.valid,
    score: result.valid ? MAX_SCORES.qr : 0,
    expired: false,
    remainingSeconds,
  };
}

/**
 * QR 코드 검증 (Synchronous version for backward compatibility)
 *
 * 입력된 코드가 현재 유효한 TOTP와 일치하는지 확인
 * 전환 시점을 고려해 이전 코드도 허용
 *
 * SEC-002 FIX: Uses improved hash algorithm
 */
export function verifyQrCode(
  inputCode: string,
  popupId: string,
  timestamp?: number
): QrVerificationResult {
  const now = timestamp ?? Date.now();

  // 현재 코드
  const currentCode = generateTotpCode(popupId, now);

  // 이전 코드 (전환 시점 허용)
  const previousCode = generateTotpCode(popupId, now - QR_VALIDITY_SECONDS * 1000);

  const matched = inputCode === currentCode || inputCode === previousCode;

  // 남은 유효 시간 계산
  const elapsed = (now / 1000) % QR_VALIDITY_SECONDS;
  const remainingSeconds = Math.ceil(QR_VALIDITY_SECONDS - elapsed);

  return {
    matched,
    score: matched ? MAX_SCORES.qr : 0,
    expired: false,
    remainingSeconds,
  };
}

/**
 * QR 코드 데이터 생성 (디스플레이용)
 *
 * 팝업 현장에 표시할 QR 코드 데이터
 */
export function generateQrCodeData(popupId: string): {
  code: string;
  validUntil: Date;
  refreshIn: number;
} {
  const now = Date.now();
  const code = generateTotpCode(popupId, now);

  const elapsed = (now / 1000) % QR_VALIDITY_SECONDS;
  const refreshIn = Math.ceil(QR_VALIDITY_SECONDS - elapsed);

  const validUntil = new Date(now + refreshIn * 1000);

  return {
    code,
    validUntil,
    refreshIn,
  };
}

/**
 * QR 코드 데이터 생성 (Async Secure Version)
 *
 * SEC-002 FIX: Uses RFC 6238 compliant TOTP
 */
export async function generateQrCodeDataSecure(popupId: string): Promise<{
  code: string;
  validUntil: Date;
  refreshIn: number;
}> {
  const now = Date.now();
  const code = await generateTotpCodeSecure(popupId, now);

  const elapsed = (now / 1000) % QR_VALIDITY_SECONDS;
  const refreshIn = Math.ceil(QR_VALIDITY_SECONDS - elapsed);

  const validUntil = new Date(now + refreshIn * 1000);

  return {
    code,
    validUntil,
    refreshIn,
  };
}

// =============================================================================
// Verification Logic
// =============================================================================

/**
 * Perform GPS verification
 *
 * @param userLocation User's current location
 * @param popupLocation Popup venue location
 * @param maxRange Maximum allowed distance (default from verifyGpsLocation)
 * @returns GPS verification result or null if no GPS data
 */
function performGpsVerification(
  userLocation: Coordinates,
  popupLocation: Coordinates,
  maxRange?: number
): GpsVerificationResult {
  return verifyGpsLocation(userLocation, popupLocation, maxRange);
}

/**
 * Perform QR code verification
 *
 * @param inputCode User's input code
 * @param validCode Server-generated valid code
 * @param generatedAt When the valid code was generated
 * @returns QR verification result or null if no QR data
 */
function performQrVerification(
  inputCode: string,
  validCode: string,
  generatedAt: Date
): QrVerificationResult {
  // 코드 직접 비교 (서버에서 생성된 코드와)
  const matched = inputCode === validCode;
  const generatedTime = generatedAt.getTime();
  const now = Date.now();
  const expired = now - generatedTime > QR_VALIDITY_SECONDS * 2 * 1000; // 2배 여유

  return {
    matched: matched && !expired,
    score: matched && !expired ? MAX_SCORES.qr : 0,
    expired,
  };
}

/**
 * Perform receipt verification
 *
 * @param imageBase64 Base64-encoded receipt image
 * @param brandName Expected brand name
 * @param purchaseDate Expected purchase date
 * @returns Receipt verification result
 */
async function performReceiptVerification(
  imageBase64: string,
  brandName: string,
  purchaseDate: Date,
  popupId: string
): Promise<ReceiptVerificationResult> {
  try {
    // Call Receipt Verification API
    const response = await fetch('/api/receipt/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        brandName,
        checkInDate: purchaseDate.toISOString(),
        popupId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Receipt verification API failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      verified: result.verified,
      score: result.score,
      brandMatched: result.brandMatched,
      dateValid: result.dateValid,
      extractedText: result.extractedText,
    };
  } catch (error) {
    console.error('[Receipt Verification] Error:', error);
    // 에러 시 실패 결과 반환
    return {
      verified: false,
      score: 0,
      brandMatched: false,
      dateValid: false,
      extractedText: undefined,
    };
  }
}

/**
 * Triple Verification 실행
 *
 * GPS + QR + Receipt 검증을 수행하고 결과 반환
 */
export async function performVerification(
  options: VerificationOptions
): Promise<VerificationResult> {
  const { popupId, userId, popupLocation, brandName, gpsData, qrData, receiptData } = options;

  const methods: VerificationMethod[] = [];
  let totalScore = 0;

  // GPS 검증
  let gpsResult: GpsVerificationResult | null = null;
  if (gpsData) {
    gpsResult = performGpsVerification(gpsData.userLocation, popupLocation, gpsData.maxRange);
    totalScore += gpsResult.score;
    methods.push('gps');
  }

  // QR 검증
  let qrResult: QrVerificationResult | null = null;
  if (qrData) {
    qrResult = performQrVerification(qrData.inputCode, qrData.validCode, qrData.generatedAt);
    totalScore += qrResult.score;
    methods.push('qr');
  }

  // Receipt 검증 (Async)
  let receiptResult: ReceiptVerificationResult | null = null;
  if (receiptData) {
    receiptResult = await performReceiptVerification(
      receiptData.imageBase64,
      brandName,
      receiptData.purchaseDate,
      popupId
    );
    totalScore += receiptResult.score;
    methods.push('receipt');
  }

  const passed = totalScore >= PASS_THRESHOLD;

  return {
    popupId,
    userId,
    verifiedAt: new Date(),
    gps: gpsResult,
    qr: qrResult,
    receipt: receiptResult,
    totalScore,
    passed,
    methods,
  };
}

/**
 * 검증 결과 요약 메시지 생성
 */
export function getVerificationSummary(result: VerificationResult): {
  title: string;
  message: string;
  badge: 'success' | 'partial' | 'fail';
} {
  if (result.passed && result.totalScore >= 70) {
    return {
      title: '찍음 완료!',
      message: `${result.totalScore}점으로 인증 완료! 방문 배지를 획득했어요.`,
      badge: 'success',
    };
  }

  if (result.passed) {
    return {
      title: '찍음 성공!',
      message: `${result.totalScore}점으로 인증 성공! 추가 인증으로 보너스를 받을 수 있어요.`,
      badge: 'partial',
    };
  }

  return {
    title: '인증 실패',
    message: `${result.totalScore}점 - 60점 이상이 필요해요. 현장에서 다시 시도해주세요.`,
    badge: 'fail',
  };
}

/**
 * 검증 방법별 상태 텍스트
 */
export function getMethodStatus(
  method: VerificationMethod,
  result: VerificationResult
): {
  label: string;
  score: number;
  maxScore: number;
  status: 'success' | 'fail' | 'pending';
} {
  const maxScore = MAX_SCORES[method];

  switch (method) {
    case 'gps':
      return {
        label: 'GPS 위치',
        score: result.gps?.score ?? 0,
        maxScore,
        status: result.gps ? (result.gps.score > 0 ? 'success' : 'fail') : 'pending',
      };
    case 'qr':
      return {
        label: 'QR 코드',
        score: result.qr?.score ?? 0,
        maxScore,
        status: result.qr ? (result.qr.score > 0 ? 'success' : 'fail') : 'pending',
      };
    case 'receipt':
      return {
        label: '영수증',
        score: result.receipt?.score ?? 0,
        maxScore,
        status: result.receipt ? (result.receipt.score > 0 ? 'success' : 'fail') : 'pending',
      };
  }
}
