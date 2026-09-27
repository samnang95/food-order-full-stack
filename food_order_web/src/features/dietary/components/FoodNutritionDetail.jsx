import PropTypes from 'prop-types';
import { useDietary } from '../use_dietary';
import { useTranslation } from '../../../core';

export function FoodNutritionDetail({ food }) {
  const { t } = useTranslation();
  const { preferences, getDishNutrition } = useDietary();

  if (!food) return null;

  const { nutrition, dietary } = getDishNutrition(food);
  const { protein, carbs, fat } = nutrition.macroPercentages;

  const allergenConflicts = preferences ? preferences.checkAllergenConflict(dietary) : [];

  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Allergen Conflict Alert Banner */}
      {allergenConflicts.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5">
          <span className="text-xl leading-none">⚠️</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-rose-800 dark:text-rose-300">
              {t('dietary.allergenWarningTitle', 'Allergen Conflict Alert!')}
            </h4>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5 leading-snug">
              {t(
                'dietary.allergenConflictDesc',
                'This item contains ingredients you flagged as allergens: '
              )}
              <strong className="underline uppercase font-black">
                {allergenConflicts.join(', ')}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Header: Nutrition & Calories */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🥗</span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {t('dietary.nutritionAndMacros', 'Nutritional Facts & Macros')}
            </h4>
            <p className="text-[10px] text-slate-400">
              {t('dietary.estimatedServing', 'Estimated values per standard single serving')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-black font-mono text-orange-600 dark:text-orange-400 block leading-tight">
            {nutrition.calories} <span className="text-xs font-bold">kcal</span>
          </span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase">
            {t('dietary.energy', 'Energy')}
          </span>
        </div>
      </div>

      {/* Visual Macro Contribution Bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
          <span>{t('dietary.macroDistribution', 'Macro Ratio')}</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-emerald-600 dark:text-emerald-400">
              ● {protein}% {t('dietary.protein', 'Protein')}
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              ● {carbs}% {t('dietary.carbs', 'Carbs')}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              ● {fat}% {t('dietary.fat', 'Fat')}
            </span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
          <div
            style={{ width: `${protein}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Protein: ${nutrition.protein}g (${protein}%)`}
          />
          <div
            style={{ width: `${carbs}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Carbs: ${nutrition.carbs}g (${carbs}%)`}
          />
          <div
            style={{ width: `${fat}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Fat: ${nutrition.fat}g (${fat}%)`}
          />
        </div>
      </div>

      {/* Macro Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
          <span className="block text-[9px] font-bold text-slate-400 uppercase">
            {t('dietary.protein', 'Protein')}
          </span>
          <span className="block text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
            {nutrition.protein}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
          <span className="block text-[9px] font-bold text-slate-400 uppercase">
            {t('dietary.carbs', 'Carbs')}
          </span>
          <span className="block text-xs font-black font-mono text-amber-600 dark:text-amber-400">
            {nutrition.carbs}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
          <span className="block text-[9px] font-bold text-slate-400 uppercase">
            {t('dietary.fat', 'Fat')}
          </span>
          <span className="block text-xs font-black font-mono text-rose-600 dark:text-rose-400">
            {nutrition.fat}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
          <span className="block text-[9px] font-bold text-slate-400 uppercase">
            {t('dietary.fiber', 'Fiber')}
          </span>
          <span className="block text-xs font-black font-mono text-cyan-600 dark:text-cyan-400">
            {nutrition.fiber}g
          </span>
        </div>
      </div>

      {/* Dietary Tags & Allergen Pills */}
      <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
        <div className="flex flex-wrap items-center gap-1.5">
          {dietary.isHalal && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center space-x-1">
              <span>☪️</span>
              <span>Halal Certified</span>
            </span>
          )}
          {dietary.isVegan && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <span>🌱</span>
              <span>100% Vegan</span>
            </span>
          )}
          {dietary.isVegetarian && !dietary.isVegan && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30 flex items-center space-x-1">
              <span>🥬</span>
              <span>Vegetarian</span>
            </span>
          )}
          {dietary.isGlutenFree && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center space-x-1">
              <span>🌾</span>
              <span>Gluten-Free</span>
            </span>
          )}
          {dietary.isHighProtein && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center space-x-1">
              <span>💪</span>
              <span>High-Protein</span>
            </span>
          )}
          {dietary.isKeto && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
              <span>🥑</span>
              <span>Keto Friendly</span>
            </span>
          )}

          {/* Spice Meter */}
          {dietary.spiceLevel > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center space-x-1">
              <span>{'🌶️'.repeat(dietary.spiceLevel)}</span>
              <span>{dietary.spiceLevel === 1 ? 'Mild' : dietary.spiceLevel === 2 ? 'Medium' : 'Spicy'}</span>
            </span>
          )}
        </div>

        {/* Known Allergens in this dish */}
        {dietary.allergens.length > 0 && (
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="font-bold">{t('dietary.containsAllergens', 'Contains:')}</span>
            <div className="flex flex-wrap gap-1">
              {dietary.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    preferences?.allergensToAvoid?.includes(allergen)
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

FoodNutritionDetail.propTypes = {
  food: PropTypes.object,
};
