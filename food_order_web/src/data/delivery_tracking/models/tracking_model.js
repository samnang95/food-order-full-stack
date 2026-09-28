import { DeliveryTrackingEntity, TrackingTimelineEvent } from '../../../domain/delivery_tracking';

export class TrackingModel {
  static fromJson(json) {
    if (!json) return null;
    const raw = json.tracking || json;
    const driver = raw.driver || {};
    const driverLoc = raw.driverLocation || {};
    const restLoc = raw.restaurantLocation || {};
    const delivLoc = raw.deliveryLocation || {};

    const timeline = Array.isArray(raw.timeline)
      ? raw.timeline.map(
          (e) =>
            new TrackingTimelineEvent({
              key: e.key || (e.title || '').toLowerCase().replace(/\s+/g, '_'),
              label: e.label || e.title,
              icon: e.icon || '📍',
              time: e.time,
              timestamp: e.timestamp ? new Date(e.timestamp) : null,
              isCompleted: e.isCompleted != null ? !!e.isCompleted : !!e.completed,
              isCurrent: e.isCurrent != null ? !!e.isCurrent : !!e.current,
            })
        )
      : [];

    return new DeliveryTrackingEntity({
      orderId: raw.orderId || raw.order_id || raw._id,
      status: (raw.status || 'pending').toLowerCase(),
      driverName: raw.driverName || driver.name || null,
      driverPhone: raw.driverPhone || driver.phone || null,
      driverAvatar: raw.driverAvatar || driver.avatar || null,
      driverRating:
        raw.driverRating != null
          ? Number(raw.driverRating)
          : driver.rating != null
          ? Number(driver.rating)
          : null,
      vehiclePlate: raw.vehiclePlate || driver.vehiclePlate || null,
      vehicleType: raw.vehicleType || driver.vehicleType || null,
      driverLat:
        raw.driverLat != null
          ? Number(raw.driverLat)
          : driverLoc.lat != null
          ? Number(driverLoc.lat)
          : null,
      driverLng:
        raw.driverLng != null
          ? Number(raw.driverLng)
          : driverLoc.lng != null
          ? Number(driverLoc.lng)
          : null,
      restaurantLat:
        raw.restaurantLat != null
          ? Number(raw.restaurantLat)
          : restLoc.lat != null
          ? Number(restLoc.lat)
          : null,
      restaurantLng:
        raw.restaurantLng != null
          ? Number(raw.restaurantLng)
          : restLoc.lng != null
          ? Number(restLoc.lng)
          : null,
      deliveryLat:
        raw.deliveryLat != null
          ? Number(raw.deliveryLat)
          : delivLoc.lat != null
          ? Number(delivLoc.lat)
          : null,
      deliveryLng:
        raw.deliveryLng != null
          ? Number(raw.deliveryLng)
          : delivLoc.lng != null
          ? Number(delivLoc.lng)
          : null,
      estimatedMinutes: raw.estimatedMinutes != null ? Number(raw.estimatedMinutes) : null,
      distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : null,
      timeline,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
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
      timeline: entity.timeline.map((e) => ({
        key: e.key,
        label: e.label,
        icon: e.icon,
        timestamp: e.timestamp?.toISOString() || null,
        isCompleted: e.isCompleted,
        isCurrent: e.isCurrent,
      })),
    };
  }
}
