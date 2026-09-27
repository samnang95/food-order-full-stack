import { ApiClient } from '../../../core';

export class GroupOrderRemoteDataSource {
  constructor(apiClient = ApiClient) {
    this.api = apiClient;
  }

  async createGroupOrder(payload) {
    const res = await this.api.post('/group-orders', payload);
    return res?.groupOrder || res;
  }

  async getGroupOrder(groupId) {
    const res = await this.api.get(`/group-orders/${groupId}`);
    return res?.groupOrder || res;
  }

  async joinGroupOrder(groupId, member) {
    const res = await this.api.post(`/group-orders/${groupId}/join`, member);
    return res?.groupOrder || res;
  }

  async leaveGroupOrder(groupId, memberId) {
    const res = await this.api.post(`/group-orders/${groupId}/leave`, { memberId });
    return res?.groupOrder || res;
  }

  async addItem(groupId, item) {
    const res = await this.api.post(`/group-orders/${groupId}/items`, item);
    return res?.groupOrder || res;
  }

  async removeItem(groupId, itemId) {
    const res = await this.api.delete(`/group-orders/${groupId}/items/${itemId}`);
    return res?.groupOrder || res;
  }

  async lockGroupOrder(groupId, isLocked) {
    const res = await this.api.put(`/group-orders/${groupId}/lock`, { isLocked });
    return res?.groupOrder || res;
  }
}
