import type { ReviewRepository, ReviewFilterParams } from '../repositories/review_repository';
import type { Review } from '../entities/review';

export class GetReviewsUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(params?: ReviewFilterParams): Promise<Review[]> {
    return this.reviewRepository.getReviews(params);
  }
}
