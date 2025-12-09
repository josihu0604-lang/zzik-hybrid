import { useState, useCallback } from 'react';
import { useReviewStore } from '@/lib/stores/review-store';
import { ReviewDraft } from '@/types/review';

export const useReviews = (targetId?: string) => {
  const reviews = useReviewStore((state) => 
    targetId 
      ? state.reviews.filter((r) => r.targetId === targetId)
      : state.reviews
  );
  
  const averageRating = reviews.length 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return {
    reviews,
    count: reviews.length,
    averageRating,
    isLoading: useReviewStore((state) => state.isLoading),
    error: useReviewStore((state) => state.error)
  };
};

export const useReviewForm = (targetId: string) => {
  const store = useReviewStore();
  const draft = store.getDraft(targetId);
  
  const [rating, setRating] = useState(draft?.rating || 0);
  const [content, setContent] = useState(draft?.content || '');
  const [images, setImages] = useState<string[]>(draft?.images || []);

  const saveDraft = useCallback(() => {
    store.saveDraft(targetId, { targetId, rating, content, images });
  }, [targetId, rating, content, images, store]);

  const clearDraft = useCallback(() => {
    store.removeDraft(targetId);
    setRating(0);
    setContent('');
    setImages([]);
  }, [targetId, store]);

  return {
    rating,
    setRating,
    content,
    setContent,
    images,
    setImages,
    saveDraft,
    clearDraft,
    isValid: rating > 0 && content.length >= 10
  };
};

export const useReviewInteractions = () => {
  const store = useReviewStore();
  
  return {
    toggleLike: store.toggleLike,
    addReply: store.addReply,
    deleteReply: store.deleteReply
  };
};
