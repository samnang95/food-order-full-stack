import { useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../../cart/use_cart';
import { formatUsd, formatKhr } from '../../../core';
import { FavoriteButton } from '../../favorites';

export function FoodDetailModal({ food, onClose }) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);

  if (!food) return null;

  const handleAddToCart = () => {
    addItem(food, quantity, notes);
    setAdded(true);
    setTimeout(() => {
      onClose();
      openCart();
    }, 600);
  };

  const totalPrice = (Number(food.price) || 0) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[92vh] flex flex-col"
        role="dialog"
      >
        {/* Actions (Favorite & Close) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center space-x-2">
          <FavoriteButton food={food} size="sm" />
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center transition-colors text-xs sm:text-sm"
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        {/* Hero Food Photo */}
        <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-white">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-orange-500/90 backdrop-blur-md shadow-sm">
              {food.categoryName || 'Chef Choice'}
            </span>
            <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
              <span>⭐</span>
              <span>4.9 (120+ reviews)</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {food.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                {food.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg sm:text-2xl font-black text-orange-600 dark:text-orange-400">
                {formatUsd(food.price)}
              </span>
              <span className="block text-[10px] sm:text-xs text-slate-400 font-medium">
                {formatKhr(food.price)}
              </span>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra spicy, sauce on the side, no onions"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
            />
          </div>

          {/* Stepper & Add to Cart button */}
          <div className="pt-2 flex items-center space-x-2.5 sm:space-x-4 pb-2 sm:pb-0">
            {/* Quantity Stepper */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-xs sm:text-sm shadow-xs"
              >
                -
              </button>
              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-xs sm:text-sm shadow-xs"
              >
                +
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:opacity-95 active:scale-98'
              }`}
            >
              {added ? (
                <>
                  <span>✓</span>
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <span>Add to Cart</span>
                  <span>•</span>
                  <span>{formatUsd(totalPrice)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}

FoodDetailModal.propTypes = {
  food: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
