import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import type { CategoryEntity } from '../../../domain/foods/entities/food_entity';
import { foodRepository } from '../../../data';
import { CategoriesIntentType, type CategoriesIntent, CategoriesIntents } from '../categories_intent';
import { initialCategoriesState, type CategoriesState } from '../categories_state';

export const useCategoriesStore = defineStore('categories', () => {
  const state = reactive<CategoriesState>({ ...initialCategoriesState });

  async function dispatch(intent: CategoriesIntent) {
    switch (intent.type) {
      case CategoriesIntentType.FETCH_CATEGORIES: {
        state.isLoading = true;
        try {
          state.categories = await foodRepository.getCategories();
        } finally {
          state.isLoading = false;
        }
        break;
      }
      case CategoriesIntentType.OPEN_ADD_MODAL:
        state.isAddModalOpen = true;
        break;
      case CategoriesIntentType.CLOSE_ADD_MODAL:
        state.isAddModalOpen = false;
        break;
      case CategoriesIntentType.ADD_CATEGORY: {
        const created = await foodRepository.saveCategory(intent.payload);
        state.categories.push(created);
        state.isAddModalOpen = false;
        break;
      }
    }
  }

  dispatch(CategoriesIntents.fetchCategories());

  const categories = computed(() => state.categories);
  const isAddModalOpen = computed({
    get: () => state.isAddModalOpen,
    set: (val: boolean) => {
      state.isAddModalOpen = val;
    },
  });

  return {
    state,
    dispatch,
    categories,
    isAddModalOpen,
    openAddModal: () => dispatch(CategoriesIntents.openAddModal()),
    closeAddModal: () => dispatch(CategoriesIntents.closeAddModal()),
    addCategory: (cat: Partial<CategoryEntity>) => dispatch(CategoriesIntents.addCategory(cat)),
  };
});
