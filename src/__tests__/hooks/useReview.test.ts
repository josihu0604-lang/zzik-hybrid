import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReviews, useReviewForm, useReviewInteractions } from '@/lib/hooks/useReview';
import { useReviewStore } from '@/lib/stores/review-store';

/**
 * Review Hooks Unit Tests
 * Tests custom React hooks for review functionality
 */

describe('useReviews', () => {
  beforeEach(() => {
    // Reset store
    useReviewStore.setState({
      reviewsByTarget: {},
      draftsByTarget: {},
      repliesByReview: {},
      isLoading: false,
      error: null,
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should fetch reviews for target', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 'r1', targetId: 'restaurant-1', rating: 5, comment: 'Great!' },
          { id: 'r2', targetId: 'restaurant-1', rating: 4, comment: 'Good!' },
        ],
      }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviews('restaurant-1'));
    
    await waitFor(() => {
      expect(result.current.reviews).toHaveLength(2);
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviews('restaurant-1'));
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
    
    expect(result.current.reviews).toHaveLength(0);
  });

  it('should calculate average rating', async () => {
    const { addReview } = useReviewStore.getState();
    
    const targetId = 'restaurant-1';
    addReview({ id: 'r1', targetId, targetType: 'restaurant', userId: 'u1', rating: 5, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' });
    addReview({ id: 'r2', targetId, targetType: 'restaurant', userId: 'u2', rating: 3, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' });
    addReview({ id: 'r3', targetId, targetType: 'restaurant', userId: 'u3', rating: 4, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' });
    
    const { result } = renderHook(() => useReviews(targetId));
    
    expect(result.current.averageRating).toBe(4); // (5 + 3 + 4) / 3 = 4
  });

  it('should return review count', () => {
    const { addReview } = useReviewStore.getState();
    
    const targetId = 'restaurant-1';
    addReview({ id: 'r1', targetId, targetType: 'restaurant', userId: 'u1', rating: 5, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' });
    addReview({ id: 'r2', targetId, targetType: 'restaurant', userId: 'u2', rating: 4, comment: '', photos: [], likes: 0, replies: 0, createdAt: '', updatedAt: '' });
    
    const { result } = renderHook(() => useReviews(targetId));
    
    expect(result.current.totalReviews).toBe(2);
  });

  it('should refetch reviews', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviews('restaurant-1'));
    
    await act(async () => {
      await result.current.refetch();
    });
    
    expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + refetch
  });
});

describe('useReviewForm', () => {
  beforeEach(() => {
    useReviewStore.setState({
      reviewsByTarget: {},
      draftsByTarget: {},
      repliesByReview: {},
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    expect(result.current.rating).toBe(0);
    expect(result.current.comment).toBe('');
    expect(result.current.photos).toEqual([]);
    expect(result.current.isValid).toBe(false);
  });

  it('should update rating', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(5);
    });
    
    expect(result.current.rating).toBe(5);
  });

  it('should update comment', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setComment('Great restaurant!');
    });
    
    expect(result.current.comment).toBe('Great restaurant!');
  });

  it('should add photos', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.addPhoto('photo1.jpg');
      result.current.addPhoto('photo2.jpg');
    });
    
    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos).toContain('photo1.jpg');
  });

  it('should remove photo', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.addPhoto('photo1.jpg');
      result.current.addPhoto('photo2.jpg');
      result.current.removePhoto('photo1.jpg');
    });
    
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos).not.toContain('photo1.jpg');
  });

  it('should validate form', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    // Invalid initially
    expect(result.current.isValid).toBe(false);
    
    // Still invalid with only rating
    act(() => {
      result.current.setRating(5);
    });
    expect(result.current.isValid).toBe(false);
    
    // Valid with rating and comment
    act(() => {
      result.current.setComment('Great food and service!'); // More than 10 chars
    });
    expect(result.current.isValid).toBe(true);
  });

  it('should validate comment length', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(5);
      result.current.setComment('Short'); // Less than 10 chars
    });
    
    expect(result.current.errors.comment).toBeTruthy();
    expect(result.current.isValid).toBe(false);
  });

  it('should save draft', () => {
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(4);
      result.current.setComment('Draft comment');
      result.current.saveDraft();
    });
    
    const draft = useReviewStore.getState().draftsByTarget['restaurant-1'];
    expect(draft).toBeDefined();
    expect(draft.rating).toBe(4);
    expect(draft.comment).toBe('Draft comment');
  });

  it('should load draft on initialization', () => {
    // Save draft first
    useReviewStore.getState().saveDraft('restaurant-1', {
      targetId: 'restaurant-1',
      targetType: 'restaurant',
      rating: 3,
      comment: 'Saved draft',
      photos: ['photo1.jpg'],
    });
    
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    expect(result.current.rating).toBe(3);
    expect(result.current.comment).toBe('Saved draft');
    expect(result.current.photos).toEqual(['photo1.jpg']);
  });

  it('should submit review', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'new-review', rating: 5, comment: 'Great!' },
      }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(5);
      result.current.setComment('Great restaurant with amazing food!');
    });
    
    await act(async () => {
      await result.current.submit();
    });
    
    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should reset form after submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'review-1' } }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(5);
      result.current.setComment('Great restaurant!');
    });
    
    await act(async () => {
      await result.current.submit();
    });
    
    expect(result.current.rating).toBe(0);
    expect(result.current.comment).toBe('');
    expect(result.current.photos).toEqual([]);
  });

  it('should clear draft after successful submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'review-1' } }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewForm('restaurant-1'));
    
    act(() => {
      result.current.setRating(5);
      result.current.setComment('Great restaurant!');
      result.current.saveDraft();
    });
    
    expect(useReviewStore.getState().draftsByTarget['restaurant-1']).toBeDefined();
    
    await act(async () => {
      await result.current.submit();
    });
    
    expect(useReviewStore.getState().draftsByTarget['restaurant-1']).toBeUndefined();
  });
});

