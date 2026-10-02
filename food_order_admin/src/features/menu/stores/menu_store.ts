import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import type { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';
import { foodRepository } from '../../../data';
import { GetFoodsUseCase } from '../../../domain/foods/usecases/get_foods_usecase';
import { SaveFoodUseCase } from '../../../domain/foods/usecases/save_food_usecase';
import { MenuIntentType, type MenuIntent, MenuIntents } from '../menu_intent';
import { initialMenuState, computeFilteredFoods, type MenuState } from '../menu_state';

export const useMenuStore = defineStore('menu', () => {
  const getFoodsUseCase = new GetFoodsUseCase(foodRepository);
  const saveFoodUseCase = new SaveFoodUseCase(foodRepository);

  // MVI Reactive State (M)
  const state = reactive<MenuState>({ ...initialMenuState });

  function applyStateUpdates() {
    state.filteredFoods = computeFilteredFoods(state.foods, state.selectedCategory, state.searchQuery);
    state.availableCount = state.foods.filter((f) => f.isAvailable).length;
    state.outOfStockCount = state.foods.filter((f) => !f.isAvailable).length;
  }

  /**
   * MVI Reducer / Dispatcher (I -> M)
   */
  async function dispatch(intent: MenuIntent) {
    switch (intent.type) {
      case MenuIntentType.FETCH_MENU: {
        state.isLoading = true;
        state.errorMessage = null;
        try {
          const [f, c] = await Promise.all([
            getFoodsUseCase.execute(),
            foodRepository.getCategories(),
          ]);
          state.foods = f;
          state.categories = c;
          applyStateUpdates();
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu';
        } finally {
          state.isLoading = false;
        }
        break;
      }

      case MenuIntentType.SET_CATEGORY: {
        state.selectedCategory = intent.payload;
        state.filteredFoods = computeFilteredFoods(state.foods, state.selectedCategory, state.searchQuery);
        break;
      }

      case MenuIntentType.SET_SEARCH: {
        state.searchQuery = intent.payload;
        state.filteredFoods = computeFilteredFoods(state.foods, state.selectedCategory, state.searchQuery);
        break;
      }

      case MenuIntentType.TOGGLE_AVAILABILITY: {
        try {
          const updated = await foodRepository.toggleAvailability(intent.payload.foodId);
          const idx = state.foods.findIndex((f) => f.id === intent.payload.foodId);
          if (idx !== -1) {
            state.foods[idx] = updated;
          }
          applyStateUpdates();
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to toggle availability';
        }
        break;
      }

      case MenuIntentType.OPEN_ADD_MODAL: {
        state.editingFood = null;
        state.isEditingFood = false;
        state.isFoodModalOpen = true;
        break;
      }

      case MenuIntentType.OPEN_EDIT_MODAL: {
        state.editingFood = intent.payload;
        state.isEditingFood = true;
        state.isFoodModalOpen = true;
        break;
      }

      case MenuIntentType.CLOSE_MODAL: {
        state.isFoodModalOpen = false;
        state.editingFood = null;
        break;
      }

      case MenuIntentType.SAVE_FOOD: {
        try {
          const foodData = { ...intent.payload };
          if (state.isEditingFood && state.editingFood) {
            foodData.id = state.editingFood.id;
          }
          const saved = await saveFoodUseCase.execute(foodData);
          const idx = state.foods.findIndex((f) => f.id === saved.id);
          if (idx !== -1) {
            state.foods[idx] = saved;
          } else {
            state.foods.unshift(saved);
          }
          applyStateUpdates();
          state.isFoodModalOpen = false;
          state.editingFood = null;
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to save food';
        }
        break;
      }

      case MenuIntentType.DELETE_FOOD: {
        try {
          await foodRepository.deleteFood(intent.payload.foodId);
          state.foods = state.foods.filter((f) => f.id !== intent.payload.foodId);
          applyStateUpdates();
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to delete food';
        }
        break;
      }

      case MenuIntentType.ADD_CATEGORY: {
        try {
          const created = await foodRepository.saveCategory(intent.payload);
          state.categories.push(created);
        } catch (err: unknown) {
          state.errorMessage = err instanceof Error ? err.message : 'Failed to create category';
        }
        break;
      }
    }
  }

  // Initial Fetch on store instantiation
  dispatch(MenuIntents.fetchMenu());

  // Direct accessors & computed bindings
  const foods = computed(() => state.foods);
  const categories = computed(() => state.categories);
  const selectedCategory = computed({
    get: () => state.selectedCategory,
    set: (val: string) => dispatch(MenuIntents.setCategory(val)),
  });
  const searchQuery = computed({
    get: () => state.searchQuery,
    set: (val: string) => dispatch(MenuIntents.setSearch(val)),
  });
  const filteredFoods = computed(() => state.filteredFoods);
  const availableCount = computed(() => state.availableCount);
  const outOfStockCount = computed(() => state.outOfStockCount);
  const isFoodModalOpen = computed(() => state.isFoodModalOpen);
  const isEditingFood = computed(() => state.isEditingFood);
  const editingFood = computed(() => state.editingFood);

  return {
    state,
    dispatch,
    foods,
    categories,
    selectedCategory,
    searchQuery,
    filteredFoods,
    availableCount,
    outOfStockCount,
    isFoodModalOpen,
    isEditingFood,
    editingFood,
    // Convenience helper methods that dispatch intents
    loadMenu: () => dispatch(MenuIntents.fetchMenu()),
    toggleAvailability: (id: string) => dispatch(MenuIntents.toggleAvailability(id)),
    openAddFoodModal: () => dispatch(MenuIntents.openAddModal()),
    openEditFoodModal: (food: FoodEntity) => dispatch(MenuIntents.openEditModal(food)),
    closeFoodModal: () => dispatch(MenuIntents.closeModal()),
    saveFood: (food: Partial<FoodEntity>) => dispatch(MenuIntents.saveFood(food)),
    deleteFood: (id: string) => dispatch(MenuIntents.deleteFood(id)),
    addCategory: (cat: Partial<CategoryEntity>) => dispatch(MenuIntents.addCategory(cat)),
  };
});
