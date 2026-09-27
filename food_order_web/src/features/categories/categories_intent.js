export const CategoriesIntentType = {
  LOAD_START: 'CATEGORIES/LOAD_START',
  LOAD_SUCCESS: 'CATEGORIES/LOAD_SUCCESS',
  LOAD_ERROR: 'CATEGORIES/LOAD_ERROR',

  SET_SEARCH_QUERY: 'CATEGORIES/SET_SEARCH_QUERY',
  SET_SELECTED_TAG: 'CATEGORIES/SET_SELECTED_TAG',
};

export const CategoriesIntent = {
  setSearchQuery: (query) => ({
    type: CategoriesIntentType.SET_SEARCH_QUERY,
    payload: query,
  }),

  setSelectedTag: (tag) => ({
    type: CategoriesIntentType.SET_SELECTED_TAG,
    payload: tag,
  }),
};
