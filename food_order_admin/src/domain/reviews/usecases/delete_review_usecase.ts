import type { ReviewRepository } from '../repositories/review_repository';

export class DeleteReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(reviewId: string): Promise<boolean> {
    if (!reviewId) throw new Error('Review ID is required');
    return this.reviewRepository.deleteReview(reviewId);
  }
}
