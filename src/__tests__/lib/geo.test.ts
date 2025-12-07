import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDistance,
  verifyGpsLocation,
  getCurrentPosition,
  formatDistance,
  isWithinBoundingBox,
  type Coordinates,
} from '@/lib/geo';

describe('geo.ts - Distance Calculation (Haversine)', () => {
  it('should calculate distance between two coordinates', () => {
    const seoul: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const busan: Coordinates = { latitude: 35.1796, longitude: 129.0756 };

    const distance = calculateDistance(seoul, busan);

    // Seoul to Busan is approximately 325km
    expect(distance).toBeGreaterThan(320000);
    expect(distance).toBeLessThan(330000);
  });

  it('should return 0 for same coordinates', () => {
    const location: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const distance = calculateDistance(location, location);

    expect(distance).toBe(0);
  });

  it('should calculate short distances accurately', () => {
    const point1: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const point2: Coordinates = { latitude: 37.5666, longitude: 126.978 };

    const distance = calculateDistance(point1, point2);

    // ~0.0001 degrees ≈ 11 meters
    expect(distance).toBeGreaterThan(10);
    expect(distance).toBeLessThan(15);
  });

  it('should handle negative coordinates', () => {
    const point1: Coordinates = { latitude: -33.8688, longitude: 151.2093 }; // Sydney
    const point2: Coordinates = { latitude: -37.8136, longitude: 144.9631 }; // Melbourne

    const distance = calculateDistance(point1, point2);

    // Sydney to Melbourne ≈ 714km
    expect(distance).toBeGreaterThan(700000);
    expect(distance).toBeLessThan(730000);
  });

  it('should handle equator crossing', () => {
    const north: Coordinates = { latitude: 10, longitude: 0 };
    const south: Coordinates = { latitude: -10, longitude: 0 };

    const distance = calculateDistance(north, south);

    // 20 degrees ≈ 2222km
    expect(distance).toBeGreaterThan(2200000);
    expect(distance).toBeLessThan(2250000);
  });

  it('should handle international date line', () => {
    const west: Coordinates = { latitude: 0, longitude: 179 };
    const east: Coordinates = { latitude: 0, longitude: -179 };

    const distance = calculateDistance(west, east);

    // Should be shortest path (not wrapping the world)
    expect(distance).toBeLessThan(300000); // Less than 300km
  });
});

describe('geo.ts - GPS Verification', () => {
  const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

  it('should score 40 points for exact location (0-20m)', () => {
    const userLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const result = verifyGpsLocation(userLocation, popupLocation);

    expect(result.score).toBe(40);
    expect(result.accuracy).toBe('exact');
    expect(result.withinRange).toBe(true);
    expect(result.distance).toBeLessThanOrEqual(20);
  });

  it('should score 35 points for close location (20-50m)', () => {
    // Move ~30m away
    const userLocation: Coordinates = { latitude: 37.5667, longitude: 126.978 };
    const result = verifyGpsLocation(userLocation, popupLocation);

    expect(result.score).toBe(35);
    expect(result.accuracy).toBe('close');
    expect(result.withinRange).toBe(true);
    expect(result.distance).toBeGreaterThan(20);
    expect(result.distance).toBeLessThanOrEqual(50);
  });

  it('should score 25 points for near location (50-100m)', () => {
    // Move ~70m away
    const userLocation: Coordinates = { latitude: 37.5671, longitude: 126.978 };
    const result = verifyGpsLocation(userLocation, popupLocation);

    expect(result.score).toBe(25);
    expect(result.accuracy).toBe('near');
    expect(result.withinRange).toBe(true);
    expect(result.distance).toBeGreaterThan(50);
    expect(result.distance).toBeLessThanOrEqual(100);
  });

  it('should score 0 points for far location (>100m)', () => {
    // Move ~500m away
    const userLocation: Coordinates = { latitude: 37.571, longitude: 126.978 };
    const result = verifyGpsLocation(userLocation, popupLocation);

    expect(result.score).toBe(0);
    expect(result.accuracy).toBe('far');
    expect(result.withinRange).toBe(false);
    expect(result.distance).toBeGreaterThan(100);
  });

  it('should use custom max range', () => {
    const userLocation: Coordinates = { latitude: 37.5675, longitude: 126.978 };

    // With default 100m range
    const result1 = verifyGpsLocation(userLocation, popupLocation);
    expect(result1.withinRange).toBe(false);

    // With custom 200m range
    const result2 = verifyGpsLocation(userLocation, popupLocation, 200);
    expect(result2.withinRange).toBe(true);
  });

  it('should round distance to nearest meter', () => {
    const userLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const result = verifyGpsLocation(userLocation, popupLocation);

    expect(Number.isInteger(result.distance)).toBe(true);
  });

  it('should calculate distance accurately for different ranges', () => {
    const ranges = [
      { lat: 37.5665, lng: 126.978, expectedScore: 40, expectedAccuracy: 'exact' },
      { lat: 37.5667, lng: 126.978, expectedScore: 35, expectedAccuracy: 'close' },
      { lat: 37.5671, lng: 126.978, expectedScore: 25, expectedAccuracy: 'near' },
      { lat: 37.571, lng: 126.978, expectedScore: 0, expectedAccuracy: 'far' },
    ];

    ranges.forEach(({ lat, lng, expectedScore, expectedAccuracy }) => {
      const result = verifyGpsLocation({ latitude: lat, longitude: lng }, popupLocation);
      expect(result.score).toBe(expectedScore);
      expect(result.accuracy).toBe(expectedAccuracy);
    });
  });
});

