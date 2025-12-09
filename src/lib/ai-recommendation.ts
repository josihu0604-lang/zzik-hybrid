/**
 * AI-Powered Restaurant Recommendation Engine
 * Personalized suggestions based on user preferences, behavior, and context
 */

export interface UserPreferences {
  cuisineTypes: string[]; // e.g., ['korean', 'japanese', 'chinese']
  priceRange: [number, number]; // [min, max] in local currency
  dietaryRestrictions: string[]; // e.g., ['vegetarian', 'halal', 'gluten-free']
  atmosphere: string[]; // e.g., ['casual', 'fine-dining', 'romantic']
  spiceLevelTolerance: number; // 0-5 scale
  distance: number; // max distance in km
  partySize: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'late-night';
}

export interface UserBehavior {
  visitedRestaurants: string[]; // restaurant IDs
  favoriteRestaurants: string[]; // bookmarked
  ratings: Record<string, number>; // restaurantId -> rating (1-5)
  searchHistory: string[]; // search queries
  lastVisitTimestamps: Record<string, Date>;
  averageSpending: number;
  preferredTimeSlots: string[]; // e.g., ['lunch', 'dinner']
}

export interface ContextualFactors {
  currentTime: Date;
  weather?: 'sunny' | 'rainy' | 'cold' | 'hot';
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isHoliday: boolean;
  currentLocation: { lat: number; lng: number };
  travelPurpose?: 'business' | 'leisure' | 'solo' | 'family';
  localLanguage: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: string[];
  priceLevel: number; // 1-4 ($-$$$$)
  rating: number; // 0-5
  reviewCount: number;
  location: { lat: number; lng: number };
  atmosphere: string[];
  dietaryOptions: string[];
  spiceLevel: number; // 0-5
  isOpen: boolean;
  waitTime?: number; // minutes
  popularTimes: Record<string, number[]>; // day -> hourly popularity
  features: string[]; // e.g., ['outdoor-seating', 'wifi', 'parking']
  images: string[];
  description: string;
  localizedName?: Record<string, string>;
}

export interface RecommendationScore {
  restaurantId: string;
  score: number; // 0-100
  reasons: string[];
  confidence: number; // 0-1
  factors: {
    preferenceMatch: number;
    behaviorMatch: number;
    contextMatch: number;
    popularityScore: number;
    distanceScore: number;
    priceScore: number;
  };
}

/**
 * AI Recommendation Engine
 */
export class AIRecommendationEngine {
  private weights = {
    preference: 0.35,
    behavior: 0.25,
    context: 0.20,
    popularity: 0.10,
    distance: 0.05,
    price: 0.05,
  };

