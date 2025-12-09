'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import TouristHomeScreen from '@/components/home/TouristHomeScreen';

// Force dynamic rendering for real-time data
export const dynamicMode = 'force-dynamic';

// Loading component
function HomeLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your experience...</p>
      </div>
    </div>
  );
}

export default function Home() {
  // TODO: Fetch user data and balance from Supabase
  // For now, using mock data
  const mockUserData = {
    userName: 'Alex',
    balance: 50, // USD
  };

  return (
    <Suspense fallback={<HomeLoading />}>
      <TouristHomeScreen
        userName={mockUserData.userName}
        balance={mockUserData.balance}
      />
    </Suspense>
  );
}
