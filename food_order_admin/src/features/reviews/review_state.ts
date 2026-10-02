import type { Review, ReviewRatingStats } from '../../domain/reviews/entities/review';

export interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  ratingFilter: number | 'all';
  stats: ReviewRatingStats;
  selectedReviewForReply: Review | null;
  isReplyModalOpen: boolean;
  isSubmittingReply: boolean;
}

export const initialReviewState: ReviewState = {
  reviews: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  ratingFilter: 'all',
  stats: {
    averageRating: 4.8,
    totalReviews: 5,
    breakdown: { 5: 3, 4: 1, 3: 1, 2: 0, 1: 0 },
    recommendationRate: 96,
  },
  selectedReviewForReply: null,
  isReplyModalOpen: false,
  isSubmittingReply: false,
};
