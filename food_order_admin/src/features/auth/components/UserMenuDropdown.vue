<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth_store';
import { AppRoutes } from '../../../routes/app_routes';
import {
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

async function handleLogout() {
  closeDropdown();
  await authStore.logout();
  router.push(AppRoutes.LOGIN);
}

function navigateToSettings() {
  closeDropdown();
  router.push(AppRoutes.SETTINGS);
}
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      @click.stop="toggleDropdown"
      class="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition cursor-pointer select-none"
      aria-label="User profile menu"
    >
      <div class="relative">
        <img
          :src="authStore.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
          :alt="authStore.currentUser?.username || 'Admin'"
          class="w-8 h-8 rounded-xl object-cover ring-2 ring-orange-500/30"
        />
        <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
      </div>

      <div class="hidden sm:flex flex-col text-left">
        <span class="text-xs font-semibold text-slate-200 leading-tight">
          {{ authStore.currentUser?.username || 'Admin' }}
        </span>
        <span class="text-[10px] text-slate-400 font-medium">
          {{ authStore.currentUser?.role === 'admin' ? 'Executive Director' : 'Kitchen Staff' }}
        </span>
      </div>

      <ChevronDown
        :class="[
          'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block',
          isOpen ? 'rotate-180' : ''
        ]"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <!-- User Info Header -->
      <div class="px-4 py-3 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
          <img
            :src="authStore.currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'"
            class="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
          />
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-white truncate">
              {{ authStore.currentUser?.username || 'Elena Vance' }}
            </span>
            <span class="text-[11px] text-slate-400 truncate">
              {{ authStore.currentUser?.email || 'admin@foodhub.com' }}
            </span>
          </div>
        </div>

        <div class="mt-2.5 flex items-center justify-between text-[10px]">
          <span class="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 flex items-center gap-1">
            <Shield class="w-3 h-3" />
            {{ (authStore.currentUser?.role || 'admin').toUpperCase() }}
          </span>
          <span class="text-emerald-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Online
          </span>
        </div>
      </div>

      <!-- Links & Actions -->
      <div class="p-1.5 space-y-1 text-xs">
        <button
          @click="navigateToSettings"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition cursor-pointer text-left"
        >
          <Settings class="w-4 h-4 text-slate-400" />
          <span>System Settings</span>
        </button>

        <div class="border-t border-slate-800/60 my-1" />

        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer text-left font-medium"
        >
          <LogOut class="w-4 h-4 text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</template>
