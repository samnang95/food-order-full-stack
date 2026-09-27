import { DriverTipEntity } from '../../../domain/driver_tip/entities/driver_tip_entity';

export class DriverTipModel {
  static fromJson(raw = {}) {
    return new DriverTipEntity({
      id: raw.id || `tip_${Date.now()}`,
      orderId: raw.orderId || '',
      driverId: raw.driverId || 'driver_001',
      amountUsd: Number(raw.amountUsd) || 0,
      amountKhr: Number(raw.amountKhr) || 0,
      paymentMethod: raw.paymentMethod || 'checkout_add_on',
      compliments: Array.isArray(raw.compliments) ? raw.compliments : [],
      note: raw.note || '',
      status: raw.status || 'completed',
      khqrPayload: raw.khqrPayload || null,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      id: entity.id,
      orderId: entity.orderId,
      driverId: entity.driverId,
      amountUsd: entity.amountUsd,
      amountKhr: entity.amountKhr,
      paymentMethod: entity.paymentMethod,
      compliments: entity.compliments,
      note: entity.note,
      status: entity.status,
      khqrPayload: entity.khqrPayload,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
