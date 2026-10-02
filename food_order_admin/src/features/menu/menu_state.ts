import type { FoodEntity, CategoryEntity } from '../../domain/foods/entities/food_entity';

/**
 * Model / State (M) in MVI:
 * Immutable representation of Menu & Food Catalog state.
 */
export interface MenuState {
  foods: FoodEntity[];
  categories: CategoryEntity[];
  filteredFoods: FoodEntity[];
  selectedCategory: string;
  searchQuery: string;
  isFoodModalOpen: boolean;
  isEditingFood: boolean;
  editingFood: FoodEntity | null;
  isLoading: boolean;
  errorMessage: string | null;
  availableCount: number;
  outOfStockCount: number;
}

export const initialMenuState: MenuState = {
  foods: [],
  categories: [],
  filteredFoods: [],
  selectedCategory: 'All',
  searchQuery: '',
  isFoodModalOpen: false,
  isEditingFood: false,
  editingFood: null,
  isLoading: false,
  errorMessage: null,
  availableCount: 0,
  outOfStockCount: 0,
};

export function computeFilteredFoods(
  foods: FoodEntity[],
  selectedCategory: string,
  searchQuery: string
): FoodEntity[] {
  return foods.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });
}
