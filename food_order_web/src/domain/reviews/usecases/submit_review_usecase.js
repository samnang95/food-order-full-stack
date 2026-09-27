export class SubmitReviewUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(reviewData) {
    if (!reviewData.orderId && !reviewData.foodId) {
      throw new Error('Either orderId or foodId is required to submit a review.');
    }
    return await this.reviewRepository.submitReview(reviewData);
  }
}
