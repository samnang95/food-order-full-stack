import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAssets, useTranslation } from '../../core';
import { AppRoutes, getCategoryDetailRoute, getSearchRoute } from '../../routes/app_routes';
import { FoodCard } from '../menu/components/FoodCard';
import { FoodDetailModal } from '../menu/components/FoodDetailModal';
import { getCategoryHeroImage, getCategoryIcon } from '../categories';
import { useHomeStore } from './home_store';
import { HomeIntent } from './home_intent';

export function HomeView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const categoryScrollRef = useRef(null);

  const { state, onIntent, filteredFoods } = useHomeStore();
  const { foods, categories, selectedCategory, loading, searchQuery, selectedFood } = state;

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(getSearchRoute(searchQuery.trim()));
    } else {
      navigate(AppRoutes.SEARCH);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-14 pb-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white p-5 sm:p-12 lg:p-16 shadow-xl shadow-orange-500/20">
        {/* Ambient decorative elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            {/* Promo Tag */}
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-white/20 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-100 border border-white/25">
              <span>🏷️ Promo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
              <span>{t('home.promoBadge')}</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {t('home.heroTitle')}
            </h1>

            <p className="text-xs sm:text-base text-orange-50/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('home.heroSubtitle')}
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto lg:mx-0 flex items-center bg-white p-1.5 sm:p-2 rounded-2xl shadow-xl shadow-orange-950/20 text-slate-800">
              <span className="pl-2.5 sm:pl-3 text-slate-400 text-sm sm:text-lg shrink-0">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onIntent(HomeIntent.setSearchQuery(e.target.value))}
                placeholder={t('home.searchPlaceholder')}
                className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm transition-colors shadow-md shrink-0"
              >
                {t('common.search')}
              </button>
            </form>

            {/* Trust Badges */}
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold text-orange-100">
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>⚡</span>
                <span>{t('home.avgDeliveryTime')}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>⭐</span>
                <span>{t('home.ratingBadge')}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>🇰🇭</span>
                <span>{t('home.paymentBadge')}</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Graphic */}
          <div className="lg:col-span-5 relative flex justify-center mt-2 lg:mt-0">
            <div className="relative w-52 h-52 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300 to-orange-400 blur-xl opacity-50 animate-pulse" />
              <img
                src={AppAssets.images.hero}
                alt="Delicious Food"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Carousel & Selector */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {t('home.exploreMenu')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('home.curatedCategories')}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(AppRoutes.CATEGORIES)}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center space-x-1 transition-colors"
            >
              <span>{t('home.seeAll')}</span>
              <span>→</span>
            </button>
            <div className="hidden sm:flex items-center space-x-1 pl-1">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-base font-bold"
                aria-label="Scroll categories left"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-base font-bold"
                aria-label="Scroll categories right"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Visual Category Showcase Cards Carousel with Edge-to-Edge Scroll */}
        {categories.length > 0 && (
          <div
            ref={categoryScrollRef}
            className="grid grid-flow-col auto-cols-[160px] sm:auto-cols-[200px] gap-3 sm:gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none overscroll-x-contain -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8"
          >
            {categories.map((cat) => {
              const icon = getCategoryIcon(cat.name, cat.icon);
              const heroImg = getCategoryHeroImage(cat);
              const detailRoute = getCategoryDetailRoute(cat.id || cat.name);
              const count = foods.filter(
                (f) =>
                  f.categoryId === cat.id ||
                  f.categoryName?.toLowerCase() === cat.name?.toLowerCase()
              ).length;

              return (
                <div
                  key={cat._id || cat.id || cat.name}
                  onClick={() => navigate(detailRoute)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-orange-500/15 border border-slate-200/80 dark:border-slate-800 bg-slate-900 h-28 sm:h-36 p-3 sm:p-4 flex flex-col justify-end cursor-pointer transition-all hover:-translate-y-1 shrink-0"
                >
                  <img
                    src={heroImg}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="relative z-10">
                    <span className="text-xl sm:text-2xl drop-shadow-md">{icon}</span>
                    <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-orange-300 transition-colors mt-0.5 sm:mt-1">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-medium">
                      {count} {t('common.items')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1 -mx-3.5 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 lg:px-8 scroll-smooth scrollbar-none overscroll-x-contain">
          <button
            onClick={() => onIntent(HomeIntent.setSelectedCategory('ALL'))}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500'
            }`}
          >
            <span>✨</span>
            <span>{t('home.all')} ({foods.length})</span>
          </button>

          {categories.map((cat) => {
            const icon = getCategoryIcon(cat.name, cat.icon);
            return (
              <button
                key={cat._id || cat.id || cat.name}
                onClick={() => onIntent(HomeIntent.setSelectedCategory(cat.name))}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}

          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => {
                const targetCat = categories.find((c) => c.name === selectedCategory);
                navigate(getCategoryDetailRoute(targetCat?.id || selectedCategory));
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs font-bold whitespace-nowrap hover:bg-orange-200 transition-all shrink-0 flex items-center space-x-1"
            >
              <span>{t('categories.exploreDishes')}</span>
              <span>→</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Featured Dishes Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {t('home.freshlyPrepared')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedCategory === 'ALL' ? t('home.popularAndRecommended') : `${selectedCategory}`}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {filteredFoods.length} {t('common.items')}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4 animate-pulse"
              >
                <div className="h-32 sm:h-44 bg-slate-200 dark:bg-slate-800 rounded-xl sm:rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-12" />
                  <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-800 rounded-lg sm:rounded-xl w-14 sm:w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-3">
            <span className="text-3xl sm:text-4xl">🍽️</span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('home.noDishesFound')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('home.noDishesSubtitle')}
            </p>
            <button
              onClick={() => {
                onIntent(HomeIntent.setSelectedCategory('ALL'));
                onIntent(HomeIntent.setSearchQuery(''));
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
            >
              {t('home.viewAllDishes')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={(selected) => onIntent(HomeIntent.selectFood(selected))}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Value Propositions / Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🛵
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('home.featureFastTitle')}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              {t('home.featureFastDesc')}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🌱
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('home.featureFreshTitle')}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              {t('home.featureFreshDesc')}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            📱
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t('home.featurePaymentTitle')}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              {t('home.featurePaymentDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          onClose={() => onIntent(HomeIntent.clearSelectedFood())}
        />
      )}
    </div>
  );
}
