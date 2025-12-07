import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Coordinates } from '@/lib/geo';

describe('useGeolocation - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.position).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.verificationResult).toBeNull();
    expect(result.current.distanceText).toBeNull();
  });

  it('should expose required methods', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(typeof result.current.requestPosition).toBe('function');
    expect(typeof result.current.verifyLocation).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });
});

describe('useGeolocation - Browser API Support', () => {
  it('should handle browser without geolocation support', async () => {
    // Mock no geolocation support
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.error).toContain('브라우저');
    expect(result.current.position).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle SSR environment (no window)', () => {
    const { result } = renderHook(() => useGeolocation());

    // In vitest, window is always defined, but we test the guard
    expect(result.current.error).toBeNull();
  });
});

describe('useGeolocation - Position Request', () => {
  const mockCoords = {
    latitude: 37.5665,
    longitude: 126.978,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: function () {
      return this;
    },
  };
  const mockGeolocationPosition = {
    coords: mockCoords as GeolocationCoordinates,
    timestamp: Date.now(),
    toJSON: function () {
      return this;
    },
  } as GeolocationPosition;

  beforeEach(() => {
    // Mock successful geolocation
    const getCurrentPositionMock = vi.fn((success) => {
      success(mockGeolocationPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it('should request and set position', async () => {
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    await waitFor(() => {
      expect(result.current.position).not.toBeNull();
    });

    expect(result.current.position?.latitude).toBe(37.5665);
    expect(result.current.position?.longitude).toBe(126.978);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during request', async () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isLoading).toBe(false);

    const requestPromise = act(async () => {
      await result.current.requestPosition();
    });

    // Note: In React 18, state updates happen synchronously in act()
    // so we can't easily test intermediate loading states
    await requestPromise;

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).not.toBeNull();
  });

  it('should prevent concurrent requests', async () => {
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      const promise1 = result.current.requestPosition();
      const promise2 = result.current.requestPosition();

      const results = await Promise.all([promise1, promise2]);

      // Second request should return null (prevented)
      expect(results[1]).toBeNull();
    });
  });
});

describe('useGeolocation - Permission Denied', () => {
  it('should handle permission denied error', async () => {
    const mockError: GeolocationPositionError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionMock = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.error).toContain('권한');
    expect(result.current.position).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useGeolocation - Timeout Handling', () => {
  it('should handle timeout error', async () => {
    const mockError: GeolocationPositionError = {
      code: 3, // TIMEOUT
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionMock = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.error).toContain('시간');
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useGeolocation - GPS Accuracy Calculation', () => {
  it('should calculate GPS accuracy from position', async () => {
    const mockCoords = {
      latitude: 37.5665,
      longitude: 126.978,
      accuracy: 25.5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: function () {
        return this;
      },
    };
    const mockPosition = {
      coords: mockCoords as GeolocationCoordinates,
      timestamp: Date.now(),
      toJSON: function () {
        return this;
      },
    } as GeolocationPosition;

    const getCurrentPositionMock = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    await waitFor(() => {
      expect(result.current.accuracy).toBe(25.5);
    });
  });
});

describe('useGeolocation - Auto Verify', () => {
  const mockCoords = {
    latitude: 37.5665,
    longitude: 126.978,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: function () {
      return this;
    },
  };
  const mockPosition = {
    coords: mockCoords as GeolocationCoordinates,
    timestamp: Date.now(),
    toJSON: function () {
      return this;
    },
  } as GeolocationPosition;

  beforeEach(() => {
    const getCurrentPositionMock = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it('should auto-verify when autoVerify=true and popupLocation provided', async () => {
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
        autoVerify: true,
      })
    );

    await act(async () => {
      await result.current.requestPosition();
    });

    await waitFor(() => {
      expect(result.current.verificationResult).not.toBeNull();
    });

    expect(result.current.verificationResult?.withinRange).toBe(true);
    expect(result.current.distanceText).not.toBeNull();
  });

  it('should not auto-verify when autoVerify=false', async () => {
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
        autoVerify: false,
      })
    );

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.verificationResult).toBeNull();
  });
});

describe('useGeolocation - Manual Verification', () => {
  const mockCoords = {
    latitude: 37.5665,
    longitude: 126.978,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: function () {
      return this;
    },
  };
  const mockPosition = {
    coords: mockCoords as GeolocationCoordinates,
    timestamp: Date.now(),
    toJSON: function () {
      return this;
    },
  } as GeolocationPosition;

  beforeEach(() => {
    const getCurrentPositionMock = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it('should verify location manually', async () => {
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
      })
    );

    // First get position
    await act(async () => {
      await result.current.requestPosition();
    });

    // Then verify
    await act(async () => {
      await result.current.verifyLocation();
    });

    expect(result.current.verificationResult).not.toBeNull();
    expect(result.current.verificationResult?.withinRange).toBe(true);
    expect(result.current.distanceText).not.toBeNull();
  });

  it('should request position automatically if not available during verification', async () => {
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
      })
    );

    // Verify without requesting position first
    await act(async () => {
      await result.current.verifyLocation();
    });

    await waitFor(() => {
      expect(result.current.position).not.toBeNull();
      expect(result.current.verificationResult).not.toBeNull();
    });
  });

  it('should return error if popupLocation not provided', async () => {
    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      const verificationResult = await result.current.verifyLocation();
      expect(verificationResult).toBeNull();
    });

    expect(result.current.error).toContain('팝업 위치 정보');
  });

  it('should use custom maxRange', async () => {
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
        maxRange: 200,
      })
    );

    await act(async () => {
      await result.current.requestPosition();
      await result.current.verifyLocation();
    });

    expect(result.current.verificationResult).not.toBeNull();
  });
});

describe('useGeolocation - State Management', () => {
  it('should clear error', async () => {
    const mockError: GeolocationPositionError = {
      code: 1,
      message: 'Error',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionMock = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset all state', async () => {
    const mockCoords = {
      latitude: 37.5665,
      longitude: 126.978,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: function () {
        return this;
      },
    };
    const mockPosition = {
      coords: mockCoords as GeolocationCoordinates,
      timestamp: Date.now(),
      toJSON: function () {
        return this;
      },
    } as GeolocationPosition;

    const getCurrentPositionMock = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.position).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.position).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.verificationResult).toBeNull();
    expect(result.current.distanceText).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useGeolocation - Integration Tests', () => {
  it('should complete full verification workflow', async () => {
    const mockCoords = {
      latitude: 37.5665,
      longitude: 126.978,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: function () {
        return this;
      },
    };
    const mockPosition = {
      coords: mockCoords as GeolocationCoordinates,
      timestamp: Date.now(),
      toJSON: function () {
        return this;
      },
    } as GeolocationPosition;

    const getCurrentPositionMock = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });

    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    const { result } = renderHook(() =>
      useGeolocation({
        popupLocation,
        maxRange: 100,
        autoVerify: false,
      })
    );

    // Step 1: Request position
    await act(async () => {
      await result.current.requestPosition();
    });

    expect(result.current.position).not.toBeNull();
    expect(result.current.accuracy).toBe(10);

    // Step 2: Verify location
    await act(async () => {
      await result.current.verifyLocation();
    });

    expect(result.current.verificationResult).not.toBeNull();
    expect(result.current.verificationResult?.score).toBeGreaterThan(0);
    expect(result.current.distanceText).toBeDefined();
  });
});
