import { useReducer, useEffect, useCallback } from 'react';
import { createInitialFavoritesState } from './favorites_state';
import { FavoritesIntentType } from './favorites_intent';
import { LocalDB, DBKeys } from '../../core/db';

/**
 * Pure Reducer: receives current state and intent, returns new state
 */
export function favoritesReducer(state, action) {
  switch (action.type) {
    case FavoritesIntentType.TOGGLE_FAVORITE: {
      const food = action.payload;
      if (!food || !food.id) return state;

      const foodId = String(food.id);
      const currentlyFav = state.favoriteIds.includes(foodId);

      let nextIds;
      let nextFoods;

      if (currentlyFav) {
        nextIds = state.favoriteIds.filter((id) => id !== foodId);
        nextFoods = state.favoriteFoods.filter((f) => String(f.id) !== foodId);
      } else {
        nextIds = [foodId, ...state.favoriteIds];
        nextFoods = [food, ...state.favoriteFoods.filter((f) => String(f.id) !== foodId)];
      }

      LocalDB.setJSON(DBKeys.FAVORITES, nextIds);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, nextFoods);

      return {
        ...state,
        favoriteIds: nextIds,
        favoriteFoods: nextFoods,
        favoritesCount: nextIds.length,
      };
    }

    case FavoritesIntentType.REMOVE_FAVORITE: {
      const foodId = action.payload;
      if (!foodId) return state;

      const strId = String(foodId);
      const nextIds = state.favoriteIds.filter((id) => id !== strId);
      const nextFoods = state.favoriteFoods.filter((f) => String(f.id) !== strId);

      LocalDB.setJSON(DBKeys.FAVORITES, nextIds);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, nextFoods);

      return {
        ...state,
        favoriteIds: nextIds,
        favoriteFoods: nextFoods,
        favoritesCount: nextIds.length,
      };
    }

    case FavoritesIntentType.CLEAR_FAVORITES: {
      LocalDB.setJSON(DBKeys.FAVORITES, []);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, []);

      return {
        ...state,
        favoriteIds: [],
        favoriteFoods: [],
        favoritesCount: 0,
      };
    }

    case FavoritesIntentType.SYNC_FROM_STORAGE: {
      const { favoriteIds, favoriteFoods } = action.payload;
      return {
        ...state,
        favoriteIds: Array.isArray(favoriteIds) ? favoriteIds : state.favoriteIds,
        favoriteFoods: Array.isArray(favoriteFoods) ? favoriteFoods : state.favoriteFoods,
        favoritesCount: Array.isArray(favoriteIds) ? favoriteIds.length : state.favoritesCount,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Favorites
 */
export function useFavoritesStore() {
  const [state, dispatch] = useReducer(favoritesReducer, undefined, createInitialFavoritesState);

  // Cross-tab synchronization listener
  useEffect(() => {
    const unsubIds = LocalDB.addListener(DBKeys.FAVORITES, (newIds) => {
      if (Array.isArray(newIds)) {
        dispatch({
          type: FavoritesIntentType.SYNC_FROM_STORAGE,
          payload: { favoriteIds: newIds },
        });
      }
    });

    const unsubFoods = LocalDB.addListener(DBKeys.FAVORITE_FOODS, (newFoods) => {
      if (Array.isArray(newFoods)) {
        dispatch({
          type: FavoritesIntentType.SYNC_FROM_STORAGE,
          payload: { favoriteFoods: newFoods },
        });
      }
    });

    return () => {
      unsubIds?.();
      unsubFoods?.();
    };
  }, []);

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  const isFavorite = useCallback(
    (foodId) => {
      if (!foodId) return false;
      return state.favoriteIds.includes(String(foodId));
    },
    [state.favoriteIds]
  );

  const toggleFavorite = useCallback(
    (food) => {
      if (!food || !food.id) return false;
      const willBeFav = !state.favoriteIds.includes(String(food.id));
      onIntent({ type: FavoritesIntentType.TOGGLE_FAVORITE, payload: food });
      return willBeFav;
    },
    [state.favoriteIds, onIntent]
  );

  const removeFavorite = useCallback(
    (foodId) => {
      onIntent({ type: FavoritesIntentType.REMOVE_FAVORITE, payload: foodId });
    },
    [onIntent]
  );

  const clearFavorites = useCallback(() => {
    onIntent({ type: FavoritesIntentType.CLEAR_FAVORITES });
  }, [onIntent]);

  return {
    state,
    onIntent,
    favoriteIds: state.favoriteIds,
    favoriteFoods: state.favoriteFoods,
    favoritesCount: state.favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}
