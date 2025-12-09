/**
 * ZZIK Geolocation Utilities
 *
 * Triple Verification GPS 검증을 위한 지리 계산
 * Haversine 공식으로 두 좌표 간 거리 계산
 */

/** 지구 반경 (미터) */
const EARTH_RADIUS_M = 6371000;

/** 좌표 타입 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** GPS 검증 결과 */
export interface GpsVerificationResult {
  /** 거리 (미터) */
  distance: number;
  /** 허용 범위 내 */
  withinRange: boolean;
  /** 정확도 점수 (0-40) */
  score: number;
  /** 정확도 레벨 */
  accuracy: 'exact' | 'close' | 'near' | 'far';
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine 공식으로 두 좌표 간 거리 계산
 *
 * @param from 출발 좌표
 * @param to 도착 좌표
 * @returns 거리 (미터)
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * GPS 검증 점수 계산
 *
 * 거리 기반 점수:
 * - 0-20m: 40점 (exact - 정확히 현장)
 * - 20-50m: 35점 (close - 매우 가까움)
 * - 50-100m: 25점 (near - 근처)
 * - 100m+: 0점 (far - 너무 멂)
 *
 * @param userLocation 사용자 위치
 * @param popupLocation 팝업 위치
 * @param maxRange 최대 허용 범위 (기본 100m)
 */
export function verifyGpsLocation(
  userLocation: Coordinates,
  popupLocation: Coordinates,
  maxRange: number = 100
): GpsVerificationResult {
  const distance = calculateDistance(userLocation, popupLocation);

  // 거리별 점수 및 정확도 레벨
  let score: number;
  let accuracy: 'exact' | 'close' | 'near' | 'far';

  if (distance <= 20) {
    score = 40; // 만점
    accuracy = 'exact';
  } else if (distance <= 50) {
    score = 35;
    accuracy = 'close';
  } else if (distance <= maxRange) {
    score = 25;
    accuracy = 'near';
  } else {
    score = 0;
    accuracy = 'far';
  }

  return {
    distance: Math.round(distance),
    withinRange: distance <= maxRange,
    score,
    accuracy,
  };
}

/**
 * 현재 위치 가져오기 (브라우저)
 *
 * @returns Promise<Coordinates>
 */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('위치 권한이 거부되었습니다'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('위치 정보를 가져올 수 없습니다'));
            break;
          case error.TIMEOUT:
            reject(new Error('위치 요청 시간이 초과되었습니다'));
            break;
          default:
            reject(new Error('알 수 없는 오류가 발생했습니다'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // 30초 캐시
      }
    );
  });
}

/**
 * 거리를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param meters 거리 (미터)
 * @returns 포맷된 문자열
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 두 좌표가 특정 범위 내에 있는지 빠르게 확인
 * (Haversine보다 빠른 사전 필터링용)
 */
export function isWithinBoundingBox(
  point: Coordinates,
  center: Coordinates,
  rangeMeters: number
): boolean {
  // 1도 ≈ 111km at equator
  const latDiff = Math.abs(point.latitude - center.latitude);
  const lonDiff = Math.abs(point.longitude - center.longitude);
  const degreeRange = rangeMeters / 111000;

  return latDiff <= degreeRange && lonDiff <= degreeRange * 1.5; // 경도는 위도에 따라 변함
}
