<script setup lang="ts">
import { useCustomersStore } from '../stores/customers_store';
import { Search, Mail, Phone, ShoppingBag, DollarSign, Award } from 'lucide-vue-next';

const customersStore = useCustomersStore();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold font-display text-white">Customer Directory</h2>
        <p class="text-xs text-slate-400">View loyalty, order histories and contact profiles</p>
      </div>

      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="customersStore.searchQuery"
          type="text"
          placeholder="Search by customer name, email..."
          class="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>

    <div class="glass-card rounded-2xl p-5 border border-slate-800/80 overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
          <tr>
            <th class="pb-3 font-semibold">Customer</th>
            <th class="pb-3 font-semibold">Contact</th>
            <th class="pb-3 font-semibold">Orders Count</th>
            <th class="pb-3 font-semibold">Total Spent</th>
            <th class="pb-3 font-semibold">Joined Date</th>
            <th class="pb-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/40">
          <tr
            v-for="customer in customersStore.filteredCustomers"
            :key="customer.id"
            class="hover:bg-slate-800/40 transition"
          >
            <td class="py-3.5">
              <div class="flex items-center gap-3">
                <img
                  :src="customer.avatar"
                  :alt="customer.name"
                  class="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <div class="font-bold text-white flex items-center gap-1.5">
                    <span>{{ customer.name }}</span>
                    <span v-if="customer.totalOrders > 15" title="VIP Customer">
                      <Award class="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400">{{ customer.id }}</div>
                </div>
              </div>
            </td>

            <td class="py-3.5">
              <div class="text-slate-300 flex items-center gap-1.5">
                <Mail class="w-3 h-3 text-slate-400" />
                <span>{{ customer.email }}</span>
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Phone class="w-3 h-3 text-slate-400" />
                <span>{{ customer.phone }}</span>
              </div>
            </td>

            <td class="py-3.5">
              <div class="flex items-center gap-1 text-slate-200 font-semibold">
                <ShoppingBag class="w-3.5 h-3.5 text-orange-400" />
                <span>{{ customer.totalOrders }} orders</span>
              </div>
            </td>

            <td class="py-3.5">
              <div class="font-bold text-white flex items-center gap-0.5">
                <DollarSign class="w-3.5 h-3.5 text-emerald-400" />
                <span>{{ customer.totalSpent.toFixed(2) }}</span>
              </div>
            </td>

            <td class="py-3.5 text-slate-400">
              {{ customer.joinedDate }}
            </td>

            <td class="py-3.5">
              <span
                :class="[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  customer.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                ]"
              >
                {{ customer.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
