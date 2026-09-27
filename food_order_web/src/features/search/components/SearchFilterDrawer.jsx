import PropTypes from 'prop-types';
import { useTranslation } from '../../../core';
import { getCategoryIcon } from '../../categories';

export function SearchFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onResetFilters,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t('search.filters')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {/* 1. Sort By */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('search.sortBy')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'recommended', label: t('search.sortRecommended') },
                  { id: 'rating', label: t('search.sortRating') },
                  { id: 'price_asc', label: t('search.sortPriceLow') },
                  { id: 'price_desc', label: t('search.sortPriceHigh') },
                  { id: 'alpha', label: t('search.sortName') },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      sortBy === opt.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Cuisines / Categories */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('search.allCategories')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ✨ {t('search.allCategories')}
                </button>
                {categories.map((cat) => {
                  const isSelected =
                    selectedCategory === cat.id ||
                    selectedCategory === cat.name;
                  const icon = getCategoryIcon(cat.name, cat.icon);

                  return (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => setSelectedCategory(cat.id || cat.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Price Range */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('search.priceRange')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: t('search.anyPrice') },
                  { id: 'under10', label: t('search.under10') },
                  { id: '10to15', label: t('search.range10to15') },
                  { id: 'above15', label: t('search.above15') },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setPriceRange(pill.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all ${
                      priceRange === pill.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between space-x-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={onResetFilters}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            >
              {t('search.clearFilters')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all text-center"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

SearchFilterDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
  priceRange: PropTypes.string.isRequired,
  setPriceRange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
