import { ReviewRepository } from '../../../domain/reviews/repositories/review_repository';
import { ReviewEntity } from '../../../domain/reviews/entities/review_entity';
import { ReviewLocalDataSource } from '../datasources/review_local_datasource';
import { ReviewRemoteDataSource } from '../datasources/review_remote_datasource';

export class ReviewRepositoryImpl extends ReviewRepository {
  constructor(localDataSource, remoteDataSource) {
    super();
    if (localDataSource && typeof localDataSource === 'object' && ('localDataSource' in localDataSource || 'remoteDataSource' in localDataSource)) {
      this.localDataSource = localDataSource.localDataSource || new ReviewLocalDataSource();
      this.remoteDataSource = localDataSource.remoteDataSource || new ReviewRemoteDataSource();
    } else {
      this.localDataSource = localDataSource || new ReviewLocalDataSource();
      this.remoteDataSource = remoteDataSource || new ReviewRemoteDataSource();
    }
  }

  async getReviews(filter = {}) {
    try {
      const remoteReviews = await this.remoteDataSource.getReviews(filter);
      if (Array.isArray(remoteReviews) && remoteReviews.length > 0) {
        for (const rev of remoteReviews) {
          try {
            await this.localDataSource.saveReview(rev);
          } catch {
            // Ignore cache write error
          }
        }
        return remoteReviews;
      }
    } catch (err) {
      console.debug('[ReviewRepo] Remote fetch failed, falling back to local cache:', err.message);
    }
    return await this.localDataSource.getReviews();
  }

  async getReviewByOrderId(orderId) {
    try {
      const remote = await this.remoteDataSource.getReviewByOrderId(orderId);
      if (remote) return remote;
    } catch (err) {
      console.debug('[ReviewRepo] Remote order review fetch failed:', err.message);
    }
    return await this.localDataSource.getReviewByOrderId(orderId);
  }

  async getReviewsByFoodId(foodId) {
    try {
      const remote = await this.remoteDataSource.getReviewsByFoodId(foodId);
      if (Array.isArray(remote) && remote.length > 0) {
        return remote;
      }
    } catch (err) {
      console.debug('[ReviewRepo] Remote food reviews fetch failed:', err.message);
    }
    return await this.localDataSource.getReviewsByFoodId(foodId);
  }

  async submitReview(reviewData) {
    const entity = reviewData instanceof ReviewEntity
      ? reviewData
      : new ReviewEntity(reviewData);

    const localSaved = await this.localDataSource.saveReview(entity);

    try {
      const remoteSaved = await this.remoteDataSource.submitReview(entity);
      if (remoteSaved) {
        await this.localDataSource.saveReview(remoteSaved);
        return remoteSaved;
      }
    } catch (err) {
      console.warn('[ReviewRepo] Backend review persistence failed, saved to local cache:', err.message);
    }

    return localSaved;
  }
}
