<script setup lang="ts">
import { onMounted } from 'vue';
import { useVoucherStore } from '../stores/voucher_store';
import type { Voucher } from '../../../domain/vouchers/entities/voucher';
import type { CreateVoucherParams } from '../../../domain/vouchers/repositories/voucher_repository';
import VoucherCard from '../components/VoucherCard.vue';
import VoucherTesterCard from '../components/VoucherTesterCard.vue';
import VoucherFormModal from '../components/VoucherFormModal.vue';
import {
  Ticket,
  Plus,
  Search,
  Sparkles,
  Percent,
  CheckCircle2,
  TrendingUp,
  Tag,
} from 'lucide-vue-next';

const voucherStore = useVoucherStore();

onMounted(() => {
  voucherStore.dispatch({ type: 'LOAD_VOUCHERS' });
});

function handleOpenCreate() {
  voucherStore.dispatch({ type: 'OPEN_CREATE_MODAL' });
}

function handleOpenEdit(voucher: Voucher) {
  voucherStore.dispatch({ type: 'OPEN_EDIT_MODAL', payload: voucher });
}

function handleCloseModal() {
  voucherStore.dispatch({ type: 'CLOSE_MODAL' });
}

function handleFormSubmit(form: CreateVoucherParams) {
  if (voucherStore.state.editingVoucher) {
    voucherStore.dispatch({
      type: 'UPDATE_VOUCHER',
      payload: { ...form, id: voucherStore.state.editingVoucher.id },
    });
  } else {
    voucherStore.dispatch({ type: 'CREATE_VOUCHER', payload: form });
  }
}

function handleToggleStatus(id: string) {
  voucherStore.dispatch({ type: 'TOGGLE_STATUS', payload: id });
}

function handleDeleteVoucher(id: string) {
  if (confirm('Are you sure you want to delete this promotional voucher?')) {
    voucherStore.dispatch({ type: 'DELETE_VOUCHER', payload: id });
  }
}

function handleCopyCode(code: string) {
  voucherStore.dispatch({ type: 'COPY_CODE', payload: code });
}

function handleValidateVoucher(payload: { code: string; subtotal: number }) {
  voucherStore.dispatch({ type: 'VALIDATE_VOUCHER', payload });
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2.5">
          <Ticket class="w-7 h-7 text-orange-500" />
          <span>{{ $t('vouchers.title') }}</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ $t('vouchers.subtitle') }}
        </p>
      </div>

      <button
        type="button"
        @click="handleOpenCreate"
        class="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-300 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>{{ $t('vouchers.createNew') }}</span>
      </button>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">Total Vouchers</span>
          <div class="p-1.5 rounded-xl bg-orange-500/10 text-orange-400">
            <Tag class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-bold text-white font-mono mt-2">
          {{ voucherStore.totalCount }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">In system catalog</div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">Active Campaigns</span>
          <div class="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-bold text-emerald-400 font-mono mt-2">
          {{ voucherStore.activeCount }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">Available for checkout</div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">Total Redemptions</span>
          <div class="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-400 font-mono mt-2">
          {{ voucherStore.totalRedemptions }}
        </div>
        <div class="text-[11px] text-slate-400 mt-1">Customer redemptions</div>
      </div>

      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">Average Savings</span>
          <div class="p-1.5 rounded-xl bg-sky-500/10 text-sky-400">
            <TrendingUp class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-bold text-sky-400 font-mono mt-2">
          ~14.5%
        </div>
        <div class="text-[11px] text-slate-400 mt-1">Order value boost</div>
      </div>
    </div>

    <!-- Live Discount Calculator Tester Widget -->
    <VoucherTesterCard
      :result="voucherStore.state.validationResult"
      :is-validating="voucherStore.state.isValidating"
      @validate="handleValidateVoucher"
    />

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:max-w-sm">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          :value="voucherStore.state.searchQuery"
          @input="voucherStore.dispatch({ type: 'SET_SEARCH', payload: ($event.target as HTMLInputElement).value })"
          type="text"
          placeholder="Search by code (e.g. WELCOME10), title, terms..."
          class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      <!-- Type and Status Filters -->
      <div class="flex items-center gap-2.5 w-full md:w-auto">
        <!-- Type Filter -->
        <select
          :value="voucherStore.state.typeFilter"
          @change="voucherStore.dispatch({ type: 'SET_TYPE_FILTER', payload: ($event.target as HTMLSelectElement).value as any })"
          class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">All Discount Types</option>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Dollar ($)</option>
        </select>

        <!-- Status Filter -->
        <select
          :value="voucherStore.state.statusFilter"
          @change="voucherStore.dispatch({ type: 'SET_STATUS_FILTER', payload: ($event.target as HTMLSelectElement).value as any })"
          class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Paused Only</option>
        </select>
      </div>
    </div>

    <!-- Vouchers Grid -->
    <div v-if="voucherStore.isLoading" class="py-16 text-center text-slate-400">
      <div class="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p class="text-xs mt-3">Loading promotional vouchers...</p>
    </div>

    <div
      v-else-if="voucherStore.filteredVouchers.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      <VoucherCard
        v-for="voucher in voucherStore.filteredVouchers"
        :key="voucher.id"
        :voucher="voucher"
        :is-copied="voucherStore.state.copiedCode === voucher.code"
        @copy="handleCopyCode"
        @edit="handleOpenEdit"
        @delete="handleDeleteVoucher"
        @toggle="handleToggleStatus"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8"
    >
      <div class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
        <Ticket class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-white">No Vouchers Found</h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto mt-1">
        No promotional coupons matched your filters. Create a new voucher or adjust your search.
      </p>
      <button
        type="button"
        @click="handleOpenCreate"
        class="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white transition cursor-pointer"
      >
        Create Voucher
      </button>
    </div>

    <!-- Create / Edit Voucher Modal -->
    <VoucherFormModal
      :is-open="voucherStore.state.isModalOpen"
      :editing-voucher="voucherStore.state.editingVoucher"
      :is-loading="voucherStore.isLoading"
      :error="voucherStore.error"
      @close="handleCloseModal"
      @submit="handleFormSubmit"
    />
  </div>
</template>
