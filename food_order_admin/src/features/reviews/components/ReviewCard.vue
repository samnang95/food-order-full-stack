<script setup lang="ts">
import type { Review } from '../../../domain/reviews/entities/review';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Bookmark,
  Trash2,
  CornerDownRight,
  ShieldCheck,
  Utensils,
} from 'lucide-vue-next';

defineProps<{
  review: Review;
}>();

const emit = defineEmits<{
  (e: 'reply', review: Review): void;
  (e: 'toggle-feature', id: string): void;
  (e: 'delete', id: string): void;
}>();
</script>

<template>
  <div
    :class="[
      'rounded-2xl border bg-slate-900/85 p-5 shadow-lg flex flex-col justify-between space-y-4 transition',
      review.isFeatured
        ? 'border-amber-500/40 ring-1 ring-amber-500/20'
        : 'border-slate-800 hover:border-slate-700'
    ]"
  >
    <!-- Top Row: User Avatar, Name, Rating & Date -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img
          :src="review.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
          :alt="review.customerName"
          class="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 shrink-0"
        />
        <div>
          <div class="flex items-center gap-1.5">
            <h4 class="text-sm font-bold text-white">{{ review.customerName }}</h4>
            <span class="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400" title="Verified Diner">
              <ShieldCheck class="w-3.5 h-3.5" />
            </span>
          </div>

          <div class="flex items-center gap-2 mt-0.5">
            <div class="flex items-center gap-0.5 text-amber-400">
              <Star
                v-for="s in 5"
                :key="s"
                :class="[
                  'w-3.5 h-3.5',
                  s <= review.overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                ]"
              />
            </div>
            <span class="text-[11px] font-mono font-bold text-amber-400">
              {{ review.overallRating }}.0
            </span>
          </div>
        </div>
      </div>

      <!-- Date & Featured Pin Badge -->
      <div class="text-right">
        <span class="text-[10px] text-slate-500 block font-mono">
          {{ new Date(review.createdAt).toLocaleDateString() }}
        </span>
        <span
          v-if="review.isFeatured"
          class="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold"
        >
          Featured
        </span>
      </div>
    </div>

    <!-- Dish Tag / Order Reference -->
    <div v-if="review.foodName" class="inline-flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-xl w-fit">
      <Utensils class="w-3 h-3 shrink-0" />
      <span class="font-medium">{{ review.foodName }}</span>
      <span v-if="review.orderNumber" class="text-slate-400 font-mono text-[10px]">
        ({{ review.orderNumber }})
      </span>
    </div>

    <!-- Review Text Comment -->
    <p class="text-xs text-slate-200 leading-relaxed">
      {{ review.comment }}
    </p>

    <!-- Review Tags -->
    <div v-if="review.tags && review.tags.length > 0" class="flex flex-wrap gap-1.5 pt-1">
      <span
        v-for="tag in review.tags"
        :key="tag"
        class="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Official Restaurant Response Bubble -->
    <div
      v-if="review.adminReply"
      class="p-3.5 rounded-xl bg-slate-950/80 border border-orange-500/20 space-y-1 relative"
    >
      <div class="flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-1 text-orange-400 font-bold">
          <CornerDownRight class="w-3.5 h-3.5" />
          <span>{{ review.adminReply.repliedBy }}</span>
        </div>
        <span class="text-[10px] text-slate-500 font-mono">
          {{ new Date(review.adminReply.repliedAt).toLocaleDateString() }}
        </span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed pl-4">
        {{ review.adminReply.message }}
      </p>
    </div>

    <!-- Footer Action Buttons -->
    <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
      <button
        type="button"
        @click="emit('reply', review)"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer',
          review.adminReply
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            : 'bg-orange-500 hover:bg-orange-400 text-white shadow-sm'
        ]"
      >
        <MessageSquare class="w-3.5 h-3.5" />
        <span>{{ review.adminReply ? 'Edit Response' : 'Reply to Customer' }}</span>
      </button>

      <div class="flex items-center gap-1.5">
        <!-- Feature on app toggle -->
        <button
          type="button"
          @click="emit('toggle-feature', review.id)"
          :class="[
            'p-2 rounded-xl transition cursor-pointer border',
            review.isFeatured
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
          ]"
          :title="review.isFeatured ? 'Unpin from featured' : 'Pin to featured on mobile app'"
        >
          <Bookmark class="w-3.5 h-3.5" />
        </button>

        <!-- Delete button -->
        <button
          type="button"
          @click="emit('delete', review.id)"
          class="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition cursor-pointer"
          title="Delete Review"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
