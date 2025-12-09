import { describe, it, expect, beforeEach } from 'vitest';
import { useReviewStore } from '@/lib/stores/review-store';
import { useGamificationStore } from '@/lib/stores/gamification-store';
import { Review } from '@/types/review';

describe('Review & Gamification Integration', () => {
  beforeEach(() => {
    useReviewStore.setState({
      reviewsByTarget: {},
      isLoading: false,
      error: null
    });
    
    useGamificationStore.setState({
      points: {
        total: 0,
        byCategory: {},
        history: [],
        tier: 'bronze',
        tierProgress: 0,
      }
    });
  });

  it('should award points when adding a review', () => {
    const review: Review = {
      id: 'r1',
      userId: 'user-1',
      targetId: 'place-1',
      targetType: 'place',
      rating: 5,
      content: 'Great place!',
      images: [],
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };

    // Action
    useReviewStore.getState().addReview(review);

    // Assert Review Store
    const reviews = useReviewStore.getState().getReviewsByTarget('place-1');
    expect(reviews).toHaveLength(1);

    // Assert Gamification Store
    const points = useGamificationStore.getState().points;
    expect(points.total).toBe(100); // Assuming 100 points per review
    expect(points.byCategory['review']).toBe(100);
    expect(points.history).toHaveLength(1);
    expect(points.history[0].reason).toContain('Review');
  });
});
