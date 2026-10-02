<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMenuStore } from '../stores/menu_store';
import { X, Image, Sparkles } from 'lucide-vue-next';

const menuStore = useMenuStore();

const form = ref({
  name: '',
  description: '',
  price: 12.99,
  category: 'Burgers & Sandwiches',
  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  isAvailable: true,
  prepTimeMinutes: 15,
  calories: 650,
  tags: 'Special, Chef Choice',
});

watch(
  () => menuStore.editingFood,
  (food) => {
    if (food) {
      form.value = {
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        isAvailable: food.isAvailable,
        prepTimeMinutes: food.prepTimeMinutes,
        calories: food.calories || 500,
        tags: food.tags.join(', '),
      };
    } else {
      form.value = {
        name: '',
        description: '',
        price: 12.99,
        category: menuStore.categories[0]?.name || 'Burgers & Sandwiches',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        prepTimeMinutes: 15,
        calories: 550,
        tags: 'New Item, Popular',
      };
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!form.value.name) return;
  menuStore.saveFood({
    name: form.value.name,
    description: form.value.description,
    price: Number(form.value.price),
    category: form.value.category,
    image: form.value.image,
    isAvailable: form.value.isAvailable,
    prepTimeMinutes: Number(form.value.prepTimeMinutes),
    calories: Number(form.value.calories),
    tags: form.value.tags.split(',').map((t) => t.trim()).filter(Boolean),
  });
}
</script>

<template>
  <div
    v-if="menuStore.isFoodModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
  >
    <div
      class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Sparkles class="w-4 h-4" />
          </div>
          <h3 class="text-base font-bold text-white font-display">
            {{ menuStore.isEditingFood ? 'Edit Dish Details' : 'Add New Kitchen Dish' }}
          </h3>
        </div>
        <button
          @click="menuStore.closeFoodModal()"
          class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-300 mb-1">Dish Title</label>
          <input
            v-model="form.name"
            required
            type="text"
            placeholder="e.g. Signature Truffle Wagyu Burger"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Category</label>
            <select
              v-model="form.category"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option v-for="cat in menuStore.categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-300 mb-1">Price ($ USD)</label>
            <input
              v-model.number="form.price"
              required
              type="number"
              step="0.01"
              min="0"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Prep Time (Minutes)</label>
            <input
              v-model.number="form.prepTimeMinutes"
              type="number"
              min="1"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Calories (kcal)</label>
            <input
              v-model.number="form.calories"
              type="number"
              min="0"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Description & Ingredients</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Write ingredients, sauce details, allergen notes..."
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          ></textarea>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Food Photography URL</label>
          <div class="flex gap-3 items-center">
            <input
              v-model="form.image"
              type="url"
              placeholder="https://..."
              class="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
            />
            <div class="w-12 h-12 rounded-xl border border-slate-700 overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
              <img
                v-if="form.image"
                :src="form.image"
                alt="Preview"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLElement).style.display = 'none'"
              />
              <Image v-else class="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Badges / Tags (comma separated)</label>
          <input
            v-model="form.tags"
            type="text"
            placeholder="Best Seller, Spicy, Vegan"
            class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div>
            <div class="font-semibold text-white">Item Availability</div>
            <div class="text-[11px] text-slate-400">Can customers currently order this dish?</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.isAvailable" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="menuStore.closeFoodModal()"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:brightness-110 transition"
          >
            {{ menuStore.isEditingFood ? 'Save Changes' : 'Add to Menu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
