<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Review } from '../../../domain/reviews/entities/review';
import { X, MessageSquare, Send, Star } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  review: Review | null;
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { reviewId: string; message: string; adminName: string }): void;
}>();

const replyMessage = ref('');
const adminName = ref('Elena Vance (Kitchen Director)');

watch(
  () => props.review,
  (rev) => {
    if (rev?.adminReply) {
      replyMessage.value = rev.adminReply.message;
      adminName.value = rev.adminReply.repliedBy;
    } else {
      replyMessage.value = '';
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!props.review || !replyMessage.value.trim()) return;
  emit('submit', {
    reviewId: props.review.id,
    message: replyMessage.value.trim(),
    adminName: adminName.value.trim() || 'Kitchen Operations Team',
  });
}
</script>

<template>
  <div
    v-if="isOpen && review"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400">
            <MessageSquare class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white font-display">
              {{ review.adminReply ? 'Update Official Response' : 'Reply to Customer Review' }}
            </h3>
            <p class="text-xs text-slate-400">
              Customer will see your response on their mobile order screen
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Customer Review Summary -->
      <div class="p-5 bg-slate-950/60 border-b border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-200">{{ review.customerName }}</span>
          <div class="flex items-center gap-1">
            <Star
              v-for="s in 5"
              :key="s"
              :class="[
                'w-3.5 h-3.5',
                s <= review.overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
              ]"
            />
          </div>
        </div>
        <p class="text-xs text-slate-300 italic">"{{ review.comment }}"</p>
      </div>

      <!-- Reply Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase text-slate-300">Reply Author Signature</label>
          <input
            v-model="adminName"
            type="text"
            required
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase text-slate-300">Official Restaurant Response</label>
          <textarea
            v-model="replyMessage"
            rows="4"
            required
            placeholder="Thank the customer or address any issue raised in their review..."
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
          />
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <span v-if="isLoading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <template v-else>
              <Send class="w-3.5 h-3.5" />
              <span>{{ review.adminReply ? 'Update Reply' : 'Send Response' }}</span>
            </template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
