import type { Review } from '../../domain/reviews/entities/review';

export type ReviewIntent =
  | { type: 'LOAD_REVIEWS' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_RATING_FILTER'; payload: number | 'all' }
  | { type: 'OPEN_REPLY_MODAL'; payload: Review }
  | { type: 'CLOSE_REPLY_MODAL' }
  | { type: 'SUBMIT_REPLY'; payload: { reviewId: string; message: string; adminName: string } }
  | { type: 'TOGGLE_FEATURE'; payload: string }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'CLEAR_ERROR' };
