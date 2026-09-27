export const SearchIntentType = {
  LOAD_START: 'SEARCH/LOAD_START',
  LOAD_SUCCESS: 'SEARCH/LOAD_SUCCESS',
  LOAD_ERROR: 'SEARCH/LOAD_ERROR',

  SET_QUERY: 'SEARCH/SET_QUERY',
  SET_CATEGORY: 'SEARCH/SET_CATEGORY',
  SET_PRICE_RANGE: 'SEARCH/SET_PRICE_RANGE',
  SET_SORT_BY: 'SEARCH/SET_SORT_BY',
  RESET_FILTERS: 'SEARCH/RESET_FILTERS',

  SELECT_FOOD: 'SEARCH/SELECT_FOOD',
  CLEAR_SELECTED_FOOD: 'SEARCH/CLEAR_SELECTED_FOOD',

  SET_FILTER_DRAWER: 'SEARCH/SET_FILTER_DRAWER',

  SAVE_SEARCH_QUERY: 'SEARCH/SAVE_SEARCH_QUERY',
  REMOVE_RECENT_SEARCH: 'SEARCH/REMOVE_RECENT_SEARCH',
  CLEAR_RECENT_SEARCHES: 'SEARCH/CLEAR_RECENT_SEARCHES',
};

export const SearchIntent = {
  loadSuccess: ({ foods, categories }) => ({
    type: SearchIntentType.LOAD_SUCCESS,
    payload: { foods, categories },
  }),

  setQuery: (query) => ({
    type: SearchIntentType.SET_QUERY,
    payload: query,
  }),

  setCategory: (category) => ({
    type: SearchIntentType.SET_CATEGORY,
    payload: category,
  }),

  setPriceRange: (range) => ({
    type: SearchIntentType.SET_PRICE_RANGE,
    payload: range,
  }),

  setSortBy: (sort) => ({
    type: SearchIntentType.SET_SORT_BY,
    payload: sort,
  }),

  resetFilters: () => ({
    type: SearchIntentType.RESET_FILTERS,
  }),

  selectFood: (food) => ({
    type: SearchIntentType.SELECT_FOOD,
    payload: food,
  }),

  clearSelectedFood: () => ({
    type: SearchIntentType.CLEAR_SELECTED_FOOD,
  }),

  setFilterDrawer: (isOpen) => ({
    type: SearchIntentType.SET_FILTER_DRAWER,
    payload: isOpen,
  }),

  saveSearchQuery: (term) => ({
    type: SearchIntentType.SAVE_SEARCH_QUERY,
    payload: term,
  }),

  removeRecentSearch: (term) => ({
    type: SearchIntentType.REMOVE_RECENT_SEARCH,
    payload: term,
  }),

  clearRecentSearches: () => ({
    type: SearchIntentType.CLEAR_RECENT_SEARCHES,
  }),
};
