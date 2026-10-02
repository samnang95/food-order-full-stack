import type {
  ReviewRepository,
  ReviewFilterParams,
} from '../../../domain/reviews/repositories/review_repository';
import type { Review, ReviewRatingStats } from '../../../domain/reviews/entities/review';
import { ReviewRemoteDataSource } from '../datasources/review_remote_datasource';
import { ReviewLocalDataSource } from '../datasources/review_local_datasource';
import { ReviewModel } from '../models/review_model';

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev_101',
    foodId: 'food_1',
    foodName: 'Prime Wagyu Cheeseburger',
    orderId: 'ord_1001',
    orderNumber: '#ORD-1001',
    customerName: 'Marcus Vance',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    overallRating: 5,
    tasteRating: 5,
    deliveryRating: 5,
    comment: 'The brioche bun was perfectly toasted and the truffle aioli is incredible. Arrived piping hot in under 20 minutes!',
    adminReply: {
      message: 'Thank you Marcus! Our kitchen griddles the Wagyu patty fresh to order. Delighted you loved the truffle aioli!',
      repliedAt: '2026-10-01T14:32:00Z',
      repliedBy: 'Elena Vance (Kitchen Director)',
    },
    tags: ['Crispy Bun', 'Hot & Fresh', 'Juicy Patty'],
    isFeatured: true,
    createdAt: '2026-10-01T14:00:00Z',
  },
  {
    id: 'rev_102',
    foodId: 'food_2',
    foodName: 'Crispy Truffle Parmesan Fries',
    orderId: 'ord_1002',
    orderNumber: '#ORD-1002',
    customerName: 'Sophia Jenkins',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    overallRating: 5,
    tasteRating: 5,
    deliveryRating: 4,
    comment: 'Best fries in the city. Generous shaved parmesan and the aroma is mouth-watering. 10/10 recommendation!',
    tags: ['Crispy', 'Generous Portion'],
    isFeatured: true,
    createdAt: '2026-10-01T15:20:00Z',
  },
  {
    id: 'rev_103',
    foodId: 'food_3',
    foodName: 'Artisan Pepperoni Sourdough Pizza',
    orderId: 'ord_1003',
    orderNumber: '#ORD-1003',
    customerName: 'Liam Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    overallRating: 4,
    tasteRating: 5,
    deliveryRating: 3,
    comment: 'Pizza was phenomenal with genuine cup-and-char pepperoni. Courier was slightly delayed by 10 mins during the rain rush.',
    adminReply: {
      message: 'Hi Liam, apologies for the courier delay during the weather rush! We have credited 50 loyalty points to your account for next time.',
      repliedAt: '2026-10-01T18:15:00Z',
      repliedBy: 'Store Management',
    },
    tags: ['Sourdough Crust', 'Great Flavor'],
    isFeatured: false,
    createdAt: '2026-10-01T17:45:00Z',
  },
  {
    id: 'rev_104',
    foodId: 'food_4',
    foodName: 'Japanese Uji Matcha Latte',
    orderId: 'ord_1004',
    orderNumber: '#ORD-1004',
    customerName: 'Aaliyah Patel',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    overallRating: 5,
    tasteRating: 5,
    deliveryRating: 5,
    comment: 'Authentic ceremonial grade matcha! Not overwhelmingly sweet, oat milk foam was silky smooth.',
    tags: ['Organic', 'Smooth Foam'],
    isFeatured: true,
    createdAt: '2026-10-02T08:10:00Z',
  },
  {
    id: 'rev_105',
    foodId: 'food_1',
    foodName: 'Spicy Buffalo Chicken Wings',
    orderId: 'ord_1005',
    orderNumber: '#ORD-1005',
    customerName: 'David K.',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    overallRating: 3,
    tasteRating: 3,
    deliveryRating: 4,
    comment: 'Good crunch, but a little too spicy for standard medium wings. Blue cheese dip was nice though.',
    tags: ['Extra Spicy'],
    isFeatured: false,
    createdAt: '2026-10-02T09:30:00Z',
  },
];

export class ReviewRepositoryImpl implements ReviewRepository {
  constructor(
    private readonly remoteDataSource = new ReviewRemoteDataSource(),
    private readonly localDataSource = new ReviewLocalDataSource()
  ) {}

  async getReviews(params?: ReviewFilterParams): Promise<Review[]> {
    let localReviews = this.localDataSource.getReviews();

    try {
      const remoteDtos = await this.remoteDataSource.getReviews(params);
      if (remoteDtos.length > 0) {
        const remoteReviews = remoteDtos.map(dto => ReviewModel.fromApi(dto));

        const map = new Map<string, Review>();
        remoteReviews.forEach(r => map.set(r.id, r));
        localReviews.forEach(r => map.set(r.id, r));

        const merged = Array.from(map.values());
        this.localDataSource.saveReviews(merged);
        localReviews = merged;
      }
    } catch (err) {
      console.warn('[ReviewRepository] Could not fetch remote reviews, using cached/seed:', err);
    }

    if (localReviews.length === 0) {
      localReviews = [...SEED_REVIEWS];
      this.localDataSource.saveReviews(localReviews);
    }

    // Apply filtering
    let result = localReviews;

    if (params?.rating && params.rating > 0) {
      result = result.filter(r => r.overallRating === params.rating);
    }

    if (params?.foodId) {
      result = result.filter(r => r.foodId === params.foodId);
    }

    if (params?.search?.trim()) {
      const q = params.search.toLowerCase();
      result = result.filter(
        r =>
          r.customerName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.foodName && r.foodName.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getReviewById(id: string): Promise<Review | null> {
    const list = await this.getReviews();
    return list.find(r => r.id === id) || null;
  }

  async replyToReview(reviewId: string, message: string, adminName: string): Promise<Review> {
    const existing = await this.getReviewById(reviewId);
    if (!existing) {
      throw new Error(`Review with ID ${reviewId} not found`);
    }

    const updated: Review = {
      ...existing,
      adminReply: {
        message,
        repliedAt: new Date().toISOString(),
        repliedBy: adminName || 'Kitchen Operations Team',
      },
    };

    this.localDataSource.updateReview(updated);
    return updated;
  }

  async toggleFeatureReview(reviewId: string): Promise<Review> {
    const existing = await this.getReviewById(reviewId);
    if (!existing) {
      throw new Error(`Review with ID ${reviewId} not found`);
    }

    const updated: Review = {
      ...existing,
      isFeatured: !existing.isFeatured,
    };

    this.localDataSource.updateReview(updated);
    return updated;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    this.localDataSource.deleteReview(reviewId);
    return true;
  }

  async getRatingStats(): Promise<ReviewRatingStats> {
    const reviews = await this.getReviews();
    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 100,
      };
    }

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    let positiveCount = 0;

    reviews.forEach(r => {
      const score = Math.max(1, Math.min(5, Math.round(r.overallRating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[score] = (breakdown[score] || 0) + 1;
      sum += r.overallRating;
      if (r.overallRating >= 4) positiveCount += 1;
    });

    return {
      averageRating: Math.round((sum / total) * 10) / 10,
      totalReviews: total,
      breakdown,
      recommendationRate: Math.round((positiveCount / total) * 100),
    };
  }
}