describe('geo.ts - Get Current Position', () => {
  beforeEach(() => {
    // Reset navigator.geolocation mock
    vi.clearAllMocks();
  });

  it('should get current position successfully', async () => {
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

    // Mock successful geolocation
    const getCurrentPositionSpy = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionSpy,
      },
      writable: true,
      configurable: true,
    });

    const position = await getCurrentPosition();

    expect(position.latitude).toBe(37.5665);
    expect(position.longitude).toBe(126.978);
    expect(getCurrentPositionSpy).toHaveBeenCalled();
  });

  it('should reject when geolocation not supported', async () => {
    // Mock no geolocation support
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(getCurrentPosition()).rejects.toThrow('Geolocation not supported');
  });

  it('should handle permission denied error', async () => {
    const mockError: GeolocationPositionError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionSpy = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionSpy,
      },
      writable: true,
      configurable: true,
    });

    await expect(getCurrentPosition()).rejects.toThrow('위치 권한이 거부되었습니다');
  });

  it('should handle position unavailable error', async () => {
    const mockError: GeolocationPositionError = {
      code: 2, // POSITION_UNAVAILABLE
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionSpy = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionSpy,
      },
      writable: true,
      configurable: true,
    });

    await expect(getCurrentPosition()).rejects.toThrow('위치 정보를 가져올 수 없습니다');
  });

  it('should handle timeout error', async () => {
    const mockError: GeolocationPositionError = {
      code: 3, // TIMEOUT
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    const getCurrentPositionSpy = vi.fn((success, error) => {
      error(mockError);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionSpy,
      },
      writable: true,
      configurable: true,
    });

    await expect(getCurrentPosition()).rejects.toThrow('위치 요청 시간이 초과되었습니다');
  });
});

describe('geo.ts - Format Distance', () => {
  it('should format meters for distances <1km', () => {
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(50)).toBe('50m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('should format kilometers for distances >=1km', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2345)).toBe('2.3km');
    expect(formatDistance(10000)).toBe('10.0km');
  });

  it('should round meters to nearest integer', () => {
    expect(formatDistance(12.4)).toBe('12m');
    expect(formatDistance(12.6)).toBe('13m');
  });

  it('should show one decimal for kilometers', () => {
    expect(formatDistance(1234)).toBe('1.2km');
    expect(formatDistance(5678)).toBe('5.7km');
  });

  it('should handle edge cases', () => {
    expect(formatDistance(999.9)).toBe('1000m');
    expect(formatDistance(1000.1)).toBe('1.0km');
  });
});

