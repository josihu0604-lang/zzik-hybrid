/**
 * AI Recommendations Demo Page
 * Showcase personalized restaurant recommendations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Settings, ArrowLeft } from 'lucide-react';
import { AIRecommendations } from '@/components/recommendations/AIRecommendations';
import type { RecommendationScore, Restaurant } from '@/lib/ai-recommendation';

export default function RecommendationsDemoPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // User preferences (adjustable)
  const [preferences, setPreferences] = useState({
    cuisines: ['korean', 'japanese'],
    minPrice: 10000,
    maxPrice: 50000,
    spice: 2,
    distance: 5,
    partySize: 2,
  });

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        cuisines: preferences.cuisines.join(','),
        minPrice: preferences.minPrice.toString(),
        maxPrice: preferences.maxPrice.toString(),
        spice: preferences.spice.toString(),
        distance: preferences.distance.toString(),
        partySize: preferences.partySize.toString(),
        userId: 'demo_user',
      });

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
        setRestaurants(data.restaurants);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRestaurantClick = (restaurantId: string) => {
    // Navigate to restaurant detail (placeholder)
    console.log('Restaurant clicked:', restaurantId);
    alert(`Restaurant ${restaurantId} clicked! (Detail page not implemented yet)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">AI Recommendations</h1>
              </div>
              <p className="text-sm text-gray-600">Powered by Machine Learning</p>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Preferences</h3>

            {/* Cuisine Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Types
              </label>
              <div className="flex flex-wrap gap-2">
                {['korean', 'japanese', 'chinese', 'italian', 'indian'].map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      const newCuisines = preferences.cuisines.includes(cuisine)
                        ? preferences.cuisines.filter(c => c !== cuisine)
                        : [...preferences.cuisines, cuisine];
                      setPreferences({ ...preferences, cuisines: newCuisines });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferences.cuisines.includes(cuisine)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ₩{preferences.minPrice.toLocaleString()} - ₩
                {preferences.maxPrice.toLocaleString()}
              </label>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={preferences.minPrice}
                  onChange={e =>
                    setPreferences({ ...preferences, minPrice: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="10000"
                  value={preferences.maxPrice}
                  onChange={e =>
                    setPreferences({ ...preferences, maxPrice: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spice Level Tolerance: {preferences.spice}/5
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={preferences.spice}
                onChange={e => setPreferences({ ...preferences, spice: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Distance: {preferences.distance} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={preferences.distance}
                onChange={e =>
                  setPreferences({ ...preferences, distance: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Size: {preferences.partySize}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(size => (
                  <button
                    key={size}
                    onClick={() => setPreferences({ ...preferences, partySize: size })}
                    className={`w-12 h-12 rounded-xl font-bold transition-colors ${
                      preferences.partySize === size
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                fetchRecommendations();
                setShowSettings(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Apply & Refresh
            </button>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
        >
          <h2 className="text-2xl font-bold mb-2">How It Works</h2>
          <p className="text-white/90 mb-4">
            Our AI analyzes your preferences, past behavior, current context (time, location,
            weather), and thousands of data points to recommend restaurants you'll love.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">35%</div>
              <div className="text-sm text-white/80">Preference Match</div>
            </div>
            <div>
              <div className="text-3xl font-bold">25%</div>
              <div className="text-sm text-white/80">Behavior Analysis</div>
            </div>
            <div>
              <div className="text-3xl font-bold">40%</div>
              <div className="text-sm text-white/80">Context + Popularity</div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <AIRecommendations
          recommendations={recommendations}
          restaurants={restaurants}
          onRestaurantClick={handleRestaurantClick}
          isLoading={isLoading}
          onRefresh={fetchRecommendations}
          locale="en"
        />
      </main>
    </div>
  );
}
