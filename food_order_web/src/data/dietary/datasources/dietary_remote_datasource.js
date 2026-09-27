import { ApiClient } from '../../../core';

export class DietaryRemoteDataSource {
  constructor(apiClient = ApiClient) {
    this.api = apiClient;
  }

  async getPreferences(userId) {
    const query = userId ? `?userId=${userId}` : '';
    const res = await this.api.get(`/dietary/preferences${query}`);
    return res?.preferences || res;
  }

  async savePreferences(preferences, userId) {
    const payload = { ...preferences };
    if (userId) payload.userId = userId;
    const res = await this.api.post('/dietary/preferences', payload);
    return res?.preferences || res;
  }
}
