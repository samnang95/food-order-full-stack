import { useReducer, useEffect, useCallback, useRef } from 'react';
import { createInitialFavoritesState } from './favorites_state';
import { FavoritesIntentType } from './favorites_intent';
import { LocalDB, DBKeys } from '../../core/db';
import { accountRemoteDataSource } from '../../data/account';

/**
 * Pure Reducer: receives current state and intent, returns new state
 */
export function favoritesReducer(state, action) {
  switch (action.type) {
    case FavoritesIntentType.TOGGLE_FAVORITE: {
      const food = action.payload;
      if (!food || (!food.id && !food._id)) return state;

      const foodId = String(food.id || food._id);
      const currentlyFav = state.favoriteIds.includes(foodId);

      let nextIds;
      let nextFoods;

      if (currentlyFav) {
        nextIds = state.favoriteIds.filter((id) => id !== foodId);
        nextFoods = state.favoriteFoods.filter((f) => String(f.id || f._id) !== foodId);
      } else {
        nextIds = [foodId, ...state.favoriteIds];
        nextFoods = [food, ...state.favoriteFoods.filter((f) => String(f.id || f._id) !== foodId)];
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
      const nextFoods = state.favoriteFoods.filter((f) => String(f.id || f._id) !== strId);

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
      const nextIds = Array.isArray(favoriteIds) ? favoriteIds : state.favoriteIds;
      const nextFoods = Array.isArray(favoriteFoods) ? favoriteFoods : state.favoriteFoods;

      LocalDB.setJSON(DBKeys.FAVORITES, nextIds);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, nextFoods);

      return {
        ...state,
        favoriteIds: nextIds,
        favoriteFoods: nextFoods,
        favoritesCount: nextIds.length,
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
  const hasCloudFetched = useRef(false);

  // Fetch cloud favorites on mount & merge with local storage
  const refreshFavorites = useCallback(async () => {
    try {
      const remote = await accountRemoteDataSource.getFavorites();
      if (Array.isArray(remote?.favoriteIds) && remote.favoriteIds.length > 0) {
        // Merge cloud favorites with any local offline favorites
        const localIds = LocalDB.getJSON(DBKeys.FAVORITES, []);
        const unSyncedLocalIds = localIds.filter((lid) => !remote.favoriteIds.includes(lid));

        if (unSyncedLocalIds.length > 0) {
          const merged = await accountRemoteDataSource.syncFavorites([...remote.favoriteIds, ...unSyncedLocalIds]);
          dispatch({
            type: FavoritesIntentType.SYNC_FROM_STORAGE,
            payload: {
              favoriteIds: merged.favoriteIds,
              favoriteFoods: merged.favoriteFoods,
            },
          });
        } else {
          dispatch({
            type: FavoritesIntentType.SYNC_FROM_STORAGE,
            payload: {
              favoriteIds: remote.favoriteIds,
              favoriteFoods: remote.favoriteFoods,
            },
          });
        }
      } else {
        // If remote has no favorites yet, sync local ones
        const localIds = LocalDB.getJSON(DBKeys.FAVORITES, []);
        if (localIds.length > 0) {
          const synced = await accountRemoteDataSource.syncFavorites(localIds);
          dispatch({
            type: FavoritesIntentType.SYNC_FROM_STORAGE,
            payload: {
              favoriteIds: synced.favoriteIds,
              favoriteFoods: synced.favoriteFoods,
            },
          });
        }
      }
    } catch (err) {
      console.debug('[FavoritesStore] Cloud fetch fallback to local:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!hasCloudFetched.current) {
      hasCloudFetched.current = true;
      refreshFavorites();
    }
  }, [refreshFavorites]);

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
      const strId = String(foodId);
      return state.favoriteIds.includes(strId);
    },
    [state.favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (food) => {
      if (!food || (!food.id && !food._id)) return false;
      const targetId = String(food.id || food._id);
      const willBeFav = !state.favoriteIds.includes(targetId);

      // Instant optimistic UI update
      onIntent({ type: FavoritesIntentType.TOGGLE_FAVORITE, payload: food });

      // Async cloud sync in background
      try {
        const res = await accountRemoteDataSource.toggleFavorite(targetId);
        if (res && Array.isArray(res.favoriteIds)) {
          dispatch({
            type: FavoritesIntentType.SYNC_FROM_STORAGE,
            payload: {
              favoriteIds: res.favoriteIds,
              favoriteFoods: res.favoriteFoods,
            },
          });
        }
      } catch (err) {
        console.warn('[FavoritesStore] Cloud toggle failed, saved locally:', err.message);
      }

      return willBeFav;
    },
    [state.favoriteIds, onIntent]
  );

  const removeFavorite = useCallback(
    async (foodId) => {
      if (!foodId) return;
      const strId = String(foodId);

      // Instant optimistic UI update
      onIntent({ type: FavoritesIntentType.REMOVE_FAVORITE, payload: strId });

      // Async cloud delete
      try {
        const res = await accountRemoteDataSource.removeFavorite(strId);
        if (res && Array.isArray(res.favoriteIds)) {
          dispatch({
            type: FavoritesIntentType.SYNC_FROM_STORAGE,
            payload: {
              favoriteIds: res.favoriteIds,
              favoriteFoods: res.favoriteFoods,
            },
          });
        }
      } catch (err) {
        console.warn('[FavoritesStore] Cloud remove failed:', err.message);
      }
    },
    [onIntent]
  );

  const clearFavorites = useCallback(async () => {
    // Instant optimistic UI update
    onIntent({ type: FavoritesIntentType.CLEAR_FAVORITES });

    // Async cloud clear
    try {
      await accountRemoteDataSource.clearFavorites();
    } catch (err) {
      console.warn('[FavoritesStore] Cloud clear failed:', err.message);
    }
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
    refreshFavorites,
  };
}
