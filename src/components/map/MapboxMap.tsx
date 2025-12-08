'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import Map, { Marker, ViewStateChangeEvent, MapRef } from 'react-map-gl';
// Note: mapbox-gl.css is imported in map/page.tsx to avoid loading on non-map pages
import { colors } from '@/lib/design-tokens';
import { m } from 'framer-motion';
import { PopupMarker } from './PopupMarker';
import { MapControls } from './MapControls';

/**
 * MapboxMap Component - ZZIK 팝업 지도
 *
 * Features:
 * - Mapbox GL JS integration via react-map-gl
 * - Custom markers with ZZIK brand colors
 * - Interactive popups with hover effects
 * - Dark mode map style
 * - Smooth animations
 * - GPS location tracking
 * - Custom zoom/location controls
 */

export interface PopupLocation {
  id: string;
  brandName: string;
  title: string;
  location: string;
  address: string;
  dates: string;
  lat: number;
  lng: number;
  category: string;
  totalParticipants: number;
  /** 펀딩 진행률 (0-100) */
  progress?: number;
  /** 오픈 확정 여부 */
  isConfirmed?: boolean;
  /** 거리 (km, 계산됨) */
  distance?: number;
}

interface MapboxMapProps {
  popups: PopupLocation[];
  onPopupSelect?: (popup: PopupLocation | null) => void;
  selectedPopup?: PopupLocation | null;
  className?: string;
  /** 사용자 현재 위치 */
  userLocation?: { lat: number; lng: number } | null;
  /** GPS 로딩 중 */
  isLocating?: boolean;
  /** 현재 위치 요청 콜백 */
  onRequestLocation?: () => void;
}

// Category colors using ZZIK design tokens (reserved for marker styling)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CATEGORY_COLORS: Record<string, string> = {
  all: colors.flame[500],
  fashion: colors.spark[400],
  beauty: colors.ember[400],
  kpop: colors.flame[400],
  food: colors.flame[600],
  cafe: colors.spark[500],
  lifestyle: colors.ember[500],
  culture: colors.flame[300],
  tech: colors.spark[600],
};

// Seoul center coordinates
const SEOUL_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
  zoom: 11,
};

// Memoize markers to prevent re-renders on map interaction
const MemoizedPopupMarker = memo(PopupMarker);

export function MapboxMap({
  popups,
  onPopupSelect,
  selectedPopup,
  className = '',
  userLocation,
  isLocating = false,
  onRequestLocation,
}: MapboxMapProps) {
  const [viewState, setViewState] = useState(SEOUL_CENTER);
  const [hoveredPopup, setHoveredPopup] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 20),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1),
    }));
  }, []);

  // Move to user location
  const handleLocate = useCallback(() => {
    if (onRequestLocation) {
      onRequestLocation();
    }
    if (userLocation) {
      setViewState((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 14,
      }));
    }
  }, [userLocation, onRequestLocation]);

  // Fit all markers in view
  const handleFitAll = useCallback(() => {
    if (popups.length === 0) return;

    const lats = popups.map((p) => p.lat);
    const lngs = popups.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    // Calculate zoom level based on spread
    let zoom = 11;
    if (maxDiff < 0.01) zoom = 15;
    else if (maxDiff < 0.05) zoom = 13;
    else if (maxDiff < 0.1) zoom = 12;
    else if (maxDiff < 0.3) zoom = 10;
    else zoom = 9;

    setViewState((prev) => ({
      ...prev,
      latitude: centerLat,
      longitude: centerLng,
      zoom,
    }));
  }, [popups]);

  const handleMapClick = useCallback(() => {
    onPopupSelect?.(null);
  }, [onPopupSelect]);

  // Adjust view when a popup is selected
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (selectedPopup && isLoaded) {
      setViewState((prev) => ({
        ...prev,
        latitude: selectedPopup.lat,
        longitude: selectedPopup.lng,
        zoom: 14,
      }));
    }
  }, [selectedPopup, isLoaded]);

  // Cleanup map instance on unmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const currentMapRef = mapRef.current;
    return () => {
      // Cleanup map instance to prevent memory leaks
      if (currentMapRef) {
        currentMapRef.getMap()?.remove();
      }
    };
  }, []);

  // Fallback if no token
  if (!mapboxToken) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: colors.space[800] }}
      >
        <m.div
          className="text-center p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'rgba(255, 107, 91, 0.1)',
              border: '2px solid rgba(255, 107, 91, 0.2)',
            }}
            aria-hidden="true"
          >
            <span className="text-3xl" aria-hidden="true">
              🗺️
            </span>
          </div>
          <p className="text-white/60 mb-2 font-semibold" id="map-error-title">
            지도를 불러올 수 없습니다
          </p>
          <p className="text-white/60 text-sm">Mapbox 토큰이 설정되지 않았습니다</p>
        </m.div>
      </div>
    );
  }

  // Generate text alternative for screen readers
  const popupListDescription =
    popups.length > 0
      ? `지도에 ${popups.length}개의 팝업 위치가 표시되어 있습니다. ${popups.map((p) => `${p.brandName} - ${p.location}`).join(', ')}`
      : '지도에 표시된 팝업이 없습니다.';

  return (
    <div
      className={className}
      tabIndex={0}
      role="application"
      aria-label="팝업 위치 지도"
      aria-describedby="map-popup-list-description"
      onKeyDown={(e) => {
        // 키보드 네비게이션: 화살표 키로 팬, +/- 키로 줌
        const panStep = 0.01;
        const zoomStep = 0.5;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, latitude: prev.latitude + panStep }));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, latitude: prev.latitude - panStep }));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, longitude: prev.longitude - panStep }));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, longitude: prev.longitude + panStep }));
            break;
          case '+':
          case '=':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + zoomStep, 20) }));
            break;
          case '-':
          case '_':
            e.preventDefault();
            setViewState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - zoomStep, 0) }));
            break;
        }
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        onLoad={() => setIsLoaded(true)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        onClick={handleMapClick}
        attributionControl={false}
        reuseMaps
      >
        {/* Screen reader only description */}
        <div id="map-popup-list-description" className="sr-only">
          {popupListDescription}
        </div>

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <m.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Pulse ring */}
              <m.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: colors.info,
                  width: 32,
                  height: 32,
                  marginLeft: -8,
                  marginTop: -8,
                }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Center dot */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: colors.info,
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
                }}
              />
            </m.div>
          </Marker>
        )}

        {/* Popup Markers */}
        {popups.map((popup, index) => (
          <MemoizedPopupMarker
            key={popup.id}
            popup={popup}
            isSelected={selectedPopup?.id === popup.id}
            isHovered={hoveredPopup === popup.id}
            index={index}
            onClick={() => onPopupSelect?.(popup)}
            onHover={setHoveredPopup}
          />
        ))}
      </Map>

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocate}
        onFitAll={handleFitAll}
        isLocating={isLocating}
        hasUserLocation={!!userLocation}
      />
    </div>
  );
}

export default MapboxMap;
