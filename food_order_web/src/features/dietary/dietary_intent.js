export const DietaryIntentType = {
  SET_PREFERENCES: 'DIETARY/SET_PREFERENCES',
  SET_ACTIVE_DIET_TAG: 'DIETARY/SET_ACTIVE_DIET_TAG',
  OPEN_PREFERENCES_MODAL: 'DIETARY/OPEN_PREFERENCES_MODAL',
  CLOSE_PREFERENCES_MODAL: 'DIETARY/CLOSE_PREFERENCES_MODAL',
  TOGGLE_PREFERENCES_MODAL: 'DIETARY/TOGGLE_PREFERENCES_MODAL',
  TOGGLE_CART_NUTRITION: 'DIETARY/TOGGLE_CART_NUTRITION',
  SET_LOADING: 'DIETARY/SET_LOADING',
  SET_ERROR: 'DIETARY/SET_ERROR',
};

export const DietaryIntent = {
  setPreferences: (preferences) => ({
    type: DietaryIntentType.SET_PREFERENCES,
    payload: preferences,
  }),

  setActiveDietTag: (tag) => ({
    type: DietaryIntentType.SET_ACTIVE_DIET_TAG,
    payload: tag,
  }),

  openPreferencesModal: () => ({
    type: DietaryIntentType.OPEN_PREFERENCES_MODAL,
  }),

  closePreferencesModal: () => ({
    type: DietaryIntentType.CLOSE_PREFERENCES_MODAL,
  }),

  togglePreferencesModal: () => ({
    type: DietaryIntentType.TOGGLE_PREFERENCES_MODAL,
  }),

  toggleCartNutrition: (expanded) => ({
    type: DietaryIntentType.TOGGLE_CART_NUTRITION,
    payload: expanded,
  }),

  setLoading: (isLoading) => ({
    type: DietaryIntentType.SET_LOADING,
    payload: isLoading,
  }),

  setError: (error) => ({
    type: DietaryIntentType.SET_ERROR,
    payload: error,
  }),
};
