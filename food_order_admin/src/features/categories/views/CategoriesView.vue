<script setup lang="ts">
import { ref } from 'vue';
import { useCategoriesStore } from '../stores/categories_store';
import { useMenuStore } from '../../menu/stores/menu_store';
import { Layers, Plus, Check, X, Utensils, Pizza, Soup, Coffee, Cake } from 'lucide-vue-next';

const categoriesStore = useCategoriesStore();
const menuStore = useMenuStore();

const newCatName = ref('');

function handleAddCategory() {
  if (!newCatName.value) return;
  categoriesStore.addCategory({
    name: newCatName.value,
    slug: newCatName.value.toLowerCase().replace(/\s+/g, '-'),
    icon: 'Utensils',
    isActive: true,
  });
  newCatName.value = '';
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Pizza':
      return Pizza;
    case 'Soup':
      return Soup;
    case 'Coffee':
      return Coffee;
    case 'Cake':
      return Cake;
    default:
      return Utensils;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold font-display text-white">Food Categories</h2>
        <p class="text-xs text-slate-400">Organize dishes into customer menu sections</p>
      </div>

      <button
        @click="categoriesStore.openAddModal()"
        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Add Category</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in categoriesStore.categories"
        :key="cat.id"
        class="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
      >
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <component :is="getCategoryIcon(cat.icon)" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">{{ cat.name }}</h3>
            <span class="text-xs text-slate-400">
              {{ menuStore.foods.filter(f => f.category === cat.name).length }} dishes assigned
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            :class="[
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              cat.isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            ]"
          >
            {{ cat.isActive ? 'Active' : 'Disabled' }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="categoriesStore.isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <Layers class="w-4 h-4 text-orange-400" />
            <span>Create New Category</span>
          </h3>
          <button @click="categoriesStore.closeAddModal()" class="text-slate-400 hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddCategory" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Category Name</label>
            <input
              v-model="newCatName"
              required
              type="text"
              placeholder="e.g. Salads & Healthy Bowls"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="categoriesStore.closeAddModal()"
              class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
