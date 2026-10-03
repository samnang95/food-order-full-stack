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
  Menu,
  Sun,
  Moon,
  Monitor,
  Palette,
  Check,
} from 'lucide-vue-next';
import { UserMenuDropdown } from '../../auth';
import { useThemeStore, ACCENT_OPTIONS } from '../../../core/theme/theme_store';

const route = useRoute();
const appStore = useAppStore();
const menuStore = useMenuStore();
const themeStore = useThemeStore();
const showNotifications = ref(false);
const showStatusDropdown = ref(false);
const showThemeMenu = ref(false);

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
  <header class="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
    <div class="flex items-center gap-3 sm:gap-4 min-w-0">
      <!-- Mobile Sidebar Hamburger Toggle -->
      <button
        type="button"
        @click="appStore.toggleMobileSidebar"
        class="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition cursor-pointer shrink-0"
        aria-label="Open sidebar menu"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight truncate flex items-center gap-2">
          {{ getPageTitle() }}
        </h1>
        <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Admin Console</span>
          <span>/</span>
          <span class="text-orange-500 dark:text-orange-400 capitalize font-medium">{{ route.name?.toString() }}</span>
        </div>
      </div>
    </div>

    <div class="hidden md:flex items-center relative max-w-xs w-full">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder="Search orders, dishes, customers..."
        class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-9 pr-12 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition"
      />
      <kbd class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600/40">
        ⌘K
      </kbd>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative">
        <button
          @click="showStatusDropdown = !showStatusDropdown"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              appStore.restaurantStatus === 'open' ? 'bg-emerald-500 animate-pulse' :
              appStore.restaurantStatus === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
            ]"
          />
          <span class="capitalize text-slate-700 dark:text-slate-200">{{ appStore.restaurantStatus }}</span>
        </button>

        <div
          v-if="showStatusDropdown"
          class="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 space-y-1 z-50 backdrop-blur-xl"
        >
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="appStore.setRestaurantStatus(opt.value); showStatusDropdown = false"
            :class="[
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition cursor-pointer',
              appStore.restaurantStatus === opt.value
                ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            ]"
          >
            <span :class="['w-2 h-2 rounded-full', opt.color]" />
            {{ opt.label }}
          </button>
        </div>
      </div>

      <button
        @click="menuStore.openAddFoodModal()"
        class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>New Dish</span>
      </button>

      <!-- Theme & Accent Customizer -->
      <div class="relative">
        <button
          @click="showThemeMenu = !showThemeMenu; showNotifications = false"
          class="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
          title="Theme & Appearance"
        >
          <Sun v-if="themeStore.mode === 'light'" class="w-4 h-4 text-amber-500" />
          <Moon v-else-if="themeStore.mode === 'dark'" class="w-4 h-4 text-sky-400" />
          <Monitor v-else class="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        <div
          v-if="showThemeMenu"
          class="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 backdrop-blur-2xl animate-in fade-in duration-150"
        >
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2.5">
            <span class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Palette class="w-3.5 h-3.5 text-orange-500" />
              Theme & Appearance
            </span>
          </div>

          <!-- Mode Selector (Dark, Light, System) -->
          <div class="mb-3">
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Theme Mode</span>
            <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="themeStore.setMode('dark')"
                :class="[
                  'py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer',
                  themeStore.mode === 'dark' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                ]"
              >
                <Moon class="w-3 h-3 text-sky-500 dark:text-sky-400" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                @click="themeStore.setMode('light')"
                :class="[
                  'py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer',
                  themeStore.mode === 'light' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                ]"
              >
                <Sun class="w-3 h-3 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                @click="themeStore.setMode('system')"
                :class="[
                  'py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer',
                  themeStore.mode === 'system' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                ]"
              >
                <Monitor class="w-3 h-3 text-slate-500 dark:text-slate-300" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <!-- Accent Color Swatches -->
          <div>
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Brand Accent</span>
            <div class="grid grid-cols-6 gap-1.5">
              <button
                v-for="acc in ACCENT_OPTIONS"
                :key="acc.id"
                type="button"
                @click="themeStore.setAccent(acc.id)"
                :title="acc.label"
                :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer relative',
                  `bg-gradient-to-tr ${acc.gradientClass}`,
                  themeStore.accent === acc.id ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
                ]"
              >
                <Check v-if="themeStore.accent === acc.id" class="w-3.5 h-3.5 text-white stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="relative">
        <button
          @click="showNotifications = !showNotifications; showThemeMenu = false; appStore.markNotificationsAsRead()"
          class="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
          title="Notifications"
        >
          <Bell class="w-4 h-4" />
          <span
            v-if="appStore.notifications.some(n => n.unread)"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
          />
        </button>

        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 backdrop-blur-2xl"
        >
          <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Alerts</span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ appStore.notifications.length }} updates</span>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div
              v-for="item in appStore.notifications"
              :key="item.id"
              class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
            >
              <div class="p-1 rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5">
                <CheckCircle2 v-if="item.type === 'order'" class="w-3.5 h-3.5" />
                <AlertTriangle v-else-if="item.type === 'warning'" class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <Info v-else class="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{{ item.title }}</p>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
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
