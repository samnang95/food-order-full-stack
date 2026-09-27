import { LocalDB, DBKeys } from '../../core/db';

/**
 * Model / State (M) in MVI:
 * Immutable representation of the Favorites feature state.
 */
export function createInitialFavoritesState() {
  const favoriteIds = LocalDB.getJSON(DBKeys.FAVORITES, []);
  const favoriteFoods = LocalDB.getJSON(DBKeys.FAVORITE_FOODS, []);

  return {
    favoriteIds: Array.isArray(favoriteIds) ? favoriteIds : [],
    favoriteFoods: Array.isArray(favoriteFoods) ? favoriteFoods : [],
    favoritesCount: Array.isArray(favoriteIds) ? favoriteIds.length : 0,
  };
}
