import { ReviewEntity } from '../../../domain/reviews/entities/review_entity';

export class ReviewModel {
  static fromJson(json) {
    if (!json) return null;
    return new ReviewEntity({
      id: json.id || json._id,
      orderId: json.orderId,
      orderNumber: json.orderNumber,
      foodId: json.foodId,
      foodName: json.foodName,
      customerName: json.customerName || 'BiteCraft Foodie',
      customerAvatar: json.customerAvatar,
      overallRating: json.overallRating ?? json.rating ?? 5,
      foodRating: json.foodRating ?? 5,
      deliveryRating: json.deliveryRating ?? 5,
      comment: json.comment || '',
      tags: Array.isArray(json.tags) ? json.tags : [],
      createdAt: json.createdAt || new Date().toISOString(),
    });
  }

  static toJson(entity) {
    if (!entity) return null;
    return {
      id: entity.id,
      orderId: entity.orderId,
      orderNumber: entity.orderNumber,
      foodId: entity.foodId,
      foodName: entity.foodName,
      customerName: entity.customerName,
      customerAvatar: entity.customerAvatar,
      overallRating: entity.overallRating,
      foodRating: entity.foodRating,
      deliveryRating: entity.deliveryRating,
      comment: entity.comment,
      tags: entity.tags,
      createdAt: entity.createdAt,
    };
  }
}
