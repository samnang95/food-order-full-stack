import { DeliveryTrackingEntity, TrackingTimelineEvent } from '../../../domain/delivery_tracking';

/**
 * DeliveryTracking Model (Data Layer)
 * Maps API/local data into the domain DeliveryTrackingEntity.
 */
export class TrackingModel {
  static fromJson(json) {
    const timeline = Array.isArray(json.timeline)
      ? json.timeline.map(
          (e) =>
            new TrackingTimelineEvent({
              key: e.key,
              label: e.label,
              icon: e.icon,
              timestamp: e.timestamp ? new Date(e.timestamp) : null,
              isCompleted: !!e.isCompleted,
              isCurrent: !!e.isCurrent,
            })
        )
      : [];

    return new DeliveryTrackingEntity({
      orderId: json.orderId || json.order_id || json._id,
      status: (json.status || 'pending').toLowerCase(),
      driverName: json.driverName || json.driver_name || null,
      driverPhone: json.driverPhone || json.driver_phone || null,
      driverAvatar: json.driverAvatar || json.driver_avatar || null,
      driverRating: json.driverRating != null ? Number(json.driverRating) : null,
      vehiclePlate: json.vehiclePlate || json.vehicle_plate || null,
      vehicleType: json.vehicleType || json.vehicle_type || null,
      driverLat: json.driverLat != null ? Number(json.driverLat) : null,
      driverLng: json.driverLng != null ? Number(json.driverLng) : null,
      restaurantLat: json.restaurantLat != null ? Number(json.restaurantLat) : null,
      restaurantLng: json.restaurantLng != null ? Number(json.restaurantLng) : null,
      deliveryLat: json.deliveryLat != null ? Number(json.deliveryLat) : null,
      deliveryLng: json.deliveryLng != null ? Number(json.deliveryLng) : null,
      estimatedMinutes: json.estimatedMinutes != null ? Number(json.estimatedMinutes) : null,
      distanceKm: json.distanceKm != null ? Number(json.distanceKm) : null,
      timeline,
      createdAt: json.createdAt ? new Date(json.createdAt) : null,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : null,
    });
  }

  static toJson(entity) {
    return {
      orderId: entity.orderId,
      status: entity.status,
      driverName: entity.driverName,
      driverPhone: entity.driverPhone,
      driverAvatar: entity.driverAvatar,
      driverRating: entity.driverRating,
      vehiclePlate: entity.vehiclePlate,
      vehicleType: entity.vehicleType,
      driverLat: entity.driverLat,
      driverLng: entity.driverLng,
      restaurantLat: entity.restaurantLat,
      restaurantLng: entity.restaurantLng,
      deliveryLat: entity.deliveryLat,
      deliveryLng: entity.deliveryLng,
      estimatedMinutes: entity.estimatedMinutes,
      distanceKm: entity.distanceKm,
      timeline: entity.timeline,
      createdAt: entity.createdAt?.toISOString() || null,
      updatedAt: entity.updatedAt?.toISOString() || null,
    };
  }
}
