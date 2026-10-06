<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useKdsStore } from '../stores/kds_store';
import type { KdsStation } from '../kds_state';
import type { OrderStatus, OrderEntity } from '../../../domain/orders/entities/order_entity';
import KdsTicketCard from '../components/KdsTicketCard.vue';
import KdsPrintSlipModal from '../components/KdsPrintSlipModal.vue';
import KdsRecallDrawer from '../components/KdsRecallDrawer.vue';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  RefreshCw,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Bike,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  History,
  BellRing,
} from 'lucide-vue-next';

const kdsStore = useKdsStore();
let pollInterval: ReturnType<typeof setInterval> | null = null;
const isAudioTestOpen = ref(false);

const stations = [
  { id: 'all' as const, label: 'All Stations', icon: UtensilsCrossed },
  { id: 'kitchen' as const, label: 'Hot Kitchen & Grill', icon: Flame },
  { id: 'drinks' as const, label: 'Bar & Beverages', icon: Coffee },
  { id: 'dessert' as const, label: 'Bakery & Dessert', icon: Sparkles },
];

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

function handleSetStation(station: KdsStation) {
  kdsStore.dispatch({ type: 'SET_STATION', payload: station });
}

function handleToggleRecallDrawer() {
  kdsStore.dispatch({ type: 'TOGGLE_RECALL_DRAWER' });
}

function handleRecall(payload: { id: string; status: OrderStatus }) {
  kdsStore.dispatch({ type: 'RECALL_ORDER', payload });
}

function handleTestSound(type: 'kitchen' | 'transition' | 'urgent') {
  kdsStore.dispatch({ type: 'TEST_SOUND', payload: type });
  isAudioTestOpen.value = false;
}
</script>

<template>
  <div class="space-y-6">
    <!-- KDS Top Action Bar -->
    <div class="p-4 md:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Title & Station Branding -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
            <ChefHat class="w-7 h-7" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-white font-display tracking-tight">
                Kitchen Display System
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE KDS
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Real-time ticket board for line cooks, grill master, and expo station
            </p>
          </div>
        </div>

        <!-- Controls & Quick Actions -->
        <div class="flex items-center gap-2 flex-wrap">
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

          <!-- Audio Test Dropdown -->
          <div class="relative">
            <button
              type="button"
              @click="isAudioTestOpen = !isAudioTestOpen"
              class="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer flex items-center gap-1.5"
              title="Test Kitchen Chimes"
            >
              <BellRing class="w-3.5 h-3.5 text-amber-400" />
              <span>Test Audio</span>
            </button>

            <!-- Test Audio Popover Menu -->
            <div
              v-if="isAudioTestOpen"
              class="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 space-y-1 text-xs"
            >
              <div class="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Preview Kitchen Chimes
              </div>
              <button
                type="button"
                @click="handleTestSound('kitchen')"
                class="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-700 hover:text-white flex items-center justify-between transition cursor-pointer"
              >
                <span>🔔 Incoming Order Bell</span>
                <span class="text-[10px] text-orange-400 font-mono">E5/B5</span>
              </button>
              <button
                type="button"
                @click="handleTestSound('transition')"
                class="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-700 hover:text-white flex items-center justify-between transition cursor-pointer"
              >
                <span>✨ Ticket Bump / Advance</span>
                <span class="text-[10px] text-sky-400 font-mono">C5/G5</span>
              </button>
              <button
                type="button"
                @click="handleTestSound('urgent')"
                class="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 flex items-center justify-between transition cursor-pointer"
              >
                <span>⚠️ Overdue Ticket Alert</span>
                <span class="text-[10px] text-rose-400 font-mono">880Hz</span>
              </button>
            </div>
          </div>

          <!-- Recently Bumped / Recall Drawer Trigger -->
          <button
            type="button"
            @click="handleToggleRecallDrawer"
            class="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer flex items-center gap-1.5"
            title="View or Recall Recently Bumped Orders"
          >
            <History class="w-4 h-4 text-slate-400" />
            <span>Recently Bumped</span>
            <span
              v-if="kdsStore.state.recentlyBumpedOrders.length > 0"
              class="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] font-mono text-slate-200"
            >
              {{ kdsStore.state.recentlyBumpedOrders.length }}
            </span>
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

      <!-- Station Filter Pills -->
      <div class="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Station:
        </span>
        <button
          v-for="st in stations"
          :key="st.id"
          type="button"
          @click="handleSetStation(st.id)"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer',
            kdsStore.state.stationFilter === st.id
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40'
          ]"
        >
          <component :is="st.icon" class="w-3.5 h-3.5" />
          <span>{{ st.label }}</span>
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

        <!-- Ticket Cards with TransitionGroup -->
        <TransitionGroup
          v-if="kdsStore.incomingOrders.length > 0"
          name="ticket-flip"
          tag="div"
          class="space-y-4"
        >
          <KdsTicketCard
            v-for="order in kdsStore.incomingOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </TransitionGroup>
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

        <!-- Ticket Cards with TransitionGroup -->
        <TransitionGroup
          v-if="kdsStore.cookingOrders.length > 0"
          name="ticket-flip"
          tag="div"
          class="space-y-4"
        >
          <KdsTicketCard
            v-for="order in kdsStore.cookingOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </TransitionGroup>
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

        <!-- Ticket Cards with TransitionGroup -->
        <TransitionGroup
          v-if="kdsStore.readyOrders.length > 0"
          name="ticket-flip"
          tag="div"
          class="space-y-4"
        >
          <KdsTicketCard
            v-for="order in kdsStore.readyOrders"
            :key="order.id"
            :order="order"
            :prepared-map="kdsStore.state.preparedItems"
            @advance="(status) => handleAdvanceStatus(order.id, status)"
            @print="handlePrint"
            @toggle-item="handleToggleItem"
          />
        </TransitionGroup>
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

    <!-- Recall Bumped Orders Drawer -->
    <KdsRecallDrawer
      :is-open="kdsStore.state.isRecallDrawerOpen"
      :orders="kdsStore.state.recentlyBumpedOrders"
      @close="handleToggleRecallDrawer"
      @recall="handleRecall"
      @print="handlePrint"
    />
  </div>
</template>

<style scoped>
/* Flip list move transitions */
.ticket-flip-move {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ticket-flip-enter-active {
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ticket-flip-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ticket-flip-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.ticket-flip-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
</style>

