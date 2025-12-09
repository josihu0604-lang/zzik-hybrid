'use client';

import { m } from 'framer-motion';
import { useState, useMemo, Suspense, lazy, useCallback, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Globe } from 'lucide-react'; // Globe icon added
import { MapFilters } from '@/components/map/MapFilters';
import { PopupBottomSheet } from '@/components/map/PopupBottomSheet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/geo';
import { colors } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

// Lazy load MapboxMap
const MapboxMap = lazy(() =>
  import('@/components/map/MapboxMap').then((mod) => {
    // @ts-ignore
    import('mapbox-gl/dist/mapbox-gl.css');
    return mod;
  })
);

// ============================================================================
// DATA TYPES & MOCK (Global Edition)
// ============================================================================

interface PopupLocation {
  id: string;
  brandName: string;
  title: string;
  titleEn: string; // English Title
  location: string;
  locationEn: string; // English Location desc
  address: string;
  dates: string;
  lat: number;
  lng: number;
  category: string;
  totalParticipants: number;
  progress: number;
  isConfirmed: boolean;
  distance?: number;
}

// 외국인이 좋아할 만한 성수동 '찐' 스팟으로 데이터 교체
const DEMO_POPUPS: PopupLocation[] = [
  {
    id: 'demo-1',
    brandName: 'TAMBURINS',
    title: '탬버린즈 성수 플래그십',
    titleEn: 'Tamburins Flagship Store',
    location: '성수동',
    locationEn: 'Near Dior Seongsu',
    address: '8 Yeonmujang 5-gil, Seongdong-gu, Seoul',
    dates: 'Open Run',
    lat: 37.5442,
    lng: 127.0560,
    category: 'beauty',
    totalParticipants: 890,
    progress: 100,
    isConfirmed: true,
  },
  {
    id: 'demo-2',
    brandName: 'NUDAKE',
    title: '누데이크 성수',
    titleEn: 'NUDAKE Seongsu',
    location: '성수동',
    locationEn: 'Must-visit Dessert Spot',
    address: '26 Seongsui-ro 7-gil, Seongdong-gu, Seoul',
    dates: 'Always Hot',
    lat: 37.5436,
    lng: 127.0518,
    category: 'food',
    totalParticipants: 2341,
    progress: 100,
    isConfirmed: true,
  },
  {
    id: 'demo-3',
    brandName: 'ADER ERROR',
    title: '아더에러 성수',
    titleEn: 'Ader Error Space',
    location: '성수동',
    locationEn: 'Interactive Art & Shop',
    address: '82 Seongsui-ro, Seongdong-gu, Seoul',
    dates: 'Exhibition',
    lat: 37.5415,
    lng: 127.0531,
    category: 'fashion',
    totalParticipants: 156,
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
// MAIN COMPONENT
// ============================================================================

export default function GlobalMapPage() {
  // Global State
  const [lang, setLang] = useState<'ko' | 'en'>('en'); // Default to English for Foreigners
  const [selectedPopup, setSelectedPopup] = useState<PopupLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const { position, requestPosition, error: gpsError } = useGeolocation();
  const [isLoading, setIsLoading] = useState(true);

  // Mapbox Token Check
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasMapboxToken = !!mapboxToken && !mapboxToken.includes('demo');

  useEffect(() => {
    // Simulation of API Fetch
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Filter Logic
  const filteredPopups = useMemo(() => {
    return DEMO_POPUPS.filter(p => {
        if (showNearbyOnly) return true; // Mock logic
        return true;
    });
  }, [showNearbyOnly]);

  // Handle Navigation (Google Maps for Foreigners)
  const handleNavigate = useCallback(() => {
    if (!selectedPopup) return;
    
    // Google Maps Universal Link
    // query: address or lat,lng
    const query = encodeURIComponent(`${selectedPopup.lat},${selectedPopup.lng}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    
    window.open(url, '_blank');
  }, [selectedPopup]);

  return (
    <div className="min-h-screen bg-space-950 pt-safe pb-safe text-white">
      {/* 1. Global Header */}
      <header className="sticky top-0 z-50 px-5 py-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
        <div>
            <h1 className="font-black text-xl tracking-tight">
                {lang === 'en' ? 'Seongsu Map' : '성수 핫플 지도'}
            </h1>
            <p className="text-xs text-gray-400">
                {lang === 'en' ? 'Curated for Global Travelers' : '글로벌 여행자를 위한 큐레이션'}
            </p>
        </div>
        <button 
            onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
            className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/20 transition-colors"
        >
            <Globe size={14} />
            {lang === 'en' ? 'ENG' : 'KOR'}
        </button>
      </header>

      {/* 2. Map Area */}
      <div className="relative h-[60vh] bg-neutral-900">
        {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"/>
                    <div className="text-xs text-gray-500 animate-pulse">Locating Vibe...</div>
                </div>
            </div>
        ) : (
            <div className="relative w-full h-full">
                {/* Mock Map Background for Visual */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/127.0518,37.5436,14,0/800x600?access_token=pk.mock')] bg-cover bg-center opacity-50" />
                
                {/* Markers */}
                {filteredPopups.map((popup) => (
                    <button
                        key={popup.id}
                        onClick={() => setSelectedPopup(popup)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${selectedPopup?.id === popup.id ? 'scale-125 z-20' : 'scale-100 z-10'}`}
                        style={{ 
                            left: `${50 + (popup.lng - 127.0518) * 4000}%`, 
                            top: `${50 - (popup.lat - 37.5436) * 4000}%` 
                        }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ${
                            selectedPopup?.id === popup.id 
                            ? 'bg-pink-500 border-white text-white' 
                            : 'bg-neutral-800 border-pink-500/50 text-gray-400'
                        }`}>
                            <span className="text-xs font-bold">{popup.brandName[0]}</span>
                        </div>
                    </button>
                ))}

                {/* Nearby Button */}
                <button 
                    onClick={requestPosition}
                    className="absolute bottom-6 right-6 bg-white text-black p-3 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                    <Navigation size={20} fill="black" />
                </button>
            </div>
        )}
      </div>

      {/* 3. Bottom Sheet (Popup Detail) */}
      <div className="bg-neutral-900 -mt-6 rounded-t-3xl relative z-10 min-h-[40vh] p-6 border-t border-white/10">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
        
        {selectedPopup ? (
            <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <div className="text-pink-500 text-xs font-bold tracking-wider mb-2 uppercase">
                        {selectedPopup.category} • {selectedPopup.locationEn}
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2">
                        {lang === 'en' ? selectedPopup.titleEn : selectedPopup.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {selectedPopup.address}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleNavigate}
                        className="bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <MapPin size={18} />
                        {lang === 'en' ? 'Google Maps' : '구글맵 연동'}
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-bold border border-white/10">
                        {lang === 'en' ? 'Check Vibe' : '상세보기'}
                    </button>
                </div>
            </m.div>
        ) : (
            <div className="text-center text-gray-500 py-10">
                <p className="text-lg mb-2">👇 Tap a marker</p>
                <p className="text-sm">Find the hottest spots in Seongsu.</p>
            </div>
        )}
      </div>
    </div>
  );
}
