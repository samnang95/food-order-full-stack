import type { FoodEntity, CategoryEntity } from '../entities/food_entity';

export interface FoodRepository {
  getFoods(): Promise<FoodEntity[]>;
  getCategories(): Promise<CategoryEntity[]>;
  saveFood(food: Partial<FoodEntity>): Promise<FoodEntity>;
  deleteFood(id: string): Promise<boolean>;
  toggleAvailability(id: string): Promise<FoodEntity>;
  saveCategory(category: Partial<CategoryEntity>): Promise<CategoryEntity>;
}
