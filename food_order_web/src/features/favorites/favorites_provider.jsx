import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FavoritesContext } from './favorites_context';
import { LocalDB, DBKeys } from '../../core/db';

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    return LocalDB.getJSON(DBKeys.FAVORITES, []);
  });

  const [favoriteFoods, setFavoriteFoods] = useState(() => {
    return LocalDB.getJSON(DBKeys.FAVORITE_FOODS, []);
  });

  // Cross-tab synchronization listener
  useEffect(() => {
    const unsubIds = LocalDB.addListener(DBKeys.FAVORITES, (newIds) => {
      if (Array.isArray(newIds)) {
        setFavoriteIds(newIds);
      }
    });

    const unsubFoods = LocalDB.addListener(DBKeys.FAVORITE_FOODS, (newFoods) => {
      if (Array.isArray(newFoods)) {
        setFavoriteFoods(newFoods);
      }
    });

    return () => {
      unsubIds?.();
      unsubFoods?.();
    };
  }, []);

  const isFavorite = useCallback(
    (foodId) => {
      if (!foodId) return false;
      return favoriteIds.includes(String(foodId));
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (food) => {
      if (!food || !food.id) return false;
      const foodId = String(food.id);
      const currentlyFav = favoriteIds.includes(foodId);

      let nextIds;
      let nextFoods;

      if (currentlyFav) {
        nextIds = favoriteIds.filter((id) => id !== foodId);
        nextFoods = favoriteFoods.filter((f) => String(f.id) !== foodId);
      } else {
        nextIds = [foodId, ...favoriteIds];
        nextFoods = [food, ...favoriteFoods.filter((f) => String(f.id) !== foodId)];
      }

      setFavoriteIds(nextIds);
      setFavoriteFoods(nextFoods);

      LocalDB.setJSON(DBKeys.FAVORITES, nextIds);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, nextFoods);

      return !currentlyFav;
    },
    [favoriteIds, favoriteFoods]
  );

  const removeFavorite = useCallback(
    (foodId) => {
      if (!foodId) return;
      const strId = String(foodId);
      const nextIds = favoriteIds.filter((id) => id !== strId);
      const nextFoods = favoriteFoods.filter((f) => String(f.id) !== strId);

      setFavoriteIds(nextIds);
      setFavoriteFoods(nextFoods);

      LocalDB.setJSON(DBKeys.FAVORITES, nextIds);
      LocalDB.setJSON(DBKeys.FAVORITE_FOODS, nextFoods);
    },
    [favoriteIds, favoriteFoods]
  );

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    setFavoriteFoods([]);
    LocalDB.setJSON(DBKeys.FAVORITES, []);
    LocalDB.setJSON(DBKeys.FAVORITE_FOODS, []);
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteFoods,
      favoritesCount: favoriteIds.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favoriteIds, favoriteFoods, isFavorite, toggleFavorite, removeFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
