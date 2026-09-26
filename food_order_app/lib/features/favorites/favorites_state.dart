import '../../domain/food/entities/food_entity.dart';

class FavoritesState {
  final String searchQuery;
  final String selectedCategory;
  final String selectedSort; // 'recent', 'price_asc', 'price_desc', 'name_asc'
  final List<FoodEntity> favoriteFoods;

  const FavoritesState({
    this.searchQuery = '',
    this.selectedCategory = 'all',
    this.selectedSort = 'recent',
    this.favoriteFoods = const [],
  });

  FavoritesState copyWith({
    String? searchQuery,
    String? selectedCategory,
    String? selectedSort,
    List<FoodEntity>? favoriteFoods,
  }) {
    return FavoritesState(
      searchQuery: searchQuery ?? this.searchQuery,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedSort: selectedSort ?? this.selectedSort,
      favoriteFoods: favoriteFoods ?? this.favoriteFoods,
    );
  }

  List<String> get availableCategories {
    final catSet = <String>{};
    for (final f in favoriteFoods) {
      if (f.categoryName.isNotEmpty) {
        catSet.add(f.categoryName);
      }
    }
    return ['all', ...catSet];
  }

  List<FoodEntity> get filteredFoods {
    var list = List<FoodEntity>.from(favoriteFoods);

    // 1. Category filter
    if (selectedCategory != 'all') {
      list = list.where((f) {
        return f.categoryName.toLowerCase() == selectedCategory.toLowerCase() ||
            f.categoryId.toLowerCase() == selectedCategory.toLowerCase();
      }).toList();
    }

    // 2. Search query filter
    final query = searchQuery.trim().toLowerCase();
    if (query.isNotEmpty) {
      list = list.where((f) {
        final nameMatch = f.name.toLowerCase().contains(query);
        final descMatch = f.description.toLowerCase().contains(query);
        final catMatch = f.categoryName.toLowerCase().contains(query);
        return nameMatch || descMatch || catMatch;
      }).toList();
    }

    // 3. Sorting
    switch (selectedSort) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'name_asc':
        list.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
        break;
      case 'recent':
      default:
        break;
    }

    return list;
  }
}
