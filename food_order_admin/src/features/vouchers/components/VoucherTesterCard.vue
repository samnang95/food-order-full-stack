<script setup lang="ts">
import { ref } from 'vue';
import type { VoucherValidationResult } from '../../../domain/vouchers/entities/voucher';
import {
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Percent,
} from 'lucide-vue-next';

const props = defineProps<{
  result: VoucherValidationResult | null;
  isValidating: boolean;
}>();

const emit = defineEmits<{
  (e: 'validate', payload: { code: string; subtotal: number }): void;
}>();

const testCode = ref('WELCOME10');
const testSubtotal = ref(25.0);

function handleRunTest() {
  if (!testCode.value.trim()) return;
  emit('validate', {
    code: testCode.value.trim().toUpperCase(),
    subtotal: Number(testSubtotal.value) || 0,
  });
}
</script>

<template>
  <div class="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400">
          <Calculator class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-white">Live Discount Calculator</h4>
          <p class="text-[11px] text-slate-400">Test voucher math against any cart subtotal</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
        /vouchers/validate
      </span>
    </div>

    <form @submit.prevent="handleRunTest" class="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
      <!-- Voucher Code Input -->
      <div class="sm:col-span-5 space-y-1">
        <label class="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Voucher Code
        </label>
        <input
          v-model="testCode"
          type="text"
          placeholder="e.g. WELCOME10"
          required
          class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-amber-400 uppercase placeholder-slate-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      <!-- Cart Subtotal Input -->
      <div class="sm:col-span-4 space-y-1">
        <label class="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          Cart Subtotal ($)
        </label>
        <input
          v-model.number="testSubtotal"
          type="number"
          step="0.5"
          min="1"
          required
          class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
        />
      </div>

      <!-- Test Button -->
      <div class="sm:col-span-3">
        <button
          type="submit"
          :disabled="isValidating"
          class="w-full py-2 px-3 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <span v-if="isValidating" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <template v-else>
            <span>Calculate</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </template>
        </button>
      </div>
    </form>

    <!-- Calculation Result Box -->
    <div v-if="result" class="mt-4 p-3.5 rounded-xl border transition-all" :class="result.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'">
      <div class="flex items-start gap-2.5">
        <CheckCircle2 v-if="result.valid" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <AlertCircle v-else class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold" :class="result.valid ? 'text-emerald-300' : 'text-red-300'">
              {{ result.valid ? 'Voucher Valid & Applicable' : 'Voucher Rejected' }}
            </span>
            <span v-if="result.valid && result.discountAmount" class="text-xs font-mono font-bold text-emerald-400">
              -${{ result.discountAmount.toFixed(2) }}
            </span>
          </div>

          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            {{ result.message }}
          </p>

          <div v-if="result.valid" class="mt-2.5 pt-2 border-t border-emerald-500/20 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div class="bg-slate-900/60 p-1.5 rounded-lg">
              <span class="text-slate-400 block text-[10px]">Subtotal</span>
              <span class="font-mono font-bold text-slate-200">${{ testSubtotal.toFixed(2) }}</span>
            </div>
            <div class="bg-slate-900/60 p-1.5 rounded-lg">
              <span class="text-emerald-400 block text-[10px]">Discount</span>
              <span class="font-mono font-bold text-emerald-400">-${{ result.discountAmount?.toFixed(2) }}</span>
            </div>
            <div class="bg-slate-900/60 p-1.5 rounded-lg border border-emerald-500/30">
              <span class="text-slate-400 block text-[10px]">Payable</span>
              <span class="font-mono font-bold text-white">${{ result.finalSubtotal?.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
