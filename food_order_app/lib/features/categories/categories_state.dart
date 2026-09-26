import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';

class CategoriesState {
  final bool isLoading;
  final List<CategoryEntity> categories;
  final List<FoodEntity> allFoods;
  final Map<String, int> categoryItemCounts;
  final String searchQuery;
  final String selectedTag; // 'all', 'trending', 'quick', 'budget', 'top_rated'
  final String? errorMessage;
  final bool isScrolled;

  const CategoriesState({
    this.isLoading = false,
    this.categories = const [],
    this.allFoods = const [],
    this.categoryItemCounts = const {},
    this.searchQuery = '',
    this.selectedTag = 'all',
    this.errorMessage,
    this.isScrolled = false,
  });

  CategoriesState copyWith({
    bool? isLoading,
    List<CategoryEntity>? categories,
    List<FoodEntity>? allFoods,
    Map<String, int>? categoryItemCounts,
    String? searchQuery,
    String? selectedTag,
    String? errorMessage,
    bool? isScrolled,
  }) {
    return CategoriesState(
      isLoading: isLoading ?? this.isLoading,
      categories: categories ?? this.categories,
      allFoods: allFoods ?? this.allFoods,
      categoryItemCounts: categoryItemCounts ?? this.categoryItemCounts,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedTag: selectedTag ?? this.selectedTag,
      errorMessage: errorMessage,
      isScrolled: isScrolled ?? this.isScrolled,
    );
  }

  int getItemCount(CategoryEntity category) {
    if (categoryItemCounts.containsKey(category.id)) {
      return categoryItemCounts[category.id]!;
    }
    return 6;
  }

  List<FoodEntity> getFoodsForCategory(CategoryEntity category) {
    return allFoods.where((f) {
      if (f.categoryId.isNotEmpty && f.categoryId == category.id) {
        return true;
      }
      if (f.categoryName.isNotEmpty &&
          f.categoryName.toLowerCase() == category.name.toLowerCase()) {
        return true;
      }
      return false;
    }).toList();
  }

  List<CategoryEntity> get filteredCategories {
    var list = categories.toList();

    // 1. Tag filtering
    switch (selectedTag) {
      case 'trending':
        const trendingNames = ['burgers', 'pizza', 'asian cuisine'];
        list = list.where((c) => trendingNames.contains(c.name.toLowerCase())).toList();
        break;
      case 'quick':
        const quickNames = ['burgers', 'bakery', 'beverages'];
        list = list.where((c) => quickNames.contains(c.name.toLowerCase())).toList();
        break;
      case 'budget':
        final budgetCatNames = allFoods
            .where((f) => f.price <= 6.0)
            .map((f) => f.categoryName.toLowerCase())
            .toSet();
        if (budgetCatNames.isNotEmpty) {
          list = list.where((c) => budgetCatNames.contains(c.name.toLowerCase())).toList();
        }
        break;
      case 'top_rated':
        const topRated = ['asian cuisine', 'healthy bowls', 'pizza', 'desserts'];
        list = list.where((c) => topRated.contains(c.name.toLowerCase())).toList();
        break;
      default:
        break;
    }

    // 2. Search query filtering
    final query = searchQuery.trim().toLowerCase();
    if (query.isNotEmpty) {
      list = list.where((c) {
        final nameMatch = c.name.toLowerCase().contains(query);
        final descMatch = c.description.toLowerCase().contains(query);
        return nameMatch || descMatch;
      }).toList();
    }

    return list;
  }
}
