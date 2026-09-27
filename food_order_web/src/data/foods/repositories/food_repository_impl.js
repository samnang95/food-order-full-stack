import { IFoodRepository } from '../../../domain/foods/repositories/food_repository';
import { FoodModel, CategoryModel } from '../models/food_model';
import { FoodRemoteDataSource } from '../datasources/food_remote_datasource';
import { LocalDB, DBKeys } from '../../../core/db';

export class FoodRepositoryImpl extends IFoodRepository {
  constructor(
    remoteDataSource = new FoodRemoteDataSource(),
    localDb = LocalDB
  ) {
    super();
    this.remoteDataSource = remoteDataSource;
    this.localDb = localDb;
  }

  async getFoods(filter = {}) {
    try {
      const rawList = await this.remoteDataSource.fetchFoods(filter);
      if (Array.isArray(rawList) && rawList.length > 0 && !Object.keys(filter).length) {
        this.localDb.setJSON(DBKeys.CACHED_FOODS, rawList);
      }
      return rawList.map((item) => FoodModel.fromJson(item));
    } catch (error) {
      const cached = this.localDb.getJSON(DBKeys.CACHED_FOODS, []);
      if (cached.length > 0) {
        return cached.map((item) => FoodModel.fromJson(item));
      }
      throw error;
    }
  }

  async getFoodById(foodId) {
    try {
      const raw = await this.remoteDataSource.fetchFoodById(foodId);
      if (raw && (raw._id || raw.id)) {
        return FoodModel.fromJson(raw);
      }
    } catch {
      // Fallback to local cached foods
      const cached = this.localDb.getJSON(DBKeys.CACHED_FOODS, []);
      const matched = cached.find((f) => (f.id || f._id) === foodId);
      if (matched) return FoodModel.fromJson(matched);
    }
    throw new Error(`Food item #${foodId} not found.`);
  }

  async createFood(foodData) {
    const raw = await this.remoteDataSource.createFood(foodData);
    return FoodModel.fromJson(raw);
  }

  async updateFood(foodId, foodData) {
    const raw = await this.remoteDataSource.updateFood(foodId, foodData);
    return FoodModel.fromJson(raw);
  }

  async deleteFood(foodId) {
    return this.remoteDataSource.deleteFood(foodId);
  }

  async getCategories() {
    try {
      const rawList = await this.remoteDataSource.fetchCategories();
      if (Array.isArray(rawList) && rawList.length > 0) {
        this.localDb.setJSON(DBKeys.CACHED_CATEGORIES, rawList);
      }
      return rawList.map((item) => CategoryModel.fromJson(item));
    } catch (error) {
      const cached = this.localDb.getJSON(DBKeys.CACHED_CATEGORIES, []);
      if (cached.length > 0) {
        return cached.map((item) => CategoryModel.fromJson(item));
      }
      throw error;
    }
  }

  async getCategoryById(categoryId) {
    try {
      const raw = await this.remoteDataSource.fetchCategoryById(categoryId);
      if (raw && (raw._id || raw.id || raw.name)) {
        return CategoryModel.fromJson(raw);
      }
    } catch {
      // If fetching by ID failed (e.g. categoryId is actually a name), try searching in all categories
    }

    const allCategories = await this.getCategories();
    const matched = allCategories.find(
      (cat) =>
        cat.id === categoryId ||
        cat.name.toLowerCase() === decodeURIComponent(categoryId).toLowerCase()
    );
    if (matched) return matched;

    // Fallback stub entity if not found
    return CategoryModel.fromJson({
      id: categoryId,
      name: decodeURIComponent(categoryId),
      description: 'Explore delicious dishes prepared with fresh ingredients',
    });
  }

  async getFoodsByCategory(categoryId) {
    try {
      const rawList = await this.remoteDataSource.fetchFoodsByCategory(categoryId);
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((item) => FoodModel.fromJson(item));
      }
    } catch {
      // Fallback to fetching all foods and filtering
    }

    const allFoods = await this.getFoods();
    const decoded = decodeURIComponent(categoryId).toLowerCase();
    return allFoods.filter((f) => {
      const matchId = f.categoryId && f.categoryId === categoryId;
      const matchName = f.categoryName && f.categoryName.toLowerCase() === decoded;
      return matchId || matchName;
    });
  }
}
