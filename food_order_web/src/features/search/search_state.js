import { LocalDB, DBKeys } from '../../core';

export const POPULAR_SUGGESTIONS = [
  { emoji: '🍔', tag: 'Smash Burger' },
  { emoji: '🍕', tag: 'Pizza' },
  { emoji: '🍜', tag: 'Ramen' },
  { emoji: '🥗', tag: 'Healthy Bowl' },
  { emoji: '🍰', tag: 'Dessert' },
  { emoji: '☕', tag: 'Coffee' },
  { emoji: '🦐', tag: 'Seafood' },
  { emoji: '🥐', tag: 'Croissant' },
];

/**
 * Pure selector/filter for search results
 */
export function computeFilteredSearchResults(foods = [], query = '', selectedCategory = 'ALL', priceRange = 'all', sortBy = 'recommended') {
  let result = [...foods];
  const q = (query || '').trim().toLowerCase();

  // 1. Text Search
  if (q) {
    result = result.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        (f.categoryName && f.categoryName.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (selectedCategory && selectedCategory !== 'ALL') {
    const catLower = selectedCategory.toLowerCase();
    result = result.filter(
      (f) =>
        f.categoryId === selectedCategory ||
        (f.categoryName && f.categoryName.toLowerCase() === catLower)
    );
  }

  // 3. Price Filter
  if (priceRange === 'under10') {
    result = result.filter((f) => (Number(f.price) || 0) < 10);
  } else if (priceRange === '10to15') {
    result = result.filter((f) => {
      const p = Number(f.price) || 0;
      return p >= 10 && p <= 15;
    });
  } else if (priceRange === 'above15') {
    result = result.filter((f) => (Number(f.price) || 0) > 15);
  }

  // 4. Sorting
  result.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'alpha') return (a.name || '').localeCompare(b.name || '');
    return 0; // 'recommended'
  });

  return result;
}

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Search feature state.
 */
export function createInitialSearchState(overrides = {}) {
  const recentSearches = LocalDB.getJSON(DBKeys.SEARCH_HISTORY, []);

  return {
    query: '',
    selectedCategory: 'ALL',
    priceRange: 'all',
    sortBy: 'recommended',
    foods: [],
    categories: [],
    loading: true,
    errorMessage: null,
    selectedFood: null,
    filterDrawerOpen: false,
    recentSearches: Array.isArray(recentSearches) ? recentSearches : [],
    ...overrides,
  };
}
