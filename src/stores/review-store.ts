import { create } from 'zustand';
import { Review, ReviewDraft, ReviewSortOption } from '@/types/review';

interface ReviewState {
  reviews: Review[];
  drafts: Record<string, ReviewDraft>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addReview: (review: Review) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  setReviews: (reviews: Review[]) => void;
  toggleLike: (reviewId: string, userId: string) => void;
  
  // Drafts
  saveDraft: (targetId: string, draft: ReviewDraft) => void;
  getDraft: (targetId: string) => ReviewDraft | null;
  removeDraft: (targetId: string) => void;
  
  // Replies
  addReply: (reviewId: string, reply: any) => void;
  deleteReply: (reviewId: string, replyId: string) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  drafts: {},
  isLoading: false,
  error: null,

  addReview: (review) => set((state) => ({ 
    reviews: [review, ...state.reviews] 
  })),

  updateReview: (id, updates) => set((state) => ({
    reviews: state.reviews.map((r) => r.id === id ? { ...r, ...updates } : r)
  })),

  deleteReview: (id) => set((state) => ({
    reviews: state.reviews.filter((r) => r.id !== id)
  })),

  setReviews: (reviews) => set({ reviews }),

  toggleLike: (reviewId, userId) => set((state) => {
    const review = state.reviews.find((r) => r.id === reviewId);
    if (!review) return state;

    const isLiked = review.likedBy.includes(userId);
    const updatedReview = {
      ...review,
      likes: isLiked ? review.likes - 1 : review.likes + 1,
      likedBy: isLiked 
        ? review.likedBy.filter((id) => id !== userId)
        : [...review.likedBy, userId]
    };

    return {
      reviews: state.reviews.map((r) => r.id === reviewId ? updatedReview : r)
    };
  }),

  saveDraft: (targetId, draft) => set((state) => ({
    drafts: { ...state.drafts, [targetId]: draft }
  })),

  getDraft: (targetId) => get().drafts[targetId] || null,

  removeDraft: (targetId) => set((state) => {
    const newDrafts = { ...state.drafts };
    delete newDrafts[targetId];
    return { drafts: newDrafts };
  }),

  addReply: (reviewId, reply) => set((state) => ({
    reviews: state.reviews.map((r) => {
      if (r.id !== reviewId) return r;
      return { ...r, replies: [...(r.replies || []), reply] };
    })
  })),

  deleteReply: (reviewId, replyId) => set((state) => ({
    reviews: state.reviews.map((r) => {
      if (r.id !== reviewId) return r;
      return { ...r, replies: (r.replies || []).filter(reply => reply.id !== replyId) };
    })
  }))
}));
