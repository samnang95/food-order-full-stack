import type { ReviewRepository } from '../repositories/review_repository';
import type { Review } from '../entities/review';

export class ReplyToReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async execute(reviewId: string, message: string, adminName: string): Promise<Review> {
    if (!reviewId) throw new Error('Review ID is required');
    if (!message.trim()) throw new Error('Reply message cannot be empty');
    return this.reviewRepository.replyToReview(reviewId, message.trim(), adminName);
  }
}
