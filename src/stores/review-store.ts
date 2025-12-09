/**
 * Review Store - Zustand state management for reviews
 * 
 * Manages:
 * - Reviews by target
 * - User's reviews
 * - Review drafts
 * - Review form state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================

export type TargetType = 'experience' | 'restaurant' | 'product';

export interface ReviewUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  tier: string;
}

export interface Review {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  rating: number;
  content: string;
  images: string[];
  tags: string[];
  likesCount: number;
  repliesCount?: number;
  isVerified: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
}

export interface ReviewDraft {
  targetType: TargetType;
  targetId: string;
  rating: number;
  content: string;
  images: string[];
  tags: string[];
  lastSaved: Date;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user?: ReviewUser;
}

export type SortOption = 'recent' | 'rating' | 'likes';

// ===========================================
// Store State Interface
// ===========================================

interface ReviewState {
  // State - Reviews by target (targetId -> reviews)
  reviewsByTarget: Map<string, Review[]>;
  
  // State - User's own reviews
  userReviews: Review[];
  
  // State - Drafts (targetId -> draft)
  drafts: Map<string, ReviewDraft>;
  
  // State - Replies (reviewId -> replies)
  repliesByReview: Map<string, ReviewReply[]>;
  
  // State - UI
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  currentSort: SortOption;
  
  // Actions - Reviews
  setReviews: (targetId: string, reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  removeReview: (id: string, targetId: string) => void;
  likeReview: (reviewId: string, targetId: string) => void;
  unlikeReview: (reviewId: string, targetId: string) => void;
  
  // Actions - User Reviews
  setUserReviews: (reviews: Review[]) => void;
  
  // Actions - Drafts
  saveDraft: (targetId: string, draft: Omit<ReviewDraft, 'lastSaved'>) => void;
  getDraft: (targetId: string) => ReviewDraft | undefined;
  clearDraft: (targetId: string) => void;
  
  // Actions - Replies
  setReplies: (reviewId: string, replies: ReviewReply[]) => void;
  addReply: (reviewId: string, reply: ReviewReply) => void;
  
  // Actions - UI
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  setSort: (sort: SortOption) => void;
  
  // Actions - Async
  fetchReviews: (targetId: string, targetType: TargetType, params?: {
    sortBy?: SortOption;
    page?: number;
    limit?: number;
  }) => Promise<{ reviews: Review[]; total: number; hasMore: boolean }>;
  
  fetchUserReviews: (userId?: string) => Promise<void>;
  
  submitReview: (data: {
    targetType: TargetType;
    targetId: string;
    rating: number;
    content: string;
    images?: string[];
    tags?: string[];
  }) => Promise<Review>;
  
  deleteReview: (reviewId: string, targetId: string) => Promise<void>;
  
  toggleLike: (reviewId: string, targetId: string) => Promise<void>;
  
  fetchReplies: (reviewId: string) => Promise<ReviewReply[]>;
  
  submitReply: (reviewId: string, content: string) => Promise<ReviewReply>;
  
  // Actions - Reset
  reset: () => void;
}

// ===========================================
// Initial State
// ===========================================

const initialState = {
  reviewsByTarget: new Map<string, Review[]>(),
  userReviews: [],
  drafts: new Map<string, ReviewDraft>(),
  repliesByReview: new Map<string, ReviewReply[]>(),
  isLoading: false,
  isSubmitting: false,
  error: null,
  currentSort: 'recent' as SortOption,
};

// ===========================================
// Store Implementation
// ===========================================

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Reviews Actions
      setReviews: (targetId, reviews) => {
        set(state => {
          const newMap = new Map(state.reviewsByTarget);
          newMap.set(targetId, reviews);
          return { reviewsByTarget: newMap };
        });
      },
      
      addReview: (review) => {
        set(state => {
          // Add to target reviews
          const newByTarget = new Map(state.reviewsByTarget);
          const existing = newByTarget.get(review.targetId) || [];
          newByTarget.set(review.targetId, [review, ...existing]);
          
          // Add to user reviews if it's the user's review
          const newUserReviews = [review, ...state.userReviews];
          
          return {
            reviewsByTarget: newByTarget,
            userReviews: newUserReviews,
          };
        });
      },
      
      updateReview: (id, updates) => {
        set(state => {
          // Update in target reviews
          const newByTarget = new Map(state.reviewsByTarget);
          for (const [targetId, reviews] of newByTarget.entries()) {
            const updatedReviews = reviews.map(r =>
              r.id === id ? { ...r, ...updates } : r
            );
            newByTarget.set(targetId, updatedReviews);
          }
          
          // Update in user reviews
          const newUserReviews = state.userReviews.map(r =>
            r.id === id ? { ...r, ...updates } : r
          );
          
          return {
            reviewsByTarget: newByTarget,
            userReviews: newUserReviews,
          };
        });
      },
      
      removeReview: (id, targetId) => {
        set(state => {
          // Remove from target reviews
          const newByTarget = new Map(state.reviewsByTarget);
          const existing = newByTarget.get(targetId) || [];
          newByTarget.set(targetId, existing.filter(r => r.id !== id));
          
          // Remove from user reviews
          const newUserReviews = state.userReviews.filter(r => r.id !== id);
          
          return {
            reviewsByTarget: newByTarget,
            userReviews: newUserReviews,
          };
        });
      },
      
      likeReview: (reviewId, targetId) => {
        get().updateReview(reviewId, {
          isLiked: true,
          likesCount: (get().reviewsByTarget.get(targetId)?.find(r => r.id === reviewId)?.likesCount || 0) + 1,
        });
      },
      
      unlikeReview: (reviewId, targetId) => {
        const review = get().reviewsByTarget.get(targetId)?.find(r => r.id === reviewId);
        get().updateReview(reviewId, {
          isLiked: false,
          likesCount: Math.max(0, (review?.likesCount || 1) - 1),
        });
      },
      
      // User Reviews Actions
      setUserReviews: (reviews) => {
        set({ userReviews: reviews });
      },
      
      // Draft Actions
      saveDraft: (targetId, draft) => {
        set(state => {
          const newDrafts = new Map(state.drafts);
          newDrafts.set(targetId, {
            ...draft,
            lastSaved: new Date(),
          });
          return { drafts: newDrafts };
        });
      },
      
      getDraft: (targetId) => {
        return get().drafts.get(targetId);
      },
      
      clearDraft: (targetId) => {
        set(state => {
          const newDrafts = new Map(state.drafts);
          newDrafts.delete(targetId);
          return { drafts: newDrafts };
        });
      },
      
      // Replies Actions
      setReplies: (reviewId, replies) => {
        set(state => {
          const newMap = new Map(state.repliesByReview);
          newMap.set(reviewId, replies);
          return { repliesByReview: newMap };
        });
      },
      
      addReply: (reviewId, reply) => {
        set(state => {
          const newMap = new Map(state.repliesByReview);
          const existing = newMap.get(reviewId) || [];
          newMap.set(reviewId, [...existing, reply]);
          return { repliesByReview: newMap };
        });
      },
      
      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setError: (error) => set({ error }),
      setSort: (sort) => set({ currentSort: sort }),
      
      // Async Actions
      fetchReviews: async (targetId, targetType, params = {}) => {
        const { setLoading, setError, setReviews, currentSort } = get();
        setLoading(true);
        setError(null);
        
        try {
          const queryParams = new URLSearchParams({
            targetType,
            targetId,
            sortBy: params.sortBy || currentSort,
            page: String(params.page || 1),
            limit: String(params.limit || 20),
          });
          
          const response = await fetch(`/api/reviews?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch reviews');
          }
          
          const data = await response.json();
          setReviews(targetId, data.reviews);
          
          return {
            reviews: data.reviews,
            total: data.total,
            hasMore: data.hasMore,
          };
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          return { reviews: [], total: 0, hasMore: false };
        } finally {
          setLoading(false);
        }
      },
      
      fetchUserReviews: async (userId) => {
        const { setLoading, setError, setUserReviews } = get();
        setLoading(true);
        setError(null);
        
        try {
          const queryParams = new URLSearchParams();
          if (userId) queryParams.set('userId', userId);
          
          const response = await fetch(`/api/reviews?${queryParams}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user reviews');
          }
          
          const data = await response.json();
          setUserReviews(data.reviews);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      
      submitReview: async (data) => {
        const { setSubmitting, setError, addReview, clearDraft } = get();
        setSubmitting(true);
        setError(null);
        
        try {
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit review');
          }
          
          const result = await response.json();
          addReview(result.review);
          clearDraft(data.targetId);
          
          return result.review;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          setError(message);
          throw error;
        } finally {
          setSubmitting(false);
        }
      },
      
      deleteReview: async (reviewId, targetId) => {
        const { setLoading, setError, removeReview } = get();
        setLoading(true);
        setError(null);
        
        try {
          const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete review');
          }
          
          removeReview(reviewId, targetId);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          throw error;
        } finally {
          setLoading(false);
        }
      },
      
      toggleLike: async (reviewId, targetId) => {
        const review = get().reviewsByTarget.get(targetId)?.find(r => r.id === reviewId);
        const isCurrentlyLiked = review?.isLiked || false;
        
        // Optimistic update
        if (isCurrentlyLiked) {
          get().unlikeReview(reviewId, targetId);
        } else {
          get().likeReview(reviewId, targetId);
        }
        
        try {
          const response = await fetch(`/api/reviews/${reviewId}/like`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            // Revert optimistic update
            if (isCurrentlyLiked) {
              get().likeReview(reviewId, targetId);
            } else {
              get().unlikeReview(reviewId, targetId);
            }
            throw new Error('Failed to toggle like');
          }
        } catch (error) {
          console.error('Like toggle error:', error);
        }
      },
      
      fetchReplies: async (reviewId) => {
        const { setReplies } = get();
        
        try {
          const response = await fetch(`/api/reviews/${reviewId}/replies`);
          if (!response.ok) {
            throw new Error('Failed to fetch replies');
          }
          
          const data = await response.json();
          setReplies(reviewId, data.replies);
          return data.replies;
        } catch (error) {
          console.error('Fetch replies error:', error);
          return [];
        }
      },
      
      submitReply: async (reviewId, content) => {
        const { addReply } = get();
        
        const response = await fetch(`/api/reviews/${reviewId}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit reply');
        }
        
        const data = await response.json();
        addReply(reviewId, data.reply);
        return data.reply;
      },
      
      // Reset
      reset: () => {
        set({
          ...initialState,
          reviewsByTarget: new Map(),
          drafts: new Map(),
          repliesByReview: new Map(),
        });
      },
    }),
    {
      name: 'zzik-review-storage',
      partialize: (state) => ({
        // Only persist drafts
        drafts: Array.from(state.drafts.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.drafts) {
          // Convert array back to Map
          state.drafts = new Map(state.drafts as any);
        }
      },
    }
  )
);

// ===========================================
// Selectors
// ===========================================

export const selectReviewsByTarget = (targetId: string) => (state: ReviewState) =>
  state.reviewsByTarget.get(targetId) || [];

export const selectAverageRating = (targetId: string) => (state: ReviewState) => {
  const reviews = state.reviewsByTarget.get(targetId) || [];
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
};

export const selectRatingDistribution = (targetId: string) => (state: ReviewState) => {
  const reviews = state.reviewsByTarget.get(targetId) || [];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    distribution[r.rating as keyof typeof distribution]++;
  });
  return distribution;
};
