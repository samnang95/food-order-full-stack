import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { initialMenuState, computeProcessedFoods } from './menu_state';
import { MenuIntentType } from './menu_intent';
import { container } from '../../core/di/container';

/**
 * Pure Reducer: receives current menu state and intent, returns new state
 */
export function menuReducer(state, action) {
  switch (action.type) {
    case MenuIntentType.LOAD_START:
      return {
        ...state,
        loading: true,
        errorMessage: null,
      };

    case MenuIntentType.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        foods: action.payload.foods || [],
        categories: action.payload.categories || [],
        errorMessage: null,
      };

    case MenuIntentType.LOAD_ERROR:
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
      };

    case MenuIntentType.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload || 'ALL',
      };

    case MenuIntentType.SET_SEARCH:
      return {
        ...state,
        searchQuery: action.payload || '',
      };

    case MenuIntentType.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload || 'popular',
      };

    case MenuIntentType.SELECT_FOOD:
      return {
        ...state,
        selectedFood: action.payload,
      };

    case MenuIntentType.CLEAR_SELECTED_FOOD:
      return {
        ...state,
        selectedFood: null,
      };

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Menu
 */
export function useMenuStore(initialOverrides = {}) {
  const [state, dispatch] = useReducer(menuReducer, {
    ...initialMenuState,
    ...initialOverrides,
  });

  const loadMenu = useCallback(async () => {
    dispatch({ type: MenuIntentType.LOAD_START });
    try {
      const [foodsData, categoriesData] = await Promise.all([
        container.getFoodsUseCase.execute(),
        container.getCategoriesUseCase.execute(),
      ]);
      dispatch({
        type: MenuIntentType.LOAD_SUCCESS,
        payload: { foods: foodsData, categories: categoriesData },
      });
    } catch (err) {
      console.error('[MenuStore] Failed to load menu data:', err);
      dispatch({
        type: MenuIntentType.LOAD_ERROR,
        payload: err.message || 'Failed to load menu data',
      });
    }
  }, []);

  const onIntent = useCallback(
    (intent) => {
      switch (intent.type) {
        case MenuIntentType.LOAD_MENU:
          loadMenu();
          break;

        default:
          dispatch(intent);
          break;
      }
    },
    [loadMenu]
  );

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const processedFoods = useMemo(() => {
    return computeProcessedFoods(
      state.foods,
      state.selectedCategory,
      state.searchQuery,
      state.sortBy
    );
  }, [state.foods, state.selectedCategory, state.searchQuery, state.sortBy]);

  return {
    state,
    onIntent,
    processedFoods,
  };
}
