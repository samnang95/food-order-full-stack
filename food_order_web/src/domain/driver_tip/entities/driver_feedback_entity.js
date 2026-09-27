export class DriverFeedbackEntity {
  constructor({
    id = `fb_${Date.now()}`,
    orderId = '',
    driverId = 'driver_001',
    rating = 5,
    compliments = [],
    reviewText = '',
    tipAmount = 0,
    createdAt = new Date(),
  } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.driverId = driverId;
    this.rating = Math.min(5, Math.max(1, Number(rating) || 5));
    this.compliments = Array.isArray(compliments) ? compliments : [];
    this.reviewText = reviewText || '';
    this.tipAmount = Number(tipAmount) || 0;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }
}
