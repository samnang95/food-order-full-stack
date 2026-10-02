import type { Review, ReviewRatingStats } from '../entities/review';

export interface ReviewFilterParams {
  foodId?: string;
  orderId?: string;
  rating?: number;
  search?: string;
}

export interface ReviewRepository {
  getReviews(params?: ReviewFilterParams): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  replyToReview(reviewId: string, message: string, adminName: string): Promise<Review>;
  toggleFeatureReview(reviewId: string): Promise<Review>;
  deleteReview(reviewId: string): Promise<boolean>;
  getRatingStats(): Promise<ReviewRatingStats>;
}
