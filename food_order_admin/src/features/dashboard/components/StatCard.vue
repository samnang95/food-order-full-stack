<script setup lang="ts">
import type { Component } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

defineProps<{
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  period: string;
  icon: Component;
  colorClass?: string;
}>();
</script>

<template>
  <div class="glass-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 group">
    <div class="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10 transition-all pointer-events-none" />

    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">{{ title }}</span>
        <h3 class="text-2xl font-bold font-display text-white tracking-tight">{{ value }}</h3>
      </div>
      <div :class="['w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner transition group-hover:scale-105', colorClass || 'bg-orange-500/10 border-orange-500/20 text-orange-400']">
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>

    <div class="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/60 text-xs">
      <span
        :class="[
          'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg text-[11px]',
          isPositive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        ]"
      >
        <TrendingUp v-if="isPositive" class="w-3 h-3" />
        <TrendingDown v-else class="w-3 h-3" />
        {{ Math.abs(change) }}%
      </span>
      <span class="text-slate-400 text-[11px]">{{ period }}</span>
    </div>
  </div>
</template>
