import PropTypes from 'prop-types';
import { useDietary } from '../use_dietary';
import { DIET_TYPES } from '../../../domain/dietary/entities/dietary_info_entity';
import { useTranslation } from '../../../core';

const FILTER_TAGS = [
  { id: DIET_TYPES.ALL, labelKey: 'dietary.all', icon: '🍽️' },
  { id: DIET_TYPES.HALAL, labelKey: 'dietary.halal', icon: '☪️' },
  { id: DIET_TYPES.VEGETARIAN, labelKey: 'dietary.vegetarian', icon: '🥬' },
  { id: DIET_TYPES.VEGAN, labelKey: 'dietary.vegan', icon: '🌱' },
  { id: DIET_TYPES.GLUTEN_FREE, labelKey: 'dietary.glutenFree', icon: '🌾' },
  { id: DIET_TYPES.HIGH_PROTEIN, labelKey: 'dietary.highProtein', icon: '🥩' },
  { id: DIET_TYPES.KETO, labelKey: 'dietary.keto', icon: '🥑' },
  { id: DIET_TYPES.NUT_FREE, labelKey: 'dietary.nutFree', icon: '🥜' },
];

export function DietaryFilterBar({ className = '' }) {
  const { t } = useTranslation();
  const { activeDietTag, setActiveDietTag, preferences, openPreferencesModal } = useDietary();

  const totalAlerts =
    (preferences?.activeDiets?.length || 0) + (preferences?.allergensToAvoid?.length || 0);

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}>
      <div className="flex items-center gap-2 min-w-max px-1">
        {/* Quick Preference Config / Allergen Safety Button */}
        <button
          type="button"
          onClick={openPreferencesModal}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
            totalAlerts > 0
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-400'
          }`}
          title={t('dietary.preferencesTooltip', 'Customize dietary lifestyle & allergen alerts')}
        >
          <span>🛡️</span>
          <span>{t('dietary.preferences', 'Dietary & Allergens')}</span>
          {totalAlerts > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {totalAlerts}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        {/* Dietary Tag Filter Pills */}
        {FILTER_TAGS.map((tag) => {
          const isSelected = activeDietTag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveDietTag(tag.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50'
              }`}
            >
              <span>{tag.icon}</span>
              <span>{t(tag.labelKey, tag.id)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

DietaryFilterBar.propTypes = {
  className: PropTypes.string,
};
