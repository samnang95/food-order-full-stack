import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { container } from '../../core/di/container';
import { useTranslation } from '../../core';
import { AppRoutes, getCategoryDetailRoute } from '../../routes/app_routes';
import { FoodCard } from '../menu/components/FoodCard';
import { FoodDetailModal } from '../menu/components/FoodDetailModal';
import { getCategoryHeroImage, getCategoryIcon } from './category_constants';

export function CategoryDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [category, setCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'price_asc' | 'price_desc' | 'quick' | 'alpha'
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'under10' | '10to15' | 'above15'

  // Load category, dishes, and category list
  useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      if (!id) return;
      setLoading(true);
      try {
        const [catData, foodsData, allCats] = await Promise.all([
          container.getCategoryDetailUseCase.execute(id),
          container.getFoodsByCategoryUseCase.execute(id),
          container.getCategoriesUseCase.execute(),
        ]);

        if (isMounted) {
          setCategory(catData);
          setFoods(foodsData);
          setAllCategories(allCats);
        }
      } catch (err) {
        console.error('Failed to load category details:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Derived filtered & sorted foods
  const processedFoods = useMemo(() => {
    let result = [...foods];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // 2. Price Range Filter
    if (priceFilter === 'under10') {
      result = result.filter((f) => f.price < 10);
    } else if (priceFilter === '10to15') {
      result = result.filter((f) => f.price >= 10 && f.price <= 15);
    } else if (priceFilter === 'above15') {
      result = result.filter((f) => f.price > 15);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      return 0; // Default/Popular
    });

    return result;
  }, [foods, searchQuery, priceFilter, sortBy]);

  const categoryName = category?.name || decodeURIComponent(id || '');
  const categoryIcon = getCategoryIcon(categoryName, category?.icon);
  const heroImage = getCategoryHeroImage(category);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link to={AppRoutes.ROOT} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {t('categoryDetail.backToHome')}
          </Link>
          <span>/</span>
          <Link to={AppRoutes.CATEGORIES} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {t('categoryDetail.backToCategories')}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[150px] sm:max-w-none">
            {categoryName}
          </span>
        </nav>

        <button
          onClick={() => navigate(AppRoutes.CATEGORIES)}
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
        >
          <span>←</span>
          <span>{t('categoryDetail.backToCategories')}</span>
        </button>
      </div>

      {/* 2. Hero Category Showcase Banner */}
      <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white min-h-[220px] sm:min-h-[280px] flex items-end">
        {/* Cover Background Image */}
        <img
          src={heroImage}
          alt={categoryName}
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-100 hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600';
          }}
        />

        {/* Ambient Dark Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/25" />

        {/* Content Details */}
        <div className="relative z-10 p-5 sm:p-8 lg:p-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 sm:space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 text-xs sm:text-sm font-bold shadow-xs">
                <span className="text-base sm:text-lg">{categoryIcon}</span>
                <span>{categoryName}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md">
                {categoryName}
              </h1>

              <p className="text-xs sm:text-base text-slate-200/90 font-medium leading-relaxed drop-shadow-xs line-clamp-2 sm:line-clamp-none">
                {category?.description ||
                  'Explore our handcrafted culinary creations prepared fresh with premium ingredients.'}
              </p>
            </div>

            {/* Badges / Highlights */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs font-bold shrink-0">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-orange-500/90 text-white shadow-md shadow-orange-500/20 backdrop-blur-md">
                <span>🍽️</span>
                <span>{t('categoryDetail.dishesAvailable', { count: foods.length })}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/10">
                <span>⭐</span>
                <span>{t('categoryDetail.topRatedCuisine')}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/10">
                <span>⚡</span>
                <span>{t('categoryDetail.avgPrepTime')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Category Switcher Bar */}
      {allCategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{t('categoryDetail.otherCategories')}</span>
            <Link to={AppRoutes.CATEGORIES} className="text-orange-600 dark:text-orange-400 hover:underline">
              {t('categories.allCategories')} ({allCategories.length}) →
            </Link>
          </div>

          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 scroll-smooth scrollbar-none overscroll-x-contain">
            {allCategories.map((cat) => {
              const isCurrent =
                cat.id === category?.id ||
                cat.name.toLowerCase() === categoryName.toLowerCase();

              const icon = getCategoryIcon(cat.name, cat.icon);
              const targetRoute = getCategoryDetailRoute(cat.id || cat.name);

              return (
                <button
                  key={cat.id || cat.name}
                  onClick={() => navigate(targetRoute)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
                    isCurrent
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-102 ring-2 ring-orange-400/40'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('categoryDetail.searchPlaceholder', { name: categoryName })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <label htmlFor="cat-sort-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              {t('common.price')}:
            </label>
            <select
              id="cat-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="popular">{t('categoryDetail.sortPopular')}</option>
              <option value="rating">{t('categoryDetail.sortRating')}</option>
              <option value="price_asc">{t('categoryDetail.sortPriceLow')}</option>
              <option value="price_desc">{t('categoryDetail.sortPriceHigh')}</option>
              <option value="alpha">{t('categoryDetail.sortAlpha')}</option>
            </select>
          </div>
        </div>

        {/* Price Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Price:
          </span>
          {[
            { id: 'all', label: t('categoryDetail.filterAll') },
            { id: 'under10', label: t('categoryDetail.filterUnder10') },
            { id: '10to15', label: t('categoryDetail.filter10to15') },
            { id: 'above15', label: t('categoryDetail.filterAbove15') },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setPriceFilter(pill.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                priceFilter === pill.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}

          {(searchQuery || priceFilter !== 'all' || sortBy !== 'popular') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceFilter('all');
                setSortBy('popular');
              }}
              className="px-3 py-1 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-all shrink-0 ml-auto"
            >
              {t('categoryDetail.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* 5. Dishes Grid / Loading / Empty State */}
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
      ) : processedFoods.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {processedFoods.map((food) => (
            <FoodCard key={food.id} food={food} onSelect={setSelectedFood} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-lg mx-auto p-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-3xl">
            🍽️
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t('categoryDetail.noDishesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('categoryDetail.noDishesSubtitle', { name: categoryName })}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setPriceFilter('all');
              setSortBy('popular');
            }}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all"
          >
            {t('categoryDetail.clearFilters')}
          </button>
        </div>
      )}

      {/* 6. Food Detail Customization Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
}
