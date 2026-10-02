import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ReviewState } from '../review_state';
import { initialReviewState } from '../review_state';
import type { ReviewIntent } from '../review_intent';
import {
  GetReviewsUseCase,
  ReplyToReviewUseCase,
  ToggleFeatureReviewUseCase,
  DeleteReviewUseCase,
} from '../../../domain/reviews';
import { ReviewRepositoryImpl } from '../../../data/reviews/repositories/review_repository_impl';

export const useReviewStore = defineStore('reviews', () => {
  const repository = new ReviewRepositoryImpl();
  const getReviewsUseCase = new GetReviewsUseCase(repository);
  const replyToReviewUseCase = new ReplyToReviewUseCase(repository);
  const toggleFeatureReviewUseCase = new ToggleFeatureReviewUseCase(repository);
  const deleteReviewUseCase = new DeleteReviewUseCase(repository);

  // State
  const state = ref<ReviewState>({ ...initialReviewState });

  // Getters
  const filteredReviews = computed(() => {
    let list = state.value.reviews;

    // Star rating filter
    if (state.value.ratingFilter !== 'all') {
      list = list.filter(r => r.overallRating === state.value.ratingFilter);
    }

    // Search query
    if (state.value.searchQuery.trim()) {
      const q = state.value.searchQuery.toLowerCase();
      list = list.filter(
        r =>
          r.customerName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.foodName && r.foodName.toLowerCase().includes(q))
      );
    }

    return list;
  });

  const totalReviews = computed(() => state.value.reviews.length);
  const averageRating = computed(() => state.value.stats.averageRating);

  // Dispatch Intent handler (MVI pattern)
  async function dispatch(intent: ReviewIntent): Promise<void> {
    switch (intent.type) {
      case 'LOAD_REVIEWS': {
        state.value.isLoading = true;
        state.value.error = null;
        try {
          const [fetchedReviews, stats] = await Promise.all([
            getReviewsUseCase.execute(),
            repository.getRatingStats(),
          ]);
          state.value.reviews = fetchedReviews;
          state.value.stats = stats;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to load reviews';
        } finally {
          state.value.isLoading = false;
        }
        break;
      }

      case 'SET_SEARCH': {
        state.value.searchQuery = intent.payload;
        break;
      }

      case 'SET_RATING_FILTER': {
        state.value.ratingFilter = intent.payload;
        break;
      }

      case 'OPEN_REPLY_MODAL': {
        state.value.selectedReviewForReply = intent.payload;
        state.value.isReplyModalOpen = true;
        state.value.error = null;
        break;
      }

      case 'CLOSE_REPLY_MODAL': {
        state.value.isReplyModalOpen = false;
        state.value.selectedReviewForReply = null;
        state.value.error = null;
        break;
      }

      case 'SUBMIT_REPLY': {
        state.value.isSubmittingReply = true;
        state.value.error = null;
        try {
          const updated = await replyToReviewUseCase.execute(
            intent.payload.reviewId,
            intent.payload.message,
            intent.payload.adminName
          );

          const idx = state.value.reviews.findIndex(r => r.id === updated.id);
          if (idx >= 0) {
            state.value.reviews[idx] = updated;
          }
          state.value.isReplyModalOpen = false;
          state.value.selectedReviewForReply = null;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to submit reply';
        } finally {
          state.value.isSubmittingReply = false;
        }
        break;
      }

      case 'TOGGLE_FEATURE': {
        try {
          const updated = await toggleFeatureReviewUseCase.execute(intent.payload);
          const idx = state.value.reviews.findIndex(r => r.id === updated.id);
          if (idx >= 0) {
            state.value.reviews[idx] = updated;
          }
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to toggle featured state';
        }
        break;
      }

      case 'DELETE_REVIEW': {
        try {
          await deleteReviewUseCase.execute(intent.payload);
          state.value.reviews = state.value.reviews.filter(r => r.id !== intent.payload);
          state.value.stats = await repository.getRatingStats();
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Failed to delete review';
        }
        break;
      }

      case 'CLEAR_ERROR': {
        state.value.error = null;
        break;
      }
    }
  }

  // Load reviews initially
  dispatch({ type: 'LOAD_REVIEWS' });

  return {
    state,
    filteredReviews,
    totalReviews,
    averageRating,
    dispatch,
  };
});
