import { ApiClient } from '../../../core/services/api_client';

export class AccountRemoteDataSource {
  // ==========================================
  // Saved Addresses API
  // ==========================================

  async getAddresses() {
    const res = await ApiClient.get('/account/addresses');
    return Array.isArray(res?.addresses) ? res.addresses : [];
  }

  async saveAddress(addressData) {
    const res = await ApiClient.post('/account/addresses', addressData);
    return res?.address || null;
  }

  async updateAddress(id, fields) {
    const res = await ApiClient.put(`/account/addresses/${id}`, fields);
    return res?.address || null;
  }

  async deleteAddress(id) {
    const res = await ApiClient.delete(`/account/addresses/${id}`);
    return res;
  }

  async syncAddresses(addresses) {
    const res = await ApiClient.post('/account/addresses/sync', { addresses });
    return Array.isArray(res?.addresses) ? res.addresses : [];
  }

  // ==========================================
  // Favorites API
  // ==========================================

  async getFavorites() {
    const res = await ApiClient.get('/account/favorites');
    return {
      favoriteIds: Array.isArray(res?.favoriteIds) ? res.favoriteIds : [],
      favoriteFoods: Array.isArray(res?.favoriteFoods) ? res.favoriteFoods : [],
    };
  }

  async toggleFavorite(foodId) {
    const res = await ApiClient.post('/account/favorites/toggle', { foodId });
    return {
      favoriteIds: Array.isArray(res?.favoriteIds) ? res.favoriteIds : [],
      favoriteFoods: Array.isArray(res?.favoriteFoods) ? res.favoriteFoods : [],
      isFavorite: Boolean(res?.favoriteIds?.includes(String(foodId))),
    };
  }

  async syncFavorites(favoriteIds) {
    const res = await ApiClient.post('/account/favorites/sync', { favoriteIds });
    return {
      favoriteIds: Array.isArray(res?.favoriteIds) ? res.favoriteIds : [],
      favoriteFoods: Array.isArray(res?.favoriteFoods) ? res.favoriteFoods : [],
    };
  }

  async removeFavorite(foodId) {
    const res = await ApiClient.delete(`/account/favorites/${foodId}`);
    return {
      favoriteIds: Array.isArray(res?.favoriteIds) ? res.favoriteIds : [],
      favoriteFoods: Array.isArray(res?.favoriteFoods) ? res.favoriteFoods : [],
    };
  }

  async clearFavorites() {
    await ApiClient.delete('/account/favorites');
    return {
      favoriteIds: [],
      favoriteFoods: [],
    };
  }
}

export const accountRemoteDataSource = new AccountRemoteDataSource();
