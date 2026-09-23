import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';

class HomeModel {
  final bool isLoading;
  final List<CategoryEntity> categories;
  final String selectedCategoryId;
  final List<FoodEntity> foods;
  final String searchQuery;
  final String? errorMessage;

  const HomeModel({
    this.isLoading = true,
    this.categories = const [],
    this.selectedCategoryId = '',
    this.foods = const [],
    this.searchQuery = '',
    this.errorMessage,
  });

  HomeModel copyWith({
    bool? isLoading,
    List<CategoryEntity>? categories,
    String? selectedCategoryId,
    List<FoodEntity>? foods,
    String? searchQuery,
    String? errorMessage,
  }) {
    return HomeModel(
      isLoading: isLoading ?? this.isLoading,
      categories: categories ?? this.categories,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      foods: foods ?? this.foods,
      searchQuery: searchQuery ?? this.searchQuery,
      errorMessage: errorMessage,
    );
  }
}
