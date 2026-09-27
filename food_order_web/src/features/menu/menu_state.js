export const initialMenuState = {
  foods: [],
  categories: [],
  selectedCategory: 'ALL',
  searchQuery: '',
  sortBy: 'popular',
  loading: true,
  errorMessage: null,
  selectedFood: null,
};

export function computeProcessedFoods(foods = [], selectedCategory = 'ALL', searchQuery = '', sortBy = 'popular') {
  return foods
    .filter((food) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'ALL' ||
        food.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        food.categoryId === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        !searchQuery.trim() ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
}
