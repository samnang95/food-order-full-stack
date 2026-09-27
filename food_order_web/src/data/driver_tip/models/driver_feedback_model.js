import { DriverFeedbackEntity } from '../../../domain/driver_tip/entities/driver_feedback_entity';

export class DriverFeedbackModel {
  static fromJson(raw = {}) {
    return new DriverFeedbackEntity({
      id: raw.id || `fb_${Date.now()}`,
      orderId: raw.orderId || '',
      driverId: raw.driverId || 'driver_001',
      rating: Number(raw.rating) || 5,
      compliments: Array.isArray(raw.compliments) ? raw.compliments : [],
      reviewText: raw.reviewText || '',
      tipAmount: Number(raw.tipAmount) || 0,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    });
  }

  static toJson(entity) {
    if (!entity) return {};
    return {
      id: entity.id,
      orderId: entity.orderId,
      driverId: entity.driverId,
      rating: entity.rating,
      compliments: entity.compliments,
      reviewText: entity.reviewText,
      tipAmount: entity.tipAmount,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
