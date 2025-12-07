'use client';

import { useState, useCallback, useRef } from 'react';
import {
  getCurrentPosition,
  verifyGpsLocation,
  formatDistance,
  type Coordinates,
  type GpsVerificationResult,
} from '@/lib/geo';

/**
 * useGeolocation - GPS 위치 기반 인증 훅
 */

export interface GeolocationState {
  /** 현재 위치 */
  position: Coordinates | null;
  /** GPS 정확도 (미터) */
  accuracy: number | null;
  /** 로딩 중 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 인증 결과 */
  verificationResult: GpsVerificationResult | null;
  /** 거리 문자열 */
  distanceText: string | null;
}

export interface UseGeolocationOptions {
  /** 팝업 위치 (인증용) */
  popupLocation?: Coordinates;
  /** 최대 허용 거리 (기본 100m) */
  maxRange?: number;
  /** 자동 인증 실행 */
  autoVerify?: boolean;
}

export interface UseGeolocationReturn extends GeolocationState {
  /** 위치 요청 */
  requestPosition: () => Promise<Coordinates | null>;
  /** 위치 인증 */
  verifyLocation: () => Promise<GpsVerificationResult | null>;
  /** 에러 초기화 */
  clearError: () => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialState: GeolocationState = {
  position: null,
  accuracy: null,
  isLoading: false,
  error: null,
  verificationResult: null,
  distanceText: null,
};

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const { popupLocation, maxRange = 100, autoVerify = false } = options;

  const [state, setState] = useState<GeolocationState>(initialState);
  const isRequestingRef = useRef(false);

  // 위치 요청
  const requestPosition = useCallback(async (): Promise<Coordinates | null> => {
    if (isRequestingRef.current) return null;

    isRequestingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 브라우저 지원 확인
      if (typeof window === 'undefined' || !navigator.geolocation) {
        throw new Error('이 브라우저에서는 위치 서비스를 사용할 수 없습니다');
      }

      const position = await getCurrentPosition();

      // GPS 정확도 가져오기 (추가 정보)
      const geoPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        });
      });

      const accuracy = geoPosition.coords.accuracy;

      setState((prev) => ({
        ...prev,
        position,
        accuracy,
        isLoading: false,
      }));

      // 자동 인증
      if (autoVerify && popupLocation) {
        const result = verifyGpsLocation(position, popupLocation, maxRange);
        const distanceText = formatDistance(result.distance);

        setState((prev) => ({
          ...prev,
          verificationResult: result,
          distanceText,
        }));

        return position;
      }

      return position;
    } catch (error) {
      let errorMessage = '위치를 가져오는 중 오류가 발생했습니다';

      // Handle GeolocationPositionError
      if (error && typeof error === 'object' && 'code' in error) {
        const geoError = error as GeolocationPositionError;
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage =
              '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다. GPS가 활성화되어 있는지 확인해주세요.';
            break;
          case geoError.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
          default:
            errorMessage = '알 수 없는 위치 오류가 발생했습니다.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    } finally {
      isRequestingRef.current = false;
    }
  }, [popupLocation, maxRange, autoVerify]);

  // 위치 인증
  const verifyLocation = useCallback(async (): Promise<GpsVerificationResult | null> => {
    if (!popupLocation) {
      setState((prev) => ({
        ...prev,
        error: '팝업 위치 정보가 없습니다',
      }));
      return null;
    }

    // 위치가 없으면 먼저 요청
    let currentPosition = state.position;
    if (!currentPosition) {
      currentPosition = await requestPosition();
      if (!currentPosition) return null;
    }

    const result = verifyGpsLocation(currentPosition, popupLocation, maxRange);
    const distanceText = formatDistance(result.distance);

    setState((prev) => ({
      ...prev,
      verificationResult: result,
      distanceText,
    }));

    return result;
  }, [state.position, popupLocation, maxRange, requestPosition]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 상태 초기화
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    requestPosition,
    verifyLocation,
    clearError,
    reset,
  };
}

export default useGeolocation;
