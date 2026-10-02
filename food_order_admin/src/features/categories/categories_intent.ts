import type { CategoryEntity } from '../../domain/foods/entities/food_entity';

export const CategoriesIntentType = {
  FETCH_CATEGORIES: 'CATEGORIES/FETCH_CATEGORIES',
  OPEN_ADD_MODAL: 'CATEGORIES/OPEN_ADD_MODAL',
  CLOSE_ADD_MODAL: 'CATEGORIES/CLOSE_ADD_MODAL',
  ADD_CATEGORY: 'CATEGORIES/ADD_CATEGORY',
} as const;

export type CategoriesIntent =
  | { type: typeof CategoriesIntentType.FETCH_CATEGORIES }
  | { type: typeof CategoriesIntentType.OPEN_ADD_MODAL }
  | { type: typeof CategoriesIntentType.CLOSE_ADD_MODAL }
  | { type: typeof CategoriesIntentType.ADD_CATEGORY; payload: Partial<CategoryEntity> };

export const CategoriesIntents = {
  fetchCategories: (): CategoriesIntent => ({
    type: CategoriesIntentType.FETCH_CATEGORIES,
  }),
  openAddModal: (): CategoriesIntent => ({
    type: CategoriesIntentType.OPEN_ADD_MODAL,
  }),
  closeAddModal: (): CategoriesIntent => ({
    type: CategoriesIntentType.CLOSE_ADD_MODAL,
  }),
  addCategory: (cat: Partial<CategoryEntity>): CategoriesIntent => ({
    type: CategoriesIntentType.ADD_CATEGORY,
    payload: cat,
  }),
};
