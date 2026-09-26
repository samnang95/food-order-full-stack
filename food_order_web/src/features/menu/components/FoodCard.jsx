import { useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../../cart/use_cart';
import { formatUsd, formatKhr } from '../../../core';

export function FoodCard({ food, onSelect }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addItem(food, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div
      onClick={() => onSelect(food)}
      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={food.imageUrl}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
          }}
        />

        {/* Category Pill */}
        {food.categoryName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/70 backdrop-blur-md text-white shadow-xs">
            {food.categoryName}
          </span>
        )}

        {/* Prep Time / Rating */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-xs">
          <span>⭐ 4.8</span>
          <span className="text-slate-400">•</span>
          <span>⏱️ 20m</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {food.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {food.description || 'Deliciously crafted with fresh local ingredients.'}
          </p>
        </div>

        {/* Footer: Price & Add Button */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatUsd(food.price)}
            </span>
            <span className="block text-[11px] text-slate-400 font-medium">
              {formatKhr(food.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95 ${
              isAdding
                ? 'bg-emerald-500 text-white scale-105'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
            }`}
          >
            {isAdding ? (
              <span>✓ Added</span>
            ) : (
              <>
                <span className="text-sm leading-none">+</span>
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

FoodCard.propTypes = {
  food: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};
