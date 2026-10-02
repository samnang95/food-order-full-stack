import type { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';
import type { FoodRepository } from '../../../domain/foods/repositories/food_repository';
import { FoodModel, CategoryModel, type FoodModelData, type CategoryModelData } from '../models/food_model';
import { mockFoodsData, mockCategoriesData } from '../datasources/foods_mock_data';

export class FoodRepositoryImpl implements FoodRepository {
  private localFoods: FoodModelData[] = [...mockFoodsData];
  private localCategories: CategoryModelData[] = [...mockCategoriesData];

  async getFoods(): Promise<FoodEntity[]> {
    return this.localFoods.map((f) => FoodModel.toEntity(f));
  }

  async getCategories(): Promise<CategoryEntity[]> {
    return this.localCategories.map((c) => CategoryModel.toEntity(c));
  }

  async saveFood(food: Partial<FoodEntity>): Promise<FoodEntity> {
    if (food.id) {
      const idx = this.localFoods.findIndex((f) => f.id === food.id);
      if (idx !== -1) {
        this.localFoods[idx] = {
          ...this.localFoods[idx],
          ...food,
        } as FoodModelData;
        return FoodModel.toEntity(this.localFoods[idx]);
      }
    }

    const newFoodData: FoodModelData = {
      id: food.id || `food-${Date.now()}`,
      name: food.name || 'New Item',
      description: food.description || '',
      price: Number(food.price) || 0,
      category: food.category || this.localCategories[0]?.name || 'Burgers & Sandwiches',
      image: food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: food.isAvailable ?? true,
      rating: food.rating || 5.0,
      reviewCount: food.reviewCount || 0,
      prepTimeMinutes: Number(food.prepTimeMinutes) || 15,
      calories: Number(food.calories) || 500,
      tags: food.tags || ['New'],
    };
    this.localFoods.unshift(newFoodData);
    return FoodModel.toEntity(newFoodData);
  }

  async deleteFood(id: string): Promise<boolean> {
    const prevLength = this.localFoods.length;
    this.localFoods = this.localFoods.filter((f) => f.id !== id);
    return this.localFoods.length < prevLength;
  }

  async toggleAvailability(id: string): Promise<FoodEntity> {
    const item = this.localFoods.find((f) => f.id === id);
    if (!item) {
      throw new Error(`Food item with ID ${id} not found`);
    }
    item.isAvailable = !item.isAvailable;
    return FoodModel.toEntity(item);
  }

  async saveCategory(category: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const newCat: CategoryModelData = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'new-category',
      icon: category.icon || 'Utensils',
      itemCount: category.itemCount || 0,
      isActive: category.isActive ?? true,
    };
    this.localCategories.push(newCat);
    return CategoryModel.toEntity(newCat);
  }
}
