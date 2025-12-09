'use client';

import { m } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import ZPayBalanceCard from './ZPayBalanceCard';
import QuickActions from './QuickActions';
import FeaturedExperiences from './FeaturedExperiences';
import { useTranslation } from '@/i18n';

interface TouristHomeScreenProps {
  userName?: string;
  balance?: number;
}

export default function TouristHomeScreen({
  userName = 'Guest',
  balance = 0,
}: TouristHomeScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-6">
          <div>
            <m.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black"
            >
              {t('common.home')}
            </m.h1>
            <p className="text-gray-600 text-sm mt-1">
              Welcome back, <span className="font-semibold">{userName}</span> 👋
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <Link
              href="/settings"
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Z-Pay Balance Card */}
        <div className="px-6 pt-6">
          <ZPayBalanceCard balance={balance} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Divider */}
        <div className="h-2 bg-gray-50 my-2" />

        {/* Featured Experiences */}
        <FeaturedExperiences />

        {/* Divider */}
        <div className="h-2 bg-gray-50 my-2" />

        {/* Trending Now Section */}
        <div className="py-6 px-6">
          <h2 className="text-xl font-bold mb-4">Trending in Seoul</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Trend Cards */}
            {TRENDING_PLACES.map((place, index) => (
              <m.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={`/play/${place.id}`}
                  className="block rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="text-white/80 text-xs">{place.category}</p>
                    </div>
                  </div>
                </Link>
              </m.div>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <div className="py-6 px-6">
          <h2 className="text-xl font-bold mb-4">Explore Categories</h2>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((category, index) => (
              <m.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/play?category=${category.id}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl">{category.emoji}</div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {category.name}
                  </span>
                </Link>
              </m.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock data
const TRENDING_PLACES = [
  {
    id: 't1',
    name: 'Onion Seongsu',
    category: 'Cafe',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
  },
  {
    id: 't2',
    name: 'Hanok Village',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&q=80',
  },
  {
    id: 't3',
    name: 'Gangnam Club',
    category: 'Nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&q=80',
  },
  {
    id: 't4',
    name: 'K-Beauty Store',
    category: 'Shopping',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
  },
];

const CATEGORIES = [
  { id: 'food', name: 'Food', emoji: '🍜' },
  { id: 'cafe', name: 'Cafe', emoji: '☕' },
  { id: 'kpop', name: 'K-POP', emoji: '🎵' },
  { id: 'beauty', name: 'Beauty', emoji: '💄' },
  { id: 'shopping', name: 'Shop', emoji: '🛍️' },
  { id: 'nightlife', name: 'Night', emoji: '🌙' },
  { id: 'culture', name: 'Culture', emoji: '🏛️' },
  { id: 'more', name: 'More', emoji: '➕' },
];
