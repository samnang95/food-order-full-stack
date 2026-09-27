import { useState } from 'react';
import { useDietary } from '../use_dietary';
import { DIET_TYPES } from '../../../domain/dietary/entities/dietary_info_entity';
import { UserDietaryPreferencesEntity } from '../../../domain/dietary/entities/user_dietary_preferences_entity';
import { useTranslation } from '../../../core';

const DIETARY_OPTIONS = [
  { id: DIET_TYPES.HALAL, labelKey: 'dietary.halal', icon: '☪️', descKey: 'dietary.halalDesc' },
  { id: DIET_TYPES.VEGETARIAN, labelKey: 'dietary.vegetarian', icon: '🥬', descKey: 'dietary.vegetarianDesc' },
  { id: DIET_TYPES.VEGAN, labelKey: 'dietary.vegan', icon: '🌱', descKey: 'dietary.veganDesc' },
  { id: DIET_TYPES.GLUTEN_FREE, labelKey: 'dietary.glutenFree', icon: '🌾', descKey: 'dietary.glutenFreeDesc' },
  { id: DIET_TYPES.HIGH_PROTEIN, labelKey: 'dietary.highProtein', icon: '🥩', descKey: 'dietary.highProteinDesc' },
  { id: DIET_TYPES.KETO, labelKey: 'dietary.keto', icon: '🥑', descKey: 'dietary.ketoDesc' },
  { id: DIET_TYPES.NUT_FREE, labelKey: 'dietary.nutFree', icon: '🥜', descKey: 'dietary.nutFreeDesc' },
  { id: DIET_TYPES.DAIRY_FREE, labelKey: 'dietary.dairyFree', icon: '🥛', descKey: 'dietary.dairyFreeDesc' },
];

const ALLERGEN_OPTIONS = [
  { id: 'peanuts', labelKey: 'dietary.allergenPeanuts', icon: '🥜' },
  { id: 'tree_nuts', labelKey: 'dietary.allergenTreeNuts', icon: '🌰' },
  { id: 'dairy', labelKey: 'dietary.allergenDairy', icon: '🧀' },
  { id: 'eggs', labelKey: 'dietary.allergenEggs', icon: '🍳' },
  { id: 'gluten', labelKey: 'dietary.allergenGluten', icon: '🍞' },
  { id: 'soy', labelKey: 'dietary.allergenSoy', icon: '🫛' },
  { id: 'shellfish', labelKey: 'dietary.allergenShellfish', icon: '🦐' },
  { id: 'fish', labelKey: 'dietary.allergenFish', icon: '🐟' },
  { id: 'sesame', labelKey: 'dietary.allergenSesame', icon: '🌱' },
];

function DietaryPreferencesModalContent() {
  const { t } = useTranslation();
  const {
    closePreferencesModal,
    preferences,
    savePreferences,
  } = useDietary();

  const [activeDiets, setActiveDiets] = useState(() => preferences?.activeDiets || []);
  const [allergensToAvoid, setAllergensToAvoid] = useState(() => preferences?.allergensToAvoid || []);
  const [calorieTarget, setCalorieTarget] = useState(() => preferences?.dailyCalorieTarget || 2000);
  const [proteinTarget, setProteinTarget] = useState(() => preferences?.dailyProteinTarget || 75);
  const [showMacroBadges, setShowMacroBadges] = useState(() => preferences?.showMacroBadges !== false);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleDiet = (dietId) => {
    setActiveDiets((prev) =>
      prev.includes(dietId) ? prev.filter((d) => d !== dietId) : [...prev, dietId]
    );
  };

  const handleToggleAllergen = (allergenId) => {
    setAllergensToAvoid((prev) =>
      prev.includes(allergenId) ? prev.filter((a) => a !== allergenId) : [...prev, allergenId]
    );
  };

  const handleReset = () => {
    setActiveDiets([]);
    setAllergensToAvoid([]);
    setCalorieTarget(2000);
    setProteinTarget(75);
    setShowMacroBadges(true);
  };

  const handleSave = async () => {
    const updated = new UserDietaryPreferencesEntity({
      activeDiets,
      allergensToAvoid,
      dailyCalorieTarget: Number(calorieTarget),
      dailyProteinTarget: Number(proteinTarget),
      showMacroBadges,
    });
    await savePreferences(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      closePreferencesModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/20">
              🥗
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t('dietary.preferencesTitle', 'Dietary & Allergen Preferences')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'dietary.preferencesSubtitle',
                  'Personalize menu recommendations & health safety alerts'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePreferencesModal}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Dietary Lifestyle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dietary.lifestyleLabeL', '1. Dietary Lifestyle (Filter Only Safe Dishes)')}
              </h3>
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">
                {activeDiets.length} {t('dietary.selected', 'selected')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIETARY_OPTIONS.map((item) => {
                const checked = activeDiets.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleDiet(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      checked
                        ? 'bg-orange-500/10 border-orange-500 text-orange-950 dark:text-orange-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-bold leading-tight">
                      {t(item.labelKey, item.id)}
                    </span>
                    <span
                      className={`text-[9px] mt-1 font-medium ${
                        checked ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {checked ? '✓ Active' : '+ Select'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Allergen Safety Warnings */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-rose-500">⚠️</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  {t('dietary.allergenAlertsTitle', '2. Allergen Safety Alerts')}
                </h3>
              </div>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                {allergensToAvoid.length} {t('dietary.flagged', 'flagged')}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {t(
                'dietary.allergenAlertsDesc',
                'Select ingredients you are allergic to. Dishes containing these will display high-visibility safety warnings.'
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGEN_OPTIONS.map((item) => {
                const checked = allergensToAvoid.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleAllergen(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                      checked
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{t(item.labelKey, item.id)}</span>
                    {checked && <span className="text-[10px]">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Daily Macro Targets & Display Options */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {t('dietary.macroTargetsTitle', '3. Daily Macro & Calorie Targets (Optional)')}
            </h3>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {/* Calorie Target Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{t('dietary.dailyCalories', 'Daily Calorie Goal')}</span>
                  </span>
                  <span className="font-mono text-orange-600 dark:text-orange-400 font-black">
                    {calorieTarget} kcal
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3500"
                  step="50"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              {/* Protein Target Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <span>🥩</span>
                    <span>{t('dietary.dailyProtein', 'Daily Protein Goal')}</span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                    {proteinTarget}g
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="5"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle Macro Badges */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('dietary.showMacroBadges', 'Show Macro Pills on Menu')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t('dietary.showMacroBadgesDesc', 'Display calories & protein badge directly on dish cards')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMacroBadges}
                    onChange={(e) => setShowMacroBadges(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            {t('dietary.resetAll', 'Reset All')}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={closePreferencesModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md ${
                isSaved
                  ? 'bg-emerald-500 text-white scale-102'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-95'
              }`}
            >
              {isSaved
                ? t('dietary.saved', '✓ Preferences Applied!')
                : t('dietary.saveAndApply', 'Save & Apply Preferences')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DietaryPreferencesModal() {
  const { isPreferencesModalOpen } = useDietary();

  if (!isPreferencesModalOpen) return null;

  return <DietaryPreferencesModalContent />;
}
