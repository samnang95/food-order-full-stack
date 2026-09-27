import PropTypes from 'prop-types';
import { RatingStars } from './RatingStars';

export function ReviewCard({ review }) {
  if (!review) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:shadow-md">
      {/* Header with Avatar & Rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {review.customerAvatar ? (
              <img
                src={review.customerAvatar}
                alt={review.customerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{review.customerName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {review.customerName}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                ✓ Verified
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {review.formattedDate}
            </span>
          </div>
        </div>

        <RatingStars value={review.overallRating} readOnly size="sm" />
      </div>

      {/* Aspects (Food & Delivery pills) */}
      {(review.foodRating || review.deliveryRating) && (
        <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          {review.foodRating && (
            <span className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">
              🍲 Food: {review.foodRating}/5
            </span>
          )}
          {review.deliveryRating && (
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              🛵 Delivery: {review.deliveryRating}/5
            </span>
          )}
        </div>
      )}

      {/* Review Comment */}
      {review.comment && (
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Tags */}
      {Array.isArray(review.tags) && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.string,
    customerName: PropTypes.string,
    customerAvatar: PropTypes.string,
    overallRating: PropTypes.number,
    foodRating: PropTypes.number,
    deliveryRating: PropTypes.number,
    comment: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    formattedDate: PropTypes.string,
  }),
};
