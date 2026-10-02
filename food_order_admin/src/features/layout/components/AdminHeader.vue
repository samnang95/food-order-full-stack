<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../stores/app_store';
import { useMenuStore } from '../../menu/stores/menu_store';
import {
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-vue-next';
import { UserMenuDropdown } from '../../auth';

const route = useRoute();
const appStore = useAppStore();
const menuStore = useMenuStore();

const showNotifications = ref(false);
const showStatusDropdown = ref(false);

const getPageTitle = () => {
  return (route.meta.title as string) || 'Dashboard';
};

const statusOptions = [
  { value: 'open', label: 'Open (Accepting Orders)', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { value: 'busy', label: 'Busy (Delays Expected)', color: 'bg-amber-500', text: 'text-amber-400' },
  { value: 'closed', label: 'Kitchen Closed', color: 'bg-rose-500', text: 'text-rose-400' },
] as const;
</script>

<template>
  <header class="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
    <div class="flex items-center gap-4">
      <div>
        <h1 class="text-lg font-bold text-white font-display tracking-tight flex items-center gap-2">
          {{ getPageTitle() }}
        </h1>
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span>Admin Console</span>
          <span>/</span>
          <span class="text-orange-400 capitalize">{{ route.name?.toString() }}</span>
        </div>
      </div>
    </div>

    <div class="hidden md:flex items-center relative max-w-xs w-full">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder="Search orders, dishes, customers..."
        class="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition"
      />
      <kbd class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
        ⌘K
      </kbd>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <button
          @click="showStatusDropdown = !showStatusDropdown"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold hover:border-slate-600 transition"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              appStore.restaurantStatus === 'open' ? 'bg-emerald-400 animate-pulse' :
              appStore.restaurantStatus === 'busy' ? 'bg-amber-400' : 'bg-rose-500'
            ]"
          />
          <span class="capitalize text-slate-200">{{ appStore.restaurantStatus }}</span>
        </button>

        <div
          v-if="showStatusDropdown"
          class="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 space-y-1 z-50 backdrop-blur-xl"
        >
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="appStore.setRestaurantStatus(opt.value); showStatusDropdown = false"
            :class="[
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition',
              appStore.restaurantStatus === opt.value
                ? 'bg-orange-500/15 text-orange-400'
                : 'text-slate-300 hover:bg-slate-800/80'
            ]"
          >
            <span :class="['w-2 h-2 rounded-full', opt.color]" />
            {{ opt.label }}
          </button>
        </div>
      </div>

      <button
        @click="menuStore.openAddFoodModal()"
        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>New Dish</span>
      </button>

      <div class="relative">
        <button
          @click="showNotifications = !showNotifications; appStore.markNotificationsAsRead()"
          class="relative w-9 h-9 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-700/70 text-slate-300 flex items-center justify-center transition"
          title="Notifications"
        >
          <Bell class="w-4 h-4" />
          <span
            v-if="appStore.notifications.some(n => n.unread)"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-slate-900 animate-pulse"
          />
        </button>

        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 z-50 backdrop-blur-2xl"
        >
          <div class="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span class="text-xs font-bold text-white uppercase tracking-wider">Live Alerts</span>
            <span class="text-[10px] text-slate-400 font-mono">{{ appStore.notifications.length }} updates</span>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div
              v-for="item in appStore.notifications"
              :key="item.id"
              class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition"
            >
              <div class="p-1 rounded-lg bg-orange-500/10 text-orange-400 shrink-0 mt-0.5">
                <CheckCircle2 v-if="item.type === 'order'" class="w-3.5 h-3.5" />
                <AlertTriangle v-else-if="item.type === 'warning'" class="w-3.5 h-3.5 text-amber-400" />
                <Info v-else class="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-200 leading-snug">{{ item.title }}</p>
                <span class="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock class="w-2.5 h-2.5" /> {{ item.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile & Session Menu -->
      <UserMenuDropdown />
    </div>
  </header>
</template>
