<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth_store';
import { AppRoutes } from '../../../routes/app_routes';
import type { UserRole } from '../../../domain/auth/entities/user';
import { ROLE_CONFIGS } from '../../../core/auth/rbac';
import {
  LogOut,
  Settings,
  Shield,
  ChevronDown,
  RefreshCw,
  Crown,
  ChefHat,
  Briefcase,
  Store,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const currentRole = computed<UserRole>(() => (authStore.userRole || 'admin') as UserRole);
const roleConfig = computed(() => authStore.roleConfig);
const isSuperAdmin = computed(() => currentRole.value === 'admin');

const switchableRoles: Array<{ role: UserRole; label: string; icon: any }> = [
  { role: 'admin', label: 'Super Admin', icon: Crown },
  { role: 'manager', label: 'Manager', icon: Briefcase },
  { role: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { role: 'staff', label: 'Cashier', icon: Store },
];

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

function handleSwitchRole(role: UserRole) {
  const targetRoute = authStore.switchRole(role);
  closeDropdown();
  router.push(targetRoute);
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
          :class="['w-8 h-8 rounded-xl object-cover ring-2 transition-all', roleConfig.themeColor.ring]"
        />
        <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
      </div>

      <div class="hidden sm:flex flex-col text-left">
        <span class="text-xs font-semibold text-slate-200 leading-tight">
          {{ authStore.currentUser?.username || 'Admin' }}
        </span>
        <span class="text-[10px] text-slate-400 font-medium">
          {{ roleConfig.title }}
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
      class="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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
              {{ authStore.currentUser?.username || 'Admin User' }}
            </span>
            <span class="text-[11px] text-slate-400 truncate">
              {{ authStore.currentUser?.email || 'admin@foodhub.com' }}
            </span>
          </div>
        </div>

        <div class="mt-2.5 flex items-center justify-between text-[10px]">
          <span :class="['px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 uppercase tracking-wider', roleConfig.themeColor.bg, roleConfig.themeColor.text, roleConfig.themeColor.border]">
            <Shield class="w-3 h-3" />
            {{ roleConfig.badge }}
          </span>
          <span class="text-emerald-400 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Online
          </span>
        </div>
      </div>

      <!-- Quick Role Switcher for Testing & Verification -->
      <div class="px-3 py-2 border-b border-slate-800/60 bg-slate-950/40">
        <div class="flex items-center justify-between mb-1.5 px-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <RefreshCw class="w-2.5 h-2.5 text-orange-400" />
            Switch Active Role
          </span>
          <span class="text-[9px] text-slate-500 font-mono">RBAC Preview</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="r in switchableRoles"
            :key="r.role"
            type="button"
            @click="handleSwitchRole(r.role)"
            :class="[
              'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border text-left',
              currentRole === r.role
                ? `${ROLE_CONFIGS[r.role].themeColor.bg} ${ROLE_CONFIGS[r.role].themeColor.text} ${ROLE_CONFIGS[r.role].themeColor.border} ring-1 ring-orange-500/30`
                : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            ]"
          >
            <component :is="r.icon" class="w-3 h-3 shrink-0" />
            <span class="truncate">{{ r.label }}</span>
          </button>
        </div>
      </div>

      <!-- Links & Actions -->
      <div class="p-1.5 space-y-1 text-xs">
        <button
          v-if="isSuperAdmin"
          @click="navigateToSettings"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition cursor-pointer text-left"
        >
          <Settings class="w-4 h-4 text-slate-400" />
          <span>System Settings</span>
        </button>

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
