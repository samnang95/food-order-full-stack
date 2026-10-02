<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import {
  Clock,
  Printer,
  CheckCircle2,
  Flame,
  ChefHat,
  Bike,
  AlertTriangle,
  FileText,
} from 'lucide-vue-next';

const props = defineProps<{
  order: OrderEntity;
  preparedMap: Record<string, boolean>;
}>();

const emit = defineEmits<{
  (e: 'advance', status: OrderStatus): void;
  (e: 'print', order: OrderEntity): void;
  (e: 'toggle-item', payload: { orderId: string; itemId: string }): void;
}>();

// Elapsed timer computation
const elapsedSeconds = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Approximate created time: if string contains 'Just now' or recent
  const baseMinutes = props.order.status === 'preparing' ? 12 : props.order.status === 'on_delivery' ? 22 : 4;
  elapsedSeconds.value = baseMinutes * 60 + Math.floor(Math.random() * 45);

  timer = setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const formattedTime = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  const secs = elapsedSeconds.value % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
});

const urgencyClass = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  if (mins >= 20) {
    return 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
  }
  if (mins >= 10) {
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
});

function isItemPrepared(itemId: string): boolean {
  return Boolean(props.preparedMap[`${props.order.id}_${itemId}`]);
}
</script>

<template>
  <div
    :class="[
      'rounded-2xl border bg-slate-900/90 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-150',
      order.status === 'pending'
        ? 'border-orange-500/40 ring-1 ring-orange-500/20'
        : order.status === 'preparing'
        ? 'border-sky-500/40 ring-1 ring-sky-500/20'
        : 'border-emerald-500/40 ring-1 ring-emerald-500/20'
    ]"
  >
    <!-- Ticket Top Header -->
    <div
      :class="[
        'p-3.5 border-b border-slate-800 flex items-center justify-between',
        order.status === 'pending'
          ? 'bg-orange-500/10'
          : order.status === 'preparing'
          ? 'bg-sky-500/10'
          : 'bg-emerald-500/10'
      ]"
    >
      <div>
        <div class="flex items-center gap-2">
          <span class="font-mono font-extrabold text-base text-white tracking-wider">
            #{{ order.orderNumber || order.id.slice(-6).toUpperCase() }}
          </span>
          <span
            :class="[
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
              urgencyClass
            ]"
          >
            {{ order.status === 'pending' ? 'Queued' : order.status === 'preparing' ? 'Cooking' : 'Ready' }}
          </span>
        </div>
        <div class="text-xs font-semibold text-slate-300 mt-0.5 truncate max-w-[170px]">
          {{ order.customerName }}
        </div>
      </div>

      <!-- Live Elapsed Timer Badge & Print Button -->
      <div class="flex items-center gap-2">
        <div
          :class="[
            'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border shadow-inner',
            urgencyClass
          ]"
        >
          <Clock class="w-3.5 h-3.5" />
          <span>{{ formattedTime }}</span>
        </div>

        <button
          type="button"
          @click="emit('print', order)"
          class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer"
          title="Print Kitchen Ticket"
        >
          <Printer class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Items List with Strikethrough Check -->
    <div class="p-4 flex-1 space-y-2.5">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-800/60">
        <span>Order Items ({{ order.items.length }})</span>
        <span class="text-slate-500">Tap item to check</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="item in order.items"
          :key="item.id || item.foodId"
          @click="emit('toggle-item', { orderId: order.id, itemId: item.id || item.foodId })"
          :class="[
            'p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 select-none',
            isItemPrepared(item.id || item.foodId)
              ? 'bg-slate-950/40 border-slate-800/50 opacity-50'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          ]"
        >
          <!-- Quantity Badge -->
          <span
            :class="[
              'w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm',
              isItemPrepared(item.id || item.foodId)
                ? 'bg-slate-800 text-slate-500'
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            ]"
          >
            {{ item.quantity }}x
          </span>

          <div class="flex-1 min-w-0">
            <div
              :class="[
                'text-sm font-semibold text-slate-200 leading-snug',
                isItemPrepared(item.id || item.foodId) ? 'line-through text-slate-500' : ''
              ]"
            >
              {{ item.name }}
            </div>

            <!-- Special Instructions Callout -->
            <div
              v-if="item.specialInstructions"
              class="mt-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5"
            >
              <AlertTriangle class="w-3 h-3 shrink-0" />
              <span class="truncate">{{ item.specialInstructions }}</span>
            </div>
          </div>

          <!-- Prepared Status Dot -->
          <div class="pt-0.5 shrink-0">
            <CheckCircle2
              :class="[
                'w-4 h-4',
                isItemPrepared(item.id || item.foodId) ? 'text-emerald-500' : 'text-slate-600'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Notes / Special Delivery instructions -->
      <div v-if="order.notes" class="mt-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-1.5">
        <FileText class="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <span class="italic">{{ order.notes }}</span>
      </div>
    </div>

    <!-- Ticket Footer Action Button -->
    <div class="p-3 border-t border-slate-800 bg-slate-950/40">
      <!-- Transition to Preparing -->
      <button
        v-if="order.status === 'pending' || order.status === 'confirmed'"
        type="button"
        @click="emit('advance', 'preparing')"
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <ChefHat class="w-4 h-4" />
        <span>Start Cooking</span>
      </button>

      <!-- Transition to Ready -->
      <button
        v-else-if="order.status === 'preparing'"
        type="button"
        @click="emit('advance', 'on_delivery')"
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>Mark Ready for Pickup</span>
      </button>

      <!-- Transition to Delivered / Bumped -->
      <button
        v-else
        type="button"
        @click="emit('advance', 'delivered')"
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <Bike class="w-4 h-4" />
        <span>Bump / Complete Order</span>
      </button>
    </div>
  </div>
</template>
