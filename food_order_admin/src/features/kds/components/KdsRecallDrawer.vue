<script setup lang="ts">
import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import {
  RotateCcw,
  X,
  History,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  orders: OrderEntity[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'recall', payload: { id: string; status: OrderStatus }): void;
  (e: 'print', order: OrderEntity): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    />

    <!-- Slide-over drawer -->
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
        <!-- Header -->
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <History class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                Recently Bumped
                <span class="px-2 py-0.5 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  {{ orders.length }}
                </span>
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Restore accidentally bumped tickets back to the board
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Drawer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Orders List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="orders.length === 0" class="py-16 text-center text-slate-500 space-y-3">
            <CheckCircle2 class="w-10 h-10 mx-auto opacity-30 text-slate-400" />
            <p class="text-sm font-medium">No bumped tickets yet</p>
            <p class="text-xs text-slate-600 max-w-xs mx-auto">
              Completed or delivered orders will appear here so you can recall them if needed.
            </p>
          </div>

          <div
            v-for="order in orders"
            :key="order.id"
            class="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 space-y-3 hover:border-slate-600 transition"
          >
            <!-- Order Header -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-sm text-white">
                    #{{ order.orderNumber ? order.orderNumber.slice(-4) : order.id.slice(-4) }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                      order.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    ]"
                  >
                    {{ order.status }}
                  </span>
                  <span
                    v-if="order.isGroupOrder"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    Group
                  </span>
                </div>
                <p class="text-xs text-slate-300 mt-1 font-medium">
                  {{ order.customerName }} • {{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}
                </p>
              </div>

              <!-- Print Slip Button -->
              <button
                type="button"
                @click="emit('print', order)"
                class="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition cursor-pointer"
                title="Print Kitchen Ticket"
              >
                <Printer class="w-4 h-4" />
              </button>
            </div>

            <!-- Items Summary -->
            <div class="bg-slate-900/60 rounded-xl p-2.5 text-xs text-slate-300 space-y-1">
              <div
                v-for="item in order.items"
                :key="item.id || item.foodId"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-1.5 truncate">
                  <span class="font-mono font-bold text-orange-400">{{ item.quantity }}x</span>
                  <span class="truncate">{{ item.name }}</span>
                </div>
                <span v-if="item.addedBy?.name" class="text-[10px] text-slate-500 font-mono">
                  {{ item.addedBy.name }}
                </span>
              </div>
            </div>

            <!-- Recall Actions -->
            <div class="pt-1 flex items-center gap-2">
              <button
                type="button"
                @click="emit('recall', { id: order.id, status: 'preparing' })"
                class="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Recall to Cooking</span>
              </button>

              <button
                type="button"
                @click="emit('recall', { id: order.id, status: 'on_delivery' })"
                class="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Recall to Ready</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
