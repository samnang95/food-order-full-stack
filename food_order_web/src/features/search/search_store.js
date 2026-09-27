import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { createInitialSearchState, computeFilteredSearchResults } from './search_state';
import { SearchIntentType } from './search_intent';
import { container } from '../../core/di/container';
import { LocalDB, DBKeys } from '../../core';

/**
 * Pure Reducer: receives current search state and intent, returns new state
 */
export function searchReducer(state, action) {
  switch (action.type) {
    case SearchIntentType.LOAD_START:
      return {
        ...state,
        loading: true,
        errorMessage: null,
      };

    case SearchIntentType.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        foods: action.payload.foods || [],
        categories: action.payload.categories || [],
        errorMessage: null,
      };

    case SearchIntentType.LOAD_ERROR:
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
      };

    case SearchIntentType.SET_QUERY:
      return {
        ...state,
        query: action.payload,
      };

    case SearchIntentType.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case SearchIntentType.SET_PRICE_RANGE:
      return {
        ...state,
        priceRange: action.payload,
      };

    case SearchIntentType.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
      };

    case SearchIntentType.RESET_FILTERS:
      return {
        ...state,
        selectedCategory: 'ALL',
        priceRange: 'all',
        sortBy: 'recommended',
      };

    case SearchIntentType.SELECT_FOOD:
      return {
        ...state,
        selectedFood: action.payload,
      };

    case SearchIntentType.CLEAR_SELECTED_FOOD:
      return {
        ...state,
        selectedFood: null,
      };

    case SearchIntentType.SET_FILTER_DRAWER:
      return {
        ...state,
        filterDrawerOpen: Boolean(action.payload),
      };

    case SearchIntentType.SAVE_SEARCH_QUERY: {
      const clean = (action.payload || '').trim();
      if (!clean || clean.length < 2) return state;

      const filtered = state.recentSearches.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      );
      const updated = [clean, ...filtered].slice(0, 8);
      LocalDB.setJSON(DBKeys.SEARCH_HISTORY, updated);

      return {
        ...state,
        recentSearches: updated,
      };
    }

    case SearchIntentType.REMOVE_RECENT_SEARCH: {
      const term = action.payload;
      const updated = state.recentSearches.filter((item) => item !== term);
      LocalDB.setJSON(DBKeys.SEARCH_HISTORY, updated);

      return {
        ...state,
        recentSearches: updated,
      };
    }

    case SearchIntentType.CLEAR_RECENT_SEARCHES: {
      LocalDB.setJSON(DBKeys.SEARCH_HISTORY, []);

      return {
        ...state,
        recentSearches: [],
      };
    }

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Search
 */
export function useSearchStore(initialOverrides = {}) {
  const [state, dispatch] = useReducer(searchReducer, initialOverrides, createInitialSearchState);

  const loadData = useCallback(async () => {
    dispatch({ type: SearchIntentType.LOAD_START });
    try {
      const [foodsData, catsData] = await Promise.all([
        container.getFoodsUseCase.execute(),
        container.getCategoriesUseCase.execute(),
      ]);
      dispatch({
        type: SearchIntentType.LOAD_SUCCESS,
        payload: { foods: foodsData, categories: catsData },
      });
    } catch (err) {
      console.error('[SearchStore] Failed to load data:', err);
      dispatch({
        type: SearchIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load search data',
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
    return computeFilteredSearchResults(
      state.foods,
      state.query,
      state.selectedCategory,
      state.priceRange,
      state.sortBy
    );
  }, [state.foods, state.query, state.selectedCategory, state.priceRange, state.sortBy]);

  return {
    state,
    onIntent,
    filteredFoods,
  };
}
