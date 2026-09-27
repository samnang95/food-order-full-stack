/**
 * Model / State (M) in MVI:
 * Immutable representation of the Home feature state.
 */
export const initialHomeState = {
  foods: [],
  categories: [],
  selectedCategory: 'ALL',
  loading: true,
  searchQuery: '',
  selectedFood: null,
  errorMessage: null,
};

export function computeHomeFilteredFoods(foods = [], selectedCategory = 'ALL', searchQuery = '') {
  return foods.filter((food) => {
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'ALL' ||
      food.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
      food.categoryId === selectedCategory;

    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      food.name?.toLowerCase().includes(q) ||
      food.description?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });
}
