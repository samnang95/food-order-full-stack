import { useState } from 'react';
import PropTypes from 'prop-types';

export function RatingStars({
  value = 5,
  onChange,
  readOnly = false,
  size = 'md',
  showNumber = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const currentVal = hoverRating || value;

  return (
    <div className="inline-flex items-center space-x-1 select-none">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentVal;

        if (readOnly) {
          return (
            <span
              key={star}
              className={`${starSizes[size] || 'text-base'} ${
                isFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
              }`}
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`${starSizes[size] || 'text-xl'} transition-transform active:scale-125 focus:outline-hidden ${
              isFilled
                ? 'text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] scale-110'
                : 'text-slate-300 dark:text-slate-700 hover:text-amber-200'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        );
      })}

      {showNumber && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
}

RatingStars.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showNumber: PropTypes.bool,
};