  /**
   * Get personalized restaurant recommendations
   */
  async getRecommendations(
    restaurants: Restaurant[],
    preferences: UserPreferences,
    behavior: UserBehavior,
    context: ContextualFactors,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    // Calculate scores for each restaurant
    const scores = restaurants.map(restaurant => 
      this.calculateRecommendationScore(restaurant, preferences, behavior, context)
    );

    // Sort by score and return top N
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate recommendation score for a restaurant
   */
  private calculateRecommendationScore(
    restaurant: Restaurant,
    preferences: UserPreferences,
    behavior: UserBehavior,
    context: ContextualFactors
  ): RecommendationScore {
    const factors = {
      preferenceMatch: this.calculatePreferenceMatch(restaurant, preferences),
      behaviorMatch: this.calculateBehaviorMatch(restaurant, behavior),
      contextMatch: this.calculateContextMatch(restaurant, context),
      popularityScore: this.calculatePopularityScore(restaurant),
      distanceScore: this.calculateDistanceScore(restaurant, preferences, context),
      priceScore: this.calculatePriceScore(restaurant, preferences, behavior),
    };

    // Weighted score
    const score = 
      factors.preferenceMatch * this.weights.preference +
      factors.behaviorMatch * this.weights.behavior +
      factors.contextMatch * this.weights.context +
      factors.popularityScore * this.weights.popularity +
      factors.distanceScore * this.weights.distance +
      factors.priceScore * this.weights.price;

    // Generate explanation reasons
    const reasons = this.generateReasons(restaurant, factors, preferences, behavior);

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(behavior, factors);

    return {
      restaurantId: restaurant.id,
      score: Math.round(score * 100),
      reasons,
      confidence,
      factors,
    };
  }

  /**
   * Calculate preference match score
   */
  private calculatePreferenceMatch(
    restaurant: Restaurant,
    preferences: UserPreferences
  ): number {
    let score = 0;
    let maxScore = 0;

    // Cuisine type match
    maxScore += 30;
    const cuisineMatch = restaurant.cuisineType.some(c => 
      preferences.cuisineTypes.includes(c)
    );
    if (cuisineMatch) score += 30;

    // Dietary restrictions
    maxScore += 20;
    const dietaryMatch = preferences.dietaryRestrictions.every(restriction =>
      restaurant.dietaryOptions.includes(restriction)
    );
    if (dietaryMatch) score += 20;

    // Atmosphere match
    maxScore += 20;
    const atmosphereMatch = restaurant.atmosphere.some(a =>
      preferences.atmosphere.includes(a)
    );
    if (atmosphereMatch) score += 20;

    // Spice level tolerance
    maxScore += 15;
    const spiceDiff = Math.abs(restaurant.spiceLevel - preferences.spiceLevelTolerance);
    score += Math.max(0, 15 - (spiceDiff * 5));

    // Party size suitability (assume all restaurants can accommodate)
    maxScore += 15;
    score += 15;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate behavior match score
   */
  private calculateBehaviorMatch(
    restaurant: Restaurant,
    behavior: UserBehavior
  ): number {
    let score = 0;

    // Previously visited and liked
    if (behavior.favoriteRestaurants.includes(restaurant.id)) {
      return 1.0; // Strong signal
    }

    // Has rating
    if (behavior.ratings[restaurant.id]) {
      const rating = behavior.ratings[restaurant.id];
      score += rating / 5; // Normalize to 0-1
    }

    // Similar to visited restaurants (collaborative filtering simulation)
    const visitedCount = behavior.visitedRestaurants.length;
    if (visitedCount > 0) {
      // Simple similarity: cuisine type overlap
      const visitedCuisines = new Set<string>();
      // In real implementation, fetch actual restaurant data
      // For now, just give partial score
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate contextual match score
   */
  private calculateContextMatch(
    restaurant: Restaurant,
    context: ContextualFactors
  ): number {
    let score = 0;
    let maxScore = 0;

    // Time-based (is it open now?)
    maxScore += 40;
    if (restaurant.isOpen) {
      score += 40;
    }

    // Popularity at current time
    maxScore += 30;
    const hour = context.currentTime.getHours();
    const dayOfWeek = context.dayOfWeek.toString();
    const popularity = restaurant.popularTimes[dayOfWeek]?.[hour] || 50;
    
    // Prefer moderate popularity (not too crowded, not too empty)
    if (popularity >= 40 && popularity <= 70) {
      score += 30;
    } else if (popularity >= 30 && popularity <= 80) {
      score += 20;
    } else {
      score += 10;
    }

    // Weather-appropriate
    maxScore += 15;
    if (context.weather === 'rainy') {
      // Prefer indoor, cozy places
      if (restaurant.features.includes('indoor-seating')) {
        score += 15;
      }
    } else if (context.weather === 'sunny') {
      // Prefer places with outdoor seating
      if (restaurant.features.includes('outdoor-seating')) {
        score += 15;
      }
    } else {
      score += 10;
    }

    // Meal type alignment
    maxScore += 15;
    const mealHour = context.currentTime.getHours();
    if (mealHour >= 7 && mealHour < 11) {
      // Breakfast
      score += 15;
    } else if (mealHour >= 11 && mealHour < 15) {
      // Lunch
      score += 15;
    } else if (mealHour >= 17 && mealHour < 22) {
      // Dinner
      score += 15;
    } else {
      score += 5;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularityScore(restaurant: Restaurant): number {
    // Weighted combination of rating and review count
    const ratingScore = restaurant.rating / 5;
    
    // Logarithmic scale for review count (diminishing returns)
    const reviewScore = Math.min(
      Math.log10(restaurant.reviewCount + 1) / 4, // Normalize to 0-1
      1.0
    );

    return ratingScore * 0.7 + reviewScore * 0.3;
  }

  /**
   * Calculate distance score
   */
  private calculateDistanceScore(
    restaurant: Restaurant,
    preferences: UserPreferences,
    context: ContextualFactors
  ): number {
    const distance = this.calculateDistance(
      context.currentLocation,
      restaurant.location
    );

    if (distance > preferences.distance) {
      return 0; // Too far
    }

    // Linear decay: closer is better
    return 1 - (distance / preferences.distance);
  }

  /**
   * Calculate price score
   */
  private calculatePriceScore(
    restaurant: Restaurant,
    preferences: UserPreferences,
    behavior: UserBehavior
  ): number {
    // Convert restaurant price level to approximate range
    const avgPrice = restaurant.priceLevel * 10000; // Rough KRW estimate

    // Check if within user's budget
    if (avgPrice >= preferences.priceRange[0] && avgPrice <= preferences.priceRange[1]) {
      return 1.0;
    }

    // Penalize based on distance from range
    const midPreference = (preferences.priceRange[0] + preferences.priceRange[1]) / 2;
    const diff = Math.abs(avgPrice - midPreference);
    const maxDiff = Math.max(
      Math.abs(preferences.priceRange[0] - midPreference),
      Math.abs(preferences.priceRange[1] - midPreference)
    );

    return Math.max(0, 1 - (diff / (maxDiff * 2)));
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private generateReasons(
    restaurant: Restaurant,
    factors: RecommendationScore['factors'],
    preferences: UserPreferences,
    behavior: UserBehavior
  ): string[] {
    const reasons: string[] = [];

    // Preference matches
    if (factors.preferenceMatch > 0.7) {
      const matchingCuisines = restaurant.cuisineType.filter(c =>
        preferences.cuisineTypes.includes(c)
      );
      if (matchingCuisines.length > 0) {
        reasons.push(`Matches your love for ${matchingCuisines.join(', ')} cuisine`);
      }
    }

    // Behavior matches
    if (behavior.favoriteRestaurants.includes(restaurant.id)) {
      reasons.push('One of your favorites');
    } else if (behavior.ratings[restaurant.id]) {
      reasons.push(`You rated this ${behavior.ratings[restaurant.id]} stars before`);
    }

    // Popularity
    if (factors.popularityScore > 0.8) {
      reasons.push(`Highly rated (${restaurant.rating}⭐ from ${restaurant.reviewCount} reviews)`);
    }

    // Distance
    if (factors.distanceScore > 0.8) {
      reasons.push('Very close to your location');
    }

    // Context
    if (factors.contextMatch > 0.7) {
      reasons.push('Perfect for this time of day');
    }

    // Wait time
    if (restaurant.waitTime && restaurant.waitTime < 15) {
      reasons.push('Short wait time');
    }

    // Special features
    if (restaurant.features.includes('michelin-star')) {
      reasons.push('Michelin-starred restaurant');
    }

    return reasons.slice(0, 3); // Top 3 reasons
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    behavior: UserBehavior,
    factors: RecommendationScore['factors']
  ): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    const dataPoints = 
      behavior.visitedRestaurants.length +
      Object.keys(behavior.ratings).length +
      behavior.favoriteRestaurants.length;

    confidence += Math.min(dataPoints / 50, 0.3); // Max +0.3

    // Strong signals = higher confidence
    if (factors.behaviorMatch > 0.8) confidence += 0.1;
    if (factors.preferenceMatch > 0.8) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Update user preferences based on behavior (machine learning simulation)
   */
  learnFromBehavior(
    currentPreferences: UserPreferences,
    behavior: UserBehavior,
    restaurants: Restaurant[]
  ): UserPreferences {
    const updatedPreferences = { ...currentPreferences };

    // Learn cuisine preferences from ratings
    const cuisineScores: Record<string, number[]> = {};
    
    Object.entries(behavior.ratings).forEach(([restaurantId, rating]) => {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant && rating >= 4) {
        restaurant.cuisineType.forEach(cuisine => {
          if (!cuisineScores[cuisine]) cuisineScores[cuisine] = [];
          cuisineScores[cuisine].push(rating);
        });
      }
    });

    // Update cuisine preferences
    const topCuisines = Object.entries(cuisineScores)
      .map(([cuisine, ratings]) => ({
        cuisine,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5)
      .map(item => item.cuisine);

    if (topCuisines.length > 0) {
      updatedPreferences.cuisineTypes = topCuisines;
    }

    // Learn price range from spending
    if (behavior.averageSpending > 0) {
      updatedPreferences.priceRange = [
        behavior.averageSpending * 0.7,
        behavior.averageSpending * 1.3,
      ];
    }

    return updatedPreferences;
  }
}

/**
 * Singleton instance
 */
export const recommendationEngine = new AIRecommendationEngine();
