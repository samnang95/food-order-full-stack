export const initialCategoriesState = {
  categories: [],
  foods: [],
  loading: true,
  errorMessage: null,
  searchQuery: '',
  selectedTag: 'all',
};

export function computeCategoryItemCounts(foods = []) {
  const counts = {};
  for (const food of foods) {
    if (food.categoryId) {
      counts[food.categoryId] = (counts[food.categoryId] || 0) + 1;
    }
    if (food.categoryName) {
      const nameLower = food.categoryName.toLowerCase();
      counts[nameLower] = (counts[nameLower] || 0) + 1;
    }
  }
  return counts;
}

export function computeFilteredCategories(categories = [], foods = [], searchQuery = '', selectedTag = 'all') {
  let result = [...categories];
  const q = (searchQuery || '').trim().toLowerCase();

  // Filter by search query
  if (q) {
    result = result.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }

  // Filter by tag
  if (selectedTag === 'trending') {
    result = result.filter((c) => {
      const n = (c.name || '').toLowerCase();
      return n.includes('burger') || n.includes('pizza') || n.includes('asian');
    });
  } else if (selectedTag === 'budget') {
    const counts = computeCategoryItemCounts(foods);
    result = result.filter((c) => {
      const byId = counts[c.id] || 0;
      const byName = counts[(c.name || '').toLowerCase()] || 0;
      return Math.max(byId, byName) > 0;
    });
  }

  return result;
}
