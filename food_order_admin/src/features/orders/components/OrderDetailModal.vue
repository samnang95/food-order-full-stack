<script setup lang="ts">
import { useOrdersStore } from '../stores/orders_store';
import type { OrderStatus } from '../../../domain/orders/entities/order_entity';
import {
  X,
  MapPin,
  Phone,
  User,
  Clock,
  Printer,
  FileText,
  AlertCircle,
} from 'lucide-vue-next';

const ordersStore = useOrdersStore();

const statusSteps: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'on_delivery', label: 'On Delivery' },
  { key: 'delivered', label: 'Delivered' },
];
</script>

<template>
  <div
    v-if="ordersStore.isDetailModalOpen && ordersStore.selectedOrder"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-white font-display">
                Order {{ ordersStore.selectedOrder.orderNumber }}
              </h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {{ ordersStore.selectedOrder.status }}
              </span>
              <span
                v-if="ordersStore.selectedOrder.isGroupOrder || ordersStore.selectedOrder.groupOrder"
                class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"
              >
                👥 Group Order
              </span>
            </div>
            <p class="text-xs text-slate-400">Placed {{ ordersStore.selectedOrder.createdAt }}</p>

          </div>
        </div>

        <button
          @click="ordersStore.closeOrderDetail()"
          class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Change Order Status
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="step in statusSteps"
              :key="step.key"
              @click="ordersStore.updateOrderStatus(ordersStore.selectedOrder!.id, step.key)"
              :class="[
                'py-2 px-3 rounded-xl text-xs font-bold border transition text-center',
                ordersStore.selectedOrder.status === step.key
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/25'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
              ]"
            >
              {{ step.label }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase">
              <User class="w-3.5 h-3.5 text-orange-400" />
              <span>Customer</span>
            </div>
            <div class="text-sm font-bold text-white">{{ ordersStore.selectedOrder.customerName }}</div>
            <div class="text-xs text-slate-300 flex items-center gap-1.5">
              <Phone class="w-3 h-3 text-slate-400" />
              <span>{{ ordersStore.selectedOrder.customerPhone }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase">
              <MapPin class="w-3.5 h-3.5 text-orange-400" />
              <span>Delivery Address</span>
            </div>
            <div class="text-xs text-slate-200 leading-relaxed">
              {{ ordersStore.selectedOrder.customerAddress }}
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock class="w-3 h-3 text-orange-400" />
              <span>Est. Prep & Delivery: {{ ordersStore.selectedOrder.estimatedDeliveryMinutes }}m</span>
            </div>
          </div>
        </div>

        <div
          v-if="ordersStore.selectedOrder.notes"
          class="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300"
        >
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span class="font-bold">Customer Notes: </span>
            {{ ordersStore.selectedOrder.notes }}
          </div>
        </div>

        <div>
          <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Items Ordered ({{ ordersStore.selectedOrder.items.length }})
          </h4>
          <div class="space-y-2.5">
            <div
              v-for="item in ordersStore.selectedOrder.items"
              :key="item.id"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h5 class="text-xs font-bold text-white">{{ item.name }}</h5>
                  <div class="text-[11px] text-slate-400">
                    Qty: <span class="font-bold text-slate-200">{{ item.quantity }}</span> &times; ${{ item.price.toFixed(2) }}
                  </div>
                  <div v-if="item.specialInstructions" class="text-[10px] text-orange-400 font-medium">
                    Note: {{ item.specialInstructions }}
                  </div>
                  <div v-if="item.addedBy?.name" class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30 mt-1">
                    <span>👤</span>
                    <span>Ordered by {{ item.addedBy.name }}</span>
                  </div>
                </div>
              </div>

              <div class="text-sm font-bold text-white">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-800/30 border border-slate-800/60 space-y-2 text-xs">
          <div class="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span class="text-white">${{ ordersStore.selectedOrder.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Delivery Fee</span>
            <span class="text-white">${{ ordersStore.selectedOrder.deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Driver Tip</span>
            <span class="text-white">${{ ordersStore.selectedOrder.driverTip.toFixed(2) }}</span>
          </div>
          <div v-if="ordersStore.selectedOrder.discount > 0" class="flex justify-between text-emerald-400">
            <span>Voucher Discount</span>
            <span>-${{ ordersStore.selectedOrder.discount.toFixed(2) }}</span>
          </div>
          <div class="pt-2 border-t border-slate-700/60 flex justify-between text-sm font-bold text-white">
            <span>Total Amount</span>
            <span class="text-orange-400 text-base font-display">
              ${{ ordersStore.selectedOrder.total.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
        <button
          @click="ordersStore.updateOrderStatus(ordersStore.selectedOrder!.id, 'cancelled')"
          class="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-xs font-semibold transition"
        >
          Cancel Order
        </button>

        <div class="flex items-center gap-2">
          <button
            onclick="window.print()"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Print Docket</span>
          </button>
          <button
            @click="ordersStore.closeOrderDetail()"
            class="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-lg shadow-orange-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
