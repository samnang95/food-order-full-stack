<script setup lang="ts">
import { computed } from 'vue';
import type { Voucher } from '../../../domain/vouchers/entities/voucher';
import {
  Ticket,
  Copy,
  Check,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  Percent,
  Calendar,
  Sparkles,
} from 'lucide-vue-next';

const props = defineProps<{
  voucher: Voucher;
  isCopied: boolean;
}>();

const emit = defineEmits<{
  (e: 'copy', code: string): void;
  (e: 'edit', voucher: Voucher): void;
  (e: 'delete', id: string): void;
  (e: 'toggle', id: string): void;
}>();

const discountBadge = computed(() => {
  if (props.voucher.type === 'percentage') {
    return `${props.voucher.value}% OFF`;
  }
  return `$${props.voucher.value.toFixed(2)} OFF`;
});
</script>

<template>
  <div
    :class="[
      'rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between group',
      voucher.isActive
        ? 'bg-slate-900/85 border-slate-800 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5'
        : 'bg-slate-900/40 border-slate-800/60 opacity-70'
    ]"
  >
    <!-- Top Decorative Gradient Header -->
    <div
      :class="[
        'h-2 w-full',
        voucher.isActive
          ? voucher.type === 'percentage'
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400'
            : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
          : 'bg-slate-700'
      ]"
    />

    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      <!-- Header Row: Badge & Status Switch -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'px-2.5 py-1 rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 shadow-sm',
              voucher.type === 'percentage'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            ]"
          >
            <Percent v-if="voucher.type === 'percentage'" class="w-3 h-3" />
            <DollarSign v-else class="w-3 h-3" />
            {{ discountBadge }}
          </span>

          <span
            v-if="voucher.maxDiscount"
            class="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700/50"
          >
            Up to ${{ voucher.maxDiscount.toFixed(2) }}
          </span>
        </div>

        <!-- Active Toggle Switch -->
        <label class="relative inline-flex items-center cursor-pointer" title="Toggle active status">
          <input
            type="checkbox"
            :checked="voucher.isActive"
            @change="emit('toggle', voucher.id)"
            class="sr-only peer"
          />
          <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
        </label>
      </div>

      <!-- Title & Description -->
      <div>
        <h3 class="text-base font-bold text-white font-display flex items-center gap-2">
          {{ voucher.title }}
        </h3>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {{ voucher.desc }}
        </p>
      </div>

      <!-- Code Box with Click to Copy -->
      <div class="p-2.5 rounded-xl bg-slate-950/70 border border-dashed border-slate-700/80 flex items-center justify-between">
        <div class="flex items-center gap-2 font-mono font-bold text-sm text-amber-400 tracking-wider">
          <Tag class="w-3.5 h-3.5 text-amber-400/80" />
          <span>{{ voucher.code }}</span>
        </div>

        <button
          type="button"
          @click="emit('copy', voucher.code)"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer',
            isCopied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
          ]"
        >
          <Check v-if="isCopied" class="w-3 h-3 text-emerald-400" />
          <Copy v-else class="w-3 h-3" />
          <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
        </button>
      </div>

      <!-- Stats & Conditions Row -->
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          <span>Min order: </span>
          <span class="font-semibold text-slate-200">${{ voucher.minSpend.toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Sparkles class="w-3 h-3 text-orange-400" />
          <span>Redeemed: </span>
          <span class="font-semibold text-slate-200">{{ voucher.usedCount }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          @click="emit('edit', voucher)"
          class="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-700/50 transition cursor-pointer"
          title="Edit Voucher"
        >
          <Edit2 class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          @click="emit('delete', voucher.id)"
          class="p-2 rounded-xl bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/50 transition cursor-pointer"
          title="Delete Voucher"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
