export interface AdminReply {
  message: string;
  repliedAt: string;
  repliedBy: string;
}

export interface Review {
  id: string;
  foodId?: string;
  foodName?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName: string;
  customerAvatar?: string;
  overallRating: number;
  tasteRating?: number;
  deliveryRating?: number;
  comment: string;
  adminReply?: AdminReply;
  tags?: string[];
  isFeatured?: boolean;
  createdAt: string;
}

export interface ReviewRatingStats {
  averageRating: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommendationRate: number; // percentage (e.g. 96%)
}
