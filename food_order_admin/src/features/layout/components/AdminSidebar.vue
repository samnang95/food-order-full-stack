<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useOrdersStore } from '../../orders/stores/orders_store';
import { useAppStore } from '../stores/app_store';
import { AppRoutes } from '../../../routes/app_routes';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-vue-next';

const route = useRoute();
const ordersStore = useOrdersStore();
const appStore = useAppStore();

const pendingCount = computed(() => ordersStore.statusCounts.pending || 0);

const navItems = [
  { name: 'Dashboard', path: AppRoutes.ROOT, icon: LayoutDashboard },
  { name: 'Orders', path: AppRoutes.ORDERS, icon: ShoppingBag, badge: pendingCount },
  { name: 'Menu Catalog', path: AppRoutes.MENU, icon: UtensilsCrossed },
  { name: 'Categories', path: AppRoutes.CATEGORIES, icon: Layers },
  { name: 'Customers', path: AppRoutes.CUSTOMERS, icon: Users },
  { name: 'Settings', path: AppRoutes.SETTINGS, icon: Settings },
];
</script>

<template>
  <aside
    :class="[
      'h-screen sticky top-0 flex flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 z-30 select-none',
      appStore.isSidebarCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="h-16 flex items-center px-4 border-b border-slate-800/60 justify-between">
      <router-link to="/" class="flex items-center gap-3 overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Flame class="w-6 h-6 text-white" />
        </div>
        <div v-if="!appStore.isSidebarCollapsed" class="flex flex-col">
          <span class="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            FoodHub<span class="text-orange-500">.</span>
          </span>
          <span class="text-[11px] font-medium tracking-wider text-orange-400/80 uppercase">Operations Hub</span>
        </div>
      </router-link>

      <button
        @click="appStore.toggleSidebar"
        class="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700/40"
        :title="appStore.isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <ChevronRight v-if="appStore.isSidebarCollapsed" class="w-4 h-4" />
        <ChevronLeft v-else class="w-4 h-4" />
      </button>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
      <div v-if="!appStore.isSidebarCollapsed" class="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Management
      </div>

      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
          route.path === item.path
            ? 'bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-orange-400 border border-orange-500/25 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        ]"
      >
        <component
          :is="item.icon"
          :class="[
            'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
            route.path === item.path ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-300'
          ]"
        />

        <span v-if="!appStore.isSidebarCollapsed" class="truncate">
          {{ item.name }}
        </span>

        <span
          v-if="item.badge && item.badge.value > 0"
          :class="[
            'ml-auto text-xs px-2 py-0.5 rounded-full font-bold transition-transform animate-pulse',
            route.path === item.path
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          ]"
        >
          {{ item.badge.value }}
        </span>

        <div
          v-if="route.path === item.path"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full"
        />
      </router-link>
    </nav>

    <div class="p-3 border-t border-slate-800/60">
      <div
        v-if="!appStore.isSidebarCollapsed"
        class="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-between mb-3"
      >
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="text-xs font-medium text-slate-300">Kitchen Live</span>
        </div>
        <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          PORT 3000
        </span>
      </div>

      <div class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/50 transition">
        <div class="relative shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Admin"
            class="w-9 h-9 rounded-xl object-cover ring-2 ring-orange-500/30"
          />
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>
        <div v-if="!appStore.isSidebarCollapsed" class="flex flex-col min-w-0">
          <span class="text-xs font-semibold text-slate-200 truncate">Elena Vance</span>
          <span class="text-[11px] text-slate-400 truncate">Kitchen Director</span>
        </div>
      </div>
    </div>
  </aside>
</template>
