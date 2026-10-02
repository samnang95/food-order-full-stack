import type { Review } from '../../../domain/reviews/entities/review';

export interface ApiReviewDto {
  _id?: string;
  id?: string;
  foodId?: string;
  foodName?: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  customerName?: string;
  customerAvatar?: string;
  overallRating: number;
  tasteRating?: number;
  deliveryRating?: number;
  comment: string;
  adminReply?: {
    message: string;
    repliedAt: string;
    repliedBy: string;
  };
  tags?: string[];
  isFeatured?: boolean;
  createdAt?: string;
}

export class ReviewModel {
  static fromApi(dto: ApiReviewDto): Review {
    return {
      id: dto._id || dto.id || `rev_${Date.now()}`,
      foodId: dto.foodId,
      foodName: dto.foodName || 'Chef Special Meal',
      orderId: dto.orderId,
      orderNumber: dto.orderNumber || (dto.orderId ? `#ORD-${dto.orderId.slice(-4).toUpperCase()}` : '#ORD-1088'),
      customerId: dto.userId,
      customerName: dto.customerName || 'Verified Diner',
      customerAvatar:
        dto.customerAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      overallRating: Number(dto.overallRating) || 5,
      tasteRating: dto.tasteRating ? Number(dto.tasteRating) : undefined,
      deliveryRating: dto.deliveryRating ? Number(dto.deliveryRating) : undefined,
      comment: dto.comment || 'Delicious food and speedy delivery!',
      adminReply: dto.adminReply,
      tags: dto.tags || ['Top Rated', 'Hot & Fresh'],
      isFeatured: Boolean(dto.isFeatured),
      createdAt: dto.createdAt || new Date().toISOString(),
    };
  }
}
