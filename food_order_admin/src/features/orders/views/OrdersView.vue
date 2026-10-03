<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOrdersStore } from '../stores/orders_store';
import type { OrderStatus } from '../../../domain/orders/entities/order_entity';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  XCircle,
  Eye,
  Check,
  Filter,
} from 'lucide-vue-next';

const { t } = useI18n();
const ordersStore = useOrdersStore();

const filterTabs = computed(() => [
  { key: 'all', label: t('orders.allOrders') },
  { key: 'pending', label: t('orders.pending'), icon: Clock },
  { key: 'preparing', label: t('orders.preparing'), icon: ChefHat },
  { key: 'on_delivery', label: t('orders.onDelivery'), icon: Bike },
  { key: 'delivered', label: t('orders.delivered'), icon: CheckCircle2 },
  { key: 'cancelled', label: t('orders.cancelled'), icon: XCircle },
]);

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return { label: t('orders.pending'), bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    case 'preparing':
      return { label: t('orders.preparing'), bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'on_delivery':
      return { label: t('orders.onDelivery'), bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    case 'delivered':
      return { label: t('orders.delivered'), bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'cancelled':
      return { label: t('orders.cancelled'), bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};

const getNextActionLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return t('orders.acceptOrder');
    case 'preparing':
      return t('orders.dispatchOrder');
    case 'on_delivery':
      return t('orders.completeOrder');
    default:
      return '';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold font-display text-white">{{ $t('orders.title') }}</h2>
        <p class="text-xs text-slate-400">{{ $t('orders.subtitle') }}</p>
      </div>

      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="ordersStore.searchQuery"
          type="text"
          placeholder="Filter by Order ID or Customer..."
          class="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        @click="ordersStore.activeStatusFilter = tab.key"
        :class="[
          'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
          ordersStore.activeStatusFilter === tab.key
            ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-sm'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
        ]"
      >
        <component :is="tab.icon" v-if="tab.icon" class="w-3.5 h-3.5" />
        <span>{{ tab.label }}</span>
        <span
          :class="[
            'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
            ordersStore.activeStatusFilter === tab.key
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-400'
          ]"
        >
          {{ ordersStore.statusCounts[tab.key] || 0 }}
        </span>
      </button>
    </div>

    <div v-if="ordersStore.filteredOrders.length > 0" class="space-y-3">
      <div
        v-for="order in ordersStore.filteredOrders"
        :key="order.id"
        class="glass-card rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex flex-col items-center justify-center shrink-0">
            <span class="text-xs font-mono font-bold leading-none">ORD</span>
            <span class="text-[10px] font-bold mt-1 text-slate-300">#{{ order.orderNumber.replace('#FD-', '') }}</span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white">{{ order.customerName }}</span>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                  getStatusBadge(order.status).bg
                ]"
              >
                {{ getStatusBadge(order.status).label }}
              </span>
            </div>

            <div class="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span>{{ order.customerPhone }}</span>
              <span>•</span>
              <span class="truncate max-w-xs">{{ order.customerAddress }}</span>
              <span>•</span>
              <span class="text-orange-400 font-semibold">{{ order.createdAt }}</span>
            </div>

            <div class="text-xs text-slate-300 pt-1 flex items-center gap-2">
              <span class="font-bold text-white">{{ order.items.length }} items:</span>
              <span class="text-slate-400">
                {{ order.items.map(i => `${i.quantity}x ${i.name}`).join(', ') }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div class="text-right">
            <div class="text-base font-bold font-display text-white">${{ order.total.toFixed(2) }}</div>
            <div class="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              {{ order.paymentMethod }} ({{ order.paymentStatus }})
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
              @click="ordersStore.advanceOrderStatus(order.id)"
              class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <Check class="w-3.5 h-3.5" />
              <span>{{ getNextActionLabel(order.status) }}</span>
            </button>

            <button
              @click="ordersStore.openOrderDetail(order)"
              class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
              title="Inspect order ticket"
            >
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="glass-panel rounded-2xl p-12 text-center border border-slate-800 max-w-md mx-auto"
    >
      <div class="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Filter class="w-5 h-5" />
      </div>
      <h3 class="text-sm font-bold text-white mb-1">{{ $t('orders.noOrders') }}</h3>
      <p class="text-xs text-slate-400 mb-4">No orders currently match the selected status or search filter.</p>
      <button
        @click="ordersStore.activeStatusFilter = 'all'; ordersStore.searchQuery = ''"
        class="text-xs font-semibold text-orange-400 hover:underline"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>