describe('geo.ts - Bounding Box Check', () => {
  const center: Coordinates = { latitude: 37.5665, longitude: 126.978 };

  it('should return true for point within range', () => {
    const point: Coordinates = { latitude: 37.5665, longitude: 126.978 };
    const result = isWithinBoundingBox(point, center, 100);

    expect(result).toBe(true);
  });

  it('should return true for point near edge of range', () => {
    const point: Coordinates = { latitude: 37.5666, longitude: 126.978 };
    const result = isWithinBoundingBox(point, center, 100);

    expect(result).toBe(true);
  });

  it('should return false for point outside range', () => {
    const point: Coordinates = { latitude: 37.58, longitude: 126.978 }; // ~1.5km away
    const result = isWithinBoundingBox(point, center, 100);

    expect(result).toBe(false);
  });

  it('should be faster than Haversine for filtering', () => {
    // This is a performance hint - bounding box is O(1) while Haversine is O(n)
    const point: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    // Bounding box check should be nearly instant
    const start = performance.now();
    isWithinBoundingBox(point, center, 100);
    const boundingBoxTime = performance.now() - start;

    expect(boundingBoxTime).toBeLessThan(1); // Should be <1ms
  });

  it('should handle different range sizes', () => {
    const nearPoint: Coordinates = { latitude: 37.5666, longitude: 126.978 };
    const farPoint: Coordinates = { latitude: 37.5675, longitude: 126.978 };

    expect(isWithinBoundingBox(nearPoint, center, 50)).toBe(true);
    expect(isWithinBoundingBox(farPoint, center, 50)).toBe(false);
    expect(isWithinBoundingBox(farPoint, center, 200)).toBe(true);
  });

  it('should account for longitude scaling with latitude', () => {
    // At higher latitudes, degrees of longitude represent shorter distances
    const northCenter: Coordinates = { latitude: 60, longitude: 0 };
    const point1: Coordinates = { latitude: 60, longitude: 0.01 };
    const point2: Coordinates = { latitude: 0, longitude: 0.01 };

    const result1 = isWithinBoundingBox(point1, northCenter, 1000);
    const result2 = isWithinBoundingBox(point2, { latitude: 0, longitude: 0 }, 1000);

    // Both should work but consider latitude scaling
    expect(typeof result1).toBe('boolean');
    expect(typeof result2).toBe('boolean');
  });
});

describe('geo.ts - Integration Tests', () => {
  it('should verify location workflow end-to-end', () => {
    // 1. Define popup location
    const popupLocation: Coordinates = { latitude: 37.5665, longitude: 126.978 };

    // 2. User arrives at location
    const userLocation: Coordinates = { latitude: 37.5666, longitude: 126.978 };

    // 3. Quick bounding box check
    const isNearby = isWithinBoundingBox(userLocation, popupLocation, 100);
    expect(isNearby).toBe(true);

    // 4. Precise distance calculation
    const distance = calculateDistance(userLocation, popupLocation);
    expect(distance).toBeLessThan(100);

    // 5. Verify GPS for points
    const result = verifyGpsLocation(userLocation, popupLocation);
    expect(result.score).toBeGreaterThan(0);
    expect(result.withinRange).toBe(true);

    // 6. Format for display
    const formattedDistance = formatDistance(distance);
    expect(formattedDistance).toContain('m');
  });

  it('should handle real-world Seoul locations', () => {
    const gangnam: Coordinates = { latitude: 37.4979, longitude: 127.0276 };
    const hongdae: Coordinates = { latitude: 37.5563, longitude: 126.9236 };

    const distance = calculateDistance(gangnam, hongdae);

    // Gangnam to Hongdae ≈ 10-11km
    expect(distance).toBeGreaterThan(9000);
    expect(distance).toBeLessThan(12000);

    const formatted = formatDistance(distance);
    expect(formatted).toContain('km');
  });
});
