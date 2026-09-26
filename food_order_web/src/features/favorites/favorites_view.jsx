import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from './use_favorites';
import { useTranslation, formatUsd, formatKhr } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { useCart } from '../cart/use_cart';
import { FoodDetailModal } from '../menu/components/FoodDetailModal';
import { FavoriteButton } from './components/FavoriteButton';

export function FavoritesView() {
  const { t } = useTranslation();
  const { favoriteFoods, favoritesCount, clearFavorites, removeFavorite } = useFavorites();
  const { addItem, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return favoriteFoods;
    const query = searchQuery.toLowerCase().trim();
    return favoriteFoods.filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.categoryName?.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query)
    );
  }, [favoriteFoods, searchQuery]);

  const handleQuickAdd = (e, food) => {
    e.stopPropagation();
    setAddingId(food.id);
    addItem(food, 1);
    setTimeout(() => {
      setAddingId(null);
      openCart();
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500/10 via-orange-500/5 to-transparent p-5 sm:p-8 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl sm:text-3xl">❤️</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('favorites.favoritesTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              {favoritesCount} {t('common.items')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t('favorites.favoritesSubtitle')}
          </p>
        </div>

        {favoritesCount > 0 && (
          <button
            onClick={() => {
              if (window.confirm(t('favorites.confirmClear'))) {
                clearFavorites();
              }
            }}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-all self-start sm:self-auto border border-slate-200 dark:border-slate-700"
          >
            🗑️ {t('favorites.clearAll')}
          </button>
        )}
      </div>

      {/* Search Filter if has items */}
      {favoritesCount > 0 && (
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-2">
          <span className="text-slate-400 pl-2">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('favorites.searchFavorites')}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-2"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Main Content: Empty State or Grid */}
      {favoritesCount === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-rose-100/70 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
            ❤️
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t('favorites.emptyFavoritesTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t('favorites.emptyFavoritesSubtitle')}
            </p>
          </div>
          <Link
            to={AppRoutes.MENU}
            className="inline-block px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
          >
            {t('orders.startOrdering')}
          </Link>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <span className="text-3xl">🔍</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('home.noDishesFound')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('home.noDishesSubtitle')}
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
          >
            {t('common.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="group bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
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
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-slate-900/75 backdrop-blur-md text-white shadow-xs">
                    {food.categoryName}
                  </span>
                )}

                {/* Heart Button Overlay */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <FavoriteButton food={food} size="sm" />
                </div>

                {/* Rating */}
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center space-x-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-xs">
                  <span>⭐ 4.9</span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                    {food.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {food.description || 'Deliciously crafted with fresh local ingredients.'}
                  </p>
                </div>

                {/* Footer: Price & Add Button */}
                <div className="pt-2.5 sm:pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white truncate block">
                      {formatUsd(food.price)}
                    </span>
                    <span className="block text-[9px] sm:text-[11px] text-slate-400 font-medium truncate">
                      {formatKhr(food.price)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, food)}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95 ${
                        addingId === food.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
                      }`}
                    >
                      <span>🛍️</span>
                      <span className="hidden sm:inline">{t('menu.addToCart')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(food.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={t('favorites.removeFromFavorites')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}
