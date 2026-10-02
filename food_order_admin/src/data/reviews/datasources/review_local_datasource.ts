import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';
import type { Review } from '../../../domain/reviews/entities/review';

export class ReviewLocalDataSource {
  getReviews(): Review[] {
    return LocalDB.getJson<Review[]>(DBKeys.CACHED_REVIEWS, []) || [];
  }

  saveReviews(reviews: Review[]): void {
    LocalDB.setJson(DBKeys.CACHED_REVIEWS, reviews);
  }

  updateReview(review: Review): Review[] {
    const list = this.getReviews();
    const idx = list.findIndex(r => r.id === review.id);
    if (idx >= 0) {
      list[idx] = review;
      this.saveReviews(list);
    }
    return list;
  }

  deleteReview(id: string): Review[] {
    const list = this.getReviews().filter(r => r.id !== id);
    this.saveReviews(list);
    return list;
  }
}
