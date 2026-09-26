import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { container } from '../../core/di/container';
import { AppAssets } from '../../core';
import { AppRoutes } from '../../routes/app_routes';
import { FoodCard } from '../menu/components/FoodCard';
import { FoodDetailModal } from '../menu/components/FoodDetailModal';

export function HomeView() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const foodRepo = container.getFoodRepository();
        const [foodsData, categoriesData] = await Promise.all([
          foodRepo.getFoods(),
          foodRepo.getCategories(),
        ]);
        setFoods(foodsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      food.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
      food.categoryId === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${AppRoutes.MENU}?q=${encodeURIComponent(searchQuery.trim())}`);
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
              <span>Use code <strong>WELCOME20</strong> for 20% OFF</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Artisan Flavors Delivered Hot in <span className="underline decoration-amber-300">Phnom Penh</span>
            </h1>

            <p className="text-xs sm:text-base text-orange-50/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Handcrafted smash burgers, authentic noodles, wood-fired pizza & fresh bowls prepared by top local chefs and delivered to your doorstep in 25-35 minutes.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-lg mx-auto lg:mx-0 flex items-center bg-white p-1.5 sm:p-2 rounded-2xl shadow-xl shadow-orange-950/20 text-slate-800">
              <span className="pl-2.5 sm:pl-3 text-slate-400 text-sm sm:text-lg shrink-0">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Craving something? (Burger, Ramen...)"
                className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm transition-colors shadow-md shrink-0"
              >
                Search
              </button>
            </form>

            {/* Trust Badges */}
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold text-orange-100">
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>⚡</span>
                <span>Avg 28 Mins</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>⭐</span>
                <span>4.9 / 5 Rating</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <span>🇰🇭</span>
                <span>Bakong & Cash</span>
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
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600';
                }}
              />

              {/* Floating review card */}
              <div className="absolute -bottom-2 left-2 sm:-left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center space-x-2.5 sm:space-x-3 max-w-[90%] sm:max-w-none">
                <span className="text-xl sm:text-2xl shrink-0">🔥</span>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold truncate">10,000+ Orders</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">Delivered Across Phnom Penh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. Categories Horizontal Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Browse by Cuisine
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Our Categories
            </h2>
          </div>
          <button
            onClick={() => navigate(AppRoutes.MENU)}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
          >
            <span>View Full Menu</span>
            <span>→</span>
          </button>
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500'
            }`}
          >
            <span>✨</span>
            <span>All Dishes ({foods.length})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id || cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-500'
              }`}
            >
              <span>🍽️</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Dishes Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Freshly Prepared
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedCategory === 'ALL' ? 'Popular & Recommended' : `${selectedCategory} Dishes`}
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {filteredFoods.length} items
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4 animate-pulse"
              >
                <div className="h-36 sm:h-44 bg-slate-200 dark:bg-slate-800 rounded-xl sm:rounded-2xl" />
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
            <span className="text-3xl sm:text-4xl">🔍</span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              No matching dishes found
            </h3>
            <p className="text-xs text-slate-500">
              Try selecting another category or searching for something else!
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={(selected) => setSelectedFood(selected)}
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
              Lightning Fast Delivery
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              Dispatched with live GPS updates. Hot food arrives in an average of 28 minutes.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            🌱
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Artisan & Fresh Daily
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              Every burger, pizza, and noodle bowl is crafted upon ordering with fresh ingredients.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">
            📱
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Seamless Local Payments
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              Pay with Bakong KHQR scan from any Cambodian banking app or standard Cash on Delivery.
            </p>
          </div>
        </div>
      </section>


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
