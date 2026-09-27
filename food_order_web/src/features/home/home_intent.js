/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and home events.
 */
export const HomeIntentType = {
  LOAD_START: 'HOME/LOAD_START',
  LOAD_SUCCESS: 'HOME/LOAD_SUCCESS',
  LOAD_ERROR: 'HOME/LOAD_ERROR',

  SET_SELECTED_CATEGORY: 'HOME/SET_SELECTED_CATEGORY',
  SET_SEARCH_QUERY: 'HOME/SET_SEARCH_QUERY',

  SELECT_FOOD: 'HOME/SELECT_FOOD',
  CLEAR_SELECTED_FOOD: 'HOME/CLEAR_SELECTED_FOOD',
};

export const HomeIntent = {
  setSelectedCategory: (category) => ({
    type: HomeIntentType.SET_SELECTED_CATEGORY,
    payload: category,
  }),

  setSearchQuery: (query) => ({
    type: HomeIntentType.SET_SEARCH_QUERY,
    payload: query,
  }),

  selectFood: (food) => ({
    type: HomeIntentType.SELECT_FOOD,
    payload: food,
  }),

  clearSelectedFood: () => ({
    type: HomeIntentType.CLEAR_SELECTED_FOOD,
  }),
};
