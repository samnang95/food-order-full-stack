/**
 * DeliveryTracking Entity
 * Core domain representation of a live delivery tracking session.
 */
export class DeliveryTrackingEntity {
  constructor({
    orderId,
    status = 'pending',
    driverName = null,
    driverPhone = null,
    driverAvatar = null,
    driverRating = null,
    vehiclePlate = null,
    vehicleType = null,
    driverLat = null,
    driverLng = null,
    restaurantLat = null,
    restaurantLng = null,
    deliveryLat = null,
    deliveryLng = null,
    estimatedMinutes = null,
    distanceKm = null,
    timeline = [],
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.orderId = orderId;
    this.status = status;
    this.driverName = driverName;
    this.driverPhone = driverPhone;
    this.driverAvatar = driverAvatar;
    this.driverRating = driverRating;
    this.vehiclePlate = vehiclePlate;
    this.vehicleType = vehicleType;
    this.driverLat = driverLat;
    this.driverLng = driverLng;
    this.restaurantLat = restaurantLat;
    this.restaurantLng = restaurantLng;
    this.deliveryLat = deliveryLat;
    this.deliveryLng = deliveryLng;
    this.estimatedMinutes = estimatedMinutes;
    this.distanceKm = distanceKm;
    this.timeline = timeline;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get isLive() {
    return !['delivered', 'cancelled'].includes(this.status);
  }

  get isDelivered() {
    return this.status === 'delivered';
  }

  get hasDriver() {
    return !!this.driverName;
  }

  get hasLocation() {
    return this.driverLat !== null && this.driverLng !== null;
  }

  get formattedEta() {
    if (!this.estimatedMinutes) return null;
    if (this.estimatedMinutes <= 1) return 'Arriving now';
    return `${this.estimatedMinutes} min`;
  }

  get formattedDistance() {
    if (!this.distanceKm) return null;
    if (this.distanceKm < 1) return `${Math.round(this.distanceKm * 1000)}m`;
    return `${this.distanceKm.toFixed(1)}km`;
  }
}

/**
 * Timeline event within a tracking session
 */
export class TrackingTimelineEvent {
  constructor({ key, label, icon, timestamp = null, isCompleted = false, isCurrent = false }) {
    this.key = key;
    this.label = label;
    this.icon = icon;
    this.timestamp = timestamp;
    this.isCompleted = isCompleted;
    this.isCurrent = isCurrent;
  }
}
