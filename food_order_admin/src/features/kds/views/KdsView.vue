<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useKdsStore } from '../stores/kds_store';
import type { OrderStatus, OrderEntity } from '../../../domain/orders/entities/order_entity';
import KdsTicketCard from '../components/KdsTicketCard.vue';
import KdsPrintSlipModal from '../components/KdsPrintSlipModal.vue';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Bike,
} from 'lucide-vue-next';

const kdsStore = useKdsStore();
let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  kdsStore.dispatch({ type: 'LOAD_ORDERS' });
  // Poll every 8 seconds for real-time kitchen updates
  pollInterval = setInterval(() => {
    kdsStore.dispatch({ type: 'LOAD_ORDERS' });
  }, 8000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

function handleAdvanceStatus(orderId: string, newStatus: OrderStatus) {
  kdsStore.dispatch({
    type: 'UPDATE_STATUS',
    payload: { id: orderId, status: newStatus },
  });
}

function handlePrint(order: OrderEntity) {
  kdsStore.dispatch({ type: 'OPEN_PRINT_MODAL', payload: order });
}

function handleClosePrintModal() {
  kdsStore.dispatch({ type: 'CLOSE_PRINT_MODAL' });
}

function handleToggleItem(payload: { orderId: string; itemId: string }) {
  kdsStore.dispatch({ type: 'TOGGLE_ITEM_PREPARED', payload });
}

function handleToggleSound() {
  kdsStore.dispatch({ type: 'TOGGLE_SOUND' });
}

function handleToggleFullscreen() {
  kdsStore.dispatch({ type: 'TOGGLE_FULLSCREEN' });
}

function handleRefresh() {
  kdsStore.dispatch({ type: 'LOAD_ORDERS' });
}
</script>

<template>
  <div class="space-y-6">
    <!-- KDS Top Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
          <ChefHat class="w-7 h-7" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-black text-white font-display tracking-tight">
              Live Kitchen Display
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE KDS
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Real-time ticket board for line cooks and expo station
          </p>
        </div>
      </div>

      <!-- Controls & Quick Actions -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Audio Chime Toggle -->
        <button
          type="button"
          @click="handleToggleSound"
          :class="[
            'px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer',
            kdsStore.state.soundEnabled
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700/60'
          ]"
          :title="kdsStore.state.soundEnabled ? 'Chime sound is active on new orders' : 'Chime sound muted'"
        >
          <Volume2 v-if="kdsStore.state.soundEnabled" class="w-4 h-4 text-orange-400" />
          <VolumeX v-else class="w-4 h-4 text-slate-500" />
          <span>{{ kdsStore.state.soundEnabled ? 'Sound On' : 'Muted' }}</span>
        </button>

        <!-- Fullscreen Kiosk Mode -->
        <button
          type="button"
          @click="handleToggleFullscreen"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
          title="Toggle Fullscreen Tablet Kiosk"
        >
          <Maximize2 class="w-4 h-4" />
        </button>

        <!-- Manual Refresh -->
        <button
          type="button"
          @click="handleRefresh"
          :disabled="kdsStore.state.isLoading"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
          title="Refresh Tickets"
        >
          <RefreshCw :class="['w-4 h-4', kdsStore.state.isLoading ? 'animate-spin text-orange-400' : '']" />
        </button>
      </div>
    </div>

    <!-- 3-Column Kanban Board -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- COLUMN 1: INCOMING / QUEUED -->
      <div class="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-4">
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-orange-500/15 text-orange-400">
              <Inbox class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">
              1. Incoming Orders
            </h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-orange-500 text-white shadow-sm">
            {{ kdsStore.incomingCount }}
          </span>
        </div>

        <!-- Ticket Cards -->
        <div v-if="kdsStore.incomingOrders.length > 0" class="space-y-4">
          <KdsTicketCard
            v-for="order in kdsStore.incomingOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </div>
        <div v-else class="py-12 text-center text-slate-500 text-xs">
          No new incoming tickets
        </div>
      </div>

      <!-- COLUMN 2: IN KITCHEN / COOKING -->
      <div class="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-4">
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
              <Flame class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">
              2. In Kitchen (Cooking)
            </h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-sky-500 text-white shadow-sm">
            {{ kdsStore.cookingCount }}
          </span>
        </div>

        <!-- Ticket Cards -->
        <div v-if="kdsStore.cookingOrders.length > 0" class="space-y-4">
          <KdsTicketCard
            v-for="order in kdsStore.cookingOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </div>
        <div v-else class="py-12 text-center text-slate-500 text-xs">
          Kitchen grill & prep station idle
        </div>
      </div>

      <!-- COLUMN 3: READY FOR PICKUP -->
      <div class="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-4">
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Bike class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">
              3. Ready for Pickup
            </h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-emerald-500 text-white shadow-sm">
            {{ kdsStore.readyCount }}
          </span>
        </div>

        <!-- Ticket Cards -->
        <div v-if="kdsStore.readyOrders.length > 0" class="space-y-4">
          <KdsTicketCard
            v-for="order in kdsStore.readyOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </div>
        <div v-else class="py-12 text-center text-slate-500 text-xs">
          No ready orders waiting at expo
        </div>
      </div>
    </div>

    <!-- Print Slip Modal -->
    <KdsPrintSlipModal
      :is-open="kdsStore.state.isPrintModalOpen"
      :order="kdsStore.state.selectedOrderForPrint"
      @close="handleClosePrintModal"
    />
  </div>
</template>
