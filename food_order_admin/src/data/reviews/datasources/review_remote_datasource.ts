import { apiClient } from '../../../core/services/api_client';
import type { ApiReviewDto } from '../models/review_model';
import type { ReviewFilterParams } from '../../../domain/reviews/repositories/review_repository';

export interface ApiReviewsResponse {
  success: boolean;
  count: number;
  reviews: ApiReviewDto[];
}

export class ReviewRemoteDataSource {
  async getReviews(params?: ReviewFilterParams): Promise<ApiReviewDto[]> {
    const res = await apiClient.get<ApiReviewsResponse>('/reviews', {
      params: {
        foodId: params?.foodId,
        orderId: params?.orderId,
        rating: params?.rating,
      },
    });
    return res.data?.reviews || [];
  }
}