describe('useReviewInteractions', () => {
  const mockReviewId = 'review-1';

  beforeEach(() => {
    useReviewStore.setState({
      reviewsByTarget: {
        'restaurant-1': [
          { id: mockReviewId, targetId: 'restaurant-1', targetType: 'restaurant', userId: 'u1', rating: 5, comment: 'Great!', photos: [], likes: 10, replies: 2, createdAt: '', updatedAt: '' },
        ],
      },
      draftsByTarget: {},
      repliesByReview: {},
      isLoading: false,
      error: null,
    });
  });

  it('should toggle like', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, likes: 11 }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    await act(async () => {
      await result.current.toggleLike();
    });
    
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should get like status', () => {
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    // Initially not liked
    expect(result.current.isLiked).toBe(false);
    
    // After toggling
    act(() => {
      useReviewStore.getState().toggleLike(mockReviewId);
    });
    
    expect(result.current.isLiked).toBe(true);
  });

  it('should get reply count', () => {
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    expect(result.current.replyCount).toBe(2);
  });

  it('should add reply', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 'reply-1', reviewId: mockReviewId, content: 'Thank you!' },
      }),
    });
    
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    await act(async () => {
      await result.current.addReply('Thank you for your review!');
    });
    
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should get replies', () => {
    useReviewStore.getState().addReply(mockReviewId, {
      id: 'reply-1',
      reviewId: mockReviewId,
      userId: 'u2',
      content: 'Thanks!',
      createdAt: new Date().toISOString(),
    });
    
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    expect(result.current.replies).toHaveLength(1);
    expect(result.current.replies[0].content).toBe('Thanks!');
  });

  it('should handle like error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;
    
    const { result } = renderHook(() => useReviewInteractions(mockReviewId));
    
    await act(async () => {
      try {
        await result.current.toggleLike();
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});
