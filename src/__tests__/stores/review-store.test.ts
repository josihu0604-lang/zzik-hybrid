import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useReviewStore } from '@/lib/stores/review-store';

/**
 * Review Store Unit Tests
 * Tests Zustand store for review management
 */

describe('Review Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useReviewStore.setState({
      reviewsByTarget: {},
      draftsByTarget: {},
      repliesByReview: {},
      isLoading: false,
      error: null,
    });
  });

  describe('Basic State Management', () => {
    it('should initialize with empty state', () => {
      const state = useReviewStore.getState();
      
      expect(state.reviewsByTarget).toEqual({});
      expect(state.draftsByTarget).toEqual({});
      expect(state.repliesByReview).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state', () => {
      const { setLoading } = useReviewStore.getState();
      
      setLoading(true);
      expect(useReviewStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useReviewStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      const { setError } = useReviewStore.getState();
      const testError = 'Test error message';
      
      setError(testError);
      expect(useReviewStore.getState().error).toBe(testError);
      
      setError(null);
      expect(useReviewStore.getState().error).toBeNull();
    });
  });

  describe('Review Management', () => {
    const mockReview = {
      id: 'review-1',
      userId: 'user-1',
      targetId: 'restaurant-1',
      targetType: 'restaurant' as const,
      rating: 5,
      comment: 'Great restaurant!',
      photos: [],
      likes: 10,
      replies: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should add review to store', () => {
      const { addReview } = useReviewStore.getState();
      
      addReview(mockReview);
      
      const state = useReviewStore.getState();
      const reviews = state.reviewsByTarget[mockReview.targetId];
      
      expect(reviews).toBeDefined();
      expect(reviews).toHaveLength(1);
      expect(reviews[0]).toEqual(mockReview);
    });

    it('should update existing review', () => {
      const { addReview, updateReview } = useReviewStore.getState();
      
      addReview(mockReview);
      
      const updatedComment = 'Updated comment';
      updateReview(mockReview.id, { comment: updatedComment });
      
      const state = useReviewStore.getState();
      const reviews = state.reviewsByTarget[mockReview.targetId];
      const updatedReview = reviews.find(r => r.id === mockReview.id);
      
      expect(updatedReview?.comment).toBe(updatedComment);
    });

    it('should delete review from store', () => {
      const { addReview, deleteReview } = useReviewStore.getState();
      
      addReview(mockReview);
      expect(useReviewStore.getState().reviewsByTarget[mockReview.targetId]).toHaveLength(1);
      
      deleteReview(mockReview.id);
      
      const reviews = useReviewStore.getState().reviewsByTarget[mockReview.targetId];
      expect(reviews).toHaveLength(0);
    });

    it('should get reviews by target ID', () => {
      const { addReview, getReviewsByTarget } = useReviewStore.getState();
      
      const review1 = { ...mockReview, id: 'review-1' };
      const review2 = { ...mockReview, id: 'review-2' };
      
      addReview(review1);
      addReview(review2);
      
      const reviews = getReviewsByTarget(mockReview.targetId);
      
      expect(reviews).toHaveLength(2);
      expect(reviews.map(r => r.id)).toContain('review-1');
      expect(reviews.map(r => r.id)).toContain('review-2');
    });

    it('should toggle like on review', () => {
      const { addReview, toggleLike } = useReviewStore.getState();
      
      addReview(mockReview);
      
      const initialLikes = mockReview.likes;
      toggleLike(mockReview.id);
      
      const state = useReviewStore.getState();
      const review = state.reviewsByTarget[mockReview.targetId][0];
      
      // Optimistic update should increase likes
      expect(review.likes).toBe(initialLikes + 1);
    });
  });

  describe('Draft Management', () => {
    const mockDraft = {
      targetId: 'restaurant-1',
      targetType: 'restaurant' as const,
      rating: 4,
      comment: 'Draft comment',
      photos: [],
    };

    it('should save draft', () => {
      const { saveDraft } = useReviewStore.getState();
      
      saveDraft(mockDraft.targetId, mockDraft);
      
      const state = useReviewStore.getState();
      const draft = state.draftsByTarget[mockDraft.targetId];
      
      expect(draft).toEqual(mockDraft);
    });

    it('should get draft by target ID', () => {
      const { saveDraft, getDraft } = useReviewStore.getState();
      
      saveDraft(mockDraft.targetId, mockDraft);
      
      const draft = getDraft(mockDraft.targetId);
      
      expect(draft).toEqual(mockDraft);
    });

    it('should clear draft', () => {
      const { saveDraft, clearDraft, getDraft } = useReviewStore.getState();
      
      saveDraft(mockDraft.targetId, mockDraft);
      expect(getDraft(mockDraft.targetId)).toBeDefined();
      
      clearDraft(mockDraft.targetId);
      expect(getDraft(mockDraft.targetId)).toBeUndefined();
    });
  });

  describe('Reply Management', () => {
    const mockReply = {
      id: 'reply-1',
      reviewId: 'review-1',
      userId: 'user-2',
      content: 'Thank you for your review!',
      createdAt: new Date().toISOString(),
    };

    it('should add reply to review', () => {
      const { addReply } = useReviewStore.getState();
      
      addReply(mockReply.reviewId, mockReply);
      
      const state = useReviewStore.getState();
      const replies = state.repliesByReview[mockReply.reviewId];
      
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(1);
      expect(replies[0]).toEqual(mockReply);
    });

    it('should get replies by review ID', () => {
      const { addReply, getReplies } = useReviewStore.getState();
      
      const reply1 = { ...mockReply, id: 'reply-1' };
      const reply2 = { ...mockReply, id: 'reply-2' };
      
      addReply(mockReply.reviewId, reply1);
      addReply(mockReply.reviewId, reply2);
      
      const replies = getReplies(mockReply.reviewId);
      
      expect(replies).toHaveLength(2);
    });

    it('should delete reply', () => {
      const { addReply, deleteReply, getReplies } = useReviewStore.getState();
      
      addReply(mockReply.reviewId, mockReply);
      expect(getReplies(mockReply.reviewId)).toHaveLength(1);
      
      deleteReply(mockReply.id);
      expect(getReplies(mockReply.reviewId)).toHaveLength(0);
    });
  });

  describe('Selectors', () => {
    it('should get total review count for target', () => {
      const { addReview, getReviewCount } = useReviewStore.getState();
      
      const targetId = 'restaurant-1';
      const review1 = { id: 'r1', targetId, targetType: 'restaurant' as const, userId: 'u1', rating: 5, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' };
      const review2 = { ...review1, id: 'r2' };
      
      addReview(review1);
      addReview(review2);
      
      const count = getReviewCount(targetId);
      expect(count).toBe(2);
    });

    it('should get average rating for target', () => {
      const { addReview, getAverageRating } = useReviewStore.getState();
      
      const targetId = 'restaurant-1';
      const review1 = { id: 'r1', targetId, targetType: 'restaurant' as const, userId: 'u1', rating: 4, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' };
      const review2 = { ...review1, id: 'r2', rating: 5 };
      const review3 = { ...review1, id: 'r3', rating: 3 };
      
      addReview(review1);
      addReview(review2);
      addReview(review3);
      
      const avgRating = getAverageRating(targetId);
      expect(avgRating).toBe(4); // (4 + 5 + 3) / 3 = 4
    });

    it('should return 0 for average rating with no reviews', () => {
      const { getAverageRating } = useReviewStore.getState();
      
      const avgRating = getAverageRating('nonexistent-target');
      expect(avgRating).toBe(0);
    });

    it('should check if user has reviewed', () => {
      const { addReview, hasUserReviewed } = useReviewStore.getState();
      
      const targetId = 'restaurant-1';
      const userId = 'user-1';
      const review = { id: 'r1', targetId, targetType: 'restaurant' as const, userId, rating: 5, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' };
      
      expect(hasUserReviewed(targetId, userId)).toBe(false);
      
      addReview(review);
      
      expect(hasUserReviewed(targetId, userId)).toBe(true);
      expect(hasUserReviewed(targetId, 'different-user')).toBe(false);
    });
  });

  describe('Async Actions', () => {
    it('should fetch reviews and update store', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { id: 'r1', targetId: 'restaurant-1', rating: 5 },
            { id: 'r2', targetId: 'restaurant-1', rating: 4 },
          ],
        }),
      });
      
      global.fetch = mockFetch;
      
      const { fetchReviews } = useReviewStore.getState();
      await fetchReviews('restaurant-1');
      
      const reviews = useReviewStore.getState().reviewsByTarget['restaurant-1'];
      expect(reviews).toHaveLength(2);
    });

    it('should handle fetch error', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;
      
      const { fetchReviews } = useReviewStore.getState();
      await fetchReviews('restaurant-1');
      
      const error = useReviewStore.getState().error;
      expect(error).toBeTruthy();
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(() => {
      const { addReview } = useReviewStore.getState();
      const targetId = 'restaurant-1';
      
      // Add multiple reviews
      addReview({ id: 'r1', targetId, targetType: 'restaurant', userId: 'u1', rating: 5, comment: 'Excellent', photos: [], likes: 10, replies: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' });
      addReview({ id: 'r2', targetId, targetType: 'restaurant', userId: 'u2', rating: 3, comment: 'Average', photos: [], likes: 5, replies: 1, createdAt: '2024-01-02', updatedAt: '2024-01-02' });
      addReview({ id: 'r3', targetId, targetType: 'restaurant', userId: 'u3', rating: 4, comment: 'Good', photos: [], likes: 15, replies: 3, createdAt: '2024-01-03', updatedAt: '2024-01-03' });
    });

    it('should filter reviews by rating', () => {
      const { getReviewsByTarget } = useReviewStore.getState();
      
      const reviews = getReviewsByTarget('restaurant-1');
      const fiveStarReviews = reviews.filter(r => r.rating === 5);
      
      expect(fiveStarReviews).toHaveLength(1);
      expect(fiveStarReviews[0].id).toBe('r1');
    });

    it('should sort reviews by date (newest first)', () => {
      const { getReviewsByTarget } = useReviewStore.getState();
      
      const reviews = getReviewsByTarget('restaurant-1');
      const sortedByDate = [...reviews].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      expect(sortedByDate[0].id).toBe('r3'); // Most recent
      expect(sortedByDate[2].id).toBe('r1'); // Oldest
    });

    it('should sort reviews by likes (most popular)', () => {
      const { getReviewsByTarget } = useReviewStore.getState();
      
      const reviews = getReviewsByTarget('restaurant-1');
      const sortedByLikes = [...reviews].sort((a, b) => b.likes - a.likes);
      
      expect(sortedByLikes[0].id).toBe('r3'); // 15 likes
      expect(sortedByLikes[1].id).toBe('r1'); // 10 likes
      expect(sortedByLikes[2].id).toBe('r2'); // 5 likes
    });
  });
});
