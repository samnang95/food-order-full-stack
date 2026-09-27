import PropTypes from 'prop-types';
import { useDietary } from '../use_dietary';
import { useTranslation } from '../../../core';

export function CartNutritionBar({ cartItems = [] }) {
  const { t } = useTranslation();
  const {
    preferences,
    isCartNutritionExpanded,
    toggleCartNutrition,
    calculateCartNutrition,
  } = useDietary();

  if (!cartItems.length) return null;

  const { aggregated } = calculateCartNutrition(cartItems);

  const calorieTarget = preferences?.dailyCalorieTarget || 2000;
  const proteinTarget = preferences?.dailyProteinTarget || 75;

  const calPct = Math.min(100, Math.round((aggregated.calories / calorieTarget) * 100));
  const proPct = Math.min(100, Math.round((aggregated.protein / proteinTarget) * 100));

  return (
    <div className="mb-3 rounded-2xl bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-emerald-500/5 border border-orange-500/20 overflow-hidden shadow-xs">
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => toggleCartNutrition()}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-orange-500/10 transition-colors"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-base">🥗</span>
          <div className="min-w-0">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate block">
              {t('dietary.cartNutritionTitle', 'Cart Nutrition & Macros')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {aggregated.calories} kcal • {aggregated.protein}g protein
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white font-mono">
            {calPct}% {t('dietary.ofGoal', 'goal')}
          </span>
          <span className="text-xs text-slate-400">
            {isCartNutritionExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded Macro Progress Bars */}
      {isCartNutritionExpanded && (
        <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-orange-500/10 text-xs">
          {/* Calorie Progress */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                <span>🔥</span>
                <span>{t('dietary.calories', 'Calories')}</span>
              </span>
              <span className="font-mono text-orange-600 dark:text-orange-400 font-black">
                {aggregated.calories} / {calorieTarget} kcal ({calPct}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${calPct}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  calPct > 100 ? 'bg-rose-500' : 'bg-orange-500'
                }`}
              />
            </div>
          </div>

          {/* Protein Progress */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                <span>🥩</span>
                <span>{t('dietary.protein', 'Protein')}</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                {aggregated.protein} / {proteinTarget}g ({proPct}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${proPct}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Carbs, Fat, Fiber Breakdown */}
          <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400">
                {t('dietary.carbs', 'Carbs')}
              </span>
              <span className="block text-[11px] font-black text-amber-600 dark:text-amber-400">
                {aggregated.carbs}g
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400">
                {t('dietary.fat', 'Fat')}
              </span>
              <span className="block text-[11px] font-black text-rose-600 dark:text-rose-400">
                {aggregated.fat}g
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400">
                {t('dietary.fiber', 'Fiber')}
              </span>
              <span className="block text-[11px] font-black text-cyan-600 dark:text-cyan-400">
                {aggregated.fiber}g
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CartNutritionBar.propTypes = {
  cartItems: PropTypes.array,
};
