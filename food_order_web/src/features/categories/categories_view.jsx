import { Link } from 'react-router-dom';
import { useTranslation } from '../../core';
import { getCategoryDetailRoute } from '../../routes/app_routes';
import { getCategoryHeroImage, getCategoryIcon } from './category_constants';
import { useCategoriesStore } from './categories_store';
import { CategoriesIntent } from './categories_intent';

export function CategoriesView() {
  const { t } = useTranslation();

  const { state, onIntent, filteredCategories, getItemCount } = useCategoriesStore();
  const { loading, searchQuery, selectedTag } = state;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <span>✨</span>
            <span>{t('categories.allCategories')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-md">
            {t('categories.title')}
          </h1>

          <p className="text-xs sm:text-base text-orange-50 font-medium leading-relaxed">
            {t('categories.subtitle')}
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Search & Tag Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onIntent(CategoriesIntent.setSearchQuery(e.target.value))}
            placeholder={t('categories.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onIntent(CategoriesIntent.setSearchQuery(''))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Discovery Filter Tags */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: t('categories.tagAll') },
            { id: 'trending', label: t('categories.tagTrending') },
            { id: 'quick', label: t('categories.tagQuick') },
            { id: 'budget', label: t('categories.tagBudget') },
            { id: 'top_rated', label: t('categories.tagTopRated') },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => onIntent(CategoriesIntent.setSelectedTag(tag.id))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Category Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse border border-slate-200/80 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((cat) => {
            const count = getItemCount(cat);
            const icon = getCategoryIcon(cat.name, cat.icon);
            const heroImage = getCategoryHeroImage(cat);
            const route = getCategoryDetailRoute(cat.id || cat.name);

            return (
              <Link
                key={cat.id || cat.name}
                to={route}
                className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:shadow-orange-500/20 border border-slate-200/80 dark:border-slate-800 bg-slate-900 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] p-5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Background Image */}
                <img
                  src={heroImage}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800';
                  }}
                />

                {/* Ambient Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />

                {/* Content */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs border border-white/20">
                      {icon}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      {t('categories.dishesCount', { count })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-orange-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-200/90 line-clamp-2 mt-0.5 leading-relaxed">
                      {cat.description || 'Explore authentic handcrafted flavors.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-orange-300 group-hover:text-orange-200">
                    <span>{t('categories.exploreDishes')}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 max-w-lg mx-auto p-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-100 dark:orange-950/50 flex items-center justify-center text-3xl">
            🍽️
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t('categories.emptyTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('categories.emptySubtitle')}
            </p>
          </div>
          <button
            onClick={() => {
              onIntent(CategoriesIntent.setSearchQuery(''));
              onIntent(CategoriesIntent.setSelectedTag('all'));
            }}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all"
          >
            {t('common.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
