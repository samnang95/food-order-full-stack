<script setup lang="ts">
import { onMounted } from 'vue';
import { useReviewStore } from '../stores/review_store';
import type { Review } from '../../../domain/reviews/entities/review';
import RatingDistributionBar from '../components/RatingDistributionBar.vue';
import ReviewCard from '../components/ReviewCard.vue';
import ReviewReplyModal from '../components/ReviewReplyModal.vue';
import {
  MessageSquare,
  Search,
  Star,
  Sparkles,
  TrendingUp,
  ThumbsUp,
  ShieldAlert,
} from 'lucide-vue-next';

const reviewStore = useReviewStore();

onMounted(() => {
  reviewStore.dispatch({ type: 'LOAD_REVIEWS' });
});

function handleOpenReply(review: Review) {
  reviewStore.dispatch({ type: 'OPEN_REPLY_MODAL', payload: review });
}

function handleCloseReply() {
  reviewStore.dispatch({ type: 'CLOSE_REPLY_MODAL' });
}

function handleSubmitReply(payload: { reviewId: string; message: string; adminName: string }) {
  reviewStore.dispatch({ type: 'SUBMIT_REPLY', payload });
}

function handleToggleFeature(id: string) {
  reviewStore.dispatch({ type: 'TOGGLE_FEATURE', payload: id });
}

function handleDeleteReview(id: string) {
  if (confirm('Are you sure you want to remove this review?')) {
    reviewStore.dispatch({ type: 'DELETE_REVIEW', payload: id });
  }
}

function handleSelectRating(star: number | 'all') {
  reviewStore.dispatch({ type: 'SET_RATING_FILTER', payload: star });
}
</script>

<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2.5">
          <MessageSquare class="w-7 h-7 text-orange-500" />
          <span>{{ $t('reviews.title') }}</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('reviews.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Rating Distribution & Breakdown Banner -->
    <RatingDistributionBar
      :stats="reviewStore.state.stats"
      :selected-rating="reviewStore.state.ratingFilter"
      @select-rating="handleSelectRating"
    />

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:max-w-md">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          :value="reviewStore.state.searchQuery"
          @input="reviewStore.dispatch({ type: 'SET_SEARCH', payload: ($event.target as HTMLInputElement).value })"
          type="text"
          placeholder="Search by customer, dish (e.g. Wagyu, Pizza), or comment..."
          class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <!-- Star Filter Pills -->
      <div class="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
        <button
          type="button"
          @click="handleSelectRating('all')"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
            reviewStore.state.ratingFilter === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-950 border border-slate-700/80 text-slate-400 hover:text-white'
          ]"
        >
          All ({{ reviewStore.totalReviews }})
        </button>

        <button
          v-for="star in ([5, 4, 3, 2, 1] as const)"
          :key="star"
          type="button"
          @click="handleSelectRating(star)"
          :class="[
            'px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer',
            reviewStore.state.ratingFilter === star
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-950 border border-slate-700/80 text-slate-400 hover:text-white'
          ]"
        >
          <span>{{ star }}</span>
          <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
        </button>
      </div>
    </div>

    <!-- Reviews Grid -->
    <div v-if="reviewStore.state.isLoading" class="py-16 text-center text-slate-400">
      <div class="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-xs mt-3">Loading customer reviews...</p>
    </div>

    <div
      v-else-if="reviewStore.filteredReviews.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      <ReviewCard
        v-for="review in reviewStore.filteredReviews"
        :key="review.id"
        :review="review"
        @reply="handleOpenReply"
        @toggle-feature="handleToggleFeature"
        @delete="handleDeleteReview"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8"
    >
      <div class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
        <MessageSquare class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-white">No Reviews Found</h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">
        No customer feedback matched your current filters. Clear filters to see all reviews.
      </p>
      <button
        type="button"
        @click="handleSelectRating('all')"
        class="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
      >
        Reset Filters
      </button>
    </div>

    <!-- Official Reply Modal -->
    <ReviewReplyModal
      :is-open="reviewStore.state.isReplyModalOpen"
      :review="reviewStore.state.selectedReviewForReply"
      :is-loading="reviewStore.state.isSubmittingReply"
      :error="reviewStore.state.error"
      @close="handleCloseReply"
      @submit="handleSubmitReply"
    />
  </div>
</template>
