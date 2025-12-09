'use client';

import { m } from 'framer-motion';
import { useState, useMemo, Suspense, lazy, useCallback, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { colors } from '@/lib/design-tokens';
import type { PopupLocation } from '@/components/map/MapboxMap';
import { ErrorBoundary } from '@/components/error';
import { MapFilters } from '@/components/map/MapFilters';
import { PopupBottomSheet } from '@/components/map/PopupBottomSheet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/lib/geo';
import { getCategoryColor } from '@/lib/color-utils';
import { Button } from '@/components/ui/Button';

/**
 * Map Page - 오픈 확정된 팝업 지도
 *
 * 새 개념: 펀딩 완료된 팝업들의 위치를 보여주는 지도
 */

// Lazy load MapboxMap for better performance (2.7MB chunk)
// CSS is dynamically loaded by the component itself
const MapboxMap = lazy(() =>
  import('@/components/map/MapboxMap').then((mod) => {
    // Dynamically import Mapbox CSS only when needed
    // @ts-ignore - CSS import doesn't need type declarations
    import('mapbox-gl/dist/mapbox-gl.css');
    return mod;
  })
);

// ============================================================================
// API TYPES
// ============================================================================

interface ApiPopupData {
  id: string;
  brandName: string;
  title: string;
  description?: string | null;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  category: string;
  imageUrl?: string | null;
  currentParticipants: number;
  goalParticipants: number;
  status: 'funding' | 'confirmed' | 'completed' | 'cancelled';
  startsAt?: string | null;
  endsAt?: string | null;
  deadlineAt: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    popups: ApiPopupData[];
    total: number;
    source: 'database' | 'mock';
  };
  error?: string;
}

// ============================================================================
// DEMO DATA (Fallback)
// ============================================================================

