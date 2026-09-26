import { IFoodRepository } from '../../../domain/foods/repositories/food_repository';
import { FoodModel, CategoryModel } from '../models/food_model';
import { FoodRemoteDataSource } from '../datasources/food_remote_datasource';

export class FoodRepositoryImpl extends IFoodRepository {
  constructor(remoteDataSource = new FoodRemoteDataSource()) {
    super();
    this.remoteDataSource = remoteDataSource;
  }

  async getFoods(filter = {}) {
    const rawList = await this.remoteDataSource.fetchFoods(filter);
    return rawList.map((item) => FoodModel.fromJson(item));
  }

  async getFoodById(foodId) {
    const raw = await this.remoteDataSource.fetchFoodById(foodId);
    return FoodModel.fromJson(raw);
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
    const rawList = await this.remoteDataSource.fetchCategories();
    return rawList.map((item) => CategoryModel.fromJson(item));
  }
}
