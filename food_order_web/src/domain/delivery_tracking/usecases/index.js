/**
 * Delivery Tracking Use Cases (Domain Layer)
 */

export class GetTrackingByOrderIdUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    return this.repository.getTrackingByOrderId(orderId);
  }
}

export class GetActiveDeliveriesUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    return this.repository.getActiveDeliveries();
  }
}

export class UpdateDriverLocationUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(orderId, location) {
    if (!orderId) throw new Error('Order ID is required');
    if (!location?.lat || !location?.lng) throw new Error('Valid location is required');
    return this.repository.updateDriverLocation(orderId, location);
  }
}

export class UpdateTrackingStatusUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(orderId, newStatus) {
    if (!orderId) throw new Error('Order ID is required');
    if (!newStatus) throw new Error('Status is required');
    return this.repository.updateTrackingStatus(orderId, newStatus);
  }
}
