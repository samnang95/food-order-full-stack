import 'search_state.dart';

sealed class SearchIntent {
  const SearchIntent();
}

class SearchQueryChangedIntent extends SearchIntent {
  final String query;
  const SearchQueryChangedIntent(this.query);
}

class SearchClearQueryIntent extends SearchIntent {
  const SearchClearQueryIntent();
}

class SearchSelectRecentQueryIntent extends SearchIntent {
  final String query;
  const SearchSelectRecentQueryIntent(this.query);
}

class SearchRemoveRecentQueryIntent extends SearchIntent {
  final String query;
  const SearchRemoveRecentQueryIntent(this.query);
}

class SearchClearAllRecentIntent extends SearchIntent {
  const SearchClearAllRecentIntent();
}

class SearchApplyFilterIntent extends SearchIntent {
  final String? categoryId;
  final double minPrice;
  final double maxPrice;
  final SearchSortOption sortOption;

  const SearchApplyFilterIntent({
    this.categoryId,
    required this.minPrice,
    required this.maxPrice,
    required this.sortOption,
  });
}

class SearchResetFilterIntent extends SearchIntent {
  const SearchResetFilterIntent();
}

class SearchRefreshIntent extends SearchIntent {
  const SearchRefreshIntent();
}
