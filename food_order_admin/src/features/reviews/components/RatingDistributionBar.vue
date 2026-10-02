<script setup lang="ts">
import type { ReviewRatingStats } from '../../../domain/reviews/entities/review';
import { Star } from 'lucide-vue-next';

const props = defineProps<{
  stats: ReviewRatingStats;
  selectedRating: number | 'all';
}>();

const emit = defineEmits<{
  (e: 'select-rating', rating: number | 'all'): void;
}>();

function getPercentage(star: 5 | 4 | 3 | 2 | 1): number {
  if (!props.stats.totalReviews) return 0;
  const count = props.stats.breakdown[star] || 0;
  return Math.round((count / props.stats.totalReviews) * 100);
}
</script>

<template>
  <div class="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row items-center gap-8 shadow-xl">
    <!-- Big Average Score Callout -->
    <div class="flex flex-col items-center justify-center text-center md:border-r border-slate-800 md:pr-8 min-w-[170px]">
      <div class="text-5xl font-black text-white font-mono tracking-tight">
        {{ stats.averageRating.toFixed(1) }}
      </div>

      <!-- 5-Star Icons -->
      <div class="flex items-center gap-1 mt-2 text-amber-400">
        <Star
          v-for="i in 5"
          :key="i"
          class="w-4 h-4 fill-amber-400 text-amber-400"
        />
      </div>

      <span class="text-xs text-slate-400 mt-1.5 font-medium">
        Based on {{ stats.totalReviews }} verified reviews
      </span>

      <div class="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
        {{ stats.recommendationRate }}% would order again
      </div>
    </div>

    <!-- Rating Distribution Progress Bars -->
    <div class="flex-1 w-full space-y-2.5">
      <div
        v-for="star in ([5, 4, 3, 2, 1] as const)"
        :key="star"
        @click="emit('select-rating', selectedRating === star ? 'all' : star)"
        :class="[
          'flex items-center gap-3 text-xs cursor-pointer p-1 rounded-xl transition',
          selectedRating === star ? 'bg-slate-800' : 'hover:bg-slate-800/40'
        ]"
      >
        <div class="flex items-center gap-1 w-12 font-bold font-mono text-slate-300">
          <span>{{ star }}</span>
          <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>

        <!-- Progress bar background -->
        <div class="flex-1 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            :style="{ width: `${getPercentage(star)}%` }"
            :class="[
              'h-full rounded-full transition-all duration-500',
              star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-yellow-500' : 'bg-rose-500'
            ]"
          />
        </div>

        <div class="w-16 text-right font-mono text-slate-400 text-[11px]">
          {{ stats.breakdown[star] || 0 }} ({{ getPercentage(star) }}%)
        </div>
      </div>
    </div>
  </div>
</template>
