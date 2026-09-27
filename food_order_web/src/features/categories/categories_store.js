import { useReducer, useEffect, useCallback, useMemo } from 'react';
import {
  initialCategoriesState,
  computeCategoryItemCounts,
  computeFilteredCategories,
} from './categories_state';
import { CategoriesIntentType } from './categories_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current categories state and intent, returns new state
 */
export function categoriesReducer(state, action) {
  switch (action.type) {
    case CategoriesIntentType.LOAD_START:
      return {
        ...state,
        loading: true,
        errorMessage: null,
      };

    case CategoriesIntentType.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload.categories || [],
        foods: action.payload.foods || [],
        errorMessage: null,
      };

    case CategoriesIntentType.LOAD_ERROR:
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
      };

    case CategoriesIntentType.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case CategoriesIntentType.SET_SELECTED_TAG:
      return {
        ...state,
        selectedTag: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Categories
 */
export function useCategoriesStore() {
  const [state, dispatch] = useReducer(categoriesReducer, initialCategoriesState);

  const loadData = useCallback(async () => {
    dispatch({ type: CategoriesIntentType.LOAD_START });
    try {
      const [catsData, foodsData] = await Promise.all([
        container.getCategoriesUseCase.execute(),
        container.getFoodsUseCase.execute(),
      ]);
      dispatch({
        type: CategoriesIntentType.LOAD_SUCCESS,
        payload: { categories: catsData, foods: foodsData },
      });
    } catch (err) {
      console.error('[CategoriesStore] Failed to load categories:', err);
      dispatch({
        type: CategoriesIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load categories',
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  const categoryCounts = useMemo(() => {
    return computeCategoryItemCounts(state.foods);
  }, [state.foods]);

  const filteredCategories = useMemo(() => {
    return computeFilteredCategories(state.categories, state.foods, state.searchQuery, state.selectedTag);
  }, [state.categories, state.foods, state.searchQuery, state.selectedTag]);

  const getItemCount = useCallback(
    (category) => {
      const byId = categoryCounts[category.id] || 0;
      const byName = categoryCounts[(category.name || '').toLowerCase()] || 0;
      return Math.max(byId, byName);
    },
    [categoryCounts]
  );

  return {
    state,
    onIntent,
    categoryCounts,
    filteredCategories,
    getItemCount,
  };
}
