'use client';

import { m } from 'framer-motion';
import { Star, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { CompactPrice } from '@/components/ui/PriceDisplay';

interface Experience {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  priceInUSD: number;
  waitTime?: string;
  popularityScore: number;
}

// Mock data - In production, fetch from API
const FEATURED_EXPERIENCES: Experience[] = [
  {
    id: '1',
    name: 'Seongsu Artisan Cafe',
    category: 'Cafe',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    rating: 4.8,
    reviewCount: 342,
    location: 'Seongsu-dong',
    distance: '1.2 km',
    priceInUSD: 15,
    waitTime: '15 min',
    popularityScore: 95,
  },
  {
    id: '2',
    name: 'K-BBQ Premium',
    category: 'Korean Food',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    rating: 4.9,
    reviewCount: 567,
    location: 'Gangnam',
    distance: '2.5 km',
    priceInUSD: 35,
    popularityScore: 98,
  },
  {
    id: '3',
    name: 'Hidden Jazz Bar',
    category: 'Nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    rating: 4.7,
    reviewCount: 198,
    location: 'Itaewon',
    distance: '3.8 km',
    priceInUSD: 25,
    waitTime: '30 min',
    popularityScore: 87,
  },
];

interface FeaturedExperiencesProps {
  experiences?: Experience[];
}

export default function FeaturedExperiences({ experiences = FEATURED_EXPERIENCES }: FeaturedExperiencesProps) {
  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h2 className="text-xl font-bold">Featured Experiences</h2>
        <Link href="/play" className="text-purple-600 font-medium text-sm hover:text-purple-700">
          View All
        </Link>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-2">
        {experiences.map((experience, index) => (
          <m.div
            key={experience.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex-shrink-0 w-72"
          >
            <Link href={`/play/${experience.id}`} className="block group">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                <img
                  src={experience.imageUrl}
                  alt={experience.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900">
                  {experience.category}
                </div>

                {/* Wait Time Badge */}
                {experience.waitTime && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {experience.waitTime}
                  </div>
                )}

                {/* Popularity Score */}
                {experience.popularityScore >= 90 && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-500 text-white text-xs font-bold">
                    🔥 Hot
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors line-clamp-1">
                  {experience.name}
                </h3>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{experience.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({experience.reviewCount})</span>
                </div>

                {/* Location & Distance */}
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{experience.location}</span>
                  <span className="text-gray-400">• {experience.distance}</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <CompactPrice amount={experience.priceInUSD} className="text-lg font-bold text-purple-600" />
                  <span className="text-gray-500 text-sm">per person</span>
                </div>
              </div>
            </Link>
          </m.div>
        ))}
      </div>
    </div>
  );
}
