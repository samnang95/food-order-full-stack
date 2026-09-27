import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialDietaryState } from './dietary_state';
import { DietaryIntentType, DietaryIntent } from './dietary_intent';
import { container } from '../../core/di/container';
import { UserDietaryPreferencesEntity } from '../../domain/dietary/entities/user_dietary_preferences_entity';

export function dietaryReducer(state, action) {
  switch (action.type) {
    case DietaryIntentType.SET_PREFERENCES:
      return { ...state, preferences: action.payload, isLoading: false };

    case DietaryIntentType.SET_ACTIVE_DIET_TAG:
      return { ...state, activeDietTag: action.payload };

    case DietaryIntentType.OPEN_PREFERENCES_MODAL:
      return { ...state, isPreferencesModalOpen: true, error: null };

    case DietaryIntentType.CLOSE_PREFERENCES_MODAL:
      return { ...state, isPreferencesModalOpen: false };

    case DietaryIntentType.TOGGLE_PREFERENCES_MODAL:
      return { ...state, isPreferencesModalOpen: !state.isPreferencesModalOpen };

    case DietaryIntentType.TOGGLE_CART_NUTRITION:
      return {
        ...state,
        isCartNutritionExpanded:
          action.payload !== undefined ? action.payload : !state.isCartNutritionExpanded,
      };

    case DietaryIntentType.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case DietaryIntentType.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

export function useDietaryStore() {
  const [state, dispatch] = useReducer(dietaryReducer, initialDietaryState);
  const preferencesRef = useRef(state.preferences);

  useEffect(() => {
    preferencesRef.current = state.preferences;
  }, [state.preferences]);

  // Load preferences from local storage on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        dispatch(DietaryIntent.setLoading(true));
        const prefs = await container.getUserDietaryPreferencesUseCase.execute();
        if (isMounted && prefs) {
          dispatch(DietaryIntent.setPreferences(prefs));
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Failed to load dietary preferences:', err);
          dispatch(DietaryIntent.setError(err.message));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setActiveDietTag = useCallback((tag) => {
    dispatch(DietaryIntent.setActiveDietTag(tag));
  }, []);

  const openPreferencesModal = useCallback(() => {
    dispatch(DietaryIntent.openPreferencesModal());
  }, []);

  const closePreferencesModal = useCallback(() => {
    dispatch(DietaryIntent.closePreferencesModal());
  }, []);

  const togglePreferencesModal = useCallback(() => {
    dispatch(DietaryIntent.togglePreferencesModal());
  }, []);

  const toggleCartNutrition = useCallback((expanded) => {
    dispatch(DietaryIntent.toggleCartNutrition(expanded));
  }, []);

  const savePreferences = useCallback(async (newPreferences) => {
    try {
      const entity =
        newPreferences instanceof UserDietaryPreferencesEntity
          ? newPreferences
          : new UserDietaryPreferencesEntity(newPreferences);

      await container.saveUserDietaryPreferencesUseCase.execute(entity);
      dispatch(DietaryIntent.setPreferences(entity));
      return entity;
    } catch (err) {
      console.warn('Failed to save dietary preferences:', err);
      dispatch(DietaryIntent.setError(err.message));
      throw err;
    }
  }, []);

  const toggleDiet = useCallback(
    async (dietKey) => {
      const current = preferencesRef.current;
      const isSelected = current.activeDiets.includes(dietKey);
      const nextDiets = isSelected
        ? current.activeDiets.filter((d) => d !== dietKey)
        : [...current.activeDiets, dietKey];

      const updated = new UserDietaryPreferencesEntity({
        ...current,
        activeDiets: nextDiets,
      });

      return savePreferences(updated);
    },
    [savePreferences]
  );

  const toggleAllergen = useCallback(
    async (allergenKey) => {
      const current = preferencesRef.current;
      const isSelected = current.allergensToAvoid.includes(allergenKey);
      const nextAllergens = isSelected
        ? current.allergensToAvoid.filter((a) => a !== allergenKey)
        : [...current.allergensToAvoid, allergenKey];

      const updated = new UserDietaryPreferencesEntity({
        ...current,
        allergensToAvoid: nextAllergens,
      });

      return savePreferences(updated);
    },
    [savePreferences]
  );

  const updateCalorieTarget = useCallback(
    async (target) => {
      const current = preferencesRef.current;
      const updated = new UserDietaryPreferencesEntity({
        ...current,
        dailyCalorieTarget: Number(target) || 2000,
      });
      return savePreferences(updated);
    },
    [savePreferences]
  );

  const updateProteinTarget = useCallback(
    async (target) => {
      const current = preferencesRef.current;
      const updated = new UserDietaryPreferencesEntity({
        ...current,
        dailyProteinTarget: Number(target) || 75,
      });
      return savePreferences(updated);
    },
    [savePreferences]
  );

  const toggleMacroBadges = useCallback(
    async (enabled) => {
      const current = preferencesRef.current;
      const updated = new UserDietaryPreferencesEntity({
        ...current,
        showMacroBadges: enabled !== undefined ? enabled : !current.showMacroBadges,
      });
      return savePreferences(updated);
    },
    [savePreferences]
  );

  // Synchronous and asynchronous helpers for dishes and cart
  const getDishNutrition = useCallback((food) => {
    return container.dietaryRepository.getDishNutritionAndDietary(food);
  }, []);

  const filterFoods = useCallback(
    (foods) => {
      return container.dietaryRepository.filterDishes({
        foods,
        activeDietTag: state.activeDietTag,
        userPreferences: state.preferences,
      });
    },
    [state.activeDietTag, state.preferences]
  );

  const calculateCartNutrition = useCallback((cartItems) => {
    return container.dietaryRepository.calculateNutritionSummary(cartItems);
  }, []);

  return {
    state,
    preferences: state.preferences,
    activeDietTag: state.activeDietTag,
    isPreferencesModalOpen: state.isPreferencesModalOpen,
    isCartNutritionExpanded: state.isCartNutritionExpanded,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    setActiveDietTag,
    openPreferencesModal,
    closePreferencesModal,
    togglePreferencesModal,
    toggleCartNutrition,
    savePreferences,
    toggleDiet,
    toggleAllergen,
    updateCalorieTarget,
    updateProteinTarget,
    toggleMacroBadges,

    // Calculations & Queries
    getDishNutrition,
    filterFoods,
    calculateCartNutrition,
  };
}
