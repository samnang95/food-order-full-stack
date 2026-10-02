import type { FoodEntity, CategoryEntity } from '../../domain/foods/entities/food_entity';

/**
 * Intent (I) in MVI:
 * Plain actions representing user intents and catalog updates.
 */
export const MenuIntentType = {
  FETCH_MENU: 'MENU/FETCH_MENU',
  FETCH_START: 'MENU/FETCH_START',
  FETCH_SUCCESS: 'MENU/FETCH_SUCCESS',
  FETCH_ERROR: 'MENU/FETCH_ERROR',

  SET_CATEGORY: 'MENU/SET_CATEGORY',
  SET_SEARCH: 'MENU/SET_SEARCH',

  TOGGLE_AVAILABILITY: 'MENU/TOGGLE_AVAILABILITY',
  OPEN_ADD_MODAL: 'MENU/OPEN_ADD_MODAL',
  OPEN_EDIT_MODAL: 'MENU/OPEN_EDIT_MODAL',
  CLOSE_MODAL: 'MENU/CLOSE_MODAL',

  SAVE_FOOD: 'MENU/SAVE_FOOD',
  DELETE_FOOD: 'MENU/DELETE_FOOD',
  ADD_CATEGORY: 'MENU/ADD_CATEGORY',
} as const;

export type MenuIntent =
  | { type: typeof MenuIntentType.FETCH_MENU }
  | { type: typeof MenuIntentType.FETCH_START }
  | { type: typeof MenuIntentType.FETCH_SUCCESS; payload: { foods: FoodEntity[]; categories: CategoryEntity[] } }
  | { type: typeof MenuIntentType.FETCH_ERROR; payload: string }
  | { type: typeof MenuIntentType.SET_CATEGORY; payload: string }
  | { type: typeof MenuIntentType.SET_SEARCH; payload: string }
  | { type: typeof MenuIntentType.TOGGLE_AVAILABILITY; payload: { foodId: string } }
  | { type: typeof MenuIntentType.OPEN_ADD_MODAL }
  | { type: typeof MenuIntentType.OPEN_EDIT_MODAL; payload: FoodEntity }
  | { type: typeof MenuIntentType.CLOSE_MODAL }
  | { type: typeof MenuIntentType.SAVE_FOOD; payload: Partial<FoodEntity> }
  | { type: typeof MenuIntentType.DELETE_FOOD; payload: { foodId: string } }
  | { type: typeof MenuIntentType.ADD_CATEGORY; payload: Partial<CategoryEntity> };

export const MenuIntents = {
  fetchMenu: (): MenuIntent => ({
    type: MenuIntentType.FETCH_MENU,
  }),
  setCategory: (category: string): MenuIntent => ({
    type: MenuIntentType.SET_CATEGORY,
    payload: category,
  }),
  setSearch: (query: string): MenuIntent => ({
    type: MenuIntentType.SET_SEARCH,
    payload: query,
  }),
  toggleAvailability: (foodId: string): MenuIntent => ({
    type: MenuIntentType.TOGGLE_AVAILABILITY,
    payload: { foodId },
  }),
  openAddModal: (): MenuIntent => ({
    type: MenuIntentType.OPEN_ADD_MODAL,
  }),
  openEditModal: (food: FoodEntity): MenuIntent => ({
    type: MenuIntentType.OPEN_EDIT_MODAL,
    payload: food,
  }),
  closeModal: (): MenuIntent => ({
    type: MenuIntentType.CLOSE_MODAL,
  }),
  saveFood: (food: Partial<FoodEntity>): MenuIntent => ({
    type: MenuIntentType.SAVE_FOOD,
    payload: food,
  }),
  deleteFood: (foodId: string): MenuIntent => ({
    type: MenuIntentType.DELETE_FOOD,
    payload: { foodId },
  }),
  addCategory: (category: Partial<CategoryEntity>): MenuIntent => ({
    type: MenuIntentType.ADD_CATEGORY,
    payload: category,
  }),
};
