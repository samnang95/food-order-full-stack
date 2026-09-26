import { ApiClient } from '../../../core';

export class OrderRemoteDataSource {
  constructor(apiClient = ApiClient) {
    this.api = apiClient;
  }

  async fetchOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/orders?${query}` : '/orders';
    const response = await this.api.get(endpoint);

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.orders)) return response.orders;
    return [];
  }

  async fetchMyOrders() {
    const response = await this.api.get('/orders');
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.orders)) return response.orders;
    return [];
  }

  async fetchOrderById(orderId) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response?.order || response?.data || response;
  }

  async createOrder(orderData) {
    const response = await this.api.post('/orders', orderData);
    return response?.order || response?.data || response;
  }

  async updateOrderStatus(orderId, status, paymentStatus) {
    const payload = { status };
    if (paymentStatus) payload.paymentStatus = paymentStatus;

    const response = await this.api.put(`/orders/${orderId}/status`, payload);
    return response?.order || response?.data || response;
  }

  async cancelOrder(orderId, reason = '') {
    const response = await this.api.put(`/orders/${orderId}/status`, {
      status: 'cancelled',
      notes: reason,
    });
    return response?.order || response?.data || response;
  }
}

