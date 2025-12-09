/**
 * useReview - Review system hooks
 * 
 * Provides easy-to-use interfaces for:
 * - Fetching reviews
 * - Creating/editing reviews
 * - Draft management
 * - Likes and replies
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useReviewStore,
  selectReviewsByTarget,
  selectAverageRating,
  selectRatingDistribution,
  type Review,
  type ReviewDraft,
  type ReviewReply,
  type TargetType,
  type SortOption,
} from '@/stores';
import { useHaptic } from './useHaptic';

// ===========================================
// useReviews - Fetch reviews for a target
// ===========================================

export interface UseReviewsOptions {
  targetType: TargetType;
  targetId: string;
  sortBy?: SortOption;
  autoFetch?: boolean;
}

export interface UseReviewsReturn {
  reviews: Review[];
  averageRating: number;
  ratingDistribution: Record<number, number>;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useReviews(options: UseReviewsOptions): UseReviewsReturn {
  const { targetType, targetId, sortBy: initialSort = 'recent', autoFetch = true } = options;
  
  const store = useReviewStore();
  const reviews = useReviewStore(selectReviewsByTarget(targetId));
  const averageRating = useReviewStore(selectAverageRating(targetId));
  const ratingDistribution = useReviewStore(selectRatingDistribution(targetId));
  
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Fetch on mount and when sort changes
  useEffect(() => {
    if (autoFetch && targetId) {
      fetchReviews();
    }
  }, [autoFetch, targetId, store.currentSort]);
  
  const fetchReviews = async (pageNum = 1) => {
    const result = await store.fetchReviews(targetId, targetType, {
      sortBy: store.currentSort,
      page: pageNum,
      limit: 20,
    });
    setHasMore(result.hasMore);
    setTotalCount(result.total);
    setPage(pageNum);
  };
  
  const fetchMore = async () => {
    if (!hasMore || store.isLoading) return;
    await fetchReviews(page + 1);
  };
  
  const setSortBy = (sort: SortOption) => {
    store.setSort(sort);
    setPage(1);
    setHasMore(true);
  };
  
  return {
    reviews,
    averageRating,
    ratingDistribution,
    totalCount,
    isLoading: store.isLoading,
    error: store.error,
    hasMore,
    sortBy: store.currentSort,
    setSortBy,
    fetchMore,
    refresh: () => fetchReviews(1),
  };
}

// ===========================================
// useReviewForm - Review creation/editing
// ===========================================

export interface UseReviewFormOptions {
  targetType: TargetType;
  targetId: string;
  existingReview?: Review;
}

export interface UseReviewFormReturn {
  // Form state
  rating: number;
  content: string;
  images: string[];
  tags: string[];
  isDirty: boolean;
  isValid: boolean;
  
  // Draft state
  draft: ReviewDraft | undefined;
  hasDraft: boolean;
  
  // UI state
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  setRating: (rating: number) => void;
  setContent: (content: string) => void;
  addImage: (url: string) => void;
  removeImage: (index: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
  submit: () => Promise<Review | null>;
  reset: () => void;
}

export function useReviewForm(options: UseReviewFormOptions): UseReviewFormReturn {
  const { targetType, targetId, existingReview } = options;
  
  const store = useReviewStore();
  const { triggerHaptic } = useHaptic();
  
  // Form state
  const [rating, setRatingState] = useState(existingReview?.rating || 0);
  const [content, setContentState] = useState(existingReview?.content || '');
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [tags, setTags] = useState<string[]>(existingReview?.tags || []);
  const [isDirty, setIsDirty] = useState(false);
  
  // Get draft
  const draft = store.getDraft(targetId);
  
  // Validation
  const isValid = useMemo(() => {
    return rating >= 1 && rating <= 5 && content.length >= 10 && content.length <= 2000;
  }, [rating, content]);
  
  // Set rating
  const setRating = useCallback((newRating: number) => {
    setRatingState(newRating);
    setIsDirty(true);
    triggerHaptic('selection');
  }, [triggerHaptic]);
  
  // Set content
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    setIsDirty(true);
  }, []);
  
  // Image management
  const addImage = useCallback((url: string) => {
    if (images.length < 5) {
      setImages(prev => [...prev, url]);
      setIsDirty(true);
    }
  }, [images.length]);
  
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }, []);
  
  // Tag management
  const addTag = useCallback((tag: string) => {
    if (tags.length < 10 && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setIsDirty(true);
    }
  }, [tags]);
  
  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setIsDirty(true);
  }, []);
  
  // Draft management
  const saveDraft = useCallback(() => {
    store.saveDraft(targetId, {
      targetType,
      targetId,
      rating,
      content,
      images,
      tags,
    });
    triggerHaptic('success');
  }, [store, targetId, targetType, rating, content, images, tags, triggerHaptic]);
  
  const loadDraft = useCallback(() => {
    if (draft) {
      setRatingState(draft.rating);
      setContentState(draft.content);
      setImages(draft.images);
      setTags(draft.tags);
      setIsDirty(true);
    }
  }, [draft]);
  
  const clearDraft = useCallback(() => {
    store.clearDraft(targetId);
  }, [store, targetId]);
  
  // Submit
  const submit = useCallback(async (): Promise<Review | null> => {
    if (!isValid) {
      store.setError('Please fill in all required fields');
      return null;
    }
    
    try {
      const review = await store.submitReview({
        targetType,
        targetId,
        rating,
        content,
        images,
        tags,
      });
      
      triggerHaptic('success');
      clearDraft();
      
      return review;
    } catch (error) {
      triggerHaptic('error');
      return null;
    }
  }, [isValid, store, targetType, targetId, rating, content, images, tags, triggerHaptic, clearDraft]);
  
  // Reset
  const reset = useCallback(() => {
    setRatingState(existingReview?.rating || 0);
    setContentState(existingReview?.content || '');
    setImages(existingReview?.images || []);
    setTags(existingReview?.tags || []);
    setIsDirty(false);
  }, [existingReview]);
  
  return {
    rating,
    content,
    images,
    tags,
    isDirty,
    isValid,
    draft,
    hasDraft: !!draft,
    isSubmitting: store.isSubmitting,
    error: store.error,
    setRating,
    setContent,
    addImage,
    removeImage,
    addTag,
    removeTag,
    saveDraft,
    loadDraft,
    clearDraft,
    submit,
    reset,
  };
}

// ===========================================
// useReviewInteractions - Likes and replies
// ===========================================

export interface UseReviewInteractionsOptions {
  reviewId: string;
  targetId: string;
}

export interface UseReviewInteractionsReturn {
  isLiked: boolean;
  likesCount: number;
  replies: ReviewReply[];
  repliesCount: number;
  isLoadingReplies: boolean;
  toggleLike: () => Promise<void>;
  fetchReplies: () => Promise<void>;
  submitReply: (content: string) => Promise<ReviewReply | null>;
}

export function useReviewInteractions(options: UseReviewInteractionsOptions): UseReviewInteractionsReturn {
  const { reviewId, targetId } = options;
  
  const store = useReviewStore();
  const { triggerHaptic } = useHaptic();
  
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  
  // Get review data
  const reviews = useReviewStore(selectReviewsByTarget(targetId));
  const review = reviews.find(r => r.id === reviewId);
  const replies = store.repliesByReview.get(reviewId) || [];
  
  // Toggle like
  const toggleLike = useCallback(async () => {
    await store.toggleLike(reviewId, targetId);
    triggerHaptic('selection');
  }, [store, reviewId, targetId, triggerHaptic]);
  
  // Fetch replies
  const fetchReplies = useCallback(async () => {
    setIsLoadingReplies(true);
    try {
      await store.fetchReplies(reviewId);
    } finally {
      setIsLoadingReplies(false);
    }
  }, [store, reviewId]);
  
  // Submit reply
  const submitReply = useCallback(async (content: string): Promise<ReviewReply | null> => {
    try {
      const reply = await store.submitReply(reviewId, content);
      triggerHaptic('success');
      return reply;
    } catch (error) {
      triggerHaptic('error');
      return null;
    }
  }, [store, reviewId, triggerHaptic]);
  
  return {
    isLiked: review?.isLiked || false,
    likesCount: review?.likesCount || 0,
    replies,
    repliesCount: review?.repliesCount || replies.length,
    isLoadingReplies,
    toggleLike,
    fetchReplies,
    submitReply,
  };
}

// ===========================================
// useUserReviews - Current user's reviews
// ===========================================

export interface UseUserReviewsReturn {
  reviews: Review[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteReview: (reviewId: string, targetId: string) => Promise<boolean>;
}

export function useUserReviews(): UseUserReviewsReturn {
  const store = useReviewStore();
  const { triggerHaptic } = useHaptic();
  
  // Fetch on mount
  useEffect(() => {
    store.fetchUserReviews();
  }, []);
  
  // Delete review
  const deleteReview = useCallback(async (reviewId: string, targetId: string): Promise<boolean> => {
    try {
      await store.deleteReview(reviewId, targetId);
      triggerHaptic('warning');
      return true;
    } catch (error) {
      triggerHaptic('error');
      return false;
    }
  }, [store, triggerHaptic]);
  
  return {
    reviews: store.userReviews,
    totalCount: store.userReviews.length,
    isLoading: store.isLoading,
    error: store.error,
    refresh: () => store.fetchUserReviews(),
    deleteReview,
  };
}
