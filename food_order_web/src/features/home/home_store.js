import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { initialHomeState, computeHomeFilteredFoods } from './home_state';
import { HomeIntentType } from './home_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current home state and intent, returns new state
 */
export function homeReducer(state, action) {
  switch (action.type) {
    case HomeIntentType.LOAD_START:
      return {
        ...state,
        loading: true,
        errorMessage: null,
      };

    case HomeIntentType.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        foods: action.payload.foods || [],
        categories: action.payload.categories || [],
        errorMessage: null,
      };

    case HomeIntentType.LOAD_ERROR:
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
      };

    case HomeIntentType.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case HomeIntentType.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case HomeIntentType.SELECT_FOOD:
      return {
        ...state,
        selectedFood: action.payload,
      };

    case HomeIntentType.CLEAR_SELECTED_FOOD:
      return {
        ...state,
        selectedFood: null,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Home
 */
export function useHomeStore() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);

  const loadData = useCallback(async () => {
    dispatch({ type: HomeIntentType.LOAD_START });
    try {
      const [foodsData, categoriesData] = await Promise.all([
        container.getFoodsUseCase.execute(),
        container.getCategoriesUseCase.execute(),
      ]);
      dispatch({
        type: HomeIntentType.LOAD_SUCCESS,
        payload: { foods: foodsData, categories: categoriesData },
      });
    } catch (err) {
      console.error('[HomeStore] Failed to load home data:', err);
      dispatch({
        type: HomeIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load home data',
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  const filteredFoods = useMemo(() => {
    return computeHomeFilteredFoods(state.foods, state.selectedCategory, state.searchQuery);
  }, [state.foods, state.selectedCategory, state.searchQuery]);

  return {
    state,
    onIntent,
    filteredFoods,
  };
}
