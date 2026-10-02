import type { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';
import type { FoodRepository } from '../../../domain/foods/repositories/food_repository';
import { FoodModel, CategoryModel, type FoodModelData, type CategoryModelData } from '../models/food_model';
import { mockFoodsData, mockCategoriesData } from '../datasources/foods_mock_data';
import { indexedDBService, DB_STORES } from '../../../core/db';

export class FoodRepositoryImpl implements FoodRepository {
  private localFoods: FoodModelData[] = [];
  private localCategories: CategoryModelData[] = [];
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const [storedFoods, storedCats] = await Promise.all([
        indexedDBService.getAll<FoodModelData>(DB_STORES.FOODS),
        indexedDBService.getAll<CategoryModelData>(DB_STORES.CATEGORIES),
      ]);

      if (storedFoods && storedFoods.length > 0) {
        this.localFoods = storedFoods;
      } else {
        this.localFoods = [...mockFoodsData];
        await indexedDBService.putAll(DB_STORES.FOODS, this.localFoods);
      }

      if (storedCats && storedCats.length > 0) {
        this.localCategories = storedCats;
      } else {
        this.localCategories = [...mockCategoriesData];
        await indexedDBService.putAll(DB_STORES.CATEGORIES, this.localCategories);
      }
    } catch {
      this.localFoods = [...mockFoodsData];
      this.localCategories = [...mockCategoriesData];
    }

    this.isInitialized = true;
  }

  async getFoods(): Promise<FoodEntity[]> {
    await this.ensureInitialized();
    return this.localFoods.map((f) => FoodModel.toEntity(f));
  }

  async getCategories(): Promise<CategoryEntity[]> {
    await this.ensureInitialized();
    return this.localCategories.map((c) => CategoryModel.toEntity(c));
  }

  async saveFood(food: Partial<FoodEntity>): Promise<FoodEntity> {
    await this.ensureInitialized();

    if (food.id) {
      const idx = this.localFoods.findIndex((f) => f.id === food.id);
      if (idx !== -1) {
        this.localFoods[idx] = {
          ...this.localFoods[idx],
          ...food,
        } as FoodModelData;
        await indexedDBService.put(DB_STORES.FOODS, this.localFoods[idx]);
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
    await indexedDBService.put(DB_STORES.FOODS, newFoodData);

    return FoodModel.toEntity(newFoodData);
  }

  async deleteFood(id: string): Promise<boolean> {
    await this.ensureInitialized();
    this.localFoods = this.localFoods.filter((f) => f.id !== id);
    return await indexedDBService.delete(DB_STORES.FOODS, id);
  }

  async toggleAvailability(id: string): Promise<FoodEntity> {
    await this.ensureInitialized();
    const item = this.localFoods.find((f) => f.id === id);
    if (!item) {
      throw new Error(`Food item with ID ${id} not found`);
    }
    item.isAvailable = !item.isAvailable;
    await indexedDBService.put(DB_STORES.FOODS, item);

    return FoodModel.toEntity(item);
  }

  async saveCategory(category: Partial<CategoryEntity>): Promise<CategoryEntity> {
    await this.ensureInitialized();
    const newCat: CategoryModelData = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'new-category',
      icon: category.icon || 'Utensils',
      itemCount: category.itemCount || 0,
      isActive: category.isActive ?? true,
    };
    this.localCategories.push(newCat);
    await indexedDBService.put(DB_STORES.CATEGORIES, newCat);

    return CategoryModel.toEntity(newCat);
  }
}
