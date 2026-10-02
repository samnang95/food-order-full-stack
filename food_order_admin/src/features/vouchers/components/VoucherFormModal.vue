<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Voucher } from '../../../domain/vouchers/entities/voucher';
import type { CreateVoucherParams } from '../../../domain/vouchers/repositories/voucher_repository';
import {
  X,
  Tag,
  DollarSign,
  Percent,
  Check,
  AlertCircle,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  editingVoucher: Voucher | null;
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: CreateVoucherParams): void;
}>();

const code = ref('');
const title = ref('');
const desc = ref('');
const type = ref<'percentage' | 'fixed'>('percentage');
const value = ref(10);
const minSpend = ref(5);
const maxDiscount = ref<number | undefined>(5);
const usageLimit = ref(500);
const isActive = ref(true);

watch(
  () => props.editingVoucher,
  (voucher) => {
    if (voucher) {
      code.value = voucher.code;
      title.value = voucher.title;
      desc.value = voucher.desc;
      type.value = voucher.type;
      value.value = voucher.value;
      minSpend.value = voucher.minSpend;
      maxDiscount.value = voucher.maxDiscount;
      usageLimit.value = voucher.usageLimit || 500;
      isActive.value = voucher.isActive;
    } else {
      code.value = '';
      title.value = '';
      desc.value = '';
      type.value = 'percentage';
      value.value = 15;
      minSpend.value = 10;
      maxDiscount.value = 5;
      usageLimit.value = 500;
      isActive.value = true;
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit('submit', {
    code: code.value.trim().toUpperCase(),
    title: title.value.trim(),
    desc: desc.value.trim(),
    type: type.value,
    value: Number(value.value) || 0,
    minSpend: Number(minSpend.value) || 0,
    maxDiscount: maxDiscount.value ? Number(maxDiscount.value) : undefined,
    usageLimit: Number(usageLimit.value) || 500,
    isActive: isActive.value,
  });
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400">
            <Tag class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white font-display">
              {{ editingVoucher ? 'Edit Voucher' : 'Create New Voucher' }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ editingVoucher ? 'Update discount details and limits' : 'Launch a new promotional coupon campaign' }}
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

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Error Banner -->
        <div
          v-if="error"
          class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300"
        >
          <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Voucher Code -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase text-slate-300">Voucher Code</label>
            <input
              v-model="code"
              type="text"
              required
              placeholder="e.g. FLASH30"
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-amber-400 uppercase placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <!-- Discount Type Selector -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase text-slate-300">Discount Type</label>
            <div class="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-700">
              <button
                type="button"
                @click="type = 'percentage'"
                :class="[
                  'py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer',
                  type === 'percentage'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                <Percent class="w-3 h-3" />
                <span>Percent %</span>
              </button>
              <button
                type="button"
                @click="type = 'fixed'"
                :class="[
                  'py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer',
                  type === 'fixed'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                ]"
              >
                <DollarSign class="w-3 h-3" />
                <span>Fixed $</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase text-slate-300">Campaign Title</label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="e.g. 15% OFF Weekend Feast"
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
          />
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase text-slate-300">Description / Terms</label>
          <textarea
            v-model="desc"
            rows="2"
            required
            placeholder="e.g. Valid on all meals with minimum order of $10"
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <!-- Discount Value -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase text-slate-300">
              Value ({{ type === 'percentage' ? '%' : '$' }})
            </label>
            <input
              v-model.number="value"
              type="number"
              step="0.5"
              min="0.1"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <!-- Min Spend -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase text-slate-300">Min Spend ($)</label>
            <input
              v-model.number="minSpend"
              type="number"
              step="0.5"
              min="0"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <!-- Max Discount (Cap) -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold uppercase text-slate-300">Max Cap ($)</label>
            <input
              v-model.number="maxDiscount"
              type="number"
              step="0.5"
              min="0"
              placeholder="Optional"
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <!-- Active Status Toggle -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span class="text-xs font-bold text-white block">Active Campaign Status</span>
            <span class="text-[11px] text-slate-400">Enable this voucher immediately for customers</span>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="isActive"
              class="sr-only peer"
            />
            <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
          </label>
        </div>

        <!-- Submit & Cancel Buttons -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span v-if="isLoading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <template v-else>
              <Check class="w-3.5 h-3.5" />
              <span>{{ editingVoucher ? 'Save Changes' : 'Create Voucher' }}</span>
            </template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
