/**
 * AI Recommendations API
 * GET /api/recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  recommendationEngine,
  type UserPreferences,
  type UserBehavior,
  type ContextualFactors,
  type Restaurant,
} from '@/lib/ai-recommendation';

// Mock restaurant data
const mockRestaurants: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Seoul BBQ House',
    cuisineType: ['korean', 'bbq'],
    priceLevel: 3,
    rating: 4.5,
    reviewCount: 324,
    location: { lat: 37.5665, lng: 126.9780 },
    atmosphere: ['casual', 'family-friendly'],
    dietaryOptions: ['gluten-free', 'vegetarian'],
    spiceLevel: 3,
    isOpen: true,
    waitTime: 25,
    popularTimes: {
      '0': Array(24).fill(50),
      '1': Array(24).fill(50),
      '2': Array(24).fill(50),
      '3': Array(24).fill(50),
      '4': Array(24).fill(50),
      '5': Array(24).fill(50),
      '6': Array(24).fill(50),
    },
    features: ['indoor-seating', 'wifi', 'parking', 'group-friendly'],
    images: ['https://images.unsplash.com/photo-1600891964092-4316c288032e'],
    description: 'Authentic Korean BBQ with premium cuts',
  },
  {
    id: 'rest_2',
    name: 'Tokyo Ramen Bar',
    cuisineType: ['japanese', 'ramen'],
    priceLevel: 2,
    rating: 4.7,
    reviewCount: 856,
    location: { lat: 37.5652, lng: 126.9882 },
    atmosphere: ['casual', 'quick-bite'],
    dietaryOptions: ['vegetarian'],
    spiceLevel: 2,
    isOpen: true,
    waitTime: 15,
    popularTimes: {
      '0': Array(24).fill(60),
      '1': Array(24).fill(60),
      '2': Array(24).fill(60),
      '3': Array(24).fill(60),
      '4': Array(24).fill(60),
      '5': Array(24).fill(60),
      '6': Array(24).fill(60),
    },
    features: ['indoor-seating', 'quick-service', 'affordable'],
    images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624'],
    description: 'Rich, flavorful ramen made fresh daily',
  },
  {
    id: 'rest_3',
    name: 'Shanghai Dim Sum',
    cuisineType: ['chinese', 'dim-sum'],
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 567,
    location: { lat: 37.5645, lng: 126.9910 },
    atmosphere: ['casual', 'family-friendly'],
    dietaryOptions: ['vegetarian', 'vegan'],
    spiceLevel: 1,
    isOpen: true,
    waitTime: 20,
    popularTimes: {
      '0': Array(24).fill(55),
      '1': Array(24).fill(55),
      '2': Array(24).fill(55),
      '3': Array(24).fill(55),
      '4': Array(24).fill(55),
      '5': Array(24).fill(55),
      '6': Array(24).fill(55),
    },
    features: ['indoor-seating', 'family-friendly', 'group-friendly'],
    images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d'],
    description: 'Traditional dim sum with modern twists',
  },
  {
    id: 'rest_4',
    name: 'Bella Italia',
    cuisineType: ['italian', 'pizza'],
    priceLevel: 3,
    rating: 4.6,
    reviewCount: 432,
    location: { lat: 37.5670, lng: 126.9800 },
    atmosphere: ['romantic', 'fine-dining'],
    dietaryOptions: ['vegetarian', 'gluten-free'],
    spiceLevel: 1,
    isOpen: true,
    waitTime: 30,
    popularTimes: {
      '0': Array(24).fill(45),
      '1': Array(24).fill(45),
      '2': Array(24).fill(45),
      '3': Array(24).fill(45),
      '4': Array(24).fill(45),
      '5': Array(24).fill(45),
      '6': Array(24).fill(45),
    },
    features: ['outdoor-seating', 'wine-bar', 'romantic', 'date-night'],
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5'],
    description: 'Authentic Italian cuisine in a cozy atmosphere',
  },
  {
    id: 'rest_5',
    name: 'Spice Paradise',
    cuisineType: ['indian', 'curry'],
    priceLevel: 2,
    rating: 4.4,
    reviewCount: 298,
    location: { lat: 37.5660, lng: 126.9850 },
    atmosphere: ['casual', 'family-friendly'],
    dietaryOptions: ['vegetarian', 'vegan', 'halal'],
    spiceLevel: 4,
    isOpen: true,
    waitTime: 18,
    popularTimes: {
      '0': Array(24).fill(50),
      '1': Array(24).fill(50),
      '2': Array(24).fill(50),
      '3': Array(24).fill(50),
      '4': Array(24).fill(50),
      '5': Array(24).fill(50),
      '6': Array(24).fill(50),
    },
    features: ['indoor-seating', 'halal', 'vegetarian-friendly'],
    images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe'],
    description: 'Aromatic Indian dishes with authentic spices',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse user preferences
    const preferences: UserPreferences = {
      cuisineTypes: searchParams.get('cuisines')?.split(',') || ['korean', 'japanese'],
      priceRange: [
        parseInt(searchParams.get('minPrice') || '10000'),
        parseInt(searchParams.get('maxPrice') || '50000'),
      ],
      dietaryRestrictions: searchParams.get('dietary')?.split(',') || [],
      atmosphere: searchParams.get('atmosphere')?.split(',') || ['casual'],
      spiceLevelTolerance: parseInt(searchParams.get('spice') || '2'),
      distance: parseFloat(searchParams.get('distance') || '5'),
      partySize: parseInt(searchParams.get('partySize') || '2'),
    };

    // Parse user behavior (normally from database)
    const userId = searchParams.get('userId') || 'anonymous';
    const behavior: UserBehavior = {
      visitedRestaurants: ['rest_1', 'rest_2'],
      favoriteRestaurants: ['rest_1'],
      ratings: {
        'rest_1': 5,
        'rest_2': 4,
      },
      searchHistory: ['korean bbq', 'ramen'],
      lastVisitTimestamps: {
        'rest_1': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        'rest_2': new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      averageSpending: 30000,
      preferredTimeSlots: ['dinner'],
    };

    // Context
    const context: ContextualFactors = {
      currentTime: new Date(),
      dayOfWeek: new Date().getDay(),
      isHoliday: false,
      currentLocation: {
        lat: parseFloat(searchParams.get('lat') || '37.5665'),
        lng: parseFloat(searchParams.get('lng') || '126.9780'),
      },
      localLanguage: searchParams.get('locale') || 'en',
      weather: (searchParams.get('weather') as any) || 'sunny',
    };

    // Get recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      mockRestaurants,
      preferences,
      behavior,
      context,
      parseInt(searchParams.get('limit') || '10')
    );

    return NextResponse.json({
      success: true,
      recommendations,
      restaurants: mockRestaurants,
      preferences,
      context: {
        ...context,
        currentTime: context.currentTime.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Recommendations API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update user preferences based on behavior
 * POST /api/recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'rate_restaurant') {
      // Store rating (in production, save to database)
      console.log('Rating stored:', data);
      return NextResponse.json({ success: true });
    }

    if (action === 'favorite_restaurant') {
      // Store favorite (in production, save to database)
      console.log('Favorite stored:', data);
      return NextResponse.json({ success: true });
    }

    if (action === 'visit_restaurant') {
      // Track visit (in production, save to database)
      console.log('Visit tracked:', data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Recommendations API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
