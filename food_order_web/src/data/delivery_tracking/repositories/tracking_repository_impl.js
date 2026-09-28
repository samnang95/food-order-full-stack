import { DeliveryTrackingRepository } from '../../../domain/delivery_tracking';
import { TrackingLocalDataSource } from '../datasources/tracking_local_datasource';

/**
 * DeliveryTracking Repository Implementation (Data Layer)
 */
export class TrackingRepositoryImpl extends DeliveryTrackingRepository {
  constructor({ localDataSource } = {}) {
    super();
    this.localDataSource = localDataSource || new TrackingLocalDataSource();
  }

  async getTrackingByOrderId(orderId) {
    return this.localDataSource.getOrCreateSession(orderId);
  }

  async getActiveDeliveries() {
    return this.localDataSource.getActiveDeliveries();
  }

  async updateDriverLocation(orderId, location) {
    return this.localDataSource.updateDriverLocation(orderId, location);
  }

  async updateTrackingStatus(orderId, newStatus) {
    return this.localDataSource.updateStatus(orderId, newStatus);
  }
}
