import { LocalDB, DBKeys } from '../../../core';
import { ReviewModel } from '../models/review_model';

const SEED_REVIEWS = [
  {
    id: 'rev_seed_1',
    orderId: 'ord_sample_1',
    orderNumber: 'BC-9842',
    customerName: 'Sophea Chan',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    overallRating: 5,
    foodRating: 5,
    deliveryRating: 5,
    comment: 'The Kampot pepper sauce on the Beef Lok Lak was absolutely phenomenal! Delivered in 20 minutes piping hot to BKK1.',
    tags: ['Piping Hot', 'Fast Delivery', 'Authentic Flavor'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'rev_seed_2',
    orderId: 'ord_sample_2',
    orderNumber: 'BC-7721',
    customerName: 'Dara Rath',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    overallRating: 5,
    foodRating: 5,
    deliveryRating: 5,
    comment: 'Best Fish Amok and Khmer Red Curry in Phnom Penh. Super fragrant kroeung lemongrass paste and creamy coconut milk.',
    tags: ['Authentic Flavor', 'Neat Packaging', 'Highly Recommended'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'rev_seed_3',
    orderId: 'ord_sample_3',
    orderNumber: 'BC-6504',
    customerName: 'Kimheng Vong',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    overallRating: 4,
    foodRating: 5,
    deliveryRating: 4,
    comment: 'Fresh spring rolls were crisp and vibrant with a savory peanut dip. The delivery rider called politely when arriving downstairs.',
    tags: ['Fresh Ingredients', 'Friendly Rider'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
  },
];

export class ReviewLocalDataSource {
  constructor() {
    this._initializeSeedData();
  }

  _initializeSeedData() {
    const existing = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, null);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      LocalDB.setJSON(DBKeys.ORDER_REVIEWS, SEED_REVIEWS);
    }
  }

  async getReviews() {
    const raw = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, SEED_REVIEWS);
    return raw.map((item) => ReviewModel.fromJson(item));
  }

  async getReviewByOrderId(orderId) {
    const reviews = await this.getReviews();
    return reviews.find((r) => r.orderId === orderId) || null;
  }

  async getReviewsByFoodId(foodId) {
    const reviews = await this.getReviews();
    if (!foodId) return reviews;
    return reviews.filter((r) => r.foodId === foodId || !r.foodId);
  }

  async saveReview(reviewEntity) {
    const raw = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, SEED_REVIEWS);
    const serialized = ReviewModel.toJson(reviewEntity);

    // Update if exists, or prepend
    const existingIndex = raw.findIndex((r) => r.orderId === reviewEntity.orderId);
    let updated;
    if (existingIndex >= 0) {
      updated = [...raw];
      updated[existingIndex] = serialized;
    } else {
      updated = [serialized, ...raw];
    }

    LocalDB.setJSON(DBKeys.ORDER_REVIEWS, updated);
    return ReviewModel.fromJson(serialized);
  }
}
