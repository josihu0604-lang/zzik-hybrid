'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { Flame, Bell, MapPin, Users } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import dynamic from 'next/dynamic';
import { hasCompletedOnboarding } from '@/components/onboarding';
// import { VibePortal } from '@/components/landing/VibePortal'; // Direct import for static check

// Dynamically load heavy components
const VibePortal = dynamic(() => import('@/components/landing/VibePortal').then(mod => mod.VibePortal), {
  ssr: false,
});

const MapboxMap = dynamic(() => import('@/components/map/MapboxMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-space-900 animate-pulse" />
});

// ... (Keep existing imports)

export default function Home() {
  // Check if it's the first visit (or specific condition to show Portal)
  // For Phase 1 demo, we force show the Portal
  const showPortal = true; 

  if (showPortal) {
    return <VibePortal />;
  }

  return (
    <ErrorBoundary onError={(error) => console.error('Home page error:', error)}>
      <HomeContent />
    </ErrorBoundary>
  );
}
