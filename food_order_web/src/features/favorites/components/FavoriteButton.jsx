import { useState } from 'react';
import PropTypes from 'prop-types';
import { useFavorites } from '../use_favorites';
import { useTranslation } from '../../../core';

export function FavoriteButton({ food, size = 'sm', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useTranslation();
  const [animating, setAnimating] = useState(false);

  if (!food || !food.id) return null;

  const fav = isFavorite(food.id);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setAnimating(true);
    toggleFavorite(food);
    setTimeout(() => setAnimating(false), 400);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-base',
    lg: 'w-11 h-11 text-lg',
  }[size] || 'w-8 h-8 text-sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={fav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
      title={fav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
      className={`rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 active:scale-90 shadow-md ${sizeClasses} ${
        fav
          ? 'bg-rose-500 text-white shadow-rose-500/30'
          : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60'
      } ${animating ? 'scale-125' : 'scale-100'} ${className}`}
    >
      <svg
        className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} transition-transform duration-300 ${
          animating ? 'animate-bounce' : ''
        }`}
        fill={fav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={fav ? '0' : '2'}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

FavoriteButton.propTypes = {
  food: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    price: PropTypes.number,
    imageUrl: PropTypes.string,
  }).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};
