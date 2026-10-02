<script setup lang="ts">
import { computed } from 'vue';
import { useOrdersStore } from '../../orders/stores/orders_store';
import { useMenuStore } from '../../menu/stores/menu_store';
import StatCard from '../components/StatCard.vue';
import LiveOrderPipeline from '../components/LiveOrderPipeline.vue';
import RevenueChart from '../components/RevenueChart.vue';
import TopSellingList from '../components/TopSellingList.vue';
import RecentOrdersTable from '../components/RecentOrdersTable.vue';
import {
  DollarSign,
  ShoppingBag,
  Timer,
  Users,
  Sparkles,
  ArrowUpRight,
} from 'lucide-vue-next';

const ordersStore = useOrdersStore();
const menuStore = useMenuStore();

const metrics = computed(() => [
  {
    title: 'Gross Revenue',
    value: `$${ordersStore.totalRevenue.toFixed(2)}`,
    change: 18.4,
    isPositive: true,
    period: 'vs last week',
    icon: DollarSign,
    colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  {
    title: 'Active Orders',
    value: ordersStore.activeOrdersCount,
    change: 8.2,
    isPositive: true,
    period: 'in realtime',
    icon: ShoppingBag,
    colorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  },
  {
    title: 'Average Prep Time',
    value: '14 mins',
    change: 4.8,
    isPositive: true,
    period: 'faster than target',
    icon: Timer,
    colorClass: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  },
  {
    title: 'Menu Items Active',
    value: `${menuStore.availableCount} / ${menuStore.foods.length}`,
    change: 2.1,
    isPositive: true,
    period: 'items available',
    icon: Users,
    colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
]);
</script>

<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-orange-600/20 via-amber-600/10 to-slate-900 border border-orange-500/20 shadow-xl">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30 mb-2">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Kitchen & Delivery Operations Center</span>
          </div>
          <h2 class="text-2xl font-bold font-display text-white tracking-tight">
            Welcome back, Chef & Operations Team 👋
          </h2>
          <p class="text-xs text-slate-300 mt-1 max-w-xl">
            All kitchen stations are operational. You have <strong class="text-orange-400">{{ ordersStore.activeOrdersCount }} active orders</strong> being prepared and dispatched right now.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/orders"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition flex items-center gap-2"
          >
            <span>Live Order Station</span>
            <ArrowUpRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="metric in metrics"
        :key="metric.title"
        v-bind="metric"
      />
    </div>

    <LiveOrderPipeline />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <RevenueChart />
      </div>
      <div>
        <TopSellingList />
      </div>
    </div>

    <RecentOrdersTable />
  </div>
</template>
