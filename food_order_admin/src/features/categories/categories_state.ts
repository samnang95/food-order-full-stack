import type { CategoryEntity } from '../../domain/foods/entities/food_entity';

export interface CategoriesState {
  categories: CategoryEntity[];
  isAddModalOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

export const initialCategoriesState: CategoriesState = {
  categories: [],
  isAddModalOpen: false,
  isLoading: false,
  errorMessage: null,
};
