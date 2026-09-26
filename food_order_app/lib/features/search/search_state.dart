import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';

enum SearchSortOption {
  popular,
  priceLowToHigh,
  priceHighToLow,
  nameAZ,
}

extension SearchSortOptionExtension on SearchSortOption {
  String get label {
    switch (this) {
      case SearchSortOption.popular:
        return 'Recommended';
      case SearchSortOption.priceLowToHigh:
        return 'Price: Low to High';
      case SearchSortOption.priceHighToLow:
        return 'Price: High to Low';
      case SearchSortOption.nameAZ:
        return 'Name (A to Z)';
    }
  }
}

class SearchState {
  final String query;
  final List<FoodEntity> allFoods;
  final List<CategoryEntity> categories;
  final List<String> recentSearches;
  final String? selectedCategoryId;
  final double minPrice;
  final double maxPrice;
  final SearchSortOption sortOption;
  final bool isLoading;
  final String? errorMessage;

  const SearchState({
    this.query = '',
    this.allFoods = const [],
    this.categories = const [],
    this.recentSearches = const [],
    this.selectedCategoryId,
    this.minPrice = 0.0,
    this.maxPrice = 50.0,
    this.sortOption = SearchSortOption.popular,
    this.isLoading = false,
    this.errorMessage,
  });

  bool get hasActiveFilter =>
      selectedCategoryId != null ||
      minPrice > 0.0 ||
      maxPrice < 50.0 ||
      sortOption != SearchSortOption.popular;

  int get activeFilterCount {
    int count = 0;
    if (selectedCategoryId != null) count++;
    if (minPrice > 0.0 || maxPrice < 50.0) count++;
    if (sortOption != SearchSortOption.popular) count++;
    return count;
  }

  bool get isQueryEmpty => query.trim().isEmpty;

  List<FoodEntity> get results {
    final q = query.trim().toLowerCase();
    var list = allFoods;

    // Filter by query (name, category, description)
    if (q.isNotEmpty) {
      list = list.where((f) {
        return f.name.toLowerCase().contains(q) ||
            f.description.toLowerCase().contains(q) ||
            f.categoryName.toLowerCase().contains(q);
      }).toList();
    }

    // Filter by category
    if (selectedCategoryId != null && selectedCategoryId!.isNotEmpty) {
      list = list.where((f) => f.categoryId == selectedCategoryId).toList();
    }

    // Filter by price range
    list = list.where((f) => f.price >= minPrice && f.price <= maxPrice).toList();

    // Sort
    final sorted = List<FoodEntity>.from(list);
    switch (sortOption) {
      case SearchSortOption.priceLowToHigh:
        sorted.sort((a, b) => a.price.compareTo(b.price));
      case SearchSortOption.priceHighToLow:
        sorted.sort((a, b) => b.price.compareTo(a.price));
      case SearchSortOption.nameAZ:
        sorted.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
      case SearchSortOption.popular:
        break;
    }

    return sorted;
  }

  SearchState copyWith({
    String? query,
    List<FoodEntity>? allFoods,
    List<CategoryEntity>? categories,
    List<String>? recentSearches,
    String? selectedCategoryId,
    bool clearCategoryId = false,
    double? minPrice,
    double? maxPrice,
    SearchSortOption? sortOption,
    bool? isLoading,
    String? errorMessage,
  }) {
    return SearchState(
      query: query ?? this.query,
      allFoods: allFoods ?? this.allFoods,
      categories: categories ?? this.categories,
      recentSearches: recentSearches ?? this.recentSearches,
      selectedCategoryId: clearCategoryId ? null : (selectedCategoryId ?? this.selectedCategoryId),
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      sortOption: sortOption ?? this.sortOption,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}
