import { ApiClient } from '../../../core/services/api_client';
import { ReviewModel } from '../models/review_model';

export class ReviewRemoteDataSource {
  async getReviews(filter = {}) {
    const queryParams = new URLSearchParams();
    if (filter.foodId) queryParams.set('foodId', filter.foodId);
    if (filter.orderId) queryParams.set('orderId', filter.orderId);
    if (filter.rating) queryParams.set('rating', filter.rating);

    const queryString = queryParams.toString();
    const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;
    const res = await ApiClient.get(endpoint);

    const rawList = res?.reviews || [];
    return rawList.map((item) => ReviewModel.fromJson(item));
  }

  async getReviewsByFoodId(foodId) {
    if (!foodId) return [];
    const res = await ApiClient.get(`/reviews/food/${foodId}`);
    const rawList = res?.reviews || [];
    return rawList.map((item) => ReviewModel.fromJson(item));
  }

  async getReviewByOrderId(orderId) {
    if (!orderId) return null;
    const res = await ApiClient.get(`/reviews/order/${orderId}`);
    return res?.review ? ReviewModel.fromJson(res.review) : null;
  }

  async submitReview(reviewEntity) {
    const payload = ReviewModel.toJson(reviewEntity);
    const res = await ApiClient.post('/reviews', payload);
    return ReviewModel.fromJson(res?.review || payload);
  }
}
