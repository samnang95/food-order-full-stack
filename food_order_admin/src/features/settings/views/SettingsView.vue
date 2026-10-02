<script setup lang="ts">
import { useSettingsStore } from '../stores/settings_store';
import { AppConfig } from '../../../core/config/app_config';
import {
  Server,
  Activity,
  Bell,
  Store,
  Save,
  CheckCircle2,
} from 'lucide-vue-next';

const settingsStore = useSettingsStore();
</script>

<template>
  <div class="space-y-6 max-w-4xl">
    <div>
      <h2 class="text-xl font-bold font-display text-white">System & Operations Settings</h2>
      <p class="text-xs text-slate-400">Configure kitchen hardware, backend connection and store properties</p>
    </div>

    <!-- API & Backend Integration -->
    <div class="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Server class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Backend API Server</h3>
            <p class="text-xs text-slate-400">Connection to food-ordering-api service</p>
          </div>
        </div>

        <button
          @click="settingsStore.testApi()"
          :disabled="settingsStore.isTestingApi"
          class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition"
        >
          <Activity :class="['w-3.5 h-3.5', settingsStore.isTestingApi ? 'animate-spin text-orange-400' : 'text-slate-400']" />
          <span>{{ settingsStore.isTestingApi ? 'Pinging API...' : 'Test Connection' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">API Base Target</label>
          <input
            type="text"
            readonly
            :value="`${AppConfig.apiTarget} (proxied via ${AppConfig.apiBaseUrl})`"
            class="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono text-[11px]"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Status</label>
          <div class="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
            <span
              :class="[
                'w-2 h-2 rounded-full',
                settingsStore.apiStatus === 'connected' ? 'bg-emerald-400' :
                settingsStore.apiStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-400'
              ]"
            />
            <span class="text-slate-300 font-medium">
              {{ settingsStore.apiStatus === 'connected' ? 'Connected (200 OK)' : settingsStore.apiStatus === 'offline' ? 'Offline / API not running on port 3000' : 'Configured (/api -> localhost:3000)' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Kitchen Operations -->
    <div class="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
        <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Bell class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Live Kitchen Automation</h3>
          <p class="text-xs text-slate-400">Order routing and audible kitchen notifications</p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
          <div>
            <div class="text-xs font-semibold text-white">Audible Order Chime</div>
            <div class="text-[11px] text-slate-400">Play alert sound on the dashboard when new order arrives</div>
          </div>
          <input type="checkbox" v-model="settingsStore.profile.soundAlerts" class="accent-orange-500 w-4 h-4" />
        </label>

        <label class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 cursor-pointer">
          <div>
            <div class="text-xs font-semibold text-white">Auto-Accept Orders</div>
            <div class="text-[11px] text-slate-400">Automatically move incoming paid orders directly to "Preparing"</div>
          </div>
          <input type="checkbox" v-model="settingsStore.profile.autoAcceptOrders" class="accent-orange-500 w-4 h-4" />
        </label>
      </div>
    </div>

    <!-- Restaurant Info -->
    <div class="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
      <div class="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
        <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <Store class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Store Profile</h3>
          <p class="text-xs text-slate-400">Restaurant details shown on receipts and customer tickets</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Store / Branch Name</label>
          <input
            v-model="settingsStore.profile.name"
            type="text"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Contact Phone</label>
          <input
            v-model="settingsStore.profile.phone"
            type="text"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block font-semibold text-slate-300 mb-1">Physical Address</label>
          <input
            v-model="settingsStore.profile.address"
            type="text"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-2">
      <div v-if="settingsStore.isSavedToastVisible" class="flex items-center gap-2 text-emerald-400 text-xs font-semibold animate-pulse">
        <CheckCircle2 class="w-4 h-4" />
        <span>Settings successfully updated!</span>
      </div>
      <div v-else></div>

      <button
        @click="settingsStore.saveSettings()"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition active:scale-95"
      >
        <Save class="w-4 h-4" />
        <span>Save Changes</span>
      </button>
    </div>
  </div>
</template>
