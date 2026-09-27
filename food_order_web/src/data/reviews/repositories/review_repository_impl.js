import { ReviewRepository } from '../../../domain/reviews/repositories/review_repository';
import { ReviewEntity } from '../../../domain/reviews/entities/review_entity';

export class ReviewRepositoryImpl extends ReviewRepository {
  constructor(localDataSource) {
    super();
    this.localDataSource = localDataSource;
  }

  async getReviews() {
    return await this.localDataSource.getReviews();
  }

  async getReviewByOrderId(orderId) {
    return await this.localDataSource.getReviewByOrderId(orderId);
  }

  async getReviewsByFoodId(foodId) {
    return await this.localDataSource.getReviewsByFoodId(foodId);
  }

  async submitReview(reviewData) {
    const entity = reviewData instanceof ReviewEntity
      ? reviewData
      : new ReviewEntity(reviewData);

    return await this.localDataSource.saveReview(entity);
  }
}
