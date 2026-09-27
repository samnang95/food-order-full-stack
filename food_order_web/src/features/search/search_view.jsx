import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../core';
import { FoodCard } from '../menu/components/FoodCard';
import { FoodDetailModal } from '../menu/components/FoodDetailModal';
import { SearchFilterDrawer } from './components/SearchFilterDrawer';
import { POPULAR_SUGGESTIONS } from './search_state';
import { useSearchStore } from './search_store';
import { SearchIntent } from './search_intent';

export function SearchView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'ALL';

  const { state, onIntent, filteredFoods } = useSearchStore({
    query: initialQuery,
    selectedCategory: initialCat,
  });

  const {
    query,
    selectedCategory,
    priceRange,
    sortBy,
    categories,
    loading,
    selectedFood,
    filterDrawerOpen,
    recentSearches,
  } = state;

  // Sync state to URL params
  const updateUrlParams = useCallback(
    (newQuery, newCat) => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set('q', newQuery.trim());
      if (newCat && newCat !== 'ALL') params.set('category', newCat);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleQueryChange = (val) => {
    onIntent(SearchIntent.setQuery(val));
    updateUrlParams(val, selectedCategory);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onIntent(SearchIntent.saveSearchQuery(query));
      updateUrlParams(query, selectedCategory);
    }
  };

  const handleSelectRecent = (term) => {
    onIntent(SearchIntent.setQuery(term));
    onIntent(SearchIntent.saveSearchQuery(term));
    updateUrlParams(term, selectedCategory);
  };

  const handleClearRecent = () => {
    onIntent(SearchIntent.clearRecentSearches());
  };

  const handleResetFilters = () => {
    onIntent(SearchIntent.resetFilters());
    onIntent(SearchIntent.setQuery(''));
    setSearchParams({});
  };

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') count++;
    if (priceRange !== 'all') count++;
    if (sortBy !== 'recommended') count++;
    return count;
  }, [selectedCategory, priceRange, sortBy]);

  const hasSearchTerm = query.trim().length > 0;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. Header & Live Search Bar */}
      <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
            {t('search.title')}
          </h1>
          <p className="text-xs sm:text-sm text-orange-50 font-medium">
            {t('search.subtitle')}
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              🔍
            </span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t('search.inputPlaceholder')}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm placeholder-slate-400 shadow-md focus:outline-hidden focus:ring-2 focus:ring-amber-300 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => onIntent(SearchIntent.setFilterDrawer(true))}
            className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all shrink-0 shadow-xs"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">{t('search.filters')}</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-orange-600 text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* 2. Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <span className="text-slate-400 shrink-0 uppercase tracking-wider text-[10px]">
            {t('search.filters')}:
          </span>

          {selectedCategory !== 'ALL' && (
            <span className="px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center space-x-1 shrink-0">
              <span>{selectedCategory}</span>
              <button
                onClick={() => {
                  onIntent(SearchIntent.setCategory('ALL'));
                  updateUrlParams(query, 'ALL');
                }}
                className="hover:opacity-75"
              >
                ✕
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center space-x-1 shrink-0">
              <span>{priceRange}</span>
              <button onClick={() => onIntent(SearchIntent.setPriceRange('all'))} className="hover:opacity-75">
                ✕
              </button>
            </span>
          )}

          {sortBy !== 'recommended' && (
            <span className="px-3 py-1 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center space-x-1 shrink-0">
              <span>{sortBy}</span>
              <button onClick={() => onIntent(SearchIntent.setSortBy('recommended'))} className="hover:opacity-75">
                ✕
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-500 hover:underline shrink-0 ml-2"
          >
            {t('search.clearFilters')}
          </button>
        </div>
      )}

      {/* 3. Recent Searches History (when query is empty) */}
      {!hasSearchTerm && recentSearches.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>🕒</span>
              <span>{t('search.recentSearches')}</span>
            </div>
            <button
              onClick={handleClearRecent}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              {t('search.clearAll')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSelectRecent(term)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <span>🔍</span>
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Popular Trending Searches (when query is empty) */}
      {!hasSearchTerm && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>🔥</span>
            <span>{t('search.popularSearches')}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_SUGGESTIONS.map((item) => (
              <button
                key={item.tag}
                onClick={() => handleSelectRecent(item.tag)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-500 hover:text-white border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs hover:shadow-md hover:shadow-orange-500/20"
              >
                <span>{item.emoji}</span>
                <span>{item.tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Results Counter & Sort Selector */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <div>
          {hasSearchTerm
            ? t('search.resultsCount', { count: filteredFoods.length, query })
            : t('search.allResultsCount', { count: filteredFoods.length })}
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="search-sort-select" className="hidden sm:inline">
            {t('search.sortBy')}:
          </label>
          <select
            id="search-sort-select"
            value={sortBy}
            onChange={(e) => onIntent(SearchIntent.setSortBy(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-xs"
          >
            <option value="recommended">{t('search.sortRecommended')}</option>
            <option value="rating">{t('search.sortRating')}</option>
            <option value="price_asc">{t('search.sortPriceLow')}</option>
            <option value="price_desc">{t('search.sortPriceHigh')}</option>
            <option value="alpha">{t('search.sortName')}</option>
          </select>
        </div>
      </div>

      {/* 6. Dishes Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 animate-pulse"
            >
              <div className="h-32 sm:h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelect={(selected) => onIntent(SearchIntent.selectFood(selected))}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-lg mx-auto p-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 dark:orange-950/50 flex items-center justify-center text-3xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t('search.noResultsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('search.noResultsSubtitle', { query: query || 'filters' })}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all"
          >
            {t('search.clearFilters')}
          </button>
        </div>
      )}

      {/* 7. Slide-over Filter Drawer */}
      <SearchFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => onIntent(SearchIntent.setFilterDrawer(false))}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          onIntent(SearchIntent.setCategory(cat));
          updateUrlParams(query, cat);
        }}
        priceRange={priceRange}
        setPriceRange={(range) => onIntent(SearchIntent.setPriceRange(range))}
        sortBy={sortBy}
        setSortBy={(sort) => onIntent(SearchIntent.setSortBy(sort))}
        onResetFilters={handleResetFilters}
      />

      {/* 8. Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => onIntent(SearchIntent.clearSelectedFood())}
        />
      )}
    </div>
  );
}
