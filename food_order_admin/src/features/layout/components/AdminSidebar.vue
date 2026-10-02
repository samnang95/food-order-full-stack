<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrdersStore } from '../../orders/stores/orders_store';
import { useAppStore } from '../stores/app_store';
import { useAuthStore } from '../../auth/stores/auth_store';
import { AppRoutes } from '../../../routes/app_routes';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Users,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  LogOut,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const ordersStore = useOrdersStore();
const appStore = useAppStore();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push(AppRoutes.LOGIN);
}

const pendingCount = computed(() => ordersStore.statusCounts.pending || 0);

const navItems = [
  { name: 'Dashboard', path: AppRoutes.ROOT, icon: LayoutDashboard },
  { name: 'Orders', path: AppRoutes.ORDERS, icon: ShoppingBag, badge: pendingCount },
  { name: 'Menu Catalog', path: AppRoutes.MENU, icon: UtensilsCrossed },
  { name: 'Categories', path: AppRoutes.CATEGORIES, icon: Layers },
  { name: 'Customers', path: AppRoutes.CUSTOMERS, icon: Users },
  { name: 'Vouchers', path: AppRoutes.VOUCHERS, icon: Ticket },
  { name: 'Settings', path: AppRoutes.SETTINGS, icon: Settings },
];
</script>

<template>
  <aside
    :class="[
      'h-screen sticky top-0 flex flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-xl transition-[width] duration-300 z-30 select-none shrink-0 relative overflow-hidden',
      appStore.isSidebarCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Floating Edge Toggle Button -->
    <button
      @click="appStore.toggleSidebar"
      class="absolute -right-3.5 top-5 z-40 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 shadow-lg shadow-black/50 hover:scale-110 active:scale-95 cursor-pointer"
      :title="appStore.isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      aria-label="Toggle sidebar"
    >
      <ChevronRight v-if="appStore.isSidebarCollapsed" class="w-4 h-4" />
      <ChevronLeft v-else class="w-4 h-4" />
    </button>

    <!-- Brand Header -->
    <div
      :class="[
        'h-16 flex items-center border-b border-slate-800/60 overflow-hidden shrink-0',
        appStore.isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
      ]"
    >
      <router-link
        to="/"
        :class="[
          'flex items-center gap-3 overflow-hidden',
          appStore.isSidebarCollapsed ? 'justify-center' : ''
        ]"
      >
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Flame class="w-6 h-6 text-white" />
        </div>
        <div
          v-if="!appStore.isSidebarCollapsed"
          class="flex flex-col min-w-0"
        >
          <span class="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
            FoodHub<span class="text-orange-500">.</span>
          </span>
          <span class="text-[11px] font-medium tracking-wider text-orange-400/80 uppercase truncate">
            Operations Hub
          </span>
        </div>
      </router-link>
    </div>

    <!-- Navigation List (Locked, non-scrollable) -->
    <nav class="flex-1 px-2.5 py-4 space-y-1.5 overflow-hidden">
      <div
        v-if="!appStore.isSidebarCollapsed"
        class="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
      >
        Management
      </div>

      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center rounded-xl text-sm font-medium group relative',
          appStore.isSidebarCollapsed ? 'justify-center py-3 px-0' : 'gap-3 px-3 py-2.5',
          route.path === item.path
            ? 'bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-orange-400 border border-orange-500/25 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        ]"
      >
        <!-- Icon -->
        <component
          :is="item.icon"
          :class="[
            'w-5 h-5 shrink-0',
            route.path === item.path ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-300'
          ]"
        />

        <!-- Title Label (Expanded) -->
        <span
          v-if="!appStore.isSidebarCollapsed"
          class="truncate min-w-0"
        >
          {{ item.name }}
        </span>

        <!-- Floating Tooltip (Collapsed on Hover) -->
        <div
          v-if="appStore.isSidebarCollapsed"
          class="absolute left-full ml-3.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none z-50 flex items-center gap-2"
        >
          <span>{{ item.name }}</span>
          <span
            v-if="item.badge && item.badge.value > 0"
            class="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold"
          >
            {{ item.badge.value }}
          </span>
        </div>

        <!-- Badge in Expanded Mode -->
        <span
          v-if="!appStore.isSidebarCollapsed && item.badge && item.badge.value > 0"
          :class="[
            'ml-auto text-xs px-2 py-0.5 rounded-full font-bold shrink-0',
            route.path === item.path
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
          ]"
        >
          {{ item.badge.value }}
        </span>

        <!-- Badge Indicator in Collapsed Mode -->
        <span
          v-else-if="appStore.isSidebarCollapsed && item.badge && item.badge.value > 0"
          class="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center shadow-md pointer-events-none"
        >
          {{ item.badge.value }}
        </span>

        <!-- Active Left Indicator Bar -->
        <div
          v-if="route.path === item.path"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full"
        />
      </router-link>
    </nav>

    <!-- Operational Status Card & Profile -->
    <div class="p-3 border-t border-slate-800/60 overflow-hidden shrink-0">
      <!-- Live Kitchen Indicator -->
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

      <!-- Collapsed Live Pulse Dot -->
      <div
        v-else
        class="flex justify-center mb-3 py-1 group relative"
      >
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div class="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none z-50">
          Kitchen Live (PORT 3000)
        </div>
      </div>

      <!-- User Profile snippet & Quick Logout -->
      <div
        :class="[
          'flex items-center justify-between rounded-xl hover:bg-slate-800/50 group',
          appStore.isSidebarCollapsed ? 'justify-center p-1' : 'p-1.5'
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="relative shrink-0">
            <img
              :src="authStore.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
              :alt="authStore.currentUser?.username || 'Admin'"
              class="w-9 h-9 rounded-xl object-cover ring-2 ring-orange-500/30"
            />
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div v-if="!appStore.isSidebarCollapsed" class="flex flex-col min-w-0">
            <span class="text-xs font-semibold text-slate-200 truncate">
              {{ authStore.currentUser?.username || 'Elena Vance' }}
            </span>
            <span class="text-[11px] text-slate-400 truncate">
              {{ authStore.currentUser?.title || 'Kitchen Director' }}
            </span>
          </div>
        </div>

        <!-- Quick Logout Icon Button (Expanded Mode) -->
        <button
          v-if="!appStore.isSidebarCollapsed"
          @click="handleLogout"
          class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer opacity-70 group-hover:opacity-100"
          title="Sign Out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
