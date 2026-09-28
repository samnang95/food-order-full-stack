import { DeliveryTrackingRepository } from '../../../domain/delivery_tracking';
import { TrackingLocalDataSource } from '../datasources/tracking_local_datasource';
import { TrackingRemoteDataSource } from '../datasources/tracking_remote_datasource';

export class TrackingRepositoryImpl extends DeliveryTrackingRepository {
  constructor({ remoteDataSource, localDataSource } = {}) {
    super();
    this.remoteDataSource = remoteDataSource || new TrackingRemoteDataSource();
    this.localDataSource = localDataSource || new TrackingLocalDataSource();
  }

  async getTrackingByOrderId(orderId) {
    try {
      const tracking = await this.remoteDataSource.getTrackingByOrderId(orderId);
      if (tracking) return tracking;
    } catch (err) {
      console.debug('[TrackingRepo] Backend unavailable, using local session:', err.message);
    }
    return this.localDataSource.getOrCreateSession(orderId);
  }

  async getActiveDeliveries() {
    return this.localDataSource.getActiveDeliveries();
  }

  async updateDriverLocation(orderId, location) {
    try {
      const updated = await this.remoteDataSource.updateDriverLocation(orderId, location);
      if (updated) return updated;
    } catch (err) {
      console.debug('[TrackingRepo] Backend update failed, using local update:', err.message);
    }
    return this.localDataSource.updateDriverLocation(orderId, location);
  }

  async updateTrackingStatus(orderId, newStatus) {
    try {
      const updated = await this.remoteDataSource.updateStatus(orderId, newStatus);
      if (updated) return updated;
    } catch (err) {
      console.debug('[TrackingRepo] Backend status update failed, using local update:', err.message);
    }
    return this.localDataSource.updateStatus(orderId, newStatus);
  }
}
