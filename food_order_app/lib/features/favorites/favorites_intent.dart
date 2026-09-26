sealed class FavoritesIntent {
  const FavoritesIntent();
}

class FavoritesSearchChanged extends FavoritesIntent {
  final String query;
  const FavoritesSearchChanged(this.query);
}

class FavoritesClearSearch extends FavoritesIntent {
  const FavoritesClearSearch();
}

class FavoritesCategorySelected extends FavoritesIntent {
  final String category;
  const FavoritesCategorySelected(this.category);
}

class FavoritesSortChanged extends FavoritesIntent {
  final String sort; // 'recent', 'price_asc', 'price_desc', 'name_asc'
  const FavoritesSortChanged(this.sort);
}

class FavoritesAddAllToCart extends FavoritesIntent {
  const FavoritesAddAllToCart();
}

class FavoritesRemoveItem extends FavoritesIntent {
  final String foodId;
  const FavoritesRemoveItem(this.foodId);
}

class FavoritesClearAll extends FavoritesIntent {
  const FavoritesClearAll();
}
