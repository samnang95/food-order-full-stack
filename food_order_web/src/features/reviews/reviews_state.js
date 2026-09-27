import { LocalDB, DBKeys } from '../../core';
import { ReviewModel } from '../../data/reviews/models/review_model';

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Reviews feature state.
 */
export function getInitialReviewsFromStorage() {
  try {
    const raw = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, []);
    return Array.isArray(raw) ? raw.map((r) => ReviewModel.fromJson(r)) : [];
  } catch (e) {
    console.warn('[ReviewsState] Failed to parse initial reviews:', e);
    return [];
  }
}

export function computeReviewStats(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return {
      average: 5.0,
      count: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const sum = reviews.reduce((acc, curr) => acc + (curr.overallRating || 5), 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.overallRating || 5)));
    breakdown[star] = (breakdown[star] || 0) + 1;
  });

  return {
    average: avg,
    count: reviews.length,
    breakdown,
  };
}

export const createInitialReviewsState = () => {
  const initialReviews = getInitialReviewsFromStorage();
  return {
    reviews: initialReviews,
    stats: computeReviewStats(initialReviews),
    isSubmitting: false,
    isLoading: false,
    errorMessage: null,
    selectedReview: null,
  };
};
