import { useState } from 'react';
import PropTypes from 'prop-types';
import { RatingStars } from './RatingStars';
import { useReviews } from '../use_reviews';
import { useAuth } from '../../auth/use_auth';
import { useTranslation } from '../../../core';

const COMPLIMENT_TAGS = [
  'Piping Hot',
  'Fast Delivery',
  'Authentic Flavor',
  'Neat Packaging',
  'Friendly Rider',
  'Generous Portion',
];

const RATING_EMOTIONS = {
  5: 'Fantastic! 🤩',
  4: 'Great! 😊',
  3: 'Good 😐',
  2: 'Could be better 🙁',
  1: 'Poor 😞',
};

export function OrderRatingModal({ isOpen, onClose, order, onRatingSubmitted }) {
  if (!isOpen || !order) return null;

  return (
    <OrderRatingModalDialog
      onClose={onClose}
      order={order}
      onRatingSubmitted={onRatingSubmitted}
    />
  );
}

function OrderRatingModalDialog({ onClose, order, onRatingSubmitted }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submitReview, getReviewForOrder } = useReviews();

  const existingReview = getReviewForOrder(order._id || order.id);

  const [overallRating, setOverallRating] = useState(existingReview?.overallRating || 5);
  const [foodRating, setFoodRating] = useState(existingReview?.foodRating || 5);
  const [deliveryRating, setDeliveryRating] = useState(existingReview?.deliveryRating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [selectedTags, setSelectedTags] = useState(existingReview?.tags || ['Authentic Flavor', 'Fast Delivery']);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderId = order._id || order.id;
      const orderNum = order.orderNumber || (orderId ? orderId.toString().slice(-6).toUpperCase() : 'BC-ORDER');
      const firstFood = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;

      const reviewPayload = {
        orderId,
        orderNumber: orderNum,
        foodId: firstFood?.foodId || firstFood?.id || '',
        foodName: firstFood?.foodName || 'Artisan Meal',
        customerName: user?.username || 'BiteCraft Foodie',
        customerAvatar: user?.profileImageUrl || '',
        overallRating,
        foodRating,
        deliveryRating,
        comment: comment.trim(),
        tags: selectedTags,
        createdAt: new Date().toISOString(),
      };

      const saved = await submitReview(reviewPayload);
      setSuccess(true);

      setTimeout(() => {
        onRatingSubmitted?.(saved);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to submit order review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const orderNum = order.orderNumber || ((order._id || order.id || '').toString().slice(-6).toUpperCase());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/25">
              ⭐
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {t('reviews.rateOrderTitle') || 'Rate Your Order'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold">
                  #{orderNum}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('reviews.rateOrderSubtitle') || 'Share your feedback on the food and delivery rider'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {success ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
                🎉
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {t('reviews.thankYouTitle') || 'Thank You For Your Review!'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {t('reviews.thankYouSubtitle') || 'Your feedback helps BiteCraft chefs and riders deliver the best experience in Phnom Penh.'}
              </p>
            </div>
          ) : (
            <>
              {/* Overall Experience */}
              <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Overall Experience
                </span>
                <RatingStars
                  value={overallRating}
                  onChange={setOverallRating}
                  size="lg"
                />
                <div className="text-xs font-black text-orange-600 dark:text-orange-400">
                  {RATING_EMOTIONS[overallRating]}
                </div>
              </div>

              {/* Sub-aspect ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Food Rating */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🍲</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Food Taste
                      </span>
                      <span className="text-[10px] text-slate-400">Flavor & Heat</span>
                    </div>
                  </div>
                  <RatingStars
                    value={foodRating}
                    onChange={setFoodRating}
                    size="sm"
                  />
                </div>

                {/* Delivery Rating */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🛵</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Rider Service
                      </span>
                      <span className="text-[10px] text-slate-400">Speed & Courtesy</span>
                    </div>
                  </div>
                  <RatingStars
                    value={deliveryRating}
                    onChange={setDeliveryRating}
                    size="sm"
                  />
                </div>
              </div>

              {/* Compliment Tags */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  What did you like most?
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPLIMENT_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs scale-102'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Written Comment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Detailed Review (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the flavor, freshness, packaging, or rider..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <span>⭐</span>
                  <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

OrderRatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onRatingSubmitted: PropTypes.func,
};

OrderRatingModalDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object.isRequired,
  onRatingSubmitted: PropTypes.func,
};
