<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth_store';
import { checkApiHealth } from '../../../core/services/api_client';
import { AppRoutes } from '../../../routes/app_routes';
import {
  Flame,
  Lock,
  User as UserIcon,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Server,
  Zap,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form states
const username = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(true);
const isApiOnline = ref<boolean | null>(null);

// Check API health on mount
onMounted(async () => {
  isApiOnline.value = await checkApiHealth();
});

// Quick demo admin credentials autofill
function fillDemoCredentials(type: 'admin' | 'manager') {
  if (type === 'admin') {
    username.value = 'admin';
    password.value = 'admin123';
  } else {
    username.value = 'elena.vance';
    password.value = 'kitchen2026';
  }
}

async function handleSubmit() {
  authStore.clearError();

  if (authStore.activeTab === 'login') {
    const success = await authStore.login({
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value,
    });

    if (success) {
      const redirectPath = (route.query.redirect as string) || AppRoutes.ROOT;
      router.push(redirectPath);
    }
  } else {
    const success = await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });

    if (success) {
      const redirectPath = (route.query.redirect as string) || AppRoutes.ROOT;
      router.push(redirectPath);
    }
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6 relative overflow-hidden select-none">
    <!-- Ambient Background Glows -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-orange-600/5 to-transparent rounded-full blur-2xl pointer-events-none" />

    <!-- Main Container Card -->
    <div class="w-full max-w-md relative z-10">
      <!-- Brand Logo Header -->
      <div class="flex flex-col items-center text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-2xl shadow-orange-500/30 mb-4 ring-4 ring-orange-500/20">
          <Flame class="w-9 h-9 text-white animate-pulse" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          FoodHub<span class="text-orange-500">.</span> Admin
        </h1>
        <p class="text-sm text-slate-400 mt-1.5 flex items-center gap-2">
          <span>Enterprise Restaurant Operations</span>
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          <span class="text-orange-400/90 font-medium">v1.0</span>
        </p>
      </div>

      <!-- Glassmorphic Card -->
      <div class="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl shadow-black/80 overflow-hidden">
        <!-- Tab Selector: Login vs Register -->
        <div class="flex border-b border-slate-800/80 p-1.5 bg-slate-950/40">
          <button
            type="button"
            @click="authStore.setTab('login')"
            :class="[
              'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer',
              authStore.activeTab === 'login'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <Lock class="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            @click="authStore.setTab('register')"
            :class="[
              'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer',
              authStore.activeTab === 'register'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            <UserIcon class="w-3.5 h-3.5" />
            <span>Create Staff Account</span>
          </button>
        </div>

        <div class="p-6 sm:p-8 space-y-6">
          <!-- Error Alert Banner -->
          <div
            v-if="authStore.error"
            class="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs animate-shake"
          >
            <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div class="flex-1">{{ authStore.error }}</div>
            <button
              @click="authStore.clearError"
              class="text-red-400 hover:text-red-200 font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Form Element -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Username Input -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Username {{ authStore.activeTab === 'login' ? 'or Email' : '' }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon class="w-4 h-4" />
                </div>
                <input
                  v-model="username"
                  type="text"
                  required
                  placeholder="e.g. admin or elena.vance"
                  autocomplete="username"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>
            </div>

            <!-- Email Input (Only in Register tab) -->
            <div v-if="authStore.activeTab === 'register'" class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="admin@foodhub.com"
                  autocomplete="email"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>
            </div>

            <!-- Password Input -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span v-if="authStore.activeTab === 'login'" class="text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span class="text-xs text-slate-400">Keep me signed in for 7 days</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span v-if="authStore.isLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <template v-else>
                <span>{{ authStore.activeTab === 'login' ? 'Sign In to Operations' : 'Register Admin Account' }}</span>
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </form>

          <!-- Quick Demo Credentials Box -->
          <div class="pt-4 border-t border-slate-800/80">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Access
              </span>
              <span class="text-[10px] text-slate-500">1-click fill</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="fillDemoCredentials('admin')"
                class="py-2 px-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div class="text-xs font-semibold text-slate-200 group-hover:text-orange-400 flex items-center justify-between">
                  <span>admin</span>
                  <Zap class="w-3 h-3 text-orange-400" />
                </div>
                <div class="text-[10px] text-slate-400">Executive Director</div>
              </button>

              <button
                type="button"
                @click="fillDemoCredentials('manager')"
                class="py-2 px-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div class="text-xs font-semibold text-slate-200 group-hover:text-orange-400 flex items-center justify-between">
                  <span>elena.vance</span>
                  <Zap class="w-3 h-3 text-orange-400" />
                </div>
                <div class="text-[10px] text-slate-400">Kitchen Director</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Card Footer: Backend API Health Indicator -->
        <div class="px-6 py-3 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <div class="flex items-center gap-2">
            <Server class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-slate-400">Backend API</span>
          </div>

          <div class="flex items-center gap-1.5">
            <span
              :class="[
                'w-2 h-2 rounded-full',
                isApiOnline === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse'
                  : isApiOnline === false
                  ? 'bg-amber-500'
                  : 'bg-slate-600'
              ]"
            />
            <span :class="isApiOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'">
              {{ isApiOnline === true ? 'Connected (Port 3000)' : isApiOnline === false ? 'Offline / Local DB' : 'Checking...' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Trust & Security Badges -->
      <div class="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
        <div class="flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-emerald-500/80" />
          <span>256-Bit SSL Encrypted</span>
        </div>
        <span class="text-slate-800">•</span>
        <div class="flex items-center gap-1.5">
          <CheckCircle2 class="w-4 h-4 text-orange-500/80" />
          <span>Role-Based Access</span>
        </div>
      </div>
    </div>
  </div>
</template>
