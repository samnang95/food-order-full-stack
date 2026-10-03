import type { FoodEntity, CategoryEntity } from '../../../domain/foods/entities/food_entity';
import type { FoodRepository } from '../../../domain/foods/repositories/food_repository';
import { FoodModel, CategoryModel, type FoodModelData, type CategoryModelData } from '../models/food_model';
import { mockFoodsData, mockCategoriesData } from '../datasources/foods_mock_data';
import { indexedDBService, DB_STORES } from '../../../core/db';
import { apiClient } from '../../../core/services/api_client';

export function mapApiFoodToModel(raw: any): FoodModelData {
  const rawId = (raw._id || raw.id || '').toString();
  return {
    id: rawId,
    name: raw.name || 'Dish',
    description: raw.description || '',
    price: Number(raw.price) || 0,
    category: (raw.category && typeof raw.category === 'object' ? raw.category.name : raw.category) || 'Burgers & Sandwiches',
    image: raw.imageUrl || raw.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: raw.isAvailable ?? true,
    rating: Number(raw.rating) || 4.8,
    reviewCount: Number(raw.reviewCount) || 12,
    prepTimeMinutes: Number(raw.prepTimeMinutes) || 15,
    calories: Number(raw.calories) || 450,
    tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : ['Popular'],
  };
}

export function mapApiCategoryToModel(raw: any): CategoryModelData {
  const rawId = (raw._id || raw.id || '').toString();
  const name = raw.name || 'Category';
  return {
    id: rawId,
    name,
    slug: raw.slug || name.toLowerCase().replace(/\s+/g, '-'),
    icon: raw.icon || 'Utensils',
    itemCount: Number(raw.itemCount) || 0,
    isActive: raw.isActive ?? true,
  };
}

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

    try {
      const res = await apiClient.get('/foods');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const fetched = res.data.map(mapApiFoodToModel);
        // Merge fetched dishes
        const foodMap = new Map<string, FoodModelData>();
        this.localFoods.forEach(f => foodMap.set(f.id, f));
        fetched.forEach(f => foodMap.set(f.id, f));
        this.localFoods = Array.from(foodMap.values());
        await indexedDBService.putAll(DB_STORES.FOODS, this.localFoods);
      }
    } catch (err) {
      console.warn('⚠️ [FoodRepository] Failed to fetch foods from API, using cached:', err);
    }

    return this.localFoods.map((f) => FoodModel.toEntity(f));
  }

  async getCategories(): Promise<CategoryEntity[]> {
    await this.ensureInitialized();

    try {
      const res = await apiClient.get('/categories');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const fetched = res.data.map(mapApiCategoryToModel);
        const catMap = new Map<string, CategoryModelData>();
        this.localCategories.forEach(c => catMap.set(c.id, c));
        fetched.forEach(c => catMap.set(c.id, c));
        this.localCategories = Array.from(catMap.values());
        await indexedDBService.putAll(DB_STORES.CATEGORIES, this.localCategories);
      }
    } catch (err) {
      console.warn('⚠️ [FoodRepository] Failed to fetch categories from API, using cached:', err);
    }

    return this.localCategories.map((c) => CategoryModel.toEntity(c));
  }

  async saveFood(food: Partial<FoodEntity>): Promise<FoodEntity> {
    await this.ensureInitialized();

    let savedItem: FoodModelData;

    if (food.id) {
      const idx = this.localFoods.findIndex((f) => f.id === food.id);
      if (idx !== -1) {
        this.localFoods[idx] = {
          ...this.localFoods[idx],
          ...food,
        } as FoodModelData;
        savedItem = this.localFoods[idx];
      } else {
        savedItem = {
          id: food.id,
          name: food.name || 'New Item',
          description: food.description || '',
          price: Number(food.price) || 0,
          category: food.category || 'Burgers & Sandwiches',
          image: food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          isAvailable: food.isAvailable ?? true,
          rating: food.rating || 5.0,
          reviewCount: food.reviewCount || 0,
          prepTimeMinutes: Number(food.prepTimeMinutes) || 15,
          calories: Number(food.calories) || 500,
          tags: food.tags || ['New'],
        };
        this.localFoods.unshift(savedItem);
      }
    } else {
      savedItem = {
        id: `food-${Date.now()}`,
        name: food.name || 'New Item',
        description: food.description || '',
        price: Number(food.price) || 0,
        category: food.category || 'Burgers & Sandwiches',
        image: food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: food.isAvailable ?? true,
        rating: food.rating || 5.0,
        reviewCount: food.reviewCount || 0,
        prepTimeMinutes: Number(food.prepTimeMinutes) || 15,
        calories: Number(food.calories) || 500,
        tags: food.tags || ['New'],
      };
      this.localFoods.unshift(savedItem);
    }

    await indexedDBService.put(DB_STORES.FOODS, savedItem);

    // Sync with API
    try {
      const payload = {
        name: savedItem.name,
        description: savedItem.description,
        price: savedItem.price,
        imageUrl: savedItem.image,
        category: savedItem.category,
        isAvailable: savedItem.isAvailable,
      };

      if (food.id && food.id.length === 24) {
        await apiClient.put(`/foods/${food.id}`, payload);
      } else {
        const res = await apiClient.post('/foods', payload);
        if (res.data?.food?._id) {
          savedItem.id = res.data.food._id;
          await indexedDBService.put(DB_STORES.FOODS, savedItem);
        }
      }
    } catch (err) {
      console.warn('⚠️ [FoodRepository] Could not sync food with remote API:', err);
    }

    return FoodModel.toEntity(savedItem);
  }

  async deleteFood(id: string): Promise<boolean> {
    await this.ensureInitialized();
    this.localFoods = this.localFoods.filter((f) => f.id !== id);
    await indexedDBService.delete(DB_STORES.FOODS, id);

    try {
      if (id.length === 24) {
        await apiClient.delete(`/foods/${id}`);
      }
    } catch (err) {
      console.warn(`⚠️ [FoodRepository] Failed to delete food ${id} on API:`, err);
    }

    return true;
  }

  async toggleAvailability(id: string): Promise<FoodEntity> {
    await this.ensureInitialized();
    const item = this.localFoods.find((f) => f.id === id);
    if (!item) {
      throw new Error(`Food item with ID ${id} not found`);
    }
    item.isAvailable = !item.isAvailable;
    await indexedDBService.put(DB_STORES.FOODS, item);

    try {
      if (id.length === 24) {
        await apiClient.put(`/foods/${id}`, { isAvailable: item.isAvailable });
      }
    } catch (err) {
      console.warn(`⚠️ [FoodRepository] Could not sync availability for ${id}:`, err);
    }

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

    try {
      await apiClient.post('/categories', {
        name: newCat.name,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      });
    } catch (_) {}

    return CategoryModel.toEntity(newCat);
  }
}
