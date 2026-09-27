import PropTypes from 'prop-types';
import { useDietary } from '../use_dietary';
import { useTranslation } from '../../../core';

export function MacroBreakdownBadge({ food }) {
  const { t } = useTranslation();
  const { preferences, getDishNutrition } = useDietary();

  if (!food) return null;

  const { nutrition, dietary } = getDishNutrition(food);
  const showBadges = preferences?.showMacroBadges !== false;

  // Check allergen conflict with user preferences
  const allergenConflicts = preferences ? preferences.checkAllergenConflict(dietary) : [];

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      {/* Allergen Warning Banner if user is allergic */}
      {allergenConflicts.length > 0 && (
        <span
          className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-500 text-white animate-pulse shadow-xs"
          title={`${t('dietary.allergenWarning', 'Allergen Alert')}: ${allergenConflicts.join(', ')}`}
        >
          <span>⚠️</span>
          <span>{allergenConflicts[0]}</span>
          {allergenConflicts.length > 1 && <span>+{allergenConflicts.length - 1}</span>}
        </span>
      )}

      {/* Dietary Lifestyle Chips */}
      {dietary.isVegan ? (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <span>🌱</span>
          <span>Vegan</span>
        </span>
      ) : dietary.isVegetarian ? (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
          <span>🥬</span>
          <span>Veg</span>
        </span>
      ) : dietary.isHalal ? (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
          <span>☪️</span>
          <span>Halal</span>
        </span>
      ) : null}

      {dietary.isGlutenFree && (
        <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <span>🌾</span>
          <span>GF</span>
        </span>
      )}

      {/* Macro Pills (Calories & Protein) */}
      {showBadges && nutrition && (
        <>
          <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            <span className="text-orange-500 font-normal">🔥</span>
            <span>{nutrition.calories} kcal</span>
          </span>

          {nutrition.protein > 0 && (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-700">
              <span className="font-normal">🥩</span>
              <span>{nutrition.protein}g P</span>
            </span>
          )}
        </>
      )}
    </div>
  );
}

MacroBreakdownBadge.propTypes = {
  food: PropTypes.object,
};
