import type { ReviewRepository } from '../repositories/review_repository';
import type { Review } from '../entities/review';

export class ToggleFeatureReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(reviewId: string): Promise<Review> {
    if (!reviewId) throw new Error('Review ID is required');
    return this.reviewRepository.toggleFeatureReview(reviewId);
  }
}
