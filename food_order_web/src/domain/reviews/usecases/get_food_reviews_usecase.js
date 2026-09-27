export class GetFoodReviewsUseCase {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(foodId) {
    return await this.reviewRepository.getReviewsByFoodId(foodId);
  }
}
