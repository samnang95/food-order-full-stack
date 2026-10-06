<script setup lang="ts">
import { Users, UserCheck, ChefHat, Store, Shield } from 'lucide-vue-next';

defineProps<{
  stats: {
    total: number;
    active: number;
    kitchen: number;
    frontDesk: number;
    managers: number;
  };
}>();
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
    <!-- Total Staff -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Team</span>
        <div class="p-2 rounded-xl bg-slate-800 text-slate-300">
          <Users class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-extrabold text-white font-display">{{ stats.total }}</span>
        <span class="text-[11px] text-slate-400">Registered</span>
      </div>
    </div>

    <!-- Active Now -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/30 transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">On Duty</span>
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UserCheck class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-extrabold text-emerald-400 font-display">{{ stats.active }}</span>
        <span class="text-[11px] text-slate-400">Active shifts</span>
      </div>
    </div>

    <!-- Kitchen Crew -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/30 transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Kitchen</span>
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ChefHat class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-extrabold text-white font-display">{{ stats.kitchen }}</span>
        <span class="text-[11px] text-slate-400">Chefs / Cooks</span>
      </div>
    </div>

    <!-- Front Desk / Cashiers -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-purple-500/30 transition">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-purple-400">Cashiers</span>
        <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Store class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-extrabold text-white font-display">{{ stats.frontDesk }}</span>
        <span class="text-[11px] text-slate-400">Front desk</span>
      </div>
    </div>

    <!-- Management -->
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-orange-500/30 transition col-span-2 lg:col-span-1">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-orange-400">Leadership</span>
        <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Shield class="w-4 h-4" />
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl font-extrabold text-orange-400 font-display">{{ stats.managers }}</span>
        <span class="text-[11px] text-slate-400">Admins / Mgrs</span>
      </div>
    </div>
  </div>
</template>
