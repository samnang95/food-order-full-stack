<script setup lang="ts">
import { useDashboardStore } from '../stores/dashboard_store';
import { DollarSign, BarChart3, TrendingUp } from 'lucide-vue-next';

const dashboardStore = useDashboardStore();
</script>

<template>
  <div class="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <BarChart3 class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white font-display">Revenue & Sales Trends</h3>
          <p class="text-xs text-slate-400">Total gross earnings and daily volume</p>
        </div>
      </div>

      <div class="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          v-for="p in (['day', 'week', 'month'] as const)"
          :key="p"
          @click="dashboardStore.setChartPeriod(p)"
          :class="[
            'text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize transition',
            dashboardStore.chartPeriod === p
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</span>
        <div class="text-base font-bold text-white flex items-center gap-1">
          <DollarSign class="w-3.5 h-3.5 text-emerald-400" />
          11,950
        </div>
      </div>
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</span>
        <div class="text-base font-bold text-white">463 orders</div>
      </div>
      <div>
        <span class="text-[10px] text-slate-400 uppercase font-semibold">Avg Ticket</span>
        <div class="text-base font-bold text-orange-400">$25.81</div>
      </div>
    </div>

    <div class="h-44 flex items-end justify-between gap-3 pt-4 px-2">
      <div
        v-for="day in dashboardStore.weekData"
        :key="day.label"
        class="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
      >
        <div class="opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none text-center transform -translate-y-1">
          <div class="bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap">
            <span class="font-bold text-orange-400">${{ day.value }}</span> ({{ day.orders }} orders)
          </div>
        </div>

        <div class="w-full bg-slate-800/60 rounded-xl p-1 flex items-end h-32 overflow-hidden">
          <div
            :style="{ height: `${day.percentage}%` }"
            class="w-full rounded-lg bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 group-hover:brightness-125 transition-all duration-300 shadow-lg shadow-orange-500/20"
          />
        </div>

        <span class="text-[11px] font-semibold text-slate-400 group-hover:text-white transition">
          {{ day.label }}
        </span>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
      <div class="flex items-center gap-1.5 text-emerald-400 font-medium">
        <TrendingUp class="w-3.5 h-3.5" />
        <span>+14.2% higher than previous week</span>
      </div>
      <span class="text-slate-400 text-[11px]">Updated 5 mins ago</span>
    </div>
  </div>
</template>
