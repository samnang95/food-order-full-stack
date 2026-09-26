import { ApiClient } from '../../../core';

export class FoodRemoteDataSource {
  constructor(apiClient = ApiClient) {
    this.api = apiClient;
  }

  async fetchFoods(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/foods?${query}` : '/foods';
    const response = await this.api.get(endpoint);

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.foods)) return response.foods;
    return [];
  }

  async fetchFoodById(foodId) {
    const response = await this.api.get(`/foods/${foodId}`);
    return response?.data || response?.food || response;
  }

  async createFood(foodData) {
    const response = await this.api.post('/foods', foodData);
    return response?.food || response?.data || response;
  }

  async updateFood(foodId, foodData) {
    const response = await this.api.put(`/foods/${foodId}`, foodData);
    return response?.food || response?.data || response;
  }

  async deleteFood(foodId) {
    await this.api.delete(`/foods/${foodId}`);
    return true;
  }

  async fetchCategories() {
    const response = await this.api.get('/categories');
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.categories)) return response.categories;
    return [];
  }
}
