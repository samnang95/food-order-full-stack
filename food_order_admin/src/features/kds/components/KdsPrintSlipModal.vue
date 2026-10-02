<script setup lang="ts">
import type { OrderEntity } from '../../../domain/orders/entities/order_entity';
import { X, Printer } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  order: OrderEntity | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handlePrint() {
  window.print();
}
</script>

<template>
  <div
    v-if="isOpen && order"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <h3 class="text-sm font-bold text-white">Kitchen Ticket Preview</h3>
        <button
          type="button"
          @click="emit('close')"
          class="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Thermal Slip Preview Paper -->
      <div class="p-6 bg-slate-950 flex justify-center">
        <div class="w-72 bg-white text-slate-900 p-5 rounded shadow-lg font-mono text-xs leading-relaxed border border-slate-300">
          <div class="text-center pb-3 border-b-2 border-dashed border-slate-400">
            <h2 class="text-base font-black uppercase">FoodHub Kitchen</h2>
            <p class="text-[10px] text-slate-600">Operations Slip #1</p>
            <div class="text-sm font-black mt-1">#{{ order.orderNumber }}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">{{ new Date().toLocaleString() }}</div>
          </div>

          <div class="py-2.5 border-b border-dashed border-slate-400">
            <div><strong>Customer:</strong> {{ order.customerName }}</div>
            <div><strong>Type:</strong> Delivery (Courier)</div>
            <div v-if="order.customerPhone"><strong>Tel:</strong> {{ order.customerPhone }}</div>
          </div>

          <!-- Items list -->
          <div class="py-3 border-b-2 border-dashed border-slate-400 space-y-2">
            <div
              v-for="item in order.items"
              :key="item.id || item.foodId"
              class="flex flex-col"
            >
              <div class="flex justify-between items-start">
                <span class="font-black text-sm">[{{ item.quantity }}x] {{ item.name }}</span>
                <span class="text-xs font-semibold">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              <div v-if="item.specialInstructions" class="text-[10px] font-bold text-red-600 bg-red-50 p-0.5 rounded mt-0.5">
                ** NOTE: {{ item.specialInstructions }} **
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="order.notes" class="py-2 border-b border-dashed border-slate-400 text-[11px]">
            <strong>Order Notes:</strong>
            <p class="italic text-slate-700">{{ order.notes }}</p>
          </div>

          <!-- Total -->
          <div class="pt-3 flex justify-between font-black text-sm">
            <span>TOTAL AMOUNT:</span>
            <span>${{ order.total.toFixed(2) }}</span>
          </div>

          <div class="text-center text-[10px] text-slate-500 pt-4 border-t border-dashed border-slate-300 mt-3">
            --- KITCHEN COPY ---
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        >
          Close
        </button>
        <button
          type="button"
          @click="handlePrint"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Printer class="w-4 h-4" />
          <span>Print Slip</span>
        </button>
      </div>
    </div>
  </div>
</template>
