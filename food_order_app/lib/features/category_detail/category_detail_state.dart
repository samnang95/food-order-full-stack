import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';

class CategoryDetailState {
  final CategoryEntity? category;
  final String selectedSort; // 'all', 'price_asc', 'price_desc'
  final List<FoodEntity> foods;
  final bool isLoading;
  final bool isScrolled;

  const CategoryDetailState({
    this.category,
    this.selectedSort = 'all',
    this.foods = const [],
    this.isLoading = false,
    this.isScrolled = false,
  });

  CategoryDetailState copyWith({
    CategoryEntity? category,
    String? selectedSort,
    List<FoodEntity>? foods,
    bool? isLoading,
    bool? isScrolled,
  }) {
    return CategoryDetailState(
      category: category ?? this.category,
      selectedSort: selectedSort ?? this.selectedSort,
      foods: foods ?? this.foods,
      isLoading: isLoading ?? this.isLoading,
      isScrolled: isScrolled ?? this.isScrolled,
    );
  }

  List<FoodEntity> get sortedFoods {
    final list = List<FoodEntity>.from(foods);
    switch (selectedSort) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      default:
        break;
    }
    return list;
  }
}
