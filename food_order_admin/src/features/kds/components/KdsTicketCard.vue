<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import {
  Clock,
  Printer,
  CheckCircle2,
  ChefHat,
  Bike,
  AlertTriangle,
  FileText,
  Zap,
  Users,
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

// Compute realistic elapsed seconds from createdAt timestamp
function getInitialElapsed(): number {
  if (props.order.createdAt) {
    const parsed = new Date(props.order.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      return Math.max(0, Math.floor((Date.now() - parsed) / 1000));
    }
  }
  const baseMinutes = props.order.status === 'preparing' ? 12 : props.order.status === 'on_delivery' ? 22 : 4;
  return baseMinutes * 60;
}

const elapsedSeconds = ref(getInitialElapsed());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    elapsedSeconds.value += 1;
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const elapsedMinutes = computed(() => Math.floor(elapsedSeconds.value / 60));

const formattedTime = computed(() => {
  const mins = elapsedMinutes.value;
  const secs = elapsedSeconds.value % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
});

// Urgency tiers based on elapsed preparation duration
const isOverdue = computed(() => elapsedMinutes.value >= 18);
const isWarning = computed(() => elapsedMinutes.value >= 10 && elapsedMinutes.value < 18);

const urgencyClass = computed(() => {
  if (isOverdue.value) {
    return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-black';
  }
  if (isWarning.value) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold';
  }
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold';
});

function isItemPrepared(itemId: string): boolean {
  return Boolean(props.preparedMap[`${props.order.id}_${itemId}`]);
}

const checkedCount = computed(() => {
  return props.order.items.filter((it) => isItemPrepared(it.id || it.foodId)).length;
});

const totalItemsCount = computed(() => props.order.items.length);

const progressPercent = computed(() => {
  if (totalItemsCount.value === 0) return 0;
  return Math.round((checkedCount.value / totalItemsCount.value) * 100);
});

const isRush = computed(() => {
  const lower = (props.order.notes || '').toLowerCase();
  return lower.includes('urgent') || lower.includes('rush') || lower.includes('asap');
});
</script>

<template>
  <div
    :class="[
      'rounded-2xl border bg-slate-900/95 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-200 transform hover:border-slate-600',
      isOverdue
        ? 'border-rose-500/60 ring-2 ring-rose-500/20'
        : order.status === 'pending'
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
        isOverdue
          ? 'bg-rose-950/40'
          : order.status === 'pending'
          ? 'bg-orange-500/10'
          : order.status === 'preparing'
          ? 'bg-sky-500/10'
          : 'bg-emerald-500/10'
      ]"
    >
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-mono font-extrabold text-base text-white tracking-wider">
            #{{ order.orderNumber || order.id.slice(-6).toUpperCase() }}
          </span>

          <span
            :class="[
              'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border',
              urgencyClass
            ]"
          >
            {{ isOverdue ? '⚠️ Overdue' : order.status === 'pending' ? 'Queued' : order.status === 'preparing' ? 'Cooking' : 'Ready' }}
          </span>

          <!-- Rush Tag -->
          <span
            v-if="isRush"
            class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-sm"
          >
            <Zap class="w-3 h-3" />
            RUSH
          </span>

          <!-- Group Order Pill -->
          <span
            v-if="order.isGroupOrder || order.groupOrder"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"
          >
            <Users class="w-3 h-3" />
            <span>Group {{ order.groupOrder?.code ? `(${order.groupOrder.code})` : '' }}</span>
          </span>
        </div>

        <div class="text-xs font-semibold text-slate-300 mt-1 truncate max-w-[200px]">
          {{ order.customerName }}
        </div>
      </div>

      <!-- Live Elapsed Timer Badge & Print Button -->
      <div class="flex items-center gap-2 shrink-0">
        <div
          :class="[
            'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono border shadow-inner transition-all',
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

    <!-- Items List with Strikethrough Check & Progress Bar -->
    <div class="p-4 flex-1 space-y-3">
      <!-- Item Checklist Progress -->
      <div class="space-y-1.5">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Items Ready ({{ checkedCount }}/{{ totalItemsCount }})</span>
          <span class="text-slate-500 font-mono">{{ progressPercent }}%</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            :class="[
              'h-full transition-all duration-300 rounded-full',
              progressPercent === 100
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-orange-500 to-amber-400'
            ]"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <div class="space-y-2">
        <div
          v-for="item in order.items"
          :key="item.id || item.foodId"
          @click="emit('toggle-item', { orderId: order.id, itemId: item.id || item.foodId })"
          :class="[
            'p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 select-none',
            isItemPrepared(item.id || item.foodId)
              ? 'bg-slate-950/40 border-slate-800/50 opacity-55'
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

            <!-- Member Attribution in Group Order -->
            <div
              v-if="item.addedBy?.name"
              class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-300 border border-orange-500/25"
            >
              <span>👤</span>
              <span>{{ item.addedBy.name }}</span>
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
                'w-4 h-4 transition-colors',
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
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 active:scale-98 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <ChefHat class="w-4 h-4" />
        <span>Start Cooking →</span>
      </button>

      <!-- Transition to Ready -->
      <button
        v-else-if="order.status === 'preparing'"
        type="button"
        @click="emit('advance', 'on_delivery')"
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 active:scale-98 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>Mark Ready for Pickup →</span>
      </button>

      <!-- Transition to Delivered / Bumped -->
      <button
        v-else
        type="button"
        @click="emit('advance', 'delivered')"
        class="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <Bike class="w-4 h-4" />
        <span>Bump / Complete Order ✓</span>
      </button>
    </div>
  </div>
</template>

