<script setup lang="ts">
import { computed } from 'vue';
import { useMenuStore } from '../../menu/stores/menu_store';
import { Star, Flame, ArrowUpRight } from 'lucide-vue-next';

const menuStore = useMenuStore();

const topItems = computed(() => {
  return [...menuStore.foods]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
});
</script>

<template>
  <div class="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display">Top Selling Dishes</h3>
            <p class="text-xs text-slate-400">Most requested kitchen creations</p>
          </div>
        </div>
        <router-link
          to="/menu"
          class="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
        >
          <span>Catalog</span>
          <ArrowUpRight class="w-3 h-3" />
        </router-link>
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, idx) in topItems"
          :key="item.id"
          class="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/40 transition group"
        >
          <div class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <img
              :src="item.image"
              :alt="item.name"
              loading="lazy"
              decoding="async"
              class="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
            <span class="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-orange-400 font-mono">
              #{{ idx + 1 }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-semibold text-white truncate group-hover:text-orange-400 transition">
              {{ item.name }}
            </h4>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span class="text-orange-400 font-bold">${{ item.price.toFixed(2) }}</span>
              <span>•</span>
              <span class="flex items-center gap-0.5 text-amber-400">
                <Star class="w-3 h-3 fill-amber-400" /> {{ item.rating }}
              </span>
              <span>({{ item.reviewCount }})</span>
            </div>
          </div>

          <div>
            <span
              :class="[
                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                item.isAvailable
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              ]"
            >
              {{ item.isAvailable ? 'In Stock' : 'Sold Out' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
