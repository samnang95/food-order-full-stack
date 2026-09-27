import { ApiClient } from '../../../core';

export class DriverTipRemoteDataSource {
  constructor(apiClient = ApiClient) {
    this.api = apiClient;
  }

  async submitTip(tipData) {
    const res = await this.api.post('/driver-tips', tipData);
    return res?.tip || res;
  }

  async submitFeedback(feedbackData) {
    const res = await this.api.post('/driver-tips/feedback', feedbackData);
    return res?.feedback || res;
  }

  async getOrderTipStatus(orderId) {
    const res = await this.api.get(`/driver-tips/${orderId}`);
    return res;
  }

  async getDriverProfile(driverId = 'driver_001') {
    const res = await this.api.get(`/driver-tips/driver/${driverId}`);
    return res?.profile || res;
  }
}
