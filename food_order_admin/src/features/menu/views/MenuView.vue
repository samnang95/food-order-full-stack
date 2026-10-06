<script setup lang="ts">
import { useMenuStore } from '../stores/menu_store';
import {
  Plus,
  Search,
  Star,
  Clock,
  Flame,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-vue-next';

const menuStore = useMenuStore();
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold font-display text-white">{{ $t('menu.title') }}</h2>
        <p class="text-xs text-slate-400">
          {{ $t('menu.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="menuStore.openAddFoodModal()"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('menu.addNewDish') }}</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          @click="menuStore.selectedCategory = 'All'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border',
            menuStore.selectedCategory === 'All'
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          ]"
        >
          All Items ({{ menuStore.foods.length }})
        </button>
        <button
          v-for="cat in menuStore.categories"
          :key="cat.id"
          @click="menuStore.selectedCategory = cat.name"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border',
            menuStore.selectedCategory === cat.name
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="relative w-full md:w-64">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="menuStore.searchQuery"
          type="text"
          placeholder="Search recipes, tags..."
          class="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="item in menuStore.filteredFoods"
        :key="item.id"
        class="glass-card rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
      >
        <div class="relative h-44 w-full overflow-hidden bg-slate-800">
          <img
            :src="item.image"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

          <span class="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-900/90 text-slate-200 border border-white/10">
            {{ item.category }}
          </span>

          <div class="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-900/90 text-amber-400 border border-white/10">
            <Star class="w-3 h-3 fill-amber-400" />
            <span>{{ item.rating }}</span>
          </div>

          <div class="absolute bottom-2.5 left-2.5">
            <span class="text-base font-bold font-display text-white bg-slate-900/95 px-2.5 py-1 rounded-xl border border-white/10 text-orange-400">
              ${{ item.price.toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-white group-hover:text-orange-400 transition truncate">
              {{ item.name }}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {{ item.description }}
            </p>

            <div class="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
              <span class="flex items-center gap-1">
                <Clock class="w-3 h-3 text-orange-400" />
                {{ item.prepTimeMinutes }}m prep
              </span>
              <span v-if="item.calories" class="flex items-center gap-1">
                <Flame class="w-3 h-3 text-amber-400" />
                {{ item.calories }} kcal
              </span>
            </div>

            <div class="flex flex-wrap gap-1 mt-2.5">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              @click="menuStore.toggleAvailability(item.id)"
              :class="[
                'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl transition border',
                item.isAvailable
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
              ]"
            >
              <CheckCircle2 v-if="item.isAvailable" class="w-3 h-3" />
              <AlertCircle v-else class="w-3 h-3" />
              <span>{{ item.isAvailable ? 'In Stock' : 'Sold Out' }}</span>
            </button>

            <div class="flex items-center gap-1">
              <button
                @click="menuStore.openEditFoodModal(item)"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Edit item"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="menuStore.deleteFood(item.id)"
                class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 transition"
                title="Delete item"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
