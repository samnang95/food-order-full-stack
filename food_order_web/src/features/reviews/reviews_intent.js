export const ReviewsIntentType = {
  FETCH_REVIEWS: 'REVIEWS/FETCH_REVIEWS',
  FETCH_START: 'REVIEWS/FETCH_START',
  FETCH_SUCCESS: 'REVIEWS/FETCH_SUCCESS',
  FETCH_ERROR: 'REVIEWS/FETCH_ERROR',

  SUBMIT_REVIEW: 'REVIEWS/SUBMIT_REVIEW',
  SUBMIT_START: 'REVIEWS/SUBMIT_START',
  SUBMIT_SUCCESS: 'REVIEWS/SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'REVIEWS/SUBMIT_ERROR',

  REVIEWS_UPDATED: 'REVIEWS/REVIEWS_UPDATED',
  SELECT_REVIEW: 'REVIEWS/SELECT_REVIEW',
  CLEAR_SELECTED_REVIEW: 'REVIEWS/CLEAR_SELECTED_REVIEW',
};

export const ReviewsIntent = {
  fetchReviews: () => ({
    type: ReviewsIntentType.FETCH_REVIEWS,
  }),

  submitReview: (reviewData, onSuccess, onError) => ({
    type: ReviewsIntentType.SUBMIT_REVIEW,
    payload: reviewData,
    meta: { onSuccess, onError },
  }),

  reviewsUpdated: (reviews) => ({
    type: ReviewsIntentType.REVIEWS_UPDATED,
    payload: reviews,
  }),

  selectReview: (review) => ({
    type: ReviewsIntentType.SELECT_REVIEW,
    payload: review,
  }),

  clearSelectedReview: () => ({
    type: ReviewsIntentType.CLEAR_SELECTED_REVIEW,
  }),
};
