export const MenuIntentType = {
  LOAD_MENU: 'MENU/LOAD_MENU',
  LOAD_START: 'MENU/LOAD_START',
  LOAD_SUCCESS: 'MENU/LOAD_SUCCESS',
  LOAD_ERROR: 'MENU/LOAD_ERROR',

  SET_CATEGORY: 'MENU/SET_CATEGORY',
  SET_SEARCH: 'MENU/SET_SEARCH',
  SET_SORT_BY: 'MENU/SET_SORT_BY',

  SELECT_FOOD: 'MENU/SELECT_FOOD',
  CLEAR_SELECTED_FOOD: 'MENU/CLEAR_SELECTED_FOOD',
};

export const MenuIntent = {
  loadMenu: () => ({
    type: MenuIntentType.LOAD_MENU,
  }),

  setCategory: (categoryName) => ({
    type: MenuIntentType.SET_CATEGORY,
    payload: categoryName,
  }),

  setSearch: (query) => ({
    type: MenuIntentType.SET_SEARCH,
    payload: query,
  }),

  setSortBy: (sortBy) => ({
    type: MenuIntentType.SET_SORT_BY,
    payload: sortBy,
  }),

  selectFood: (food) => ({
    type: MenuIntentType.SELECT_FOOD,
    payload: food,
  }),

  clearSelectedFood: () => ({
    type: MenuIntentType.CLEAR_SELECTED_FOOD,
  }),
};
