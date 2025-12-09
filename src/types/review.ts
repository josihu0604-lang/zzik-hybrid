export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'place' | 'user' | 'event';
  rating: number;
  content: string;
  images: string[];
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ReviewDraft {
  targetId: string;
  rating: number;
  content: string;
  images: string[];
}

export type ReviewSortOption = 'latest' | 'popular' | 'rating-high' | 'rating-low';
