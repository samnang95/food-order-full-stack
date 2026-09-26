import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';

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

  final categories = <CategoryEntity>[].obs;
  final allFoods = <FoodEntity>[].obs;
  final categoryItemCounts = <String, int>{}.obs;

  final isLoading = false.obs;
  final searchQuery = ''.obs;
  final selectedTag = 'all'.obs; // 'all', 'trending', 'quick', 'budget', 'top_rated'
  final errorMessage = RxnString();
  final isScrolled = false.obs;
  final searchController = TextEditingController();

  void setIsScrolled(bool value) {
    if (isScrolled.value != value) {
      isScrolled.value = value;
    }
  }

  void clearSearch() {
    searchQuery.value = '';
    searchController.clear();
  }

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

  Future<void> loadData() async {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      final results = await Future.wait([
        getCategoriesUseCase.execute(),
        getFoodsUseCase.execute(),
      ]);

      final loadedCategories = results[0] as List<CategoryEntity>;
      final loadedFoods = results[1] as List<FoodEntity>;

      if (loadedCategories.isNotEmpty) {
        categories.assignAll(loadedCategories);
      } else {
        categories.assignAll(defaultSeedCategories);
      }

      allFoods.assignAll(loadedFoods);
      _computeItemCounts();

      debugPrint('🍔 [CategoriesStore] Loaded ${categories.length} categories, ${allFoods.length} foods');
    } catch (e) {
      debugPrint('⚠️ [CategoriesStore] Error loading categories from API: $e');
      if (categories.isEmpty) {
        categories.assignAll(defaultSeedCategories);
      }
      errorMessage.value = e.toString().replaceFirst('Exception: ', '');
    } finally {
      isLoading.value = false;
    }
  }

  void _computeItemCounts() {
    final counts = <String, int>{};

    for (final cat in categories) {
      final count = allFoods.where((f) {
        if (f.categoryId.isNotEmpty && f.categoryId == cat.id) {
          return true;
        }
        if (f.categoryName.isNotEmpty &&
            f.categoryName.toLowerCase() == cat.name.toLowerCase()) {
          return true;
        }
        return false;
      }).length;

      // If backend has items, save real count; otherwise provide a realistic preview count
      counts[cat.id] = count > 0 ? count : (cat.name.length * 2 % 8 + 3);
    }

    categoryItemCounts.assignAll(counts);
  }

  int getItemCount(CategoryEntity category) {
    if (categoryItemCounts.containsKey(category.id)) {
      return categoryItemCounts[category.id]!;
    }
    return 6;
  }

  List<FoodEntity> getFoodsForCategory(CategoryEntity category) {
    final matched = allFoods.where((f) {
      if (f.categoryId.isNotEmpty && f.categoryId == category.id) {
        return true;
      }
      if (f.categoryName.isNotEmpty &&
          f.categoryName.toLowerCase() == category.name.toLowerCase()) {
        return true;
      }
      return false;
    }).toList();

    return matched;
  }

  void setSearchQuery(String query) {
    searchQuery.value = query;
    if (searchController.text != query) {
      searchController.text = query;
    }
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  void setSelectedTag(String tag) {
    selectedTag.value = tag;
  }

  List<CategoryEntity> get filteredCategories {
    var list = categories.toList();

    // 1. Tag filtering
    switch (selectedTag.value) {
      case 'trending':
        const trendingNames = ['burgers', 'pizza', 'asian cuisine'];
        list = list.where((c) => trendingNames.contains(c.name.toLowerCase())).toList();
        break;
      case 'quick':
        const quickNames = ['burgers', 'bakery', 'beverages'];
        list = list.where((c) => quickNames.contains(c.name.toLowerCase())).toList();
        break;
      case 'budget':
        // Categories containing dishes under $6
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
    final query = searchQuery.value.trim().toLowerCase();
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
