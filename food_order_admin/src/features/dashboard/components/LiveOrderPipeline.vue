<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useOrdersStore } from '../../orders/stores/orders_store';
import { Clock, ChefHat, Bike, CheckCircle2 } from 'lucide-vue-next';

const router = useRouter();
const { t } = useI18n();
const ordersStore = useOrdersStore();

const stages = computed(() => [
  {
    key: 'pending',
    label: t('orders.pending'),
    count: ordersStore.statusCounts.pending || 0,
    icon: Clock,
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-white',
  },
  {
    key: 'preparing',
    label: t('orders.preparing'),
    count: ordersStore.statusCounts.preparing || 0,
    icon: ChefHat,
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500 text-white',
  },
  {
    key: 'on_delivery',
    label: t('orders.onDelivery'),
    count: ordersStore.statusCounts.on_delivery || 0,
    icon: Bike,
    color: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    badge: 'bg-sky-500 text-white',
  },
  {
    key: 'delivered',
    label: t('orders.delivered'),
    count: ordersStore.statusCounts.delivered || 0,
    icon: CheckCircle2,
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500 text-white',
  },
]);

function navigateToStage(status: string) {
  ordersStore.activeStatusFilter = status;
  router.push('/orders');
}
</script>

<template>
  <div class="glass-card rounded-2xl p-5 border border-slate-800/80">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-bold text-white font-display uppercase tracking-wider">{{ $t('dashboard.pipelineTitle') }}</h3>
        <p class="text-xs text-slate-400">{{ $t('dashboard.pipelineSubtitle') }}</p>
      </div>
      <button
        @click="navigateToStage('all')"
        class="text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
      >
        {{ $t('dashboard.viewAllOrders') }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="stage in stages"
        :key="stage.key"
        @click="navigateToStage(stage.key)"
        :class="[
          'p-3.5 rounded-xl border bg-gradient-to-b cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
          stage.color,
          stage.border
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div :class="['p-2 rounded-lg bg-slate-900/60 border border-white/5', stage.text]">
            <component :is="stage.icon" class="w-4 h-4" />
          </div>
          <span :class="['text-xs font-bold px-2 py-0.5 rounded-full shadow-sm', stage.badge]">
            {{ stage.count }}
          </span>
        </div>
        <div class="text-xs font-semibold text-slate-200">{{ stage.label }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Click to inspect</div>
      </div>
    </div>
  </div>
</template>
