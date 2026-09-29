import { useReducer, useEffect, useCallback } from 'react';
import { createInitialReviewsState, computeReviewStats } from './reviews_state';
import { ReviewsIntentType } from './reviews_intent';
import { container } from '../../core/di/container';
import { LocalDB, DBKeys, socketService } from '../../core';
import { ReviewModel } from '../../data/reviews/models/review_model';

/**
 * Pure Reducer: receives current state and intent, returns new state
 */
export function reviewsReducer(state, action) {
  switch (action.type) {
    case ReviewsIntentType.FETCH_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
      };

    case ReviewsIntentType.FETCH_SUCCESS: {
      const reviews = action.payload || [];
      return {
        ...state,
        isLoading: false,
        reviews,
        stats: computeReviewStats(reviews),
        errorMessage: null,
      };
    }

    case ReviewsIntentType.FETCH_ERROR:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
      };

    case ReviewsIntentType.SUBMIT_START:
      return {
        ...state,
        isSubmitting: true,
        errorMessage: null,
      };

    case ReviewsIntentType.SUBMIT_SUCCESS: {
      const savedReview = action.payload;
      const updatedReviews = [
        savedReview,
        ...state.reviews.filter((r) => r.id !== savedReview.id),
      ];
      return {
        ...state,
        isSubmitting: false,
        reviews: updatedReviews,
        stats: computeReviewStats(updatedReviews),
        errorMessage: null,
      };
    }

    case ReviewsIntentType.SUBMIT_ERROR:
      return {
        ...state,
        isSubmitting: false,
        errorMessage: action.payload,
      };

    case ReviewsIntentType.REVIEWS_UPDATED: {
      const reviews = action.payload || [];
      return {
        ...state,
        reviews,
        stats: computeReviewStats(reviews),
      };
    }

    case ReviewsIntentType.SELECT_REVIEW:
      return {
        ...state,
        selectedReview: action.payload,
      };

    case ReviewsIntentType.CLEAR_SELECTED_REVIEW:
      return {
        ...state,
        selectedReview: null,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Reviews
 */
export function useReviewsStore() {
  const [state, dispatch] = useReducer(reviewsReducer, undefined, createInitialReviewsState);

  const fetchReviews = useCallback(async () => {
    dispatch({ type: ReviewsIntentType.FETCH_START });
    try {
      const data = await container.getReviewRepository().getReviews();
      dispatch({ type: ReviewsIntentType.FETCH_SUCCESS, payload: data });
    } catch (err) {
      dispatch({
        type: ReviewsIntentType.FETCH_ERROR,
        payload: err.message || 'Failed to fetch reviews',
      });
    }
  }, []);

  const submitReview = useCallback(async (reviewData, onSuccess, onError) => {
    dispatch({ type: ReviewsIntentType.SUBMIT_START });
    try {
      const saved = await container.submitReviewUseCase.execute(reviewData);
      dispatch({ type: ReviewsIntentType.SUBMIT_SUCCESS, payload: saved });
      onSuccess?.(saved);
      return saved;
    } catch (err) {
      const errMsg = err.message || 'Failed to submit review';
      dispatch({ type: ReviewsIntentType.SUBMIT_ERROR, payload: errMsg });
      onError?.(errMsg);
      throw err;
    }
  }, []);

  /**
   * Main Intent Dispatcher: UI dispatches user intents through onIntent
   */
  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case ReviewsIntentType.FETCH_REVIEWS:
          fetchReviews();
          break;

        case ReviewsIntentType.SUBMIT_REVIEW:
          return submitReview(intent.payload, intent.meta?.onSuccess, intent.meta?.onError);

        default:
          dispatch(intent);
          break;
      }
    },
    [fetchReviews, submitReview]
  );

  // Fetch reviews on mount & synchronize across tabs, local storage, and real-time socket events
  useEffect(() => {
    fetchReviews();

    const unsubLocal = LocalDB.addListener(DBKeys.ORDER_REVIEWS, (updated) => {
      if (Array.isArray(updated)) {
        const parsed = updated.map((r) => ReviewModel.fromJson(r));
        dispatch({ type: ReviewsIntentType.REVIEWS_UPDATED, payload: parsed });
      }
    });

    const unsubSocket = socketService.onReviewCreated?.((reviewData) => {
      if (reviewData) {
        const parsed = ReviewModel.fromJson(reviewData);
        if (parsed) {
          dispatch({ type: ReviewsIntentType.SUBMIT_SUCCESS, payload: parsed });
        }
      }
    });

    return () => {
      unsubLocal?.();
      unsubSocket?.();
    };
  }, [fetchReviews]);

  // Helper query selectors
  const getReviewForOrder = useCallback(
    (orderId) => {
      if (!orderId) return null;
      return state.reviews.find((r) => r.orderId === orderId) || null;
    },
    [state.reviews]
  );

  const hasReviewedOrder = useCallback(
    (orderId) => {
      if (!orderId) return false;
      return state.reviews.some((r) => r.orderId === orderId);
    },
    [state.reviews]
  );

  const getReviewsForFood = useCallback(
    (foodId, foodName) => {
      if (!foodId && !foodName) return state.reviews;
      const strId = foodId ? String(foodId) : '';
      const strName = foodName ? String(foodName).toLowerCase() : '';
      return state.reviews.filter((r) => {
        if (strId && (r.foodId === strId || String(r.foodId) === strId)) return true;
        if (strName && r.foodName && r.foodName.toLowerCase() === strName) return true;
        return false;
      });
    },
    [state.reviews]
  );

  return {
    state,
    onIntent,
    reviews: state.reviews,
    stats: state.stats,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    submitReview,
    refreshReviews: fetchReviews,
    getReviewForOrder,
    hasReviewedOrder,
    getReviewsForFood,
  };
}
