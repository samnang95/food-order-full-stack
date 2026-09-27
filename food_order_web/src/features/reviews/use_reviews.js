import { useState, useEffect, useCallback, useMemo } from 'react';
import { container } from '../../core/di/container';
import { LocalDB, DBKeys } from '../../core';
import { ReviewModel } from '../../data/reviews/models/review_model';

export function useReviews() {
  const [reviews, setReviews] = useState(() => {
    const raw = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, []);
    return Array.isArray(raw) ? raw.map((r) => ReviewModel.fromJson(r)) : [];
  });

  const refreshReviews = useCallback(async () => {
    try {
      const data = await container.getReviewRepository().getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to refresh reviews:', err);
    }
  }, []);

  // Listen for storage changes across tabs and local saves
  useEffect(() => {
    const unsub = LocalDB.addListener(DBKeys.ORDER_REVIEWS, (updated) => {
      if (Array.isArray(updated)) {
        setReviews(updated.map((r) => ReviewModel.fromJson(r)));
      }
    });

    return () => unsub?.();
  }, []);

  const submitReview = useCallback(
    async (reviewData) => {
      const saved = await container.submitReviewUseCase.execute(reviewData);
      const raw = LocalDB.getJSON(DBKeys.ORDER_REVIEWS, []);
      setReviews(raw.map((r) => ReviewModel.fromJson(r)));
      return saved;
    },
    []
  );

  const getReviewForOrder = useCallback(
    (orderId) => {
      if (!orderId) return null;
      return reviews.find((r) => r.orderId === orderId) || null;
    },
    [reviews]
  );

  const hasReviewedOrder = useCallback(
    (orderId) => {
      if (!orderId) return false;
      return reviews.some((r) => r.orderId === orderId);
    },
    [reviews]
  );

  const getReviewsForFood = useCallback(
    (foodId) => {
      if (!foodId) return reviews;
      return reviews.filter((r) => r.foodId === foodId || !r.foodId);
    },
    [reviews]
  );

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = reviews.reduce((acc, curr) => acc + curr.overallRating, 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.overallRating)));
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    return {
      average: avg,
      count: reviews.length,
      breakdown,
    };
  }, [reviews]);

  return {
    reviews,
    submitReview,
    getReviewForOrder,
    hasReviewedOrder,
    getReviewsForFood,
    stats,
    refreshReviews,
  };
}
