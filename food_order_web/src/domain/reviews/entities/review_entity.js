export class ReviewEntity {
  constructor({
    id = '',
    orderId = '',
    orderNumber = '',
    foodId = '',
    foodName = '',
    customerName = 'Anonymous Foodie',
    customerAvatar = '',
    overallRating = 5,
    foodRating = 5,
    deliveryRating = 5,
    comment = '',
    tags = [],
    createdAt = new Date().toISOString(),
  } = {}) {
    this.id = id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.orderId = orderId;
    this.orderNumber = orderNumber;
    this.foodId = foodId;
    this.foodName = foodName;
    this.customerName = customerName;
    this.customerAvatar = customerAvatar;
    this.overallRating = Math.min(5, Math.max(1, Number(overallRating) || 5));
    this.foodRating = Math.min(5, Math.max(1, Number(foodRating) || 5));
    this.deliveryRating = Math.min(5, Math.max(1, Number(deliveryRating) || 5));
    this.comment = comment.trim();
    this.tags = Array.isArray(tags) ? tags : [];
    this.createdAt = createdAt;
  }

  get isHighRating() {
    return this.overallRating >= 4;
  }

  get formattedDate() {
    try {
      return new Date(this.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  }
}