const DEMO_POPUPS: PopupLocation[] = [
  {
    id: 'demo-1',
    brandName: 'TAMBURINS',
    title: '새 향수 라인 체험 팝업',
    location: '가로수길',
    address: '서울 강남구 신사동 가로수길 12',
    dates: '2월 1-5일',
    lat: 37.5209,
    lng: 127.0234,
    category: 'beauty',
    totalParticipants: 89,
    progress: 100,
    isConfirmed: true,
  },
  {
    id: 'demo-2',
    brandName: 'MUSINSA',
    title: '무신사 한남 팝업',
    location: '한남동',
    address: '서울 용산구 한남동 23',
    dates: '1월 22-28일',
    lat: 37.5345,
    lng: 127.0012,
    category: 'fashion',
    totalParticipants: 234,
    progress: 100,
    isConfirmed: true,
  },
  {
    id: 'demo-3',
    brandName: 'LINE FRIENDS',
    title: 'BT21 스페셜 팝업',
    location: '성수동',
    address: '서울 성동구 성수동 45',
    dates: '1월 25-30일',
    lat: 37.5445,
    lng: 127.0556,
    category: 'kpop',
    totalParticipants: 456,
    progress: 100,
    isConfirmed: true,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  fashion: colors.spark[400],
  beauty: colors.ember[400],
  kpop: colors.flame[400],
  food: colors.flame[600],
  lifestyle: colors.ember[500],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform API data to PopupLocation format
 */
function transformApiDataToPopupLocation(apiData: ApiPopupData): PopupLocation {
  // Parse dates
  const startsAt = apiData.startsAt ? new Date(apiData.startsAt) : null;
  const endsAt = apiData.endsAt ? new Date(apiData.endsAt) : null;

  // Format dates display
  let dates = '날짜 미정';
  if (startsAt && endsAt) {
    const startMonth = startsAt.getMonth() + 1;
    const startDay = startsAt.getDate();
    const endDay = endsAt.getDate();
    dates = `${startMonth}월 ${startDay}-${endDay}일`;
  }

  // Calculate progress
  const progress =
    apiData.goalParticipants > 0
      ? Math.round((apiData.currentParticipants / apiData.goalParticipants) * 100)
      : 0;

  // Determine if confirmed
  const isConfirmed =
    apiData.status === 'confirmed' || apiData.status === 'completed' || progress >= 100;

  return {
    id: apiData.id,
    brandName: apiData.brandName,
    title: apiData.title,
    location: apiData.location,
    address: apiData.location, // API doesn't provide separate address yet
    dates,
    lat: apiData.latitude || 37.5665, // Default to Seoul
    lng: apiData.longitude || 126.978,
    category: apiData.category,
    totalParticipants: apiData.currentParticipants,
    progress,
    isConfirmed,
  };
}

/**
 * Fetch confirmed popups from API
 */
async function fetchConfirmedPopups(): Promise<{
  popups: PopupLocation[];
  isDemo: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/popup?status=confirmed&limit=100', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch popups');
    }

    // Transform API data
    const popups = result.data.popups
      .map(transformApiDataToPopupLocation)
      .filter((popup) => popup.lat && popup.lng); // Filter out popups without coordinates

    // Check if using mock data
    const isDemo = result.data.source === 'mock' || popups.length === 0;

    return {
      popups: isDemo ? DEMO_POPUPS : popups,
      isDemo,
    };
  } catch (error) {
    console.error('Failed to fetch popups:', error);
    return {
      popups: DEMO_POPUPS,
      isDemo: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Map Loading Skeleton Component
function MapLoadingSkeleton() {
  return (
    <div className="absolute inset-0 bg-linear-elevated overflow-hidden">
      {/* Animated gradient pulse */}
      <div className="absolute inset-0">
        <m.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 107, 91, 0.1), transparent)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Skeleton markers */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <m.div
            key={i}
            className="absolute"
            style={{
              top: `${20 + i * 25}%`,
              left: `${20 + i * 20}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
            transition={{
              opacity: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              scale: {
                duration: 0.3,
                delay: i * 0.1,
              },
            }}
          >
            <div
              className="w-11 h-11 rounded-full"
              style={{
                background: 'rgba(255, 107, 91, 0.2)',
                border: '2px solid rgba(255, 107, 91, 0.3)',
              }}
            />
          </m.div>
        ))}
      </div>

      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <m.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <m.div
              className="w-2 h-2 rounded-full"
              style={{ background: colors.flame[500] }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <p className="text-linear-text-secondary text-sm font-medium">지도를 불러오는 중...</p>
          </div>
        </m.div>
      </div>
    </div>
  );
}

// Fallback UI when Mapbox token is not available
function MapFallbackUI({
  popups,
  selectedPopup,
  onPopupSelect,
}: {
  popups: PopupLocation[];
  selectedPopup: PopupLocation | null;
  onPopupSelect: (popup: PopupLocation | null) => void;
}) {
  return (
    <div className="relative h-full bg-linear-elevated">
      {/* Info banner */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(18, 19, 20, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 107, 91, 0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 107, 91, 0.15)',
              }}
            >
              <span className="text-xl">🗺️</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">지도 기능 준비 중</p>
              <p className="text-linear-text-tertiary text-xs leading-relaxed">
                Mapbox 토큰 설정 후 인터랙티브 지도를 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </m.div>
      </div>

      {/* Popup Markers (Visual representation) */}
      <div className="absolute inset-0">
        {popups.map((popup, index) => (
          <m.button
            key={popup.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              delay: 0.2 + index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="absolute cursor-pointer group"
            style={{
              top: `${20 + index * 25}%`,
              left: `${20 + index * 20}%`,
            }}
            onClick={() => onPopupSelect(selectedPopup?.id === popup.id ? null : popup)}
            aria-label={`${popup.brandName} - ${popup.title} 팝업 마커`}
          >
            <div className="relative">
              {/* Hover glow effect */}
              <m.div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: CATEGORY_COLORS[popup.category] || colors.flame[500],
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.2 }}
              />

              {/* Marker */}
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-200"
                style={{
                  background: CATEGORY_COLORS[popup.category] || colors.flame[500],
                  boxShadow: `0 4px 12px ${CATEGORY_COLORS[popup.category] || colors.flame[500]}60`,
                  border:
                    selectedPopup?.id === popup.id
                      ? '3px solid white'
                      : '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {popup.brandName.charAt(0)}
              </div>

              {/* Selected pulse */}
              {selectedPopup?.id === popup.id && (
                <m.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[popup.category] || colors.flame[500],
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>

            {/* Tooltip on hover */}
            <m.div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
              style={{
                background: 'rgba(18, 19, 20, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              initial={{ opacity: 0, y: -5 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-white text-xs font-medium">{popup.brandName}</p>
            </m.div>
          </m.button>
        ))}
      </div>
    </div>
  );
}

function MapPageContent() {
  // UI State
  const [selectedPopup, setSelectedPopup] = useState<PopupLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'date' | 'popularity'>('distance');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  // Check for valid Mapbox token (not demo/placeholder)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasMapboxToken = !!mapboxToken && 
    mapboxToken.startsWith('pk.') && 
    mapboxToken.length > 50 &&
    !mapboxToken.includes('demo');

  // Data State
  const [allPopups, setAllPopups] = useState<PopupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // GPS 위치 훅
  const { position, isLoading: isLocating, requestPosition, error: gpsError } = useGeolocation();

  // Fetch popups on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    let mounted = true;

    const loadPopups = async () => {
      setIsLoading(true);
      setApiError(null);

      const result = await fetchConfirmedPopups();

      if (!mounted) return;

      setAllPopups(result.popups);
      setIsDemo(result.isDemo);
      if (result.error) {
        setApiError(result.error);
      }
      setIsLoading(false);
    };

    loadPopups();

    return () => {
      mounted = false;
    };
  }, []);

  // 사용자 위치를 지도용 포맷으로 변환
  const userLocation = useMemo(() => {
    if (!position) return null;
    return { lat: position.latitude, lng: position.longitude };
  }, [position]);

  // 위치 요청 핸들러
  const handleRequestLocation = useCallback(() => {
    requestPosition();
  }, [requestPosition]);

  // 거리 계산이 포함된 팝업 목록
  const popupsWithDistance = useMemo(() => {
    return allPopups.map((popup) => {
      if (!position) return { ...popup, distance: undefined };
      const distanceM = calculateDistance(
        { latitude: position.latitude, longitude: position.longitude },
        { latitude: popup.lat, longitude: popup.lng }
      );
      return { ...popup, distance: distanceM / 1000 }; // km로 변환
    });
  }, [allPopups, position]);

  // 필터링된 팝업 목록
  const filteredPopups = useMemo(() => {
    let result = [...popupsWithDistance];

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (popup) =>
          popup.brandName.toLowerCase().includes(query) ||
          popup.title.toLowerCase().includes(query) ||
          popup.location.toLowerCase().includes(query)
      );
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      result = result.filter((popup) => selectedCategories.includes(popup.category));
    }

    // 내 주변 필터 (5km 이내)
    if (showNearbyOnly && position) {
      result = result.filter((popup) => popup.distance !== undefined && popup.distance <= 5);
    }

    // 정렬
    switch (sortBy) {
      case 'popularity':
        result.sort((a, b) => b.totalParticipants - a.totalParticipants);
        break;
      case 'date':
        // 날짜 기준 정렬 (실제로는 날짜 파싱 필요)
        break;
      case 'distance':
      default:
        // 거리 기준 정렬 (위치가 있을 때만)
        if (position) {
          result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }
        break;
    }

    return result;
  }, [popupsWithDistance, searchQuery, selectedCategories, sortBy, showNearbyOnly, position]);

  // 바텀시트 닫기
  const handleCloseBottomSheet = useCallback(() => {
    setSelectedPopup(null);
  }, []);

  // 길찾기
  const handleNavigate = useCallback(() => {
    if (selectedPopup) {
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(selectedPopup.title)},${selectedPopup.lat},${selectedPopup.lng}`;
      window.open(url, '_blank');
    }
  }, [selectedPopup]);

  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe">
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-5 py-4"
        style={{
          background: 'rgba(8, 9, 10, 0.9)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-xl">오픈 확정 팝업</h1>
            {isDemo && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255, 211, 61, 0.15)',
                  color: colors.spark[400],
                  border: `1px solid ${colors.spark[400]}40`,
                }}
              >
                데모
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <m.div
                className="w-2 h-2 rounded-full"
                style={{ background: colors.flame[500] }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ) : (
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: colors.flame[500],
                  boxShadow: `0 0 8px ${colors.flame[500]}`,
                }}
              />
            )}
            <span className="text-linear-text-secondary text-sm">
              {isLoading ? '로딩중...' : `${filteredPopups.length}개 장소`}
            </span>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="relative h-[55vh] bg-linear-elevated">
        {/* API Error Banner */}
        {apiError && !isDemo && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 right-4 z-20 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">데이터를 불러오는 중 문제가 발생했습니다</p>
            </div>
          </m.div>
        )}

        {/* MapFilters */}
        <MapFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={allPopups.length}
          filteredCount={filteredPopups.length}
        />

        {/* Nearby Filter Button */}
        <div className="absolute bottom-4 left-4 z-10">
          <Button
            variant={showNearbyOnly ? 'primary' : 'glass'}
            size="md"
            leftIcon={<Navigation size={16} />}
            onClick={() => {
              if (!position) {
                handleRequestLocation();
              }
              setShowNearbyOnly(!showNearbyOnly);
            }}
          >
            내 주변
            {showNearbyOnly && position && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                5km
              </span>
            )}
          </Button>
        </div>

        {isLoading ? (
          <MapLoadingSkeleton />
        ) : hasMapboxToken ? (
          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapboxMap
              popups={filteredPopups}
              selectedPopup={selectedPopup}
              onPopupSelect={setSelectedPopup}
              className="w-full h-full"
              userLocation={userLocation}
              isLocating={isLocating}
              onRequestLocation={handleRequestLocation}
            />
          </Suspense>
        ) : (
          <MapFallbackUI
            popups={filteredPopups}
            selectedPopup={selectedPopup}
            onPopupSelect={setSelectedPopup}
          />
        )}
      </div>

      {/* Popup Bottom Sheet */}
      <PopupBottomSheet
        popup={selectedPopup}
        onClose={handleCloseBottomSheet}
        userLocation={userLocation}
        onNavigate={handleNavigate}
      />

      {/* Popup List */}
      <div className="px-5 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">
              {showNearbyOnly ? '내 주변 팝업' : '가까운 팝업'}
            </h2>
            <span className="text-linear-text-tertiary text-sm">
              {sortBy === 'distance' ? '거리순' : sortBy === 'popularity' ? '인기순' : '날짜순'}
            </span>
          </div>

          {/* Demo Mode Info */}
          {isDemo && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl"
              style={{
                background: 'rgba(255, 211, 61, 0.1)',
                border: `1px solid ${colors.spark[400]}40`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    background: 'rgba(255, 211, 61, 0.15)',
                  }}
                >
                  ⚡
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">데모 모드</p>
                  <p className="text-linear-text-tertiary text-xs leading-relaxed">
                    실제 데이터가 없어 샘플 데이터를 표시하고 있습니다. 데이터베이스에 팝업을
                    추가하면 실제 데이터가 표시됩니다.
                  </p>
                </div>
              </div>
            </m.div>
          )}

          {/* GPS Error Message */}
          {gpsError && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg flex items-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <MapPin size={16} className="text-red-400" />
              <p className="text-red-400 text-sm">{gpsError}</p>
            </m.div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: 'rgba(18, 19, 20, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Icon skeleton */}
                  <m.div
                    className="w-12 h-12 rounded-xl"
                    style={{ background: 'rgba(255, 107, 91, 0.2)' }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <div className="flex-1">
                    <m.div
                      className="h-3 rounded mb-2"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', width: '40%' }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <m.div
                      className="h-4 rounded mb-2"
                      style={{ background: 'rgba(255, 255, 255, 0.15)', width: '80%' }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <m.div
                      className="h-3 rounded"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', width: '60%' }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                </m.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPopups.length === 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <MapPin size={48} className="text-linear-text-quaternary mx-auto mb-4" />
              <p className="text-linear-text-secondary mb-2">
                {showNearbyOnly ? '주변에 팝업이 없습니다' : '검색 결과가 없습니다'}
              </p>
              <p className="text-linear-text-tertiary text-sm">
                {showNearbyOnly
                  ? '범위를 넓히거나 필터를 해제해보세요'
                  : '다른 키워드로 검색해보세요'}
              </p>
            </m.div>
          )}

          {/* Popup List */}
          {!isLoading && (
            <div className="space-y-3">
              {filteredPopups.map((popup, index) => {
                const categoryColor = getCategoryColor(popup.category);
                const isConfirmed = popup.isConfirmed || (popup.progress ?? 0) >= 100;

                return (
                  <m.div
                    key={popup.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <m.div
                      className="flex items-center gap-4 p-4 rounded-xl transition-colors cursor-pointer"
                      style={{
                        background: 'rgba(18, 19, 20, 0.6)',
                        border: `1px solid ${
                          selectedPopup?.id === popup.id
                            ? `${categoryColor}40`
                            : 'rgba(255, 255, 255, 0.05)'
                        }`,
                      }}
                      whileHover={{
                        background: 'rgba(26, 28, 31, 0.8)',
                        borderColor: `${categoryColor}40`,
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPopup(popup)}
                      aria-label={`${popup.brandName} ${popup.title} 팝업 선택하기`}
                    >
                      {/* Icon with progress ring */}
                      <div className="relative">
                        <m.div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{
                            background: isConfirmed
                              ? `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`
                              : categoryColor,
                            boxShadow: `0 4px 12px ${isConfirmed ? colors.success : categoryColor}30`,
                          }}
                          whileHover={{
                            scale: 1.05,
                          }}
                        >
                          {popup.brandName.charAt(0)}
                        </m.div>
                        {isConfirmed && (
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-micro font-bold"
                            style={{ background: colors.success }}
                          >
                            V
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-linear-text-tertiary text-xs font-medium truncate">
                            {popup.brandName}
                          </p>
                          {!isConfirmed && popup.progress && (
                            <span
                              className="px-1.5 py-0.5 rounded text-micro font-semibold"
                              style={{
                                background: `${categoryColor}20`,
                                color: categoryColor,
                              }}
                            >
                              {popup.progress}%
                            </span>
                          )}
                        </div>
                        <p className="text-white font-semibold text-sm mb-1 truncate">
                          {popup.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-linear-text-tertiary">{popup.location}</span>
                          <span className="text-linear-text-quaternary">.</span>
                          <span className="font-medium" style={{ color: categoryColor }}>
                            {popup.dates}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {popup.distance !== undefined ? (
                          <>
                            <p className="font-bold text-sm mb-0.5" style={{ color: colors.info }}>
                              {formatDistance(popup.distance * 1000)}
                            </p>
                            <p className="text-linear-text-quaternary text-xs">
                              {popup.totalParticipants}명
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              className="font-bold text-sm mb-0.5"
                              style={{ color: categoryColor }}
                            >
                              {popup.totalParticipants}명
                            </p>
                            <p className="text-linear-text-quaternary text-xs">참여 중</p>
                          </>
                        )}
                      </div>
                    </m.div>
                  </m.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function MapPage() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Map page error:', error);
      }}
    >
      <MapPageContent />
    </ErrorBoundary>
  );
}
