import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { container } from '../../core/di/container';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';

export function MenuView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'ALL';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-low' | 'price-high' | 'name'
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    async function loadMenu() {
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
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const handleCategoryChange = (categoryName) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryName === 'ALL') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryName);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (!val.trim()) {
      newParams.delete('q');
    } else {
      newParams.set('q', val);
    }
    setSearchParams(newParams);
  };


  // Filter and sort dishes
  const processedFoods = foods
    .filter((food) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        food.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        food.categoryId === selectedCategory;

      const matchesSearch =
        !searchQuery.trim() ||
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default order
    });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 border border-orange-500/20">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Explore Our Delicious Menu 🍽️
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          From smash burgers and wood-fired pizzas to fresh matcha and Asian bowls, find your favorite meal handcrafted daily.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search dishes by name or ingredients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange({ target: { value: '' } })}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-hidden focus:border-orange-500 cursor-pointer"
            >
              <option value="popular">⭐ Most Popular</option>
              <option value="price-low">💵 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
              <option value="name">🔤 Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-75">({foods.length})</span>
          </button>

          {categories.map((cat) => {
            const count = foods.filter(
              (f) => f.categoryName?.toLowerCase() === cat.name.toLowerCase()
            ).length;

            return (
              <button
                key={cat._id || cat.id || cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : processedFoods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <span className="text-4xl">🍽️</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No items matched your filter
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or selecting &quot;All Categories&quot;.
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
          >
            Clear All Filters
          </button>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelect={(selected) => setSelectedFood(selected)}
            />
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
