export const FavoritesIntentType = {
  TOGGLE_FAVORITE: 'FAVORITES/TOGGLE_FAVORITE',
  REMOVE_FAVORITE: 'FAVORITES/REMOVE_FAVORITE',
  CLEAR_FAVORITES: 'FAVORITES/CLEAR_FAVORITES',
  SYNC_FROM_STORAGE: 'FAVORITES/SYNC_FROM_STORAGE',
};

export const FavoritesIntent = {
  toggleFavorite: (food) => ({
    type: FavoritesIntentType.TOGGLE_FAVORITE,
    payload: food,
  }),

  removeFavorite: (foodId) => ({
    type: FavoritesIntentType.REMOVE_FAVORITE,
    payload: foodId,
  }),

  clearFavorites: () => ({
    type: FavoritesIntentType.CLEAR_FAVORITES,
  }),

  syncFromStorage: ({ favoriteIds, favoriteFoods }) => ({
    type: FavoritesIntentType.SYNC_FROM_STORAGE,
    payload: { favoriteIds, favoriteFoods },
  }),
};
