export class GetOrderReviewUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(orderId) {
    if (!orderId) return null;
    return await this.reviewRepository.getReviewByOrderId(orderId);
  }
}
