/**
 * ZZIK Check-in Service
 *
 * 클라이언트에서 체크인 API를 호출하기 위한 서비스
 * VerificationModal에서 사용
 */

import { getCsrfTokenFromCookie } from './csrf-client';

// =============================================================================
// Types
// =============================================================================

export interface CheckinRequest {
  /** 팝업 ID */
  popupId: string;
  /** 사용자 위치 (GPS 인증) */
  latitude?: number;
  longitude?: number;
  /** QR 코드 (QR 인증) */
  qrCode?: string;
  /** 리더 레퍼럴 코드 */
  referralCode?: string;
}

export interface CheckinVerification {
  gps: {
    score: number;
    maxScore: number;
    distance: number | null;
    accuracy: string | null;
    verified: boolean;
  } | null;
  qr: {
    score: number;
    maxScore: number;
    verified: boolean;
  } | null;
  receipt: null;
  total: {
    score: number;
    maxScore: number;
    passed: boolean;
    threshold: number;
  };
}

export interface CheckinResult {
  id: string;
  popupId: string;
  totalScore: number;
  passed: boolean;
  verifiedAt: string;
}

export interface CheckinResponse {
  success: boolean;
  data?: {
    checkin: CheckinResult;
    verification: CheckinVerification;
    summary: {
      title: string;
      message: string;
      badge: 'success' | 'partial' | 'fail';
    };
    popup: {
      id: string;
      brandName: string;
      title?: string;
    };
  };
  error?: string;
  details?: {
    checkin?: {
      id: string;
      total_score: number;
      passed: boolean;
    };
  };
}

export interface QrCodeResponse {
  success: boolean;
  data?: {
    code: string;
    refreshIn: number;
    popupId: string;
    brandName: string;
  };
  error?: string;
}

export interface QrVerifyRequest {
  popupId: string;
  code: string;
}

export interface QrVerifyResponse {
  success: boolean;
  data?: {
    valid: boolean;
    score: number;
    message: string;
  };
  error?: string;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * 체크인 수행
 *
 * GPS 및/또는 QR 인증을 통해 체크인을 수행합니다.
 *
 * @param request 체크인 요청 데이터
 * @returns 체크인 결과
 */
export async function performCheckin(request: CheckinRequest): Promise<CheckinResponse> {
  try {
    const csrfToken = getCsrfTokenFromCookie();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch('/api/checkin', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `체크인 실패 (${response.status})`,
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    console.error('Checkin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * QR 코드 조회 (키오스크/현장 디스플레이용)
 *
 * 팝업 현장에 표시할 QR 코드를 조회합니다.
 *
 * @param popupId 팝업 ID
 * @returns QR 코드 데이터
 */
export async function getQrCode(popupId: string): Promise<QrCodeResponse> {
  try {
    const response = await fetch(`/api/checkin?popupId=${encodeURIComponent(popupId)}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `QR 코드 조회 실패 (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    console.error('QR code fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * QR 코드 검증
 *
 * 사용자가 입력한 QR 코드가 유효한지 검증합니다.
 * 체크인을 수행하지 않고 검증만 합니다.
 *
 * @param request QR 검증 요청
 * @returns 검증 결과
 */
export async function verifyQrCode(request: QrVerifyRequest): Promise<QrVerifyResponse> {
  try {
    const csrfToken = getCsrfTokenFromCookie();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch('/api/qr/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `QR 검증 실패 (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    console.error('QR verify error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

/**
 * 체크인 상태 조회
 *
 * 특정 팝업에 대한 사용자의 체크인 상태를 조회합니다.
 *
 * @param popupId 팝업 ID
 * @returns 체크인 상태
 */
export async function getCheckinStatus(popupId: string): Promise<{
  success: boolean;
  data?: {
    hasCheckedIn: boolean;
    checkin?: CheckinResult;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/checkin/status?popupId=${encodeURIComponent(popupId)}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `체크인 상태 조회 실패 (${response.status})`,
      };
    }

    return data;
  } catch (error) {
    console.error('Checkin status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 점수에 따른 배지 타입 결정
 */
export function getBadgeType(
  score: number,
  passed: boolean
): 'gold' | 'silver' | 'bronze' | 'none' {
  if (!passed) return 'none';
  if (score >= 80) return 'gold';
  if (score >= 70) return 'silver';
  return 'bronze';
}

/**
 * 점수에 따른 메시지 생성
 */
export function getScoreMessage(score: number, passed: boolean): string {
  if (!passed) {
    return `${score}점 - 60점 이상이 필요해요`;
  }
  if (score >= 80) {
    return `완벽해요! ${score}점으로 골드 배지 획득!`;
  }
  if (score >= 70) {
    return `훌륭해요! ${score}점으로 실버 배지 획득!`;
  }
  return `성공! ${score}점으로 브론즈 배지 획득!`;
}

/**
 * 리더 레퍼럴 처리
 *
 * 체크인 성공 시 리더 레퍼럴을 업데이트합니다.
 */
export async function updateLeaderReferral(
  popupId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const csrfToken = getCsrfTokenFromCookie();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch('/api/leader/referral', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        popupId,
        referralCode,
        action: 'checkin_complete',
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || '레퍼럴 업데이트 실패',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Leader referral update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다',
    };
  }
}
