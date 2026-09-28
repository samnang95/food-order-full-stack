import { ApiClient } from '../../../core/services/api_client';
import { TrackingModel } from '../models/tracking_model';

export class TrackingRemoteDataSource {

  async getTrackingByOrderId(orderId) {
    const response = await ApiClient.get(`/tracking/${orderId}`);
    return TrackingModel.fromJson(response);
  }

  async updateDriverLocation(orderId, location) {
    const response = await ApiClient.put(`/tracking/${orderId}/location`, { location });
    return TrackingModel.fromJson(response);
  }

  async updateStatus(orderId, newStatus) {
    const response = await ApiClient.put(`/tracking/${orderId}/status`, { status: newStatus });
    return TrackingModel.fromJson(response);
  }
}
