<script setup lang="ts">
import { computed } from 'vue';
import { useOrdersStore } from '../../orders/stores/orders_store';
import type { OrderStatus } from '../../../domain/orders/entities/order_entity';
import { Eye, ChevronRight, Check } from 'lucide-vue-next';

const ordersStore = useOrdersStore();

const recentOrders = computed(() => {
  return ordersStore.orders.slice(0, 6);
});

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    case 'preparing':
      return { label: 'Preparing', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'on_delivery':
      return { label: 'On Delivery', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
    case 'delivered':
      return { label: 'Delivered', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
};
</script>

<template>
  <div class="glass-card rounded-2xl p-5 border border-slate-800/80">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-bold text-white font-display">Recent Order Operations</h3>
        <p class="text-xs text-slate-400">Manage incoming and live processing orders</p>
      </div>
      <router-link
        to="/orders"
        class="text-xs font-semibold text-orange-400 hover:text-orange-300 transition flex items-center gap-1"
      >
        <span>All Orders ({{ ordersStore.orders.length }})</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </router-link>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
          <tr>
            <th class="pb-3 font-semibold">Order ID</th>
            <th class="pb-3 font-semibold">Customer</th>
            <th class="pb-3 font-semibold">Items</th>
            <th class="pb-3 font-semibold">Total</th>
            <th class="pb-3 font-semibold">Status</th>
            <th class="pb-3 font-semibold">Time</th>
            <th class="pb-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr
            v-for="order in recentOrders"
            :key="order.id"
            class="hover:bg-slate-800/40 transition group"
          >
            <td class="py-3 font-mono font-bold text-orange-400">
              {{ order.orderNumber }}
            </td>

            <td class="py-3">
              <div class="font-medium text-slate-200">{{ order.customerName }}</div>
              <div class="text-[10px] text-slate-400">{{ order.customerPhone }}</div>
            </td>

            <td class="py-3 text-slate-300">
              <span class="font-semibold">{{ order.items.length }} items</span>
              <div class="text-[11px] text-slate-400 truncate max-w-[140px]">
                {{ order.items.map(i => i.name).join(', ') }}
              </div>
            </td>

            <td class="py-3">
              <div class="font-bold text-white">${{ order.total.toFixed(2) }}</div>
              <div class="text-[10px] uppercase font-semibold text-emerald-400">
                {{ order.paymentStatus }}
              </div>
            </td>

            <td class="py-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                  getStatusBadge(order.status).bg
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current" />
                {{ getStatusBadge(order.status).label }}
              </span>
            </td>

            <td class="py-3 text-slate-400 whitespace-nowrap">
              {{ order.createdAt }}
            </td>

            <td class="py-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                  @click.stop="ordersStore.advanceOrderStatus(order.id)"
                  class="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/30 transition text-[11px] font-medium flex items-center gap-1"
                  title="Advance Status"
                >
                  <Check class="w-3 h-3" />
                  <span>Next</span>
                </button>
                <button
                  @click="ordersStore.openOrderDetail(order)"
                  class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="View Details"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
