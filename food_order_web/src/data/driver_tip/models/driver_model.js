import { DriverEntity } from '../../../domain/driver_tip/entities/driver_entity';

export class DriverModel {
  static fromJson(raw = {}) {
    return new DriverEntity({
      id: raw.id || raw._id || 'driver_001',
      name: raw.name || 'Sok Dara',
      phone: raw.phone || '012 889 922',
      avatar:
        raw.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      vehicle: raw.vehicle || 'Honda Wave 125i',
      plateNumber: raw.plateNumber || 'Phnom Penh 1AC-9281',
      rating: Number(raw.rating) || 4.96,
      totalDeliveries: Number(raw.totalDeliveries) || 482,
      badgeCounts: raw.badgeCounts || {
        super_fast: 148,
        careful_handling: 196,
        friendly_smile: 212,
        followed_notes: 95,
        weather_hero: 64,
      },
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      id: entity.id,
      name: entity.name,
      phone: entity.phone,
      avatar: entity.avatar,
      vehicle: entity.vehicle,
      plateNumber: entity.plateNumber,
      rating: entity.rating,
      totalDeliveries: entity.totalDeliveries,
      badgeCounts: entity.badgeCounts,
    };
  }
}
