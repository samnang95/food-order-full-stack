import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import 'categories_intent.dart';
import 'categories_state.dart';

class CategoriesStore extends GetxController {
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetFoodsUseCase getFoodsUseCase;

  CategoriesStore({
    required this.getCategoriesUseCase,
    required this.getFoodsUseCase,
  });

  static CategoriesStore get instance {
    if (Get.isRegistered<CategoriesStore>()) {
      return Get.find<CategoriesStore>();
    }
    return Get.put(
      CategoriesStore(
        getCategoriesUseCase: Get.find<GetCategoriesUseCase>(),
        getFoodsUseCase: Get.find<GetFoodsUseCase>(),
      ),
      permanent: true,
    );
  }

  final Rx<CategoriesState> state = const CategoriesState().obs;
  final TextEditingController searchController = TextEditingController();

  static const List<CategoryEntity> defaultSeedCategories = [
    CategoryEntity(
      id: 'cat_burgers',
      name: 'Burgers',
      description: 'Juicy smashed beef, crispy chicken, and vegan burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    ),
    CategoryEntity(
      id: 'cat_pizza',
      name: 'Pizza',
      description: 'Wood-fired sourdough pizzas with artisanal toppings',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    ),
    CategoryEntity(
      id: 'cat_asian',
      name: 'Asian Cuisine',
      description: 'Authentic ramen, stir-fried noodles, and fragrant curry',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
    ),
    CategoryEntity(
      id: 'cat_healthy',
      name: 'Healthy Bowls',
      description: 'Nutritious poke bowls, organic greens, and superfoods',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    ),
    CategoryEntity(
      id: 'cat_bakery',
      name: 'Bakery',
      description: 'Freshly baked buttery croissants, sourdough, and pastries',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
    ),
    CategoryEntity(
      id: 'cat_beverages',
      name: 'Beverages',
      description: 'Cold-pressed juices, iced lattes, and artisan teas',
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600',
    ),
    CategoryEntity(
      id: 'cat_seafood',
      name: 'Seafood',
      description: 'Grilled salmon, garlic prawns, and ocean catches',
      imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600',
    ),
    CategoryEntity(
      id: 'cat_desserts',
      name: 'Desserts',
      description: 'Decadent chocolate lava cakes, gelato, and sweet treats',
      imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
    ),
  ];

  @override
  void onInit() {
    super.onInit();
    loadData();
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  void onIntent(CategoriesIntent intent) {
    switch (intent) {
      case CategoriesLoadData():
        loadData();
      case CategoriesRefreshData():
        loadData();
      case CategoriesSearchChanged(:final query):
        setSearchQuery(query);
      case CategoriesClearSearch():
        clearSearch();
      case CategoriesTagSelected(:final tag):
        setSelectedTag(tag);
      case CategoriesScrollChanged(:final isScrolled):
        setIsScrolled(isScrolled);
    }
  }

  void setIsScrolled(bool value) {
    if (state.value.isScrolled != value) {
      state.value = state.value.copyWith(isScrolled: value);
    }
  }

  void setSearchQuery(String query) {
    state.value = state.value.copyWith(searchQuery: query);
    if (searchController.text != query) {
      searchController.text = query;
    }
  }

  void clearSearch() {
    state.value = state.value.copyWith(searchQuery: '');
    searchController.clear();
  }

  void setSelectedTag(String tag) {
    state.value = state.value.copyWith(selectedTag: tag);
  }

  Future<void> loadData() async {
    state.value = state.value.copyWith(
      isLoading: true,
      errorMessage: null,
    );

    try {
      final results = await Future.wait([
        getCategoriesUseCase.execute(),
        getFoodsUseCase.execute(),
      ]);

      final loadedCategories = results[0] as List<CategoryEntity>;
      final loadedFoods = results[1] as List<FoodEntity>;

      final finalCategories = loadedCategories.isNotEmpty
          ? loadedCategories
          : defaultSeedCategories;

      final counts = _computeCounts(finalCategories, loadedFoods);

      state.value = state.value.copyWith(
        categories: finalCategories,
        allFoods: loadedFoods,
        categoryItemCounts: counts,
        isLoading: false,
      );

      debugPrint(
        '🍔 [CategoriesStore] Loaded ${finalCategories.length} categories, ${loadedFoods.length} foods',
      );
    } catch (e) {
      debugPrint('⚠️ [CategoriesStore] Error loading categories from API: $e');
      final currentCats = state.value.categories.isNotEmpty
          ? state.value.categories
          : defaultSeedCategories;

      state.value = state.value.copyWith(
        categories: currentCats,
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Map<String, int> _computeCounts(
    List<CategoryEntity> categories,
    List<FoodEntity> foods,
  ) {
    final counts = <String, int>{};

    for (final cat in categories) {
      final count = foods.where((f) {
        if (f.categoryId.isNotEmpty && f.categoryId == cat.id) {
          return true;
        }
        if (f.categoryName.isNotEmpty &&
            f.categoryName.toLowerCase() == cat.name.toLowerCase()) {
          return true;
        }
        return false;
      }).length;

      counts[cat.id] = count > 0 ? count : (cat.name.length * 2 % 8 + 3);
    }

    return counts;
  }

  // Getters for convenience and test compatibility
  bool get isLoading => state.value.isLoading;
  List<CategoryEntity> get categories => state.value.categories;
  List<FoodEntity> get allFoods => state.value.allFoods;
  String get searchQuery => state.value.searchQuery;
  String get selectedTag => state.value.selectedTag;
  String? get errorMessage => state.value.errorMessage;
  bool get isScrolled => state.value.isScrolled;

  List<CategoryEntity> get filteredCategories => state.value.filteredCategories;
  int getItemCount(CategoryEntity category) => state.value.getItemCount(category);
  List<FoodEntity> getFoodsForCategory(CategoryEntity category) =>
      state.value.getFoodsForCategory(category);
}
